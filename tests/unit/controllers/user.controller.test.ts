import { Request, Response } from 'express';
import { UserController } from '../../../src/controllers/user.controller';

// Mock the services
jest.mock('../../../src/services/user.service', () => ({
  UserService: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateBalance: jest.fn(),
    hasEnoughBalance: jest.fn()
  }
}));

jest.mock('../../../src/services/auth.service', () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn()
  }
}));

import { UserService } from '../../../src/services/user.service';
import { AuthService } from '../../../src/services/auth.service';

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseObject = {};
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      })
    };
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        username: 'testuser',
        password: 'testpassword'
      };

      const authResponse = {
        user: {
          id: 'user123',
          username: 'testuser',
          role: 'player',
          balance: 10000
        },
        token: 'mock.jwt.token'
      };

      mockRequest.body = registerData;
      mockAuthService.register.mockResolvedValue(authResponse);

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        success: true,
        data: authResponse,
        message: 'User registered successfully'
      });
    });

    it('should return 400 if username is missing', async () => {
      mockRequest.body = { password: 'testpassword' };

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { username: 'testuser' };

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should handle registration error', async () => {
      const registerData = {
        username: 'testuser',
        password: 'testpassword'
      };

      mockRequest.body = registerData;
      mockAuthService.register.mockRejectedValue(new Error('Username already exists'));

      await UserController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Username already exists'
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpassword'
      };

      const authResponse = {
        user: {
          id: 'user123',
          username: 'testuser',
          role: 'player',
          balance: 10000
        },
        token: 'mock.jwt.token'
      };

      mockRequest.body = loginData;
      mockAuthService.login.mockResolvedValue(authResponse);

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: authResponse,
        message: 'Login successful'
      });
    });

    it('should return 400 if credentials are missing', async () => {
      mockRequest.body = { username: 'testuser' };

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should handle login error', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      mockRequest.body = loginData;
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await UserController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        role: 'player',
        balance: 10000
      };

      mockRequest.user = { id: 'user123', username: 'testuser', role: 'player' };
      mockUserService.getUserById.mockResolvedValue(mockUser as any);

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: {
          id: 'user123',
          username: 'testuser',
          role: 'player',
          balance: 10000
        }
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.user = { id: 'user123', username: 'testuser', role: 'player' };
      mockUserService.getUserById.mockResolvedValue(null);

      await UserController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('updateBalance', () => {
    it('should update user balance successfully', async () => {
      const userId = 'user123';
      const newBalance = 5000;
      const updatedUser = {
        _id: userId,
        username: 'testuser',
        balance: newBalance,
        role: 'player'
      };

      mockRequest.params = { id: userId };
      mockRequest.body = { balance: newBalance };
      mockUserService.updateBalance.mockResolvedValue(updatedUser as any);

      await UserController.updateBalance(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateBalance).toHaveBeenCalledWith(userId, newBalance);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: updatedUser,
        message: 'Balance updated successfully'
      });
    });

    it('should return 400 for invalid balance amount', async () => {
      mockRequest.params = { id: 'user123' };
      mockRequest.body = { balance: -100 };

      await UserController.updateBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Invalid balance amount'
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: 'nonexistentId' };
      mockRequest.body = { balance: 5000 };
      mockUserService.updateBalance.mockResolvedValue(null);

      await UserController.updateBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not found'
      });
    });
  });

  describe('checkBalance', () => {
    it('should check balance successfully', async () => {
      const userId = 'user123';
      const amount = '1000';

      mockRequest.params = { id: userId };
      mockRequest.query = { amount };
      mockUserService.hasEnoughBalance.mockResolvedValue(true);

      await UserController.checkBalance(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.hasEnoughBalance).toHaveBeenCalledWith(userId, 1000);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: { hasEnoughBalance: true }
      });
    });

    it('should return 400 if amount is missing', async () => {
      mockRequest.params = { id: 'user123' };
      mockRequest.query = {};

      await UserController.checkBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount is required and must be a number'
      });
    });

    it('should return 400 if amount is not a number', async () => {
      mockRequest.params = { id: 'user123' };
      mockRequest.query = { amount: 'invalid' };

      await UserController.checkBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount is required and must be a number'
      });
    });
  });
});