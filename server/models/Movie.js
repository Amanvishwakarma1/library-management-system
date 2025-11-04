import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  director: { type: String, trim: true },
  upc: { type: String, trim: true },
  copiesTotal: { type: Number, default: 1, min: 0 },
  copiesAvailable: { type: Number, default: 1, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', MovieSchema);
