import mongoose from "mongoose";

export type UserRole = 'admin' | 'player';

export interface UserInput {
    username: string;
    password: string;
    balance: number;
    role: UserRole;
}

export interface UserDocument extends UserInput, mongoose.Document {}

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    balance: { type: Number, required: true, default: 10000 },
    role: { type: String, required: true, enum: ['admin', 'player'], default: 'player' }
}, { collection: "Users" });

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
