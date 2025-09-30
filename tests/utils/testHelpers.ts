/**
 * Test Helper Utilities
 * Provides mock data and helper functions for testing
 */

// Mock data generators
export class TestDataGenerator {
  
  static createMockUser(overrides: any = {}) {
    return {
      _id: 'user123',
      username: 'testuser',
      password: 'hashedpassword',
      balance: 10000,
      role: 'player',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createMockEvent(overrides: any = {}) {
    return {
      _id: 'event123',
      name: 'Test Match: Team A vs Team B',
      status: 'open',
      odds: {
        home_win: 2.5,
        draw: 3.0,
        away_win: 2.2
      },
      final_result: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createMockBet(overrides: any = {}) {
    return {
      _id: 'bet123',
      user_id: 'user123',
      event_id: 'event123',
      chosen_option: 'home_win',
      odds: 2.5,
      amount: 1000,
      status: 'pending',
      winnings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createMockAdmin(overrides: any = {}) {
    return this.createMockUser({
      _id: 'admin123',
      username: 'admin',
      role: 'admin',
      ...overrides
    });
  }

  static createMockJWTPayload(overrides: any = {}) {
    return {
      id: 'user123',
      username: 'testuser',
      role: 'player',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      ...overrides
    };
  }
}

// Test helper functions
export class TestHelpers {
  
  static generateValidToken() {
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxMjMiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwicm9sZSI6InBsYXllciJ9.test';
  }

  static generateExpiredToken() {
    return 'expired.jwt.token';
  }

  static generateInvalidToken() {
    return 'invalid.token.format';
  }

  static createMockRequest(overrides: any = {}) {
    return {
      headers: {},
      body: {},
      params: {},
      query: {},
      user: null,
      ...overrides
    };
  }

  static createMockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }

  static createMockNext() {
    return jest.fn();
  }

  // Mock cleanup - simplified version that doesn't use actual models
  static async cleanupTestData() {
    // This is a mock function for test cleanup
    // In unit tests, we don't need actual database operations
    return Promise.resolve();
  }
}

// Validation test data
export const VALIDATION_TEST_DATA = {
  validUser: {
    username: 'testuser',
    password: 'password123',
    balance: 10000,
    role: 'player'
  },
  
  invalidUser: {
    username: '', // Invalid: empty username
    password: '123', // Invalid: too short
    balance: -100, // Invalid: negative balance
    role: 'invalid' // Invalid: not admin or player
  },
  
  validEvent: {
    name: 'Real Madrid vs Barcelona',
    status: 'open',
    odds: {
      home_win: 2.5,
      draw: 3.0,
      away_win: 2.2
    }
  },
  
  invalidEvent: {
    name: '', // Invalid: empty name
    status: 'invalid', // Invalid: not open or closed
    odds: {
      home_win: 1.0 // Invalid: odds too low
    }
  },
  
  validBet: {
    user_id: 'user123',
    event_id: 'event123',
    chosen_option: 'home_win',
    odds: 2.5,
    amount: 1000,
    status: 'pending',
    winnings: 0
  },
  
  invalidBet: {
    user_id: '', // Invalid: empty user_id
    event_id: '', // Invalid: empty event_id
    chosen_option: 'invalid', // Invalid: not home_win, draw, or away_win
    odds: 0, // Invalid: zero odds
    amount: -100, // Invalid: negative amount
    status: 'invalid', // Invalid: not pending, won, or lost
    winnings: -50 // Invalid: negative winnings
  }
};

export default {
  TestDataGenerator,
  TestHelpers,
  VALIDATION_TEST_DATA
};