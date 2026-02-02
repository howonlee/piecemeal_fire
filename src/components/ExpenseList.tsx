import type { Expense, UpdateExpenseInput } from '../types';
import ExpenseItem from './ExpenseItem';

interface ExpenseListProps {
  expenses: Expense[];
  total: number;
  onUpdate: (id: number, input: UpdateExpenseInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ExpenseList = ({ expenses, total, onUpdate, onDelete }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No expenses yet. Add one above!</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Monthly Total: ${total.toFixed(2)}</strong>
      </div>
      <div>
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
