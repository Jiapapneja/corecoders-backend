import mongoose from 'mongoose';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

export async function follow(req, res) {
  const targetId = req.params.id;
  if (!mongoose.isValidObjectId(targetId)) return res.status(400).json({ message: 'Invalid user id' });
  if (String(targetId) === String(req.user._id)) return res.status(400).json({ message: 'You cannot follow yourself' });
  const target = await User.findById(targetId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  const following = req.user.following.some(id => String(id) === String(targetId));
  if (following) {
    await User.updateOne({ _id: req.user._id }, { $pull: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $pull: { followers: req.user._id } });
  } else {
    await User.updateOne({ _id: req.user._id }, { $addToSet: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $addToSet: { followers: req.user._id } });
  }
  res.json({ following: !following });
}

export async function getFeed(req, res) {
  const { cursor, limit = 12 } = req.query;
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 30);
  const following = req.user.following;
  if (!following.length) return res.json({ items: [], nextCursor: null });
  const filter = { authorId: { $in: following } };
  if (cursor) {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    filter.$or = [{ createdAt: { $lt: new Date(decoded.createdAt) } }, { createdAt: new Date(decoded.createdAt), _id: { $lt: decoded.id } }];
  }
  const docs = await Recipe.find(filter).populate('authorId', 'name avatarUrl').sort({ createdAt: -1, _id: -1 }).limit(safeLimit + 1).lean();
  const hasMore = docs.length > safeLimit;
  const items = hasMore ? docs.slice(0, safeLimit) : docs;
  const last = items.at(-1);
  const nextCursor = hasMore && last ? Buffer.from(JSON.stringify({ createdAt: last.createdAt, id: last._id })).toString('base64url') : null;
  res.json({ items, nextCursor });
}
