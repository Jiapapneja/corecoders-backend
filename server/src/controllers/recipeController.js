import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';
import Review from '../models/Review.js';
import { uniqueSlug } from '../utils/slug.js';
import { optimizedUrl, uploadBuffer } from '../utils/cloudinaryUpload.js';

function parseJson(value, fallback) { if (value === undefined) return fallback; try { return JSON.parse(value); } catch { return fallback; } }

function recipePayload(body) {
  return {
    title: body.title, cuisine: body.cuisine, diet: body.diet, cookTime: Number(body.cookTime), servings: Number(body.servings), difficulty: body.difficulty,
    coverUrl: body.coverUrl || '', tags: parseJson(body.tags, body.tags || []).map(String),
    ingredients: parseJson(body.ingredients, []), steps: parseJson(body.steps, [])
  };
}

export async function listRecipes(req, res) {
  const { cuisine, diet, maxTime, difficulty, q, cursor, limit = 12 } = req.query;
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 30);
  const filter = {};
  if (cuisine) filter.cuisine = cuisine;
  if (diet) filter.diet = diet;
  if (difficulty) filter.difficulty = difficulty;
  if (maxTime) filter.cookTime = { $lte: Number(maxTime) };
  if (q) filter.$text = { $search: q };
  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    if (!mongoose.isValidObjectId(decoded.id) || !decoded.createdAt) return res.status(400).json({ message: 'Invalid cursor' });
    filter.$or = [{ createdAt: { $lt: new Date(decoded.createdAt) } }, { createdAt: new Date(decoded.createdAt), _id: { $lt: decoded.id } }];
  }
  let query = Recipe.find(filter).populate('authorId', 'name avatarUrl').sort({ createdAt: -1, _id: -1 }).limit(safeLimit + 1);
  if (q) query = query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, createdAt: -1, _id: -1 });
  const docs = await query.lean();
  const hasMore = docs.length > safeLimit;
  const items = hasMore ? docs.slice(0, safeLimit) : docs;
  const last = items.at(-1);
  const nextCursor = hasMore && last ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last._id })).toString('base64url') : null;
  res.json({ items, nextCursor });
}

export async function getRecipe(req, res) {
  const recipe = await Recipe.findOne({ $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { slug: req.params.id }] }).populate('authorId', 'name avatarUrl bio').lean();
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  const reviews = await Review.find({ recipeId: recipe._id }).populate('userId', 'name avatarUrl').sort({ createdAt: -1 }).limit(50).lean();
  res.json({ recipe, reviews });
}

export async function createRecipe(req, res) {
  const payload = recipePayload(req.body);
  if (!payload.title || !payload.cuisine || !payload.ingredients?.length || !payload.steps?.length) return res.status(400).json({ message: 'Title, cuisine, ingredients and steps are required' });
  if (req.files?.length) {
    const uploads = await Promise.all(req.files.map(file => uploadBuffer(file.buffer, `${process.env.CLOUDINARY_UPLOAD_FOLDER || 'recipe-community'}/recipes`)));
    if (!payload.coverUrl) payload.coverUrl = optimizedUrl(uploads[0].secure_url);
    const extraStepImages = uploads.slice(payload.coverUrl ? 1 : 0).map(r => optimizedUrl(r.secure_url));
    payload.steps = payload.steps.map((step, i) => ({ ...step, imageUrl: step.imageUrl || extraStepImages[i] || '' }));
  }
  payload.authorId = req.user._id;
  payload.slug = await uniqueSlug(payload.title);
  const recipe = await Recipe.create(payload);
  res.status(201).json(recipe);
}

export async function updateRecipe(req, res) {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (String(recipe.authorId) !== String(req.user._id)) return res.status(403).json({ message: 'Not your recipe' });
  const payload = recipePayload(req.body);
  if (payload.title && payload.title !== recipe.title) { payload.slug = await uniqueSlug(payload.title, recipe._id); }
  Object.assign(recipe, payload);
  await recipe.save();
  res.json(recipe);
}

export async function addReview(req, res) {
  const recipeId = req.params.id;
  const { rating, comment, photos = [] } = req.body;
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5 || !comment?.trim()) return res.status(400).json({ message: 'Rating 1-5 and comment are required' });
  const session = await mongoose.startSession();
  try {
    let created;
    await session.withTransaction(async () => {
      const existing = await Review.findOne({ recipeId, userId: req.user._id }).session(session);
      if (existing) throw Object.assign(new Error('You have already reviewed this recipe'), { status: 409 });
      [created] = await Review.create([{ recipeId, userId: req.user._id, rating: r, comment: comment.trim(), photos }], { session });
      await Recipe.updateOne({ _id: recipeId }, { $inc: { ratingCount: 1, avgRating: r } }, { session });
      await Recipe.updateOne({ _id: recipeId }, [{ $set: { avgRating: { $cond: [{ $gt: ['$ratingCount', 0] }, { $divide: ['$avgRating', '$ratingCount'] }, 0] } } }], { session });
    });
    res.status(201).json(created);
  } finally { await session.endSession(); }
}

export async function deleteReview(req, res) {
  const review = await Review.findOne({ _id: req.params.reviewId, recipeId: req.params.id, userId: req.user._id });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Review.deleteOne({ _id: review._id }, { session });
      await Recipe.updateOne({ _id: review.recipeId }, { $inc: { ratingCount: -1, avgRating: -review.rating } }, { session });
      await Recipe.updateOne({ _id: review.recipeId }, [{ $set: { avgRating: { $cond: [{ $gt: ['$ratingCount', 0] }, { $divide: ['$avgRating', '$ratingCount'] }, 0] } } }], { session });
    });
    res.json({ message: 'Review deleted' });
  } finally { await session.endSession(); }
}

export async function toggleLike(req, res) {
  const recipe = await Recipe.findById(req.params.id).select('likes');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  const liked = recipe.likes.some(id => String(id) === String(req.user._id));
  const update = liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } };
  await Recipe.updateOne({ _id: recipe._id }, update);
  res.json({ liked: !liked, count: recipe.likes.length + (liked ? -1 : 1) });
}
