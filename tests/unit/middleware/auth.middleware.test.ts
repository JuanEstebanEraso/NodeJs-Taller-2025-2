import { Request, Response, NextFunction } from 'express';
import { 
  authenticateToken, 
  requireRole, 
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

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseObject = {};
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      })
    };
    mockNext = jest.fn();
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

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(mockUser as any);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'test-secret-key');
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
      expect(mockRequest.user).toEqual({
        id: 'user123',
        username: 'testuser',
        role: 'player'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      mockRequest.headers = {};

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', async () => {
      const token = 'invalid.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toEqual({
        success: false,
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

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(null);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
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

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      mockJwt.verify.mockReturnValue(decodedPayload as any);
      mockUserModel.findById.mockResolvedValue(mockUser as any);

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, 'your-secret-key');
      
      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('requireRole', () => {
    it('should allow access if user has required role', () => {
      const roles = ['admin', 'player'];
      const middleware = requireRole(roles);

      mockRequest.user = {
        id: 'user123',
        username: 'testuser',
        role: 'admin'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if user does not have required role', () => {
      const roles = ['admin'];
      const middleware = requireRole(roles);

      mockRequest.user = {
        id: 'user123',
        username: 'testuser',
        role: 'player'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', () => {
      const roles = ['admin'];
      const middleware = requireRole(roles);

      mockRequest.user = undefined;

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of multiple required roles', () => {
      const roles = ['admin', 'moderator'];
      const middleware = requireRole(roles);

      mockRequest.user = {
        id: 'user123',
        username: 'testuser',
        role: 'admin'
      };

      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      mockRequest.user = {
        id: 'user123',
        username: 'admin',
        role: 'admin'
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      mockRequest.user = {
        id: 'user123',
        username: 'player',
        role: 'player'
      };

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePlayer', () => {
    it('should allow access for player user', () => {
      mockRequest.user = {
        id: 'user123',
        username: 'player',
        role: 'player'
      };

      requirePlayer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for admin user trying to access player-only endpoint', () => {
      mockRequest.user = {
        id: 'user123',
        username: 'admin',
        role: 'admin'
      };

      requirePlayer(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(responseObject).toEqual({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});