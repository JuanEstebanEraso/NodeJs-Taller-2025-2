// JWT Authentication Interfaces

// Payload that gets encoded in the JWT token
export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;  // issued at
  exp?: number;  // expires at
}

// Response from login/register endpoints
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    role: string;
    balance: number;
  };
  token: string;
}

// User information attached to request after authentication
export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

// Login request body
export interface LoginRequest {
  username: string;
  password: string;
}

// Register request body
export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}

// Token verification result
export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}
