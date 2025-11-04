import mongoose from 'mongoose';

const MembershipSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  maxBooks: { type: Number, default: 3 },
  maxDays: { type: Number, default: 14 },
  fee: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Membership', MembershipSchema);
