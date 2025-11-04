import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  joinedAt: { type: Date, default: Date.now },
  membershipStart: { type: Date },
  membershipEnd:   { type: Date }
});

export default mongoose.model('Member', MemberSchema);
