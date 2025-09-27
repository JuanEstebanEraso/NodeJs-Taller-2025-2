import mongoose from "mongoose";

export type EventStatus = 'abierto' | 'cerrado';
export type ResultType = 'ganaLocal' | 'empate' | 'ganaVisitante';

export interface EventOdds {
    ganaLocal: number;
    empate: number;
    ganaVisitante: number;
}

export interface EventInput {
    nombre: string;
    estado: EventStatus;
    opciones: EventOdds;
    resultadoFinal?: ResultType;
}

export interface EventDocument extends EventInput, mongoose.Document {}

const eventSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    estado: { type: String, required: true, enum: ['abierto', 'cerrado'], default: 'abierto' },
    opciones: {
        ganaLocal: { type: Number, required: true },
        empate: { type: Number, required: true },
        ganaVisitante: { type: Number, required: true }
    },
    resultadoFinal: { type: String, enum: ['ganaLocal', 'empate', 'ganaVisitante'] }
}, { collection: "Events" });

export const EventModel = mongoose.model<EventDocument>("Event", eventSchema);
