import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { 
  JWTPayload, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest 
} from '../interfaces/auth.interface';

export class AuthService {
  // Generate JWT token
  static generateToken(userId: string, username: string, role: string): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    return jwt.sign(
      { userId, username, role },
      secret,
      { expiresIn: '1h' }
    );
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Login user
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const { username, password } = loginData;
      const user = await UserModel.findOne({ username });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await this.verifyPassword(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = this.generateToken((user._id as any).toString(), user.username, user.role);

      return {
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          role: user.role,
          balance: user.balance
        },
        token
      };
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  // Register new user
  static async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { username, password, role = 'player' } = registerData;
      
      // Check if user already exists
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const hashedPassword = await this.hashPassword(password);
      
      const user = await UserModel.create({
        username,
        password: hashedPassword,
        balance: 10000, // Default starting balance
        role
      });

      const token = this.generateToken((user._id as any).toString(), user.username, user.role);

      return {
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          role: user.role,
          balance: user.balance
        },
        token
      };
    } catch (error) {
      throw new Error('Registration failed');
    }
  }
}
