import { BetModel, BetInput, BetStatus } from '../models/Bet';
import { UserService } from './user.service';
import { EventService } from './event.service';

export class BetService {
  // Creates a bet validating balance and event status
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

      // Deducts money from user's balance
      await UserService.updateBalance(betData.user_id, user.balance - betData.amount);

      const bet = new BetModel(betData);
      return await bet.save();
    } catch (error) {
      throw new Error('Error creating bet');
    }
  }

  // Gets user's betting history
  static async getUserBets(userId: string) {
    try {
      return await BetModel.find({ user_id: userId })
        .populate('event_id', 'name odds final_result')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error('Error fetching user bets');
    }
  }

  // Processes all bets when an event is closed
  static async processBetsForEvent(eventId: string) {
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
          // Winning bet - calculates winnings and updates balance
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

  // User betting statistics
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
}
