import { useState, FormEvent } from 'react';
import type { CreateExpenseInput, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../types';

interface ExpenseFormProps {
  onAdd: (input: CreateExpenseInput) => Promise<void>;
}

const ExpenseForm = ({ onAdd }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!category) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        amount: amountNum,
        description: description.trim(),
        category,
      });
      setAmount('');
      setDescription('');
      setCategory(EXPENSE_CATEGORIES[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>Add Recurring Expense</h3>
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label htmlFor="amount">Amount: </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description: </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Netflix subscription"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label htmlFor="category">Category: </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            disabled={isSubmitting}
            required
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
