import { Router } from 'express';
import { ShareController } from '../controllers/shareController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const shareController = new ShareController();

// All routes require authentication
router.use(requireAuth);

// POST /api/shares - Share a category with a user
router.post('/', shareController.createShare);

export default router;