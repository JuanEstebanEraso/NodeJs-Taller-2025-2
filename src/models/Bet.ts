import mongoose from "mongoose";
import { ResultType } from "./Event";

export type BetStatus = 'pending' | 'won' | 'lost';

export interface BetInput {
    user_id: string;
    event_id: string;
    chosen_option: ResultType;
    odds: number;
    amount: number;
    status: BetStatus;
    winnings: number;
}

export interface BetDocument extends BetInput, mongoose.Document {}

const betSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    chosen_option: { type: String, required: true, enum: ['home_win', 'draw', 'away_win'] },
    odds: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['pending', 'won', 'lost'], default: 'pending' },
    winnings: { type: Number, required: true, default: 0 }
}, { collection: "Bets" });

export const BetModel = mongoose.model<BetDocument>("Bet", betSchema);
