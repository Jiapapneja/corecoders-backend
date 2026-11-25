import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFeed } from '../controllers/userController.js';
const router = Router();
router.get('/', requireAuth, getFeed);
export default router;
