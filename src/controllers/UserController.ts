import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  // Create a new user
  static async createUser(req: Request, res: Response) {
    try {
      const { username, password, balance, role } = req.body;
      
      const userData = {
        username,
        password,
        balance: balance || 10000,
        role: role || 'player'
      };

      const user = await UserService.createUser(userData);
      return res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating user'
      });
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching user'
      });
    }
  }

  // Update user balance
  static async updateBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { balance } = req.body;

      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid balance amount'
        });
      }

      const user = await UserService.updateBalance(id, balance);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
        message: 'Balance updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating balance'
      });
    }
  }

  // Check if user has enough balance
  static async checkBalance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.query;

      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required and must be a number'
        });
      }

      const hasEnough = await UserService.hasEnoughBalance(id, Number(amount));
      
      return res.status(200).json({
        success: true,
        data: { hasEnoughBalance: hasEnough }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error checking balance'
      });
    }
  }
}
