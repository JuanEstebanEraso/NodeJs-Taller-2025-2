import { Router } from 'express';
import { EventController } from '../controllers/EventController';

const router = Router();

// Event CRUD routes
router.post('/', EventController.createEvent);
router.get('/', EventController.getOpenEvents);
router.get('/:id', EventController.getEventById);
router.put('/:id/close', EventController.closeEvent);
router.get('/:id/status', EventController.checkEventStatus);

export default router;