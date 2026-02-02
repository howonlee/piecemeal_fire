export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Dining Out',
  'Transportation',
  'Gas',
  'Public Transit',
  'Entertainment',
  'Movies',
  'Streaming Services',
  'Shopping',
  'Clothing',
  'Utilities',
  'Rent/Mortgage',
  'Insurance',
  'Medical/Healthcare',
  'Fitness/Gym',
  'Education',
  'Personal Care',
  'Bills',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: ExpenseCategory;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: ExpenseCategory;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: ExpenseCategory;
}
