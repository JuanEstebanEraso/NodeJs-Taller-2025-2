import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/', eventController.getOpenEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/status', eventController.checkEventStatus);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, eventController.createEvent);
router.put('/:id/close', authenticateToken, requireAdmin, eventController.closeEvent);
router.get('/admin/all', authenticateToken, requireAdmin, eventController.getAllEvents);
router.put('/admin/:id', authenticateToken, requireAdmin, eventController.updateEvent);
router.delete('/admin/:id', authenticateToken, requireAdmin, eventController.deleteEvent);

export default router;