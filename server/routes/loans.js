// server/routes/loans.js
import express from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Member from '../models/Member.js';

const router = express.Router();

// GET /api/loans — list loans (populated, newest first)
router.get('/', async (_req, res) => {
  try {
    const loans = await Loan.find({})
      .populate('book')
      .populate('member')
      .sort({ loanedAt: -1 });
    res.json(loans);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/loans — create a loan
// body: { book, member, days }
router.post('/', async (req, res) => {
  try {
    const { book, member } = req.body;
    let { days } = req.body;
    days = Math.max(1, Math.min(15, Number(days || 15)));

    const b = await Book.findById(book);
    const m = await Member.findById(member);
    if (!b) return res.status(404).json({ error: 'Book not found' });
    if (!m) return res.status(404).json({ error: 'Member not found' });
    if ((b.copiesAvailable ?? 0) < 1) {
      return res.status(400).json({ error: 'No copies available' });
    }

    const now = new Date();
    const due = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const loan = await Loan.create({
      book,
      member,
      loanedAt: now,
      dueAt: due,
      fineAmount: 0,
      finePaid: false,
    });

    await Book.findByIdAndUpdate(book, { $inc: { copiesAvailable: -1 } });

    const populated = await Loan.findById(loan._id).populate('book').populate('member');
    res.json(populated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/loans/:id/return — mark returned + compute fine + increment copies
router.post('/:id/return', async (req, res) => {
  try {
    const id = req.params.id;
    const loan = await Loan.findById(id).populate('book');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (loan.returnedAt) return res.status(400).json({ error: 'Already returned' });

    loan.returnedAt = new Date();

    const perDay = Number(process.env.FINE_PER_DAY || 10);
    if (loan.dueAt && loan.returnedAt > loan.dueAt) {
      const ms = loan.returnedAt - loan.dueAt;
      const daysLate = Math.ceil(ms / (1000 * 60 * 60 * 24));
      loan.fineAmount = daysLate * perDay;
      loan.finePaid = false;
    }

    await loan.save();

    const bookId = loan.book?._id || loan.book;
    await Book.findByIdAndUpdate(bookId, { $inc: { copiesAvailable: 1 } });

    const populated = await Loan.findById(loan._id).populate('book').populate('member');
    res.json({ ok: true, loan: populated });
  } catch (e) {
    console.error('Return route error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
