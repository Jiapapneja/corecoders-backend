import slugify from 'slugify';
import Recipe from '../models/Recipe.js';

export async function uniqueSlug(title, currentId = null) {
  const base = slugify(title, { lower: true, strict: true }) || `recipe-${Date.now()}`;
  let slug = base;
  let n = 1;
  while (await Recipe.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) slug = `${base}-${n++}`;
  return slug;
}
