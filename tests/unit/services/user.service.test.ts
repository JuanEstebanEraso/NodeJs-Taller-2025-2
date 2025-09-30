import { UserService } from '../../../src/services/user.service';

// Mock the UserModel completely
jest.mock('../../../src/models/User', () => ({
  UserModel: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

import { UserModel } from '../../../src/models/User';

const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('UserService (Simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userId = 'user123';
      const mockUser = {
        _id: userId,
        username: 'testuser',
        balance: 10000,
        role: 'player'
      };

      mockUserModel.findById.mockResolvedValue(mockUser as any);

      const result = await UserService.getUserById(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistentId';

      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.getUserById(userId);

      expect(result).toBeNull();
    });

    it('should throw error if database query fails', async () => {
      const userId = 'user123';

      mockUserModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(UserService.getUserById(userId)).rejects.toThrow('User not found');
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

      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser as any);

      const result = await UserService.updateBalance(userId, newBalance);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { balance: newBalance },
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'nonexistentId';
      const newBalance = 5000;

      mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await UserService.updateBalance(userId, newBalance);

      expect(result).toBeNull();
    });

    it('should throw error if update fails', async () => {
      const userId = 'user123';
      const newBalance = 5000;

      mockUserModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await expect(UserService.updateBalance(userId, newBalance)).rejects.toThrow('Error updating balance');
    });
  });

  describe('hasEnoughBalance', () => {
    it('should return true if user has enough balance', async () => {
      const userId = 'user123';
      const amount = 1000;
      const mockUser = {
        _id: userId,
        username: 'testuser',
        balance: 5000,
        role: 'player'
      };

      mockUserModel.findById.mockResolvedValue(mockUser as any);

      const result = await UserService.hasEnoughBalance(userId, amount);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should return false if user does not have enough balance', async () => {
      const userId = 'user123';
      const amount = 6000;
      const mockUser = {
        _id: userId,
        username: 'testuser',
        balance: 5000,
        role: 'player'
      };

      mockUserModel.findById.mockResolvedValue(mockUser as any);

      const result = await UserService.hasEnoughBalance(userId, amount);

      expect(result).toBe(false);
    });

    it('should return false if user not found', async () => {
      const userId = 'nonexistentId';
      const amount = 1000;

      mockUserModel.findById.mockResolvedValue(null);

      const result = await UserService.hasEnoughBalance(userId, amount);

      expect(result).toBe(false);
    });

    it('should return false if database query fails', async () => {
      const userId = 'user123';
      const amount = 1000;

      mockUserModel.findById.mockRejectedValue(new Error('Database error'));

      const result = await UserService.hasEnoughBalance(userId, amount);

      expect(result).toBe(false);
    });

    it('should handle edge case where balance equals amount', async () => {
      const userId = 'user123';
      const amount = 5000;
      const mockUser = {
        _id: userId,
        username: 'testuser',
        balance: 5000,
        role: 'player'
      };

      mockUserModel.findById.mockResolvedValue(mockUser as any);

      const result = await UserService.hasEnoughBalance(userId, amount);

      expect(result).toBe(true);
    });
  });
});
