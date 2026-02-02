import type { Expense, UpdateExpenseInput } from '../types';
import ExpenseItem from './ExpenseItem';

interface ExpenseListProps {
  expenses: Expense[];
  total: number;
  capitalRatio: number;
  onUpdate: (id: number, input: UpdateExpenseInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ExpenseList = ({ expenses, total, capitalRatio, onUpdate, onDelete }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No expenses yet. Add one above!</div>;
  }

  const totalCapitalNeeded = total * capitalRatio;

  return (
    <div>
      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong style={{ color: '#1a1a1a' }}>Monthly Total: ${total.toFixed(2)}</strong>
        </div>
        <div>
          <strong style={{ color: '#2563eb' }}>Total Capital Needed: ${totalCapitalNeeded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>
      <div>
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            capitalRatio={capitalRatio}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
