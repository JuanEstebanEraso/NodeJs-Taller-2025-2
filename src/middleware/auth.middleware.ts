import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { JWTPayload } from '../interfaces/auth.interface';

// Extend Request interface to include user in body
declare global {
  namespace Express {
    interface Request {
      body: {
        user?: {
          userId: string;
          username: string;
          role: string;
        };
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token = req.header('Authorization');
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    token = token.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;

    // Verify user still exists in database
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Add user info to req.body
    req.body.user = {
      userId: (user._id as any).toString(),
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (allowRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.body.user;
    if (user && !allowRoles.includes(user.role)) {
      res.status(403).json({ message: `Forbidden, you are a ${user.role} and this service is only available for ${allowRoles.join(', ')}` });
      return;
    }
    next();
  };
};

// Convenience middleware for admin only
export const requireAdmin = authorizeRoles(['admin']);

// Convenience middleware for player only
export const requirePlayer = authorizeRoles(['player']);