import { useState, useEffect, useCallback } from 'react';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types';
import * as api from '../utils/api';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchExpenses();
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const addExpense = useCallback(async (input: CreateExpenseInput) => {
    try {
      await api.createExpense(input);
      await loadExpenses();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add expense');
    }
  }, [loadExpenses]);

  const editExpense = useCallback(async (id: number, input: UpdateExpenseInput) => {
    try {
      await api.updateExpense(id, input);
      await loadExpenses();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update expense');
    }
  }, [loadExpenses]);

  const removeExpense = useCallback(async (id: number) => {
    try {
      await api.deleteExpense(id);
      await loadExpenses();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete expense');
    }
  }, [loadExpenses]);

  return {
    expenses,
    total,
    loading,
    error,
    addExpense,
    editExpense,
    removeExpense,
    refreshExpenses: loadExpenses,
  };
};
