import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { shoppingList } from '../controllers/shoppingController.js';
const router = Router();
router.post('/', requireAuth, shoppingList);
export default router;
