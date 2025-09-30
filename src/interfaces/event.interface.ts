// Event related interfaces

// Event data for API responses
export interface EventResponse {
  id: string;
  name: string;
  status: 'open' | 'closed';
  odds: {
    home_win: number;
    draw: number;
    away_win: number;
  };
  final_result?: 'home_win' | 'draw' | 'away_win';
  createdAt: Date;
  updatedAt: Date;
}

// Event creation request
export interface CreateEventRequest {
  name: string;
  odds: {
    home_win: number;
    draw: number;
    away_win: number;
  };
}

// Event close request
export interface CloseEventRequest {
  final_result: 'home_win' | 'draw' | 'away_win';
}

// Event status check response
export interface EventStatusResponse {
  isOpen: boolean;
  status: 'open' | 'closed';
  final_result?: 'home_win' | 'draw' | 'away_win';
}
