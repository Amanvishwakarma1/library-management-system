import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const items = await Movie.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const item = await Movie.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
