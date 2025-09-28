import { Request, Response } from 'express';
import { BetController } from '../../../src/controllers/bet.controller';
import { BetService } from '../../../src/services/bet.service';

// Mock the service
jest.mock('../../../src/services/bet.service');

const mockBetService = BetService as jest.Mocked<typeof BetService>;

describe('BetController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    responseObject = {};
    mockRequest = {};
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

      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockRequest.body = betData;
      mockBetService.createBet.mockResolvedValue(createdBet as any);

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

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
      mockRequest.user = undefined;
      mockRequest.body = {
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000
      };

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockRequest.body = {
        event_id: 'eventId123'
        // missing chosen_option and amount
      };

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event ID, chosen option, and amount are required'
      });
    });

    it('should return 400 if chosen_option is invalid', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockRequest.body = {
        event_id: 'eventId123',
        chosen_option: 'invalid_option',
        amount: 1000
      };

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Invalid chosen option (home_win, draw, away_win)'
      });
    });

    it('should return 400 if amount is not a positive number', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockRequest.body = {
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: -100
      };

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Amount must be a positive number'
      });
    });

    it('should handle bet creation error', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockRequest.body = {
        event_id: 'eventId123',
        chosen_option: 'home_win',
        amount: 1000
      };
      mockBetService.createBet.mockRejectedValue(new Error('Insufficient balance'));

      await BetController.createBet(mockRequest as Request, mockResponse as Response);

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

      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBets.mockResolvedValue(userBets as any);

      await BetController.getUserBets(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.getUserBets).toHaveBeenCalledWith('userId123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: userBets,
        count: 2
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await BetController.getUserBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should handle error fetching bets', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBets.mockRejectedValue(new Error('Database error'));

      await BetController.getUserBets(mockRequest as Request, mockResponse as Response);

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
      mockBetService.processBetsForEvent.mockResolvedValue(processResult);

      await BetController.processBetsForEvent(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.processBetsForEvent).toHaveBeenCalledWith(eventId);
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
      mockBetService.processBetsForEvent.mockRejectedValue(new Error('Event not found'));

      await BetController.processBetsForEvent(mockRequest as Request, mockResponse as Response);

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

      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBetStats.mockResolvedValue(betStats);

      await BetController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockBetService.getUserBetStats).toHaveBeenCalledWith('userId123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: betStats
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockRequest.user = undefined;

      await BetController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject).toEqual({
        success: false,
        message: 'User not authenticated'
      });
    });

    it('should handle error fetching statistics', async () => {
      mockRequest.user = { id: 'userId123', username: 'testuser', role: 'player' };
      mockBetService.getUserBetStats.mockRejectedValue(new Error('Database error'));

      await BetController.getUserBetStats(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getEventBets', () => {
    it('should return placeholder response', async () => {
      const eventId = 'eventId123';

      mockRequest.params = { eventId };

      await BetController.getEventBets(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: [],
        message: 'Event bets endpoint - to be implemented'
      });
    });
  });
});
