import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api.js';

export default function RecipeCard({ recipe }) {
  return <Link to={`/recipes/${recipe.slug || recipe._id}`} className="group card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
    <div className="aspect-[4/3] overflow-hidden bg-black/5"><img loading="lazy" src={imageUrl(recipe.coverUrl, 700)} alt={recipe.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div>
    <div className="p-4"><div className="mb-2 flex flex-wrap gap-1.5"><span className="pill">{recipe.cuisine}</span><span className="pill">{recipe.diet}</span></div><h3 className="line-clamp-2 text-lg font-bold">{recipe.title}</h3><p className="mt-2 text-sm text-black/55">{recipe.cookTime} min · {recipe.difficulty} · {recipe.avgRating?.toFixed(1) || '0.0'} ★</p></div>
  </Link>;
}
