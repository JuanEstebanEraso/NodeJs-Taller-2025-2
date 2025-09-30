// Tests for validation utilities and business logic

describe('Betting System Validation Tests', () => {
  describe('User Validation', () => {
    it('should validate username format', () => {
      const isValidUsername = (username: string): boolean => {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
      };

      expect(isValidUsername('testuser')).toBe(true);
      expect(isValidUsername('admin123')).toBe(true);
      expect(isValidUsername('us')).toBe(false); // too short
      expect(isValidUsername('')).toBe(false); // empty
      expect(isValidUsername('user@domain')).toBe(false); // invalid chars
    });

    it('should validate user roles', () => {
      const isValidRole = (role: string): boolean => {
        return ['admin', 'player'].includes(role);
      };

      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('player')).toBe(true);
      expect(isValidRole('moderator')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });

    it('should validate balance amounts', () => {
      const isValidBalance = (balance: number): boolean => {
        return typeof balance === 'number' && balance >= 0 && balance <= 1000000;
      };

      expect(isValidBalance(10000)).toBe(true);
      expect(isValidBalance(0)).toBe(true);
      expect(isValidBalance(-100)).toBe(false);
      expect(isValidBalance(1000001)).toBe(false);
    });
  });

  describe('Event Validation', () => {
    it('should validate event names', () => {
      const isValidEventName = (name: string): boolean => {
        return name.length >= 5 && name.length <= 100;
      };

      expect(isValidEventName('Real Madrid vs Barcelona')).toBe(true);
      expect(isValidEventName('Team A vs Team B')).toBe(true);
      expect(isValidEventName('A vs B')).toBe(true); // actually valid length
      expect(isValidEventName('')).toBe(false);
    });

    it('should validate odds format', () => {
      const isValidOdds = (odds: any): boolean => {
        if (!odds || typeof odds !== 'object') return false;
        return typeof odds.home_win === 'number' &&
               typeof odds.draw === 'number' &&
               typeof odds.away_win === 'number' &&
               odds.home_win > 1 &&
               odds.draw > 1 &&
               odds.away_win > 1;
      };

      expect(isValidOdds({ home_win: 2.5, draw: 3.0, away_win: 2.2 })).toBe(true);
      expect(isValidOdds({ home_win: 1.0, draw: 3.0, away_win: 2.2 })).toBe(false); // odds too low
      expect(isValidOdds({ home_win: 2.5, draw: 3.0 })).toBe(false); // missing away_win
      expect(isValidOdds(null)).toBe(false);
    });

    it('should validate event status', () => {
      const isValidStatus = (status: string): boolean => {
        return ['open', 'closed'].includes(status);
      };

      expect(isValidStatus('open')).toBe(true);
      expect(isValidStatus('closed')).toBe(true);
      expect(isValidStatus('pending')).toBe(false);
      expect(isValidStatus('')).toBe(false);
    });

    it('should validate result types', () => {
      const isValidResult = (result: string): boolean => {
        return ['home_win', 'draw', 'away_win'].includes(result);
      };

      expect(isValidResult('home_win')).toBe(true);
      expect(isValidResult('draw')).toBe(true);
      expect(isValidResult('away_win')).toBe(true);
      expect(isValidResult('tie')).toBe(false);
      expect(isValidResult('')).toBe(false);
    });
  });

  describe('Bet Validation', () => {
    it('should validate bet amounts', () => {
      const isValidBetAmount = (amount: number, userBalance: number): boolean => {
        return typeof amount === 'number' &&
               amount > 0 &&
               amount <= userBalance &&
               amount <= 10000; // max bet limit
      };

      expect(isValidBetAmount(1000, 5000)).toBe(true);
      expect(isValidBetAmount(5000, 5000)).toBe(true); // max allowed
      expect(isValidBetAmount(6000, 5000)).toBe(false); // exceeds balance
      expect(isValidBetAmount(-100, 5000)).toBe(false); // negative amount
      expect(isValidBetAmount(15000, 20000)).toBe(false); // exceeds max bet
    });

    it('should validate bet choices', () => {
      const isValidBetChoice = (choice: string): boolean => {
        return ['home_win', 'draw', 'away_win'].includes(choice);
      };

      expect(isValidBetChoice('home_win')).toBe(true);
      expect(isValidBetChoice('draw')).toBe(true);
      expect(isValidBetChoice('away_win')).toBe(true);
      expect(isValidBetChoice('home')).toBe(false);
      expect(isValidBetChoice('')).toBe(false);
    });

    it('should calculate potential winnings', () => {
      const calculateWinnings = (amount: number, odds: number): number => {
        return amount * odds;
      };

      expect(calculateWinnings(1000, 2.5)).toBe(2500);
      expect(calculateWinnings(500, 3.0)).toBe(1500);
      expect(calculateWinnings(100, 1.5)).toBe(150);
      expect(calculateWinnings(0, 2.0)).toBe(0);
    });

    it('should validate bet status transitions', () => {
      const isValidStatusTransition = (from: string, to: string): boolean => {
        const validTransitions: Record<string, string[]> = {
          'pending': ['won', 'lost'],
          'won': [],
          'lost': []
        };
        
        return validTransitions[from]?.includes(to) || false;
      };

      expect(isValidStatusTransition('pending', 'won')).toBe(true);
      expect(isValidStatusTransition('pending', 'lost')).toBe(true);
      expect(isValidStatusTransition('won', 'lost')).toBe(false);
      expect(isValidStatusTransition('lost', 'won')).toBe(false);
      expect(isValidStatusTransition('pending', 'pending')).toBe(false);
    });
  });

  describe('Business Logic Tests', () => {
    it('should calculate user profit/loss correctly', () => {
      const calculateNetProfit = (bets: Array<{amount: number, winnings: number}>): number => {
        const totalSpent = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const totalWon = bets.reduce((sum, bet) => sum + bet.winnings, 0);
        return totalWon - totalSpent;
      };

      const userBets = [
        { amount: 1000, winnings: 2500 }, // won bet
        { amount: 500, winnings: 0 },     // lost bet
        { amount: 800, winnings: 0 },     // lost bet
        { amount: 200, winnings: 600 }    // won bet
      ];

      expect(calculateNetProfit(userBets)).toBe(600); // 3100 won - 2500 spent = 600 profit
    });

    it('should calculate house edge', () => {
      const calculateHouseEdge = (odds: {home_win: number, draw: number, away_win: number}): number => {
        const totalImpliedProbability = (1/odds.home_win) + (1/odds.draw) + (1/odds.away_win);
        return ((totalImpliedProbability - 1) * 100); // Convert to percentage
      };

      const odds = { home_win: 2.0, draw: 3.0, away_win: 4.0 };
      const houseEdge = calculateHouseEdge(odds);
      
      expect(houseEdge).toBeGreaterThan(0); // House should have an edge
      expect(houseEdge).toBeLessThan(20); // Reasonable house edge
    });

    it('should validate betting windows', () => {
      const isBettingAllowed = (eventStatus: string, eventStartTime?: Date): boolean => {
        if (eventStatus !== 'open') return false;
        if (!eventStartTime) return true; // No start time restriction
        
        const now = new Date();
        const timeDiff = eventStartTime.getTime() - now.getTime();
        const minutesUntilStart = timeDiff / (1000 * 60);
        
        return minutesUntilStart > 5; // Stop betting 5 minutes before event
      };

      const futureEvent = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const soonEvent = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
      const pastEvent = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

      expect(isBettingAllowed('open', futureEvent)).toBe(true);
      expect(isBettingAllowed('open', soonEvent)).toBe(false);
      expect(isBettingAllowed('open', pastEvent)).toBe(false);
      expect(isBettingAllowed('closed', futureEvent)).toBe(false);
    });
  });
});
