import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types';

const API_BASE = '/api';

export const fetchExpenses = async (): Promise<{ expenses: Expense[]; total: number }> => {
  const response = await fetch(`${API_BASE}/expenses`);
  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }
  return response.json();
};

export const createExpense = async (input: CreateExpenseInput): Promise<Expense> => {
  const response = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to create expense');
  }
  return response.json();
};

export const updateExpense = async (id: number, input: UpdateExpenseInput): Promise<Expense> => {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to update expense');
  }
  return response.json();
};

export const deleteExpense = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }
};
