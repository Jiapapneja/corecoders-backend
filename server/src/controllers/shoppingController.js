import Recipe from '../models/Recipe.js';

export async function shoppingList(req, res) {
  const ids = Array.isArray(req.body.recipeIds) ? req.body.recipeIds : [];
  const servings = Number(req.body.servings) || 1;
  const recipes = await Recipe.find({ _id: { $in: ids } }).select('title servings ingredients').lean();
  const map = new Map();
  for (const recipe of recipes) {
    const factor = servings / recipe.servings;
    for (const item of recipe.ingredients) {
      const key = `${item.name.trim().toLowerCase()}|${item.unit.trim().toLowerCase()}`;
      const existing = map.get(key) || { name: item.name, unit: item.unit, qty: 0 };
      existing.qty += item.qty * factor;
      map.set(key, existing);
    }
  }
  res.json({ servings, items: [...map.values()] });
}
