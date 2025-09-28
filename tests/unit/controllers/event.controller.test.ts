import { Request, Response } from 'express';
import { EventController } from '../../../src/controllers/event.controller';
import { EventService } from '../../../src/services/event.service';

// Mock the service
jest.mock('../../../src/services/event.service');

const mockEventService = EventService as jest.Mocked<typeof EventService>;

describe('EventController', () => {
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

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventData = {
        name: 'Test Match: Team A vs Team B',
        odds: {
          home_win: 2.5,
          draw: 3.0,
          away_win: 2.2
        }
      };

      const createdEvent = {
        _id: 'eventId123',
        ...eventData,
        status: 'open'
      };

      mockRequest.body = eventData;
      mockEventService.createEvent.mockResolvedValue(createdEvent as any);

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.createEvent).toHaveBeenCalledWith({
        name: eventData.name,
        odds: eventData.odds,
        status: 'open'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toEqual({
        success: true,
        data: createdEvent,
        message: 'Event created successfully'
      });
    });

    it('should return 400 if name is missing', async () => {
      mockRequest.body = {
        odds: {
          home_win: 2.5,
          draw: 3.0,
          away_win: 2.2
        }
      };

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event name and all odds are required'
      });
    });

    it('should return 400 if odds are incomplete', async () => {
      mockRequest.body = {
        name: 'Test Match',
        odds: {
          home_win: 2.5,
          draw: 3.0
          // missing away_win
        }
      };

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event name and all odds are required'
      });
    });

    it('should handle creation error', async () => {
      const eventData = {
        name: 'Test Match',
        odds: {
          home_win: 2.5,
          draw: 3.0,
          away_win: 2.2
        }
      };

      mockRequest.body = eventData;
      mockEventService.createEvent.mockRejectedValue(new Error('Database error'));

      await EventController.createEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getOpenEvents', () => {
    it('should return all open events', async () => {
      const openEvents = [
        {
          _id: 'event1',
          name: 'Match 1',
          status: 'open',
          odds: { home_win: 2.0, draw: 3.0, away_win: 2.5 }
        },
        {
          _id: 'event2',
          name: 'Match 2',
          status: 'open',
          odds: { home_win: 1.8, draw: 3.2, away_win: 3.0 }
        }
      ];

      mockEventService.getOpenEvents.mockResolvedValue(openEvents as any);

      await EventController.getOpenEvents(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.getOpenEvents).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: openEvents,
        count: 2
      });
    });

    it('should return empty array if no open events', async () => {
      mockEventService.getOpenEvents.mockResolvedValue([]);

      await EventController.getOpenEvents(mockRequest as Request, mockResponse as Response);

      expect(responseObject).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });

    it('should handle error when fetching events', async () => {
      mockEventService.getOpenEvents.mockRejectedValue(new Error('Database error'));

      await EventController.getOpenEvents(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const eventId = 'eventId123';
      const event = {
        _id: eventId,
        name: 'Test Match',
        status: 'open',
        odds: { home_win: 2.5, draw: 3.0, away_win: 2.2 }
      };

      mockRequest.params = { id: eventId };
      mockEventService.getEventById.mockResolvedValue(event as any);

      await EventController.getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.getEventById).toHaveBeenCalledWith(eventId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: event
      });
    });

    it('should return 404 if event not found', async () => {
      const eventId = 'nonexistentId';

      mockRequest.params = { id: eventId };
      mockEventService.getEventById.mockResolvedValue(null);

      await EventController.getEventById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('closeEvent', () => {
    it('should close event successfully', async () => {
      const eventId = 'eventId123';
      const finalResult = 'home_win';
      const closedEvent = {
        _id: eventId,
        name: 'Test Match',
        status: 'closed',
        final_result: finalResult
      };

      mockRequest.params = { id: eventId };
      mockRequest.body = { final_result: finalResult };
      mockEventService.closeEvent.mockResolvedValue(closedEvent as any);

      await EventController.closeEvent(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.closeEvent).toHaveBeenCalledWith(eventId, finalResult);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: closedEvent,
        message: 'Event closed successfully'
      });
    });

    it('should return 400 if final_result is missing', async () => {
      mockRequest.params = { id: 'eventId123' };
      mockRequest.body = {};

      await EventController.closeEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Valid final result is required (home_win, draw, away_win)'
      });
    });

    it('should return 400 if final_result is invalid', async () => {
      mockRequest.params = { id: 'eventId123' };
      mockRequest.body = { final_result: 'invalid_result' };

      await EventController.closeEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toEqual({
        success: false,
        message: 'Valid final result is required (home_win, draw, away_win)'
      });
    });

    it('should return 404 if event not found', async () => {
      mockRequest.params = { id: 'nonexistentId' };
      mockRequest.body = { final_result: 'home_win' };
      mockEventService.closeEvent.mockResolvedValue(null);

      await EventController.closeEvent(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toEqual({
        success: false,
        message: 'Event not found'
      });
    });
  });

  describe('checkEventStatus', () => {
    it('should return event status successfully', async () => {
      const eventId = 'eventId123';

      mockRequest.params = { id: eventId };
      mockEventService.isEventOpen.mockResolvedValue(true);

      await EventController.checkEventStatus(mockRequest as Request, mockResponse as Response);

      expect(mockEventService.isEventOpen).toHaveBeenCalledWith(eventId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toEqual({
        success: true,
        data: { isOpen: true }
      });
    });

    it('should return false for closed event', async () => {
      const eventId = 'eventId123';

      mockRequest.params = { id: eventId };
      mockEventService.isEventOpen.mockResolvedValue(false);

      await EventController.checkEventStatus(mockRequest as Request, mockResponse as Response);

      expect(responseObject).toEqual({
        success: true,
        data: { isOpen: false }
      });
    });

    it('should handle error checking event status', async () => {
      const eventId = 'eventId123';

      mockRequest.params = { id: eventId };
      mockEventService.isEventOpen.mockRejectedValue(new Error('Database error'));

      await EventController.checkEventStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject).toEqual({
        success: false,
        message: 'Database error'
      });
    });
  });
});
