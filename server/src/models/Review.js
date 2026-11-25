import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
  photos: [{ type: String }],
  helpfulCount: { type: Number, default: 0 }
}, { timestamps: true });
reviewSchema.index({ recipeId: 1, createdAt: -1 });
reviewSchema.index({ recipeId: 1, userId: 1 }, { unique: true });
export default mongoose.model('Review', reviewSchema);
