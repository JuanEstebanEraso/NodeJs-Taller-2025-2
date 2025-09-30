// Mock jsonwebtoken for testing
const jsonwebtoken = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
  JsonWebTokenError: class JsonWebTokenError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'JsonWebTokenError';
    }
  },
  TokenExpiredError: class TokenExpiredError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TokenExpiredError';
    }
  }
};

export default jsonwebtoken;
