import mongoose from "mongoose";
import { ResultType } from "./Event";

export type BetStatus = 'pendiente' | 'ganada' | 'perdida';

export interface BetInput {
    usuarioId: string;
    eventoId: string;
    opcionElegida: ResultType;
    cuota: number;
    monto: number;
    estado: BetStatus;
    ganancia: number;
}

export interface BetDocument extends BetInput, mongoose.Document {}

const betSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    opcionElegida: { type: String, required: true, enum: ['ganaLocal', 'empate', 'ganaVisitante'] },
    cuota: { type: Number, required: true },
    monto: { type: Number, required: true },
    estado: { type: String, required: true, enum: ['pendiente', 'ganada', 'perdida'], default: 'pendiente' },
    ganancia: { type: Number, required: true, default: 0 }
}, { collection: "Bets" });

export const BetModel = mongoose.model<BetDocument>("Bet", betSchema);
