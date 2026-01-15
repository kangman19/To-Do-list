import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const userController = new UserController();

// GET /api/users - Get all users (for sharing)
router.get('/', requireAuth, userController.getAllUsers);

export default router;