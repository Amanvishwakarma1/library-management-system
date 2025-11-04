import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import booksRouter from './routes/books.js';
import membersRouter from './routes/members.js';
import loansRouter from './routes/loans.js';
import authRouter from './routes/auth.js';
import statsRouter from './routes/stats.js';
import requestsRouter from './routes/requests.js';
import moviesRouter from './routes/movies.js';
import membershipsRouter from './routes/memberships.js';
import { authRequired, adminOnly } from './middleware.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'library-management-api' }));

app.use('/api/auth', authRouter);
app.use('/api/books', authRequired, booksRouter);
app.use('/api/members', authRequired, adminOnly, membersRouter);
app.use('/api/loans', authRequired, loansRouter);
app.use('/api/stats', authRequired, statsRouter);
app.use('/api/requests', authRequired, requestsRouter);
app.use('/api/movies', authRequired, moviesRouter);
app.use('/api/memberships', authRequired, membershipsRouter);

mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
