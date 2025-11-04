import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','approved','rejected','cancelled'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  decidedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Request', RequestSchema);
