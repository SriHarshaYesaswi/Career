import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  uid: string; // Same as _id.toString(), kept for frontend compatibility
  name: string;
  email: string;
  passwordHash?: string;
  photoUrl?: string;
  profession: string;
  currentEducation: string;
  onboarded: boolean;
  streakCount: number;
  lastActiveDate: string;
  productivityScore: number;
  level: number;
  xp: number;
  authProvider: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    photoUrl: { type: String, default: '' },
    profession: { type: String, default: 'Software Engineer Intern & CS Student' },
    currentEducation: { type: String, default: 'B.Tech in Computer Science' },
    onboarded: { type: Boolean, default: false },
    streakCount: { type: Number, default: 1 },
    lastActiveDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    productivityScore: { type: Number, default: 50 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    authProvider: { type: String, default: 'email' },
    role: { type: String, default: 'user' },
    lastLogin: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
