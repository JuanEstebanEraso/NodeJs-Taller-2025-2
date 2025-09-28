// User related interfaces

// User data for API responses (without sensitive info)
export interface UserResponse {
  id: string;
  username: string;
  role: string;
  balance: number;
}

// User creation data
export interface CreateUserRequest {
  username: string;
  password: string;
  balance?: number;
  role?: string;
}

// User update data
export interface UpdateUserRequest {
  username?: string;
  balance?: number;
  role?: string;
}

// User balance check request
export interface BalanceCheckRequest {
  amount: number;
}

// User balance check response
export interface BalanceCheckResponse {
  hasEnoughBalance: boolean;
  currentBalance: number;
  requestedAmount: number;
}
