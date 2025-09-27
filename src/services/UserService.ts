import { UserModel, UserInput } from '../models/User';

export class UserService {
  static async createUser(userData: UserInput) {
    try {
      const user = new UserModel(userData);
      return await user.save();
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  static async getUserById(userId: string) {
    try {
      return await UserModel.findById(userId);
    } catch (error) {
      throw new Error('User not found');
    }
  }

  // Updates user balance after a bet
  static async updateBalance(userId: string, newBalance: number) {
    try {
      return await UserModel.findByIdAndUpdate(
        userId, 
        { balance: newBalance }, 
        { new: true }
      );
    } catch (error) {
      throw new Error('Error updating balance');
    }
  }

  // Checks if user has enough money to place a bet
  static async hasEnoughBalance(userId: string, amount: number) {
    try {
      const user = await UserModel.findById(userId);
      return user ? user.balance >= amount : false;
    } catch (error) {
      return false;
    }
  }
}
