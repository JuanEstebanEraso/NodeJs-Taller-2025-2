import { AuthService } from '../../../src/services/auth.service';

// Mock the external dependencies
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock('../../../src/models/User', () => ({
  UserModel: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../../src/models/User';

// Type the mocks properly
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn()
};

const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn()
};

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn()
};

// Replace the actual modules with mocks
(bcrypt as any).hash = mockBcrypt.hash;
(bcrypt as any).compare = mockBcrypt.compare;
(jwt as any).sign = mockJwt.sign;
(jwt as any).verify = mockJwt.verify;
(UserModel as any).findOne = mockUserModel.findOne;
(UserModel as any).create = mockUserModel.create;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with correct payload', () => {
      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValue(mockToken as any);

      const token = AuthService.generateToken('user123', 'testuser', 'player');

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId: 'user123', username: 'testuser', role: 'player' },
        'test-secret-key',
        { expiresIn: '1h' }
      );
      expect(token).toBe(mockToken);
    });

    it('should use default secret when JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const mockToken = 'mock.jwt.token';
      mockJwt.sign.mockReturnValue(mockToken as any);

      AuthService.generateToken('user123', 'testuser', 'admin');

      expect(mockJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'your-secret-key',
        expect.any(Object)
      );

      // Restore
      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'testpassword123';
      const hashedPassword = '$2b$12$hashedpassword';
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await AuthService.hashPassword(password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12);
      expect(result).toBe(hashedPassword);
    });

    it('should propagate hashing errors', async () => {
      const password = 'testpassword';
      const error = new Error('Hashing failed');
      
      mockBcrypt.hash.mockRejectedValue(error as never);

      await expect(AuthService.hashPassword(password)).rejects.toThrow('Hashing failed');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'plainpassword';
      const hashedPassword = '$2b$12$hashedpassword';
      
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongpassword';
      const hashedPassword = '$2b$12$hashedpassword';
      
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await AuthService.verifyPassword(password, hashedPassword);

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginData = { username: 'testuser', password: 'password123' };
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: '$2b$12$hashedpassword',
        role: 'player',
        balance: 10000
      };
      const mockToken = 'valid.jwt.token';

      mockUserModel.findOne.mockResolvedValue(mockUser as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue(mockToken as any);

      const result = await AuthService.login(loginData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', '$2b$12$hashedpassword');
      expect(result).toEqual({
        user: {
          id: 'user123',
          username: 'testuser',
          role: 'player',
          balance: 10000
        },
        token: mockToken
      });
    });

    it('should throw error when user not found', async () => {
      const loginData = { username: 'nonexistent', password: 'password123' };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(AuthService.login(loginData)).rejects.toThrow('Login failed');
    });

    it('should throw error when password is invalid', async () => {
      const loginData = { username: 'testuser', password: 'wrongpassword' };
      const mockUser = {
        _id: 'user123',
        username: 'testuser',
        password: '$2b$12$hashedpassword',
        role: 'player',
        balance: 10000
      };

      mockUserModel.findOne.mockResolvedValue(mockUser as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(AuthService.login(loginData)).rejects.toThrow('Login failed');
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const registerData = { username: 'newuser', password: 'password123' };
      const hashedPassword = '$2b$12$hashedpassword';
      const mockUser = {
        _id: 'newuser123',
        username: 'newuser',
        password: hashedPassword,
        role: 'player',
        balance: 10000
      };
      const mockToken = 'new.jwt.token';

      mockUserModel.findOne.mockResolvedValue(null); // User doesn't exist
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserModel.create.mockResolvedValue(mockUser as any);
      mockJwt.sign.mockReturnValue(mockToken as any);

      const result = await AuthService.register(registerData);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username: 'newuser' });
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'newuser',
        password: hashedPassword,
        balance: 10000,
        role: 'player'
      });
      expect(result).toEqual({
        user: {
          id: 'newuser123',
          username: 'newuser',
          role: 'player',
          balance: 10000
        },
        token: mockToken
      });
    });

    it('should throw error when username already exists', async () => {
      const registerData = { username: 'existinguser', password: 'password123' };
      const existingUser = { username: 'existinguser' };

      mockUserModel.findOne.mockResolvedValue(existingUser as any);

      await expect(AuthService.register(registerData)).rejects.toThrow('Registration failed');
    });

    it('should register admin user when role is specified', async () => {
      const registerData = { username: 'adminuser', password: 'password123', role: 'admin' as any };
      const hashedPassword = '$2b$12$hashedpassword';
      const mockUser = {
        _id: 'admin123',
        username: 'adminuser',
        password: hashedPassword,
        role: 'admin',
        balance: 10000
      };
      const mockToken = 'admin.jwt.token';

      mockUserModel.findOne.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserModel.create.mockResolvedValue(mockUser as any);
      mockJwt.sign.mockReturnValue(mockToken as any);

      const result = await AuthService.register(registerData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        username: 'adminuser',
        password: hashedPassword,
        balance: 10000,
        role: 'admin'
      });
      expect(result.user.role).toBe('admin');
    });
  });
});