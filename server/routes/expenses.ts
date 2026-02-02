import { Hono } from 'hono';
import * as db from '../db.js';
import type { CreateExpenseInput, UpdateExpenseInput } from '../types.js';

const expenses = new Hono();

// GET /api/expenses - Get all recurring expenses
expenses.get('/', (c) => {
  try {
    const allExpenses = db.getAllExpenses();
    const total = db.calculateMonthlyTotal();
    return c.json({ expenses: allExpenses, total });
  } catch (error) {
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
});

// POST /api/expenses - Create new recurring expense
expenses.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateExpenseInput>();

    if (!body.amount || !body.description || !body.category) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return c.json({ error: 'Amount must be a positive number' }, 400);
    }

    const expense = db.createExpense(body);
    return c.json(expense, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create expense' }, 500);
  }
});

// PUT /api/expenses/:id - Update recurring expense
expenses.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid expense ID' }, 400);
    }

    const body = await c.req.json<UpdateExpenseInput>();

    if (body.amount !== undefined && (typeof body.amount !== 'number' || body.amount <= 0)) {
      return c.json({ error: 'Amount must be a positive number' }, 400);
    }

    const expense = db.updateExpense(id, body);
    return c.json(expense);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update expense';
    const status = message === 'Expense not found' ? 404 : 500;
    return c.json({ error: message }, status);
  }
});

// DELETE /api/expenses/:id - Delete recurring expense
expenses.delete('/:id', (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ error: 'Invalid expense ID' }, 400);
    }

    const success = db.deleteExpense(id);
    if (!success) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete expense' }, 500);
  }
});

export default expenses;
