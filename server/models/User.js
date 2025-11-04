import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','student'], required: true },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model('User', UserSchema);
