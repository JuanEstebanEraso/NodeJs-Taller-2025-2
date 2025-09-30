// Bet data for API responses
export interface BetResponse {
  id: string;
  user_id: string;
  event_id: string;
  chosen_option: 'home_win' | 'draw' | 'away_win';
  odds: number;
  amount: number;
  status: 'pending' | 'won' | 'lost';
  winnings: number;
  createdAt: Date;
  updatedAt: Date;
}

// Bet creation request
export interface CreateBetRequest {
  event_id: string;
  chosen_option: 'home_win' | 'draw' | 'away_win';
  amount: number;
}

// Bet statistics response
export interface BetStatsResponse {
  total: number;
  won: number;
  lost: number;
  pending: number;
  totalWinnings: number;
  winRate: number; // percentage
}

// Process bets response
export interface ProcessBetsResponse {
  processed: number;
  eventId: string;
  finalResult: 'home_win' | 'draw' | 'away_win';
}
