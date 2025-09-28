import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, UserController.getProfile);
router.get('/:id', authenticateToken, UserController.getUserById);
router.put('/:id/balance', authenticateToken, UserController.updateBalance);
router.get('/:id/balance/check', authenticateToken, UserController.checkBalance);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, UserController.createUser);

export default router;