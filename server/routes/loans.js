import express from 'express';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import Fine from '../models/Fine.js';

const router = express.Router();

// ENV: fine per day (default 10)
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 10);

// list loans (admin -> all, student -> own)
router.get('/', async (req, res) => {
  const q = req.user?.role === 'student' ? { member: req.user.id } : {};
  const loans = await Loan.find(q).populate('book').populate('member').sort({ createdAt: -1 });
  res.json(loans);
});

// create loan (Excel: Issue = today, Return = +15 days max, not past)
router.post('/', async (req, res) => {
  try {
    let { book, member, days = 15 } = req.body;
    if (req.user?.role === 'student') member = req.user.id;

    if (!book)  return res.status(400).json({ error: 'Select a book' });
    if (!member) return res.status(400).json({ error: 'Select a member' });

    const b = await Book.findById(book);
    if (!b) return res.status(404).json({ error: 'Book not found' });
    if (b.copiesAvailable <= 0) return res.status(400).json({ error: 'No available copies' });

    // Excel rules
    const today = new Date();
    days = Number(days) || 15;
    if (days < 1) days = 1;
    if (days > 15) days = 15;               // <= 15 days
    const dueAt = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const loan = await Loan.create({ book, member, loanedAt: today, dueAt });
    b.copiesAvailable -= 1; await b.save();

    res.status(201).json(await loan.populate('book').populate('member'));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// return loan (Excel: compute fine if overdue; allow confirm and pay)
router.post('/:id/return', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('book').populate('member');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    // students can only return their own loans
    if (req.user?.role === 'student' && String(loan.member._id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    if (loan.returnedAt) return res.status(400).json({ error: 'Already returned' });

    const now = new Date();
    loan.returnedAt = now;

    // fine calc
    let fine = 0;
    if (now > loan.dueAt) {
      const ms = now.getTime() - loan.dueAt.getTime();
      const daysLate = Math.ceil(ms / (24 * 60 * 60 * 1000));
      fine = daysLate * FINE_PER_DAY;
      loan.fineAmount = fine;
      loan.finePaid = false;
    }

    await loan.save();

    // restore book availability
    const b = await Book.findById(loan.book._id);
    b.copiesAvailable += 1; await b.save();

    res.json({ loan, fine });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// pay fine for a returned loan
router.post('/:id/pay-fine', async (req, res) => {
  try {
    const { amount, remarks } = req.body;
    const loan = await Loan.findById(req.params.id).populate('member');
    if (!loan) return res.status(404).json({ error: 'Loan not found' });
    if (!loan.returnedAt) return res.status(400).json({ error: 'Return the book first' });

    // <-- FIXED: parenthesize (amount ?? loan.fineAmount) before || 0
    const toPay = Number((amount ?? loan.fineAmount) || 0);
    if (toPay <= 0) return res.status(400).json({ error: 'No fine to pay' });

    const fine = await Fine.create({
      loan: loan._id,
      member: loan.member._id,
      amount: toPay,
      remarks,
      paid: true,
      paidAt: new Date()
    });

    loan.finePaid = true;
    loan.fineNote = remarks;
    await loan.save();

    res.json({ ok: true, fine });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
