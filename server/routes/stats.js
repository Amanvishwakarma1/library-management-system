// server/routes/stats.js
import express from 'express';
import Book from '../models/Book.js';
import Loan from '../models/Loan.js';
import Member from '../models/Member.js';
import Request from '../models/Request.js';

const router = express.Router();

// Admin KPIs (live from DB)
router.get('/admin', async (_req, res) => {
  try {
    const [books, members, activeLoans, overdueLoans, pendingReq] = await Promise.all([
      Book.countDocuments({}),
      Member.countDocuments({}),
      Loan.countDocuments({ returnedAt: { $exists: false } }),
      Loan.countDocuments({ returnedAt: { $exists: false }, dueAt: { $lt: new Date() } }),
      Request.countDocuments({ status: 'pending' })
    ]);
    res.json({ books, members, activeLoans, overdueLoans, pendingReq });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Student KPIs
router.get('/student', async (req, res) => {
  try {
    const userId = req.user?.id;
    const [myActive, myOverdue] = await Promise.all([
      Loan.countDocuments({ member: userId, returnedAt: { $exists: false } }),
      Loan.countDocuments({ member: userId, returnedAt: { $exists: false }, dueAt: { $lt: new Date() } })
    ]);
    res.json({ myActive, myOverdue });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
