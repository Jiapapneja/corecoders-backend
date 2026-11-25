import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addRecipe, createCollection, listCollections } from '../controllers/collectionController.js';
const router = Router();
router.get('/', requireAuth, listCollections);
router.post('/', requireAuth, createCollection);
router.post('/:id/recipes/:recipeId', requireAuth, addRecipe);
export default router;
