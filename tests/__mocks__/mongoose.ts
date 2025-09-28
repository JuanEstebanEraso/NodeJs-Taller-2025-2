// Complete mock of mongoose for testing
const mockObjectId = jest.fn().mockImplementation((id) => id || 'mockObjectId');

const mongoose = {
  Schema: class MockSchema {
    definition: any;
    options: any;
    
    constructor(definition: any, options?: any) {
      this.definition = definition;
      this.options = options;
    }
    
    static Types = {
      ObjectId: mockObjectId
    };

    Types = {
      ObjectId: mockObjectId
    };
  },
  
  model: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  connection: {
    close: jest.fn().mockResolvedValue(undefined),
    collections: {},
    readyState: 1
  },
  Types: {
    ObjectId: mockObjectId
  }
};

// Make sure Schema.Types is available
mongoose.Schema.Types = {
  ObjectId: mockObjectId
};

export default mongoose;