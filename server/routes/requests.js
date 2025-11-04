import express from 'express';
import Request from '../models/Request.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { book, notes } = req.body;
    const member = req.user.id;
    const reqDoc = await Request.create({ book, member, notes });
    res.status(201).json(await reqDoc.populate('book').populate('member'));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/', async (req, res) => {
  const q = req.user.role === 'admin' ? {} : { member: req.user.id };
  const list = await Request.find(q).populate('book').populate('member').sort({ createdAt: -1 });
  res.json(list);
});

router.post('/:id/decide', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status } = req.body;
  const doc = await Request.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.status = status;
  doc.decidedAt = new Date();
  await doc.save();
  res.json(doc);
});

router.post('/:id/cancel', async (req, res) => {
  const doc = await Request.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (String(doc.member) !== String(req.user.id)) return res.status(403).json({ error: 'Not allowed' });
  if (doc.status !== 'pending') return res.status(400).json({ error: 'Cannot cancel now' });
  doc.status = 'cancelled';
  await doc.save();
  res.json(doc);
});

export default router;
