import { EventService } from '../../../src/services/event.service';

// Mock the EventModel completely
jest.mock('../../../src/models/Event', () => ({
  EventModel: {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  }
}));

import { EventModel } from '../../../src/models/Event';

const mockEventModel = EventModel as jest.Mocked<typeof EventModel>;

describe('EventService (Simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOpenEvents', () => {
    it('should return all open events', async () => {
      const mockOpenEvents = [
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

      mockEventModel.find.mockResolvedValue(mockOpenEvents as any);

      const result = await EventService.getOpenEvents();

      expect(mockEventModel.find).toHaveBeenCalledWith({ status: 'open' });
      expect(result).toEqual(mockOpenEvents);
    });

    it('should return empty array if no open events', async () => {
      mockEventModel.find.mockResolvedValue([]);

      const result = await EventService.getOpenEvents();

      expect(result).toEqual([]);
    });

    it('should throw error if database query fails', async () => {
      mockEventModel.find.mockRejectedValue(new Error('Database error'));

      await expect(EventService.getOpenEvents()).rejects.toThrow('Error fetching open events');
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const eventId = 'event123';
      const mockEvent = {
        _id: eventId,
        name: 'Test Match',
        status: 'open',
        odds: { home_win: 2.5, draw: 3.0, away_win: 2.2 }
      };

      mockEventModel.findById.mockResolvedValue(mockEvent as any);

      const result = await EventService.getEventById(eventId);

      expect(mockEventModel.findById).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(mockEvent);
    });

    it('should return null when event not found', async () => {
      const eventId = 'nonexistentId';

      mockEventModel.findById.mockResolvedValue(null);

      const result = await EventService.getEventById(eventId);

      expect(result).toBeNull();
    });

    it('should throw error if database query fails', async () => {
      const eventId = 'event123';

      mockEventModel.findById.mockRejectedValue(new Error('Database error'));

      await expect(EventService.getEventById(eventId)).rejects.toThrow('Event not found');
    });
  });

  describe('closeEvent', () => {
    it('should close event and set final result successfully', async () => {
      const eventId = 'event123';
      const finalResult = 'home_win';
      const updatedEvent = {
        _id: eventId,
        name: 'Test Match',
        status: 'closed',
        final_result: finalResult
      };

      mockEventModel.findByIdAndUpdate.mockResolvedValue(updatedEvent as any);

      const result = await EventService.closeEvent(eventId, finalResult as any);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        {
          status: 'closed',
          final_result: finalResult
        },
        { new: true }
      );
      expect(result).toEqual(updatedEvent);
    });

    it('should return null if event not found', async () => {
      const eventId = 'nonexistentId';
      const finalResult = 'home_win';

      mockEventModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await EventService.closeEvent(eventId, finalResult as any);

      expect(result).toBeNull();
    });

    it('should throw error if update fails', async () => {
      const eventId = 'event123';
      const finalResult = 'home_win';

      mockEventModel.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      await expect(EventService.closeEvent(eventId, finalResult as any)).rejects.toThrow('Error closing event');
    });
  });

  describe('isEventOpen', () => {
    it('should return true if event is open', async () => {
      const eventId = 'event123';
      const mockEvent = {
        _id: eventId,
        name: 'Test Match',
        status: 'open'
      };

      mockEventModel.findById.mockResolvedValue(mockEvent as any);

      const result = await EventService.isEventOpen(eventId);

      expect(mockEventModel.findById).toHaveBeenCalledWith(eventId);
      expect(result).toBe(true);
    });

    it('should return false if event is closed', async () => {
      const eventId = 'event123';
      const mockEvent = {
        _id: eventId,
        name: 'Test Match',
        status: 'closed'
      };

      mockEventModel.findById.mockResolvedValue(mockEvent as any);

      const result = await EventService.isEventOpen(eventId);

      expect(result).toBe(false);
    });

    it('should return false if event not found', async () => {
      const eventId = 'nonexistentId';

      mockEventModel.findById.mockResolvedValue(null);

      const result = await EventService.isEventOpen(eventId);

      expect(result).toBe(false);
    });

    it('should return false if database query fails', async () => {
      const eventId = 'event123';

      mockEventModel.findById.mockRejectedValue(new Error('Database error'));

      const result = await EventService.isEventOpen(eventId);

      expect(result).toBe(false);
    });
  });
});
