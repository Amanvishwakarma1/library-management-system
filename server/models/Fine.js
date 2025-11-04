import mongoose from 'mongoose';

const FineSchema = new mongoose.Schema({
  loan:     { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  member:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:   { type: Number, required: true, min: 0 },
  paid:     { type: Boolean, default: false },
  remarks:  { type: String },
  paidAt:   { type: Date }
}, { timestamps: true });

export default mongoose.model('Fine', FineSchema);
