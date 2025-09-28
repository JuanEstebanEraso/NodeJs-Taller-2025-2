import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// User CRUD routes
router.post('/', UserController.createUser);
router.get('/:id', UserController.getUserById);
router.put('/:id/balance', UserController.updateBalance);
router.get('/:id/balance/check', UserController.checkBalance);

export default router;