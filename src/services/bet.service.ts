import { BetModel, BetInput, BetStatus } from '../models/Bet';
import { UserService } from './user.service';
import { EventService } from './event.service';

export class BetService {
  // Basic operations (static methods)
  static async createBet(betData: BetInput) {
    try {
      const hasBalance = await UserService.hasEnoughBalance(betData.user_id, betData.amount);
      if (!hasBalance) {
        throw new Error('Insufficient balance');
      }

      const isOpen = await EventService.isEventOpen(betData.event_id);
      if (!isOpen) {
        throw new Error('Event is closed');
      }

      const user = await UserService.getUserById(betData.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      // Deduct money from user's balance
      await UserService.updateBalance(betData.user_id, user.balance - betData.amount);

      const bet = new BetModel(betData);
      return await bet.save();
    } catch (error) {
      throw new Error('Error creating bet');
    }
  }

  static async getUserBets(userId: string) {
    try {
      return await BetModel.find({ user_id: userId })
        .populate('event_id', 'name odds final_result')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching user bets');
    }
  }

  static async getUserBetStats(userId: string) {
    try {
      const bets = await BetModel.find({ user_id: userId });
      
      const stats = {
        total: bets.length,
        won: bets.filter(bet => bet.status === 'won').length,
        lost: bets.filter(bet => bet.status === 'lost').length,
        pending: bets.filter(bet => bet.status === 'pending').length,
        totalWinnings: bets.reduce((sum, bet) => sum + bet.winnings, 0)
      };

      return stats;
    } catch (error) {
      throw new Error('Error fetching bet statistics');
    }
  }

  // Administrative operations (instance methods)
  async processBetsForEvent(eventId: string) {
    try {
      const event = await EventService.getEventById(eventId);
      if (!event || !event.final_result) {
        throw new Error('Event not found or no final result');
      }

      const bets = await BetModel.find({ 
        event_id: eventId, 
        status: 'pending' 
      });

      for (const bet of bets) {
        if (bet.chosen_option === event.final_result) {
          // Winning bet - calculate winnings and update balance
          const winnings = bet.amount * bet.odds;
          await BetModel.findByIdAndUpdate(bet._id, {
            status: 'won' as BetStatus,
            winnings: winnings
          });

          const user = await UserService.getUserById(bet.user_id);
          if (user) {
            await UserService.updateBalance(bet.user_id, user.balance + winnings);
          }
        } else {
          // Losing bet
          await BetModel.findByIdAndUpdate(bet._id, {
            status: 'lost' as BetStatus,
            winnings: 0
          });
        }
      }

      return { processed: bets.length };
    } catch (error) {
      throw new Error('Error processing bets');
    }
  }

  async getAllBets() {
    try {
      return await BetModel.find()
        .populate('user_id', 'username')
        .populate('event_id', 'name odds final_result')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching all bets');
    }
  }

  async getEventBets(eventId: string) {
    try {
      return await BetModel.find({ event_id: eventId })
        .populate('user_id', 'username')
        .populate('event_id', 'name odds final_result')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching event bets');
    }
  }

  async updateBetStatus(betId: string, status: BetStatus, winnings: number = 0) {
    try {
      return await BetModel.findByIdAndUpdate(
        betId,
        { status, winnings },
        { new: true }
      );
    } catch (error) {
      throw new Error('Error updating bet status');
    }
  }

  async deleteBet(betId: string) {
    try {
      const result = await BetModel.findByIdAndDelete(betId);
      return result !== null;
    } catch (error) {
      throw new Error('Error deleting bet');
    }
  }
}

export const betService = new BetService();
