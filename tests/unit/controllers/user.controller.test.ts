import { Request, Response } from 'express';
import { userController } from '../../../src/controllers/user.controller';

// Mock the services
jest.mock('../../../src/services/user.service', () => ({
  UserService: {
    createUser: jest.fn(),
    getUserById: jest.fn(),
    updateBalance: jest.fn(),
    hasEnoughBalance: jest.fn()
  },
  userService: {
    getAllUsers: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  }
}));

jest.mock('../../../src/services/auth.service', () => ({
  AuthService: {
    register: jest.fn(),
    login: jest.fn()
  }
}));

import { UserService, userService } from '../../../src/services/user.service';
import { AuthService } from '../../../src/services/auth.service';

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockUserServiceInstance = userService as jest.Mocked<typeof userService>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseObject = {};
    mockRequest = {
      body: {}
    };
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

      await userController.register(mockRequest as Request, mockResponse as Response);

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

      await userController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Username and password are required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockRequest.body = { username: 'testuser' };

      await userController.register(mockRequest as Request, mockResponse as Response);

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

      await userController.register(mockRequest as Request, mockResponse as Response);

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

      await userController.login(mockRequest as Request, mockResponse as Response);

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

      await userController.login(mockRequest as Request, mockResponse as Response);

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

      await userController.login(mockRequest as Request, mockResponse as Response);

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

      mockRequest.body.user = { userId: 'user123', username: 'testuser', role: 'player' };
      mockUserService.getUserById.mockResolvedValue(mockUser as any);

      await userController.getProfile(mockRequest as Request, mockResponse as Response);

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
      mockRequest.body.user = undefined;

      await userController.getProfile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.body.user = { userId: 'user123', username: 'testuser', role: 'player' };
      mockUserService.getUserById.mockResolvedValue(null);

      await userController.getProfile(mockRequest as Request, mockResponse as Response);

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

      await userController.updateBalance(mockRequest as Request, mockResponse as Response);

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

      await userController.updateBalance(mockRequest as Request, mockResponse as Response);

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

      await userController.updateBalance(mockRequest as Request, mockResponse as Response);

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

      await userController.checkBalance(mockRequest as Request, mockResponse as Response);

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

      await userController.checkBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount is required and must be a number'
      });
    });

    it('should return 400 if amount is not a number', async () => {
      mockRequest.params = { id: 'user123' };
      mockRequest.query = { amount: 'invalid' };

      await userController.checkBalance(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount is required and must be a number'
      });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        { _id: 'user1', username: 'user1', role: 'player', balance: 10000 },
        { _id: 'user2', username: 'user2', role: 'admin', balance: 5000 }
      ];

      mockUserServiceInstance.getAllUsers.mockResolvedValue(mockUsers as any);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockUsers,
        count: 2
      });
    });

    it('should handle error when getting all users', async () => {
      const errorMessage = 'Database error';
      mockUserServiceInstance.getAllUsers.mockRejectedValue(new Error(errorMessage));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'user123';
      const updateData = { username: 'newusername' };
      const updatedUser = {
        _id: userId,
        username: 'newusername',
        role: 'player',
        balance: 10000
      };

      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      mockUserServiceInstance.updateUser.mockResolvedValue(updatedUser as any);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    });

    it('should return 404 if user not found for update', async () => {
      const userId = 'nonexistentId';
      const updateData = { username: 'newusername' };

      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      mockUserServiceInstance.updateUser.mockResolvedValue(null);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle error when updating user', async () => {
      const userId = 'user123';
      const updateData = { username: 'newusername' };
      const errorMessage = 'Update failed';

      mockRequest.params = { id: userId };
      mockRequest.body = updateData;
      mockUserServiceInstance.updateUser.mockRejectedValue(new Error(errorMessage));

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';

      mockRequest.params = { id: userId };
      mockUserServiceInstance.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        message: 'User deleted successfully'
      });
    });

    it('should return 404 if user not found for deletion', async () => {
      const userId = 'nonexistentId';

      mockRequest.params = { id: userId };
      mockUserServiceInstance.deleteUser.mockResolvedValue(false);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle error when deleting user', async () => {
      const userId = 'user123';
      const errorMessage = 'Delete failed';

      mockRequest.params = { id: userId };
      mockUserServiceInstance.deleteUser.mockRejectedValue(new Error(errorMessage));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });
});