import Collection from '../models/Collection.js';
import Recipe from '../models/Recipe.js';

export async function createCollection(req, res) {
  const collection = await Collection.create({ userId: req.user._id, name: req.body.name, recipeIds: [] });
  res.status(201).json(collection);
}
export async function addRecipe(req, res) {
  if (!(await Recipe.exists({ _id: req.params.recipeId }))) return res.status(404).json({ message: 'Recipe not found' });
  const collection = await Collection.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $addToSet: { recipeIds: req.params.recipeId } }, { new: true });
  if (!collection) return res.status(404).json({ message: 'Collection not found' });
  res.json(collection);
}
export async function listCollections(req, res) {
  const collections = await Collection.find({ userId: req.user._id }).populate('recipeIds', 'title coverUrl slug avgRating ratingCount').lean();
  res.json(collections);
}
