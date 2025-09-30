import { Request, Response, NextFunction } from 'express';
import { 
  authenticateToken, 
  authorizeRoles, 
  requireAdmin, 
  requirePlayer 
} from '../../../src/middleware/auth.middleware';

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../../../src/models/User', () => ({
  UserModel: {
    findById: jest.fn()
  }
}));

import jwt from 'jsonwebtoken';
import { UserModel } from '../../../src/models/User';

// Type the mocks properly
const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
      body: {},
      header: jest.fn()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Set test environment
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token successfully', async () => {
      const token = 'valid.jwt.token';
      const decodedPayload = {
        userId: 'user123',
        username: 'testuser',
        role: 'player'
      };
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        role: 'player',
        balance: 10000
      };

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(mockUser as any);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(mockRequest.body.user).toEqual({
        userId: 'user123',
        username: 'testuser',
        role: 'player'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      (mockRequest.header as jest.Mock).mockReturnValue(undefined);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', async () => {
      const token = 'invalid.jwt.token';

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found in database', async () => {
      const token = 'valid.jwt.token';
      const decodedPayload = {
        userId: 'nonexistentUser',
        username: 'testuser',
        role: 'player'
      };

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(null);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should use default secret if JWT_SECRET not set', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const token = 'valid.jwt.token';
      const decodedPayload = {
        userId: 'user123',
        username: 'testuser',
        role: 'player'
      };
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        role: 'player'
      };

      (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(mockUser as any);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'your-secret-key');
      
      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('authorizeRoles', () => {
    it('should allow access if user has required role', () => {
      const middleware = authorizeRoles(['admin']);

      mockRequest.body.user = {
        userId: 'user123',
        username: 'testuser',
        role: 'admin'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access if user does not have required role', () => {
      const middleware = authorizeRoles(['admin']);

      mockRequest.body.user = {
        userId: 'user123',
        username: 'testuser',
        role: 'player'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a player and this service is only available for admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass through if user is not authenticated', () => {
      const middleware = authorizeRoles(['admin']);

      mockRequest.body.user = undefined;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of multiple required roles', () => {
      const middleware = authorizeRoles(['admin', 'moderator']);

      mockRequest.body.user = {
        userId: 'user123',
        username: 'testuser',
        role: 'admin'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      mockRequest.body.user = {
        userId: 'user123',
        username: 'admin',
        role: 'admin'
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      mockRequest.body.user = {
        userId: 'user123',
        username: 'player',
        role: 'player'
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a player and this service is only available for admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePlayer', () => {
    it('should allow access for player user', () => {
      mockRequest.body.user = {
        userId: 'user123',
        username: 'player',
        role: 'player'
      };

      requirePlayer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access for admin user trying to access player-only endpoint', () => {
      mockRequest.body.user = {
        userId: 'user123',
        username: 'admin',
        role: 'admin'
      };

      requirePlayer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Forbidden, you are a admin and this service is only available for player'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});