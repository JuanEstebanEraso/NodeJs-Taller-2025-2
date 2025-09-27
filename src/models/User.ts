import mongoose from "mongoose";

export type UserRole = 'admin' | 'jugador';

export interface UserInput {
    username: string;
    password: string;
    saldo: number;
    role: UserRole;
}

export interface UserDocument extends UserInput, mongoose.Document {}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    saldo: { type: Number, required: true, default: 10000 },
    role: { type: String, required: true, enum: ['admin', 'jugador'], default: 'jugador' }
}, { collection: "Users" });

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
