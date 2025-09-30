import mongoose from "mongoose";

export type EventStatus = 'open' | 'closed';
export type ResultType = 'home_win' | 'draw' | 'away_win';

export interface EventOdds {
    home_win: number;
    draw: number;
    away_win: number;
}

export interface EventInput {
    name: string;
    status: EventStatus;
    odds: EventOdds;
    final_result?: ResultType;
}

export interface EventDocument extends EventInput, mongoose.Document {}

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['open', 'closed'], default: 'open' },
    odds: {
        home_win: { type: Number, required: true },
        draw: { type: Number, required: true },
        away_win: { type: Number, required: true }
    },
    final_result: { type: String, enum: ['home_win', 'draw', 'away_win'] }
}, { collection: "Events" });

export const EventModel = mongoose.model<EventDocument>("Event", eventSchema);
