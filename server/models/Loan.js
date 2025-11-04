import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  book:   { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  loanedAt:   { type: Date, default: Date.now },     // Issue Date = today
  dueAt:      { type: Date, required: true },        // Return Date (<= 15 days out)
  returnedAt: { type: Date },

  // Excel: fines on overdue
  fineAmount: { type: Number, default: 0 },          // calculated amount for this loan (if overdue)
  finePaid:   { type: Boolean, default: false },
  fineNote:   { type: String },

  // helpful audit
}, { timestamps: true });

export default mongoose.model('Loan', LoanSchema);
