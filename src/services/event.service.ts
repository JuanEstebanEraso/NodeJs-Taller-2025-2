import { EventModel, EventInput, EventStatus, ResultType } from '../models/Event';

export class EventService {
  static async createEvent(eventData: EventInput) {
    try {
      const event = new EventModel(eventData);
      return await event.save();
    } catch (error) {
      throw new Error('Error creating event');
    }
  }

  // Gets only events where betting is allowed
  static async getOpenEvents() {
    try {
      return await EventModel.find({ status: 'open' });
    } catch (error) {
      throw new Error('Error fetching open events');
    }
  }

  static async getEventById(eventId: string) {
    try {
      return await EventModel.findById(eventId);
    } catch (error) {
      throw new Error('Event not found');
    }
  }

  // Closes event and sets final result
  static async closeEvent(eventId: string, finalResult: ResultType) {
    try {
      return await EventModel.findByIdAndUpdate(
        eventId,
        { 
          status: 'closed' as EventStatus,
          final_result: finalResult 
        },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error closing event');
    }
  }

  static async isEventOpen(eventId: string) {
    try {
      const event = await EventModel.findById(eventId);
      return event ? event.status === 'open' : false;
    } catch (error) {
      return false;
    }
  }
}
