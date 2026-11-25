import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { signature } from '../controllers/uploadController.js';
const router = Router();
router.get('/signature', requireAuth, signature);
export default router;
