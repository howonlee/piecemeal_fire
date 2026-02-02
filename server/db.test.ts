import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from './types.js';

// Create a test database module
const createTestDb = () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'expense-test-'));
  const dbPath = join(tempDir, 'test.db');
  const db = new Database(dbPath);

  // Initialize schema
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

  // Pure query functions (same as db.ts)
  const getAllExpenses = (): Expense[] => {
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY created_at DESC');
    return stmt.all() as Expense[];
  };

  const getExpenseById = (id: number): Expense | undefined => {
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    return stmt.get(id) as Expense | undefined;
  };

  const createExpense = (input: CreateExpenseInput): Expense => {
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

  const updateExpense = (id: number, input: UpdateExpenseInput): Expense => {
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

  const deleteExpense = (id: number) => {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  };

  const calculateMonthlyTotal = () => {
    const expenses = getAllExpenses();
    return expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
  };

  const cleanup = () => {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  };

  return {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    calculateMonthlyTotal,
    cleanup,
  };
};

describe('database operations', () => {
  let testDb: ReturnType<typeof createTestDb>;

  beforeEach(() => {
    testDb = createTestDb();
  });

  afterEach(() => {
    testDb.cleanup();
  });

  describe('createExpense', () => {
    it('should create an expense with all required fields', () => {
      const input: CreateExpenseInput = {
        amount: 50.99,
        description: 'Test expense',
        category: 'Groceries',
      };

      const expense = testDb.createExpense(input);

      expect(expense).toMatchObject({
        id: expect.any(Number),
        amount: 50.99,
        description: 'Test expense',
        category: 'Groceries',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it('should auto-increment id for multiple expenses', () => {
      const expense1 = testDb.createExpense({
        amount: 10,
        description: 'First',
        category: 'Groceries',
      });
      const expense2 = testDb.createExpense({
        amount: 20,
        description: 'Second',
        category: 'Dining Out',
      });

      expect(expense2.id).toBe(expense1.id + 1);
    });

    it('should set created_at and updated_at timestamps', () => {
      const expense = testDb.createExpense({
        amount: 25.50,
        description: 'Timestamp test',
        category: 'Entertainment',
      });

      expect(expense.created_at).toBeTruthy();
      expect(expense.updated_at).toBeTruthy();
      // SQLite timestamp should be parseable and reasonable
      const createdDate = new Date(expense.created_at);
      expect(createdDate.getTime()).toBeGreaterThan(0);
    });
  });

  describe('getAllExpenses', () => {
    it('should return empty array when no expenses exist', () => {
      const expenses = testDb.getAllExpenses();
      expect(expenses).toEqual([]);
    });

    it('should return all expenses', () => {
      const expense1 = testDb.createExpense({
        amount: 10,
        description: 'First',
        category: 'Groceries',
      });

      const expense2 = testDb.createExpense({
        amount: 20,
        description: 'Second',
        category: 'Dining Out',
      });

      const expenses = testDb.getAllExpenses();
      expect(expenses).toHaveLength(2);
      const ids = expenses.map(e => e.id);
      expect(ids).toContain(expense1.id);
      expect(ids).toContain(expense2.id);
    });
  });

  describe('getExpenseById', () => {
    it('should return expense when it exists', () => {
      const created = testDb.createExpense({
        amount: 75.25,
        description: 'Test expense',
        category: 'Transportation',
      });

      const expense = testDb.getExpenseById(created.id);
      expect(expense).toEqual(created);
    });

    it('should return undefined when expense does not exist', () => {
      const expense = testDb.getExpenseById(999);
      expect(expense).toBeUndefined();
    });
  });

  describe('updateExpense', () => {
    it('should update amount only', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const updated = testDb.updateExpense(created.id, { amount: 75.50 });
      expect(updated.amount).toBe(75.50);
      expect(updated.description).toBe('Original');
      expect(updated.category).toBe('Groceries');
    });

    it('should update description only', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const updated = testDb.updateExpense(created.id, { description: 'Updated description' });
      expect(updated.description).toBe('Updated description');
      expect(updated.amount).toBe(50);
      expect(updated.category).toBe('Groceries');
    });

    it('should update category only', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const updated = testDb.updateExpense(created.id, { category: 'Dining Out' });
      expect(updated.category).toBe('Dining Out');
      expect(updated.amount).toBe(50);
      expect(updated.description).toBe('Original');
    });

    it('should update multiple fields at once', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const updated = testDb.updateExpense(created.id, {
        amount: 100,
        description: 'New description',
        category: 'Entertainment',
      });

      expect(updated.amount).toBe(100);
      expect(updated.description).toBe('New description');
      expect(updated.category).toBe('Entertainment');
    });

    it('should have updated_at timestamp', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const updated = testDb.updateExpense(created.id, { amount: 75 });
      expect(updated.updated_at).toBeTruthy();
      // Verify timestamp is valid
      const updatedDate = new Date(updated.updated_at);
      expect(updatedDate.getTime()).toBeGreaterThan(0);
    });

    it('should return current expense when no fields provided', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'Original',
        category: 'Groceries',
      });

      const result = testDb.updateExpense(created.id, {});
      expect(result).toEqual(created);
    });

    it('should throw error when expense not found', () => {
      expect(() => {
        testDb.updateExpense(999, { amount: 100 });
      }).toThrow('Expense not found');
    });
  });

  describe('deleteExpense', () => {
    it('should delete existing expense', () => {
      const created = testDb.createExpense({
        amount: 50,
        description: 'To be deleted',
        category: 'Groceries',
      });

      const result = testDb.deleteExpense(created.id);
      expect(result).toBe(true);

      const deleted = testDb.getExpenseById(created.id);
      expect(deleted).toBeUndefined();
    });

    it('should return false when expense does not exist', () => {
      const result = testDb.deleteExpense(999);
      expect(result).toBe(false);
    });

    it('should not affect other expenses', () => {
      const expense1 = testDb.createExpense({
        amount: 50,
        description: 'Keep this',
        category: 'Groceries',
      });
      const expense2 = testDb.createExpense({
        amount: 75,
        description: 'Delete this',
        category: 'Dining Out',
      });

      testDb.deleteExpense(expense2.id);

      const remaining = testDb.getAllExpenses();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(expense1.id);
    });
  });

  describe('calculateMonthlyTotal', () => {
    it('should return 0 when no expenses exist', () => {
      const total = testDb.calculateMonthlyTotal();
      expect(total).toBe(0);
    });

    it('should calculate sum of all expenses', () => {
      testDb.createExpense({ amount: 50.50, description: 'Expense 1', category: 'Groceries' });
      testDb.createExpense({ amount: 25.25, description: 'Expense 2', category: 'Dining Out' });
      testDb.createExpense({ amount: 100, description: 'Expense 3', category: 'Entertainment' });

      const total = testDb.calculateMonthlyTotal();
      expect(total).toBe(175.75);
    });

    it('should handle single expense', () => {
      testDb.createExpense({ amount: 42.99, description: 'Single', category: 'Groceries' });

      const total = testDb.calculateMonthlyTotal();
      expect(total).toBe(42.99);
    });

    it('should handle decimal precision', () => {
      testDb.createExpense({ amount: 10.01, description: 'Expense 1', category: 'Groceries' });
      testDb.createExpense({ amount: 20.02, description: 'Expense 2', category: 'Dining Out' });

      const total = testDb.calculateMonthlyTotal();
      expect(total).toBeCloseTo(30.03, 2);
    });
  });
});
