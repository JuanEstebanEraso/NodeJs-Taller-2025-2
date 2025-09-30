// Mock bcryptjs for testing
const bcryptjs = {
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
  hashSync: jest.fn(),
  compareSync: jest.fn()
};

export default bcryptjs;
