import { Request, Response } from 'express';
import { BetService, betService } from '../services/bet.service';

export class BetController {
  // Create a new bet
  async createBet(req: Request, res: Response) {
    try {
      const userId = req.body.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { event_id, chosen_option, amount } = req.body;
      
      if (!event_id || !chosen_option || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Event ID, chosen option, and amount are required'
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
        user_id: userId,
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
  async getUserBets(req: Request, res: Response) {
    try {
      const userId = req.body.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

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

  // Get user's betting statistics
  async getUserBetStats(req: Request, res: Response) {
    try {
      const userId = req.body.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

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

  // Process bets for a closed event (admin only)
  async processBetsForEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const result = await betService.processBetsForEvent(eventId);
      
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

  // Get all bets for an event (admin only)
  async getEventBets(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const bets = await betService.getEventBets(eventId);
      
      return res.status(200).json({
        success: true,
        data: bets,
        count: bets.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching event bets'
      });
    }
  }

  // Get all bets (admin only)
  async getAllBets(req: Request, res: Response) {
    try {
      const bets = await betService.getAllBets();
      
      return res.status(200).json({
        success: true,
        data: bets,
        count: bets.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching all bets'
      });
    }
  }

  // Update bet status (admin only)
  async updateBetStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, winnings } = req.body;

      const bet = await betService.updateBetStatus(id, status, winnings);
      
      if (!bet) {
        return res.status(404).json({
          success: false,
          message: 'Bet not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: bet,
        message: 'Bet status updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error updating bet status'
      });
    }
  }

  // Delete bet (admin only)
  async deleteBet(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await betService.deleteBet(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Bet not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bet deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error deleting bet'
      });
    }
  }
}

export const betController = new BetController();
