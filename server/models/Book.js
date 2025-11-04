import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  isbn: { type: String, unique: true, sparse: true },
  copiesTotal: { type: Number, default: 1, min: 0 },
  copiesAvailable: { type: Number, default: 1, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Book', BookSchema);
