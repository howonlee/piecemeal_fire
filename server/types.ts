export interface Expense {
  id: number;
  amount: number;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
}
