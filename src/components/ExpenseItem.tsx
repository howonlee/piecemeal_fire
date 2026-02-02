import { useState } from 'react';
import type { Expense, UpdateExpenseInput, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../types';

interface ExpenseItemProps {
  expense: Expense;
  onUpdate: (id: number, input: UpdateExpenseInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ExpenseItem = ({ expense, onUpdate, onDelete }: ExpenseItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [description, setDescription] = useState(expense.description);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(expense.id, {
        amount: amountNum,
        description: description.trim(),
        category,
      });
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(expense.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setCategory(expense.category);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div>
            <label>Amount: </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label>Description: </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label>Category: </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              disabled={isLoading}
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} disabled={isLoading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div><strong>${expense.amount.toFixed(2)}</strong> - {expense.description}</div>
        <div style={{ fontSize: '0.9em', color: '#666' }}>{expense.category}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setIsEditing(true)} disabled={isLoading}>Edit</button>
        <button onClick={handleDelete} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default ExpenseItem;
