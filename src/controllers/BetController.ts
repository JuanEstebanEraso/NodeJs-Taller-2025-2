import { Request, Response } from 'express';
import { BetService } from '../services/BetService';

export class BetController {
  // Create a new bet
  static async createBet(req: Request, res: Response) {
    try {
      const { user_id, event_id, chosen_option, amount } = req.body;
      
      if (!user_id || !event_id || !chosen_option || !amount) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required (user_id, event_id, chosen_option, amount)'
        });
      }

      if (!['home_win', 'draw', 'away_win'].includes(chosen_option)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid chosen option (home_win, draw, away_win)'
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
      }

      const betData = {
        user_id,
        event_id,
        chosen_option,
        amount,
        odds: 0, // Will be set by service
        status: 'pending' as const,
        winnings: 0
      };

      const bet = await BetService.createBet(betData);
      return res.status(201).json({
        success: true,
        data: bet,
        message: 'Bet placed successfully'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error creating bet'
      });
    }
  }

  // Get user's betting history
  static async getUserBets(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const bets = await BetService.getUserBets(userId);
      
      return res.status(200).json({
        success: true,
        data: bets,
        count: bets.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching bets'
      });
    }
  }

  // Process bets for a closed event
  static async processBetsForEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const result = await BetService.processBetsForEvent(eventId);
      
      return res.status(200).json({
        success: true,
        data: result,
        message: `Processed ${result.processed} bets successfully`
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error processing bets'
      });
    }
  }

  // Get user's betting statistics
  static async getUserBetStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const stats = await BetService.getUserBetStats(userId);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching bet statistics'
      });
    }
  }

  // Get all bets for an event (admin only)
  static async getEventBets(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      // This would need to be implemented in BetService
      // For now, return a placeholder response
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Event bets endpoint - to be implemented'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching event bets'
      });
    }
  }
}
