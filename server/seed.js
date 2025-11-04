import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Book from './models/Book.js';
import Member from './models/Member.js';
import User from './models/User.js';

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management';

async function run() {
  await mongoose.connect(MONGODB_URI);
  await Promise.all([Book.deleteMany({}), Member.deleteMany({}), User.deleteMany({})]);
  await Book.insertMany([
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', copiesTotal: 5, copiesAvailable: 5 },
    { title: 'You Don\'t Know JS', author: 'Kyle Simpson', isbn: '9781491904244', copiesTotal: 3, copiesAvailable: 3 }
  ]);
  await Member.insertMany([
    { name: 'Aman Vishwakarma', email: 'aman@example.com' },
    { name: 'Alex Doe', email: 'alex@example.com' }
  ]);
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const studentPass = await bcrypt.hash('Student@123', 10);
  await User.insertMany([
    { name: 'Admin', email: 'admin@example.com', passwordHash: adminPass, role: 'admin' },
    { name: 'Aman Vishwakarma', email: 'aman@student.com', passwordHash: studentPass, role: 'student' }
  ]);
  console.log('Seeded demo data.');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
