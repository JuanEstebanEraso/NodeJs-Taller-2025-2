import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', EventController.getOpenEvents);
router.get('/:id', EventController.getEventById);
router.get('/:id/status', EventController.checkEventStatus);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, EventController.createEvent);
router.put('/:id/close', authenticateToken, requireAdmin, EventController.closeEvent);

export default router;