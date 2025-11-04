import express from 'express';
import Membership from '../models/Membership.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const list = await Membership.find({}).sort({ createdAt: -1 });
  res.json(list);
});

router.post('/', async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const doc = await Membership.create(req.body);
  res.status(201).json(doc);
});

router.put('/:id', async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const doc = await Membership.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doc);
});

router.delete('/:id', async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  await Membership.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
