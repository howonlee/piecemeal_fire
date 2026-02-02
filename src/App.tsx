import { useState } from 'react';
import { getCurrentMonth } from './utils/dateHelpers';
import { useExpenses } from './hooks/useExpenses';
import MonthSelector from './components/MonthSelector';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import './App.css';

function App() {
  const { year: currentYear, month: currentMonth } = getCurrentMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [capitalRatio] = useState(300); // 12 months * 25 (4% withdrawal rate)

  const { expenses, total, loading, error, addExpense, editExpense, removeExpense } = useExpenses();

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Piecemeal Capital Tracker</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Track your recurring monthly expenses and figure out how much capital needed to deal with them</p>

      <MonthSelector
        year={selectedYear}
        month={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      <ExpenseForm onAdd={addExpense} />

      {loading && <div>Loading expenses...</div>}
      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}
      {!loading && !error && (
        <ExpenseList
          expenses={expenses}
          total={total}
          capitalRatio={capitalRatio}
          onUpdate={editExpense}
          onDelete={removeExpense}
        />
      )}
    </div>
  );
}

export default App;
