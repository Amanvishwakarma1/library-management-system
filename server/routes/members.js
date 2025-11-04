import express from 'express';
import Member from '../models/Member.js';

const router = express.Router();

// list
router.get('/', async (_req, res) => {
  const members = await Member.find().sort({ joinedAt: -1 });
  res.json(members);
});

// create
router.post('/', async (req, res) => {
  const member = await Member.create({
    ...req.body,
    joinedAt: new Date(),
    membershipStart: new Date(),                         // default now
    membershipEnd: new Date(Date.now() + 6*30*24*60*60*1000) // default 6 months
  });
  res.status(201).json(member);
});

// update
router.put('/:id', async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json(member);
});

// delete
router.delete('/:id', async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// Excel: Update Membership (extend/cancel) - months default 6
router.post('/:id/membership', async (req, res) => {
  const { months = 6, action = 'extend' } = req.body; // action: extend | cancel | start
  const m = await Member.findById(req.params.id);
  if (!m) return res.status(404).json({ error: 'Member not found' });

  const now = new Date();
  if (action === 'cancel') {
    m.membershipEnd = now;
  } else {
    const base = m.membershipEnd && m.membershipEnd > now ? m.membershipEnd : now;
    const ms = Number(months) * 30 * 24 * 60 * 60 * 1000;
    if (!m.membershipStart) m.membershipStart = now;
    m.membershipEnd = new Date(base.getTime() + ms);
  }
  await m.save();
  res.json(m);
});

export default router;
