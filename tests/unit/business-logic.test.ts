// Tests for business logic functions extracted from the application

describe('Sports Betting Business Logic', () => {
  describe('User Management Logic', () => {
    it('should validate username requirements', () => {
      const validateUsername = (username: string): { valid: boolean; error?: string } => {
        if (!username) return { valid: false, error: 'Username is required' };
        if (username.length < 3) return { valid: false, error: 'Username too short' };
        if (username.length > 20) return { valid: false, error: 'Username too long' };
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: 'Invalid characters' };
        return { valid: true };
      };

      expect(validateUsername('testuser')).toEqual({ valid: true });
      expect(validateUsername('admin123')).toEqual({ valid: true });
      expect(validateUsername('user_name')).toEqual({ valid: true });
      expect(validateUsername('us')).toEqual({ valid: false, error: 'Username too short' });
      expect(validateUsername('')).toEqual({ valid: false, error: 'Username is required' });
      expect(validateUsername('user@domain')).toEqual({ valid: false, error: 'Invalid characters' });
    });

    it('should validate user balance operations', () => {
      const validateBalanceOperation = (currentBalance: number, operation: number): { valid: boolean; newBalance?: number; error?: string } => {
        if (typeof currentBalance !== 'number' || currentBalance < 0) {
          return { valid: false, error: 'Invalid current balance' };
        }
        if (typeof operation !== 'number') {
          return { valid: false, error: 'Invalid operation amount' };
        }
        
        const newBalance = currentBalance + operation;
        if (newBalance < 0) {
          return { valid: false, error: 'Insufficient funds' };
        }
        
        return { valid: true, newBalance };
      };

      expect(validateBalanceOperation(10000, -1000)).toEqual({ valid: true, newBalance: 9000 });
      expect(validateBalanceOperation(10000, 5000)).toEqual({ valid: true, newBalance: 15000 });
      expect(validateBalanceOperation(500, -1000)).toEqual({ valid: false, error: 'Insufficient funds' });
      expect(validateBalanceOperation(-100, 1000)).toEqual({ valid: false, error: 'Invalid current balance' });
    });
  });

  describe('Event Management Logic', () => {
    it('should validate event odds', () => {
      const validateEventOdds = (odds: any): { valid: boolean; error?: string } => {
        if (!odds || typeof odds !== 'object') {
          return { valid: false, error: 'Odds object is required' };
        }
        
        const requiredFields = ['home_win', 'draw', 'away_win'];
        for (const field of requiredFields) {
          if (typeof odds[field] !== 'number' || odds[field] <= 1) {
            return { valid: false, error: `Invalid ${field} odds` };
          }
        }
        
        return { valid: true };
      };

      expect(validateEventOdds({ home_win: 2.5, draw: 3.0, away_win: 2.2 })).toEqual({ valid: true });
      expect(validateEventOdds({ home_win: 1.8, draw: 3.5, away_win: 4.0 })).toEqual({ valid: true });
      expect(validateEventOdds({ home_win: 0.5, draw: 3.0, away_win: 2.2 })).toEqual({ valid: false, error: 'Invalid home_win odds' });
      expect(validateEventOdds({ home_win: 2.5, draw: 3.0 })).toEqual({ valid: false, error: 'Invalid away_win odds' });
      expect(validateEventOdds(null)).toEqual({ valid: false, error: 'Odds object is required' });
    });

    it('should calculate house edge correctly', () => {
      const calculateHouseEdge = (odds: { home_win: number; draw: number; away_win: number }): number => {
        const impliedProbabilities = {
          home_win: 1 / odds.home_win,
          draw: 1 / odds.draw,
          away_win: 1 / odds.away_win
        };
        
        const totalImpliedProbability = impliedProbabilities.home_win + impliedProbabilities.draw + impliedProbabilities.away_win;
        return Math.round((totalImpliedProbability - 1) * 10000) / 100; // Percentage with 2 decimals
      };

      const odds1 = { home_win: 2.0, draw: 3.0, away_win: 4.0 };
      const houseEdge1 = calculateHouseEdge(odds1);
      expect(houseEdge1).toBeGreaterThan(0);
      expect(houseEdge1).toBeLessThan(20);

      const odds2 = { home_win: 1.9, draw: 3.5, away_win: 4.5 };
      const houseEdge2 = calculateHouseEdge(odds2);
      expect(houseEdge2).toBeGreaterThan(0);
    });
  });

  describe('Betting Logic', () => {
    it('should validate bet creation requirements', () => {
      const validateBetCreation = (
        userBalance: number,
        betAmount: number,
        eventStatus: string,
        chosenOption: string
      ): { valid: boolean; error?: string } => {
        if (eventStatus !== 'open') {
          return { valid: false, error: 'Event is not open for betting' };
        }
        
        if (!['home_win', 'draw', 'away_win'].includes(chosenOption)) {
          return { valid: false, error: 'Invalid betting option' };
        }
        
        if (betAmount <= 0) {
          return { valid: false, error: 'Bet amount must be positive' };
        }
        
        if (betAmount > userBalance) {
          return { valid: false, error: 'Insufficient balance' };
        }
        
        if (betAmount > 10000) {
          return { valid: false, error: 'Bet amount exceeds maximum limit' };
        }
        
        return { valid: true };
      };

      expect(validateBetCreation(10000, 1000, 'open', 'home_win')).toEqual({ valid: true });
      expect(validateBetCreation(10000, 5000, 'closed', 'home_win')).toEqual({ valid: false, error: 'Event is not open for betting' });
      expect(validateBetCreation(10000, 15000, 'open', 'home_win')).toEqual({ valid: false, error: 'Insufficient balance' });
      expect(validateBetCreation(20000, 15000, 'open', 'home_win')).toEqual({ valid: false, error: 'Bet amount exceeds maximum limit' });
      expect(validateBetCreation(10000, 1000, 'open', 'invalid_option')).toEqual({ valid: false, error: 'Invalid betting option' });
    });

    it('should calculate bet winnings correctly', () => {
      const calculateBetWinnings = (
        betAmount: number,
        odds: number,
        chosenOption: string,
        finalResult: string
      ): { won: boolean; winnings: number } => {
        if (chosenOption === finalResult) {
          return { won: true, winnings: betAmount * odds };
        } else {
          return { won: false, winnings: 0 };
        }
      };

      expect(calculateBetWinnings(1000, 2.5, 'home_win', 'home_win')).toEqual({ won: true, winnings: 2500 });
      expect(calculateBetWinnings(1000, 2.5, 'home_win', 'draw')).toEqual({ won: false, winnings: 0 });
      expect(calculateBetWinnings(500, 3.0, 'draw', 'draw')).toEqual({ won: true, winnings: 1500 });
    });

    it('should process multiple bets for an event', () => {
      interface Bet {
        id: string;
        userId: string;
        amount: number;
        odds: number;
        chosenOption: string;
        status: 'pending' | 'won' | 'lost';
        winnings: number;
      }

      const processBetsForEvent = (bets: Bet[], finalResult: string): Bet[] => {
        return bets.map(bet => {
          if (bet.status !== 'pending') return bet;
          
          if (bet.chosenOption === finalResult) {
            return {
              ...bet,
              status: 'won' as const,
              winnings: bet.amount * bet.odds
            };
          } else {
            return {
              ...bet,
              status: 'lost' as const,
              winnings: 0
            };
          }
        });
      };

      const bets: Bet[] = [
        { id: '1', userId: 'user1', amount: 1000, odds: 2.5, chosenOption: 'home_win', status: 'pending', winnings: 0 },
        { id: '2', userId: 'user2', amount: 500, odds: 3.0, chosenOption: 'draw', status: 'pending', winnings: 0 },
        { id: '3', userId: 'user3', amount: 800, odds: 2.2, chosenOption: 'away_win', status: 'pending', winnings: 0 }
      ];

      const processedBets = processBetsForEvent(bets, 'home_win');
      
      expect(processedBets[0]).toEqual({ 
        id: '1', userId: 'user1', amount: 1000, odds: 2.5, chosenOption: 'home_win', status: 'won', winnings: 2500 
      });
      expect(processedBets[1]).toEqual({ 
        id: '2', userId: 'user2', amount: 500, odds: 3.0, chosenOption: 'draw', status: 'lost', winnings: 0 
      });
      expect(processedBets[2]).toEqual({ 
        id: '3', userId: 'user3', amount: 800, odds: 2.2, chosenOption: 'away_win', status: 'lost', winnings: 0 
      });
    });
  });

  describe('Authentication Logic', () => {
    it('should validate JWT token structure', () => {
      const validateTokenStructure = (payload: any): { valid: boolean; error?: string } => {
        if (!payload || typeof payload !== 'object') {
          return { valid: false, error: 'Invalid token payload' };
        }
        
        const requiredFields = ['userId', 'username', 'role'];
        for (const field of requiredFields) {
          if (!payload[field]) {
            return { valid: false, error: `Missing ${field} in token` };
          }
        }
        
        if (!['admin', 'player'].includes(payload.role)) {
          return { valid: false, error: 'Invalid role in token' };
        }
        
        return { valid: true };
      };

      expect(validateTokenStructure({ userId: '123', username: 'test', role: 'player' })).toEqual({ valid: true });
      expect(validateTokenStructure({ userId: '123', username: 'test', role: 'admin' })).toEqual({ valid: true });
      expect(validateTokenStructure({ userId: '123', username: 'test' })).toEqual({ valid: false, error: 'Missing role in token' });
      expect(validateTokenStructure({ userId: '123', username: 'test', role: 'invalid' })).toEqual({ valid: false, error: 'Invalid role in token' });
      expect(validateTokenStructure(null)).toEqual({ valid: false, error: 'Invalid token payload' });
    });

    it('should validate role permissions', () => {
      const checkPermission = (userRole: string, requiredRoles: string[]): boolean => {
        return requiredRoles.includes(userRole);
      };

      expect(checkPermission('admin', ['admin'])).toBe(true);
      expect(checkPermission('admin', ['admin', 'player'])).toBe(true);
      expect(checkPermission('player', ['admin'])).toBe(false);
      expect(checkPermission('player', ['player'])).toBe(true);
      expect(checkPermission('player', ['admin', 'player'])).toBe(true);
    });
  });

  describe('Statistics and Analytics', () => {
    it('should calculate user betting statistics', () => {
      interface UserBet {
        amount: number;
        status: 'pending' | 'won' | 'lost';
        winnings: number;
      }

      const calculateUserStats = (bets: UserBet[]) => {
        const stats = {
          totalBets: bets.length,
          totalAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
          totalWinnings: bets.reduce((sum, bet) => sum + bet.winnings, 0),
          wonBets: bets.filter(bet => bet.status === 'won').length,
          lostBets: bets.filter(bet => bet.status === 'lost').length,
          pendingBets: bets.filter(bet => bet.status === 'pending').length,
          winRate: 0,
          netProfit: 0
        };

        const completedBets = stats.wonBets + stats.lostBets;
        if (completedBets > 0) {
          stats.winRate = Math.round((stats.wonBets / completedBets) * 10000) / 100; // Percentage with 2 decimals
        }
        
        stats.netProfit = stats.totalWinnings - stats.totalAmount;
        
        return stats;
      };

      const userBets: UserBet[] = [
        { amount: 1000, status: 'won', winnings: 2500 },
        { amount: 500, status: 'lost', winnings: 0 },
        { amount: 800, status: 'won', winnings: 1600 },
        { amount: 300, status: 'pending', winnings: 0 }
      ];

      const stats = calculateUserStats(userBets);
      
      expect(stats.totalBets).toBe(4);
      expect(stats.totalAmount).toBe(2600);
      expect(stats.totalWinnings).toBe(4100);
      expect(stats.wonBets).toBe(2);
      expect(stats.lostBets).toBe(1);
      expect(stats.pendingBets).toBe(1);
      expect(stats.winRate).toBe(66.67); // 2/3 * 100
      expect(stats.netProfit).toBe(1500); // 4100 - 2600
    });
  });
});
