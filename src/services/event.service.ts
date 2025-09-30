import { EventModel, EventInput, EventStatus, ResultType } from '../models/Event';

export class EventService {
  // Basic CRUD operations (static methods)
  static async createEvent(eventData: EventInput) {
    try {
      const event = new EventModel(eventData);
      return await event.save();
    } catch (error) {
      throw new Error('Error creating event');
    }
  }

  static async getEventById(eventId: string) {
    try {
      return await EventModel.findById(eventId);
    } catch (error) {
      throw new Error('Event not found');
    }
  }

  static async getOpenEvents() {
    try {
      return await EventModel.find({ status: 'open' });
    } catch (error) {
      throw new Error('Error fetching open events');
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

  // Administrative operations (instance methods)
  async closeEvent(eventId: string, finalResult: ResultType) {
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

  async getAllEvents() {
    try {
      return await EventModel.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching all events');
    }
  }

  async updateEvent(eventId: string, updateData: Partial<EventInput>) {
    try {
      return await EventModel.findByIdAndUpdate(
        eventId,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error('Error updating event');
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const result = await EventModel.findByIdAndDelete(eventId);
      return result !== null;
    } catch (error) {
      throw new Error('Error deleting event');
    }
  }
}

export const eventService = new EventService();
