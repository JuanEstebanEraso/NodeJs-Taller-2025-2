import { Request, Response } from 'express';
import { UserService, userService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse,
  ApiResponse 
} from '../interfaces';

export class UserController {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const registerData: RegisterRequest = req.body;
      
      if (!registerData.username || !registerData.password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const result: AuthResponse = await AuthService.register(registerData);
      
      return res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const loginData: LoginRequest = req.body;
      
      if (!loginData.username || !loginData.password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const result: AuthResponse = await AuthService.login(loginData);
      
      return res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const user = await UserService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          role: user.role,
          balance: user.balance
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching profile'
      });
    }
  }

  // Create a new user (admin only)
  async createUser(req: Request, res: Response) {
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
  async getUserById(req: Request, res: Response) {
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
  async updateBalance(req: Request, res: Response) {
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
  async checkBalance(req: Request, res: Response) {
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

  //admin only
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      
      return res.status(200).json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching users'
      });
    }
  }

  //admin only
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await userService.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating user'
      });
    }
  }

  // admin only
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await userService.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting user'
      });
    }
  }
}


export const userController = new UserController();
