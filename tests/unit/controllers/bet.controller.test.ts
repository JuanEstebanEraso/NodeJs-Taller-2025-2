import { Request, Response } from 'express';
import { betController } from '../../../src/controllers/bet.controller';

// Mock the service
jest.mock('../../../src/services/bet.service', () => ({
  BetService: {
    createBet: jest.fn(),
    getUserBets: jest.fn(),
    getUserBetStats: jest.fn()
  },
  betService: {
    processBetsForEvent: jest.fn(),
    getEventBets: jest.fn(),
    getAllBets: jest.fn(),
    updateBetStatus: jest.fn(),
    deleteBet: jest.fn()
  }
}));

import { BetService, betService } from '../../../src/services/bet.service';

const mockBetService = BetService as jest.Mocked<typeof BetService>;
const mockBetServiceInstance = betService as jest.Mocked<typeof betService>;

describe('BetController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseObject = {};
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      })
    };
  });

  describe('createBet', () => {
    it('should create bet successfully', async () => {
      const betData = {
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000
      };

      const createdBet = {
        _id: 'betId123',
        user_id: 'userId123',
        ...betData,
        odds: 2.5,
        status: 'pending',
        winnings: 0
      };

      mockRequest.body = { 
        user: { userId: 'userId123', username: 'testuser', role: 'player' },
        ...betData 
      };
      mockBetService.createBet.mockResolvedValue(createdBet as any);

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.createBet).toHaveBeenCalledWith({
        user_id: 'userId123',
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000,
        odds: 0,
        status: 'pending',
        winnings: 0
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        success: true,
        data: createdBet,
        message: 'Bet placed successfully'
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.body.user = undefined;
      mockRequest.body = {
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000
      };

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.body = {
        user: { userId: 'userId123', username: 'testuser', role: 'player' },
        event_id: 'eventId123'
        // missing chosen_option and amount
      };

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event ID, chosen option, and amount are required'
      });
    });

    it('should return 400 if chosen_option is invalid', async () => {
      mockRequest.body = {
        user: { userId: 'userId123', username: 'testuser', role: 'player' },
        event_id: 'eventId123',
        chosen_option: 'invalid_option',
        amount: 1000
      };

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Invalid chosen option (home_win, draw, away_win)'
      });
    });

    it('should return 400 if amount is not a positive number', async () => {
      mockRequest.body = {
        user: { userId: 'userId123', username: 'testuser', role: 'player' },
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: -100
      };

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount must be a positive number'
      });
    });

    it('should handle bet creation error', async () => {
      mockRequest.body = {
        user: { userId: 'userId123', username: 'testuser', role: 'player' },
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000
      };
      mockBetService.createBet.mockRejectedValue(new Error('Insufficient balance'));

      await betController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Insufficient balance'
      });
    });
  });

  describe('getUserBets', () => {
    it('should return user bets successfully', async () => {
      const userBets = [
        {
          _id: 'bet1',
          user_id: 'userId123',
          event_id: 'event1',
          chosen_option: 'home_win',
          amount: 1000,
          status: 'won'
        },
        {
          _id: 'bet2',
          user_id: 'userId123',
          event_id: 'event2',
          chosen_option: 'draw',
          amount: 500,
          status: 'pending'
        }
      ];

      mockRequest.body.user = { userId: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBets.mockResolvedValue(userBets as any);

      await betController.getUserBets(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.getUserBets).toHaveBeenCalledWith('userId123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: userBets,
        count: 2
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.body.user = undefined;

      await betController.getUserBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should handle error fetching bets', async () => {
      mockRequest.body.user = { userId: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBets.mockRejectedValue(new Error('Database error'));

      await betController.getUserBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('processBetsForEvent', () => {
    it('should process bets successfully', async () => {
      const eventId = 'eventId123';
      const processResult = { processed: 5 };

      mockRequest.params = { eventId };
      mockBetServiceInstance.processBetsForEvent.mockResolvedValue(processResult);

      await betController.processBetsForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockBetServiceInstance.processBetsForEvent).toHaveBeenCalledWith(eventId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: processResult,
        message: 'Processed 5 bets successfully'
      });
    });

    it('should handle processing error', async () => {
      const eventId = 'eventId123';

      mockRequest.params = { eventId };
      mockBetServiceInstance.processBetsForEvent.mockRejectedValue(new Error('Event not found'));

      await betController.processBetsForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('getUserBetStats', () => {
    it('should return user bet statistics successfully', async () => {
      const betStats = {
        total: 10,
        won: 4,
        lost: 3,
        pending: 3,
        totalWinnings: 5000
      };

      mockRequest.body.user = { userId: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBetStats.mockResolvedValue(betStats);

      await betController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.getUserBetStats).toHaveBeenCalledWith('userId123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: betStats
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.body.user = undefined;

      await betController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should handle error fetching statistics', async () => {
      mockRequest.body.user = { userId: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBetStats.mockRejectedValue(new Error('Database error'));

      await betController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getEventBets', () => {
    it('should return event bets successfully', async () => {
      const eventId = 'eventId123';
      const mockBets = [
        {
          _id: 'bet1',
          user_id: 'user1',
          event_id: eventId,
          chosen_option: 'home_win',
          amount: 1000,
          status: 'pending'
        }
      ];

      mockRequest.params = { eventId };
      mockBetServiceInstance.getEventBets.mockResolvedValue(mockBets as any);

      await betController.getEventBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockBets,
        count: 1
      });
    });
  });

  describe('getAllBets', () => {
    it('should get all bets successfully', async () => {
      const mockBets = [
        { _id: 'bet1', user_id: 'user1', event_id: 'event1', amount: 100 },
        { _id: 'bet2', user_id: 'user2', event_id: 'event2', amount: 200 }
      ];

      mockBetServiceInstance.getAllBets.mockResolvedValue(mockBets as any);

      await betController.getAllBets(mockRequest as Request, mockResponse as Response);

      expect(mockBetServiceInstance.getAllBets).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: mockBets,
        count: 2
      });
    });

    it('should handle error when getting all bets', async () => {
      const errorMessage = 'Database error';
      mockBetServiceInstance.getAllBets.mockRejectedValue(new Error(errorMessage));

      await betController.getAllBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('updateBetStatus', () => {
    it('should update bet status successfully', async () => {
      const betId = 'bet123';
      const status = 'won';
      const winnings = 500;
      const updatedBet = {
        _id: betId,
        status,
        winnings,
        user_id: 'user123',
        event_id: 'event123'
      };

      mockRequest.params = { id: betId };
      mockRequest.body = { status, winnings };
      mockBetServiceInstance.updateBetStatus.mockResolvedValue(updatedBet as any);

      await betController.updateBetStatus(mockRequest as Request, mockResponse as Response);

      expect(mockBetServiceInstance.updateBetStatus).toHaveBeenCalledWith(betId, status, winnings);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: updatedBet,
        message: 'Bet status updated successfully'
      });
    });

    it('should return 404 if bet not found for update', async () => {
      const betId = 'nonexistentId';
      const status = 'won';
      const winnings = 500;

      mockRequest.params = { id: betId };
      mockRequest.body = { status, winnings };
      mockBetServiceInstance.updateBetStatus.mockResolvedValue(null);

      await betController.updateBetStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'Bet not found'
      });
    });

    it('should handle error when updating bet status', async () => {
      const betId = 'bet123';
      const status = 'won';
      const winnings = 500;
      const errorMessage = 'Update failed';

      mockRequest.params = { id: betId };
      mockRequest.body = { status, winnings };
      mockBetServiceInstance.updateBetStatus.mockRejectedValue(new Error(errorMessage));

      await betController.updateBetStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('deleteBet', () => {
    it('should delete bet successfully', async () => {
      const betId = 'bet123';

      mockRequest.params = { id: betId };
      mockBetServiceInstance.deleteBet.mockResolvedValue(true);

      await betController.deleteBet(mockRequest as Request, mockResponse as Response);

      expect(mockBetServiceInstance.deleteBet).toHaveBeenCalledWith(betId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        message: 'Bet deleted successfully'
      });
    });

    it('should return 404 if bet not found for deletion', async () => {
      const betId = 'nonexistentId';

      mockRequest.params = { id: betId };
      mockBetServiceInstance.deleteBet.mockResolvedValue(false);

      await betController.deleteBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'Bet not found'
      });
    });

    it('should handle error when deleting bet', async () => {
      const betId = 'bet123';
      const errorMessage = 'Delete failed';

      mockRequest.params = { id: betId };
      mockBetServiceInstance.deleteBet.mockRejectedValue(new Error(errorMessage));

      await betController.deleteBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: errorMessage
      });
    });
  });
});
