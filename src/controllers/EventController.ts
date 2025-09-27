import { Request, Response } from 'express';
import { EventService } from '../services/EventService';

export class EventController {
  // Create a new event
  static async createEvent(req: Request, res: Response) {
    try {
      const { name, odds } = req.body;
      
      if (!name || !odds || !odds.home_win || !odds.draw || !odds.away_win) {
        return res.status(400).json({
          success: false,
          message: 'Event name and all odds are required'
        });
      }

      const eventData = {
        name,
        odds,
        status: 'open' as const
      };

      const event = await EventService.createEvent(eventData);
      return res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating event'
      });
    }
  }

  // Get all open events
  static async getOpenEvents(req: Request, res: Response) {
    try {
      const events = await EventService.getOpenEvents();
      
      return res.status(200).json({
        success: true,
        data: events,
        count: events.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching events'
      });
    }
  }

  // Get event by ID
  static async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: event
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching event'
      });
    }
  }

  // Close event and set final result
  static async closeEvent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { final_result } = req.body;

      if (!final_result || !['home_win', 'draw', 'away_win'].includes(final_result)) {
        return res.status(400).json({
          success: false,
          message: 'Valid final result is required (home_win, draw, away_win)'
        });
      }

      const event = await EventService.closeEvent(id, final_result);
      
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: event,
        message: 'Event closed successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error closing event'
      });
    }
  }

  // Check if event is open for betting
  static async checkEventStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isOpen = await EventService.isEventOpen(id);
      
      return res.status(200).json({
        success: true,
        data: { isOpen }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error checking event status'
      });
    }
  }
}
