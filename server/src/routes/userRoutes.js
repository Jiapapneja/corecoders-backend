import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { follow } from '../controllers/userController.js';
const router = Router();
router.post('/:id/follow', requireAuth, follow);
export default router;
