import { Router } from 'express';
import { ReminderController } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const reminderController = new ReminderController();

// All routes require authentication
router.use(requireAuth);

// POST /api/reminders - Send a reminder
router.post('/', reminderController.sendReminder);

// GET /api/reminders/unread - Get unread reminders
router.get('/unread', reminderController.getUnreadReminders);

// POST /api/reminders/:reminderId/read - Mark as read
router.post('/:reminderId/read', reminderController.markAsRead);

export default router;