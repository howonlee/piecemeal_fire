import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'expenses.db');

const db = new Database(dbPath);

// Initialize database schema
const initDb = (): void => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// Pure query functions
export const getAllExpenses = (): Expense[] => {
  const stmt = db.prepare('SELECT * FROM expenses ORDER BY created_at DESC');
  return stmt.all() as Expense[];
};

export const getExpenseById = (id: number): Expense | undefined => {
  const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
  return stmt.get(id) as Expense | undefined;
};

export const createExpense = (input: CreateExpenseInput): Expense => {
  const stmt = db.prepare(`
    INSERT INTO expenses (amount, description, category)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(input.amount, input.description, input.category);
  const expense = getExpenseById(result.lastInsertRowid as number);
  if (!expense) {
    throw new Error('Failed to create expense');
  }
  return expense;
};

export const updateExpense = (id: number, input: UpdateExpenseInput): Expense => {
  const current = getExpenseById(id);
  if (!current) {
    throw new Error('Expense not found');
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (input.amount !== undefined) {
    updates.push('amount = ?');
    values.push(input.amount);
  }
  if (input.description !== undefined) {
    updates.push('description = ?');
    values.push(input.description);
  }
  if (input.category !== undefined) {
    updates.push('category = ?');
    values.push(input.category);
  }

  if (updates.length === 0) {
    return current;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const stmt = db.prepare(`
    UPDATE expenses
    SET ${updates.join(', ')}
    WHERE id = ?
  `);
  stmt.run(...values);

  const expense = getExpenseById(id);
  if (!expense) {
    throw new Error('Failed to update expense');
  }
  return expense;
};

export const deleteExpense = (id: number): boolean => {
  const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

export const calculateMonthlyTotal = (): number => {
  const expenses = getAllExpenses();
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Initialize database on module load
initDb();

export default db;
