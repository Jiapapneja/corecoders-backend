import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  unit: { type: String, default: '' }
}, { _id: false });

const stepSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  text: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: '' }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, index: true },
  coverUrl: { type: String, default: '' },
  cuisine: { type: String, required: true, index: true },
  diet: { type: String, enum: ['veg', 'vegan', 'keto', 'non-veg'], default: 'veg', index: true },
  cookTime: { type: Number, required: true, min: 1, index: true },
  servings: { type: Number, required: true, min: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy', index: true },
  tags: [{ type: String, lowercase: true, trim: true }],
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  avgRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

recipeSchema.index({ title: 'text', tags: 'text', 'ingredients.name': 'text' }, { weights: { title: 10, tags: 5, 'ingredients.name': 2 }, name: 'recipe_text_weighted' });
recipeSchema.index({ authorId: 1, createdAt: -1, _id: -1 });
recipeSchema.index({ cuisine: 1, diet: 1, difficulty: 1, cookTime: 1, createdAt: -1, _id: -1 });

export default mongoose.model('Recipe', recipeSchema);
