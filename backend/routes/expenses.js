const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();

// Is router ke saare routes protected hain
router.use(auth);

const handleError = (err, res) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
};

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid expense id' });
  }
  next();
};

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body || {};
    const expense = await Expense.create({
      title, amount, category, date,
      user: req.user._id, // body se nahi, token se
    });
    res.status(201).json(expense);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/expenses  (sirf logged-in user ke)
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    handleError(err, res);
  }
});

// PUT /api/expenses/:id
router.put('/:id', checkId, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body || {};
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', checkId, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    handleError(err, res);
  }
});

module.exports = router;
