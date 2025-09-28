import { Router } from 'express';
import { BetController } from '../controllers/BetController';

const router = Router();

// Bet CRUD routes
router.post('/', BetController.createBet);
router.get('/user/:userId', BetController.getUserBets);
router.get('/user/:userId/stats', BetController.getUserBetStats);
router.post('/event/:eventId/process', BetController.processBetsForEvent);
router.get('/event/:eventId', BetController.getEventBets);

export default router;