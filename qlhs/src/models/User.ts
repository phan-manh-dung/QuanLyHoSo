import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  idUser: string;
  username: string;
  password: string;
  fullName: string;
  role: string;
  loginType: 'google' | 'basic';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  idUser: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true , index:true },
  password: { type: String, required: true },
  fullName: { type: String },
  role: { type: String, default: 'user', enum: ['adminql', 'user'] },
  loginType: {
    type: String,
    default: 'basic',
    enum: ['google', 'basic'],
  },
}, {
  timestamps: true,
});

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
