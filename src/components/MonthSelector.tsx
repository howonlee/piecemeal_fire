import { formatMonth, getPreviousMonth, getNextMonth } from '../utils/dateHelpers';

interface MonthSelectorProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

const MonthSelector = ({ year, month, onMonthChange }: MonthSelectorProps) => {
  const handlePrevious = () => {
    const prev = getPreviousMonth(year, month);
    onMonthChange(prev.year, prev.month);
  };

  const handleNext = () => {
    const next = getNextMonth(year, month);
    onMonthChange(next.year, next.month);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
      <button onClick={handlePrevious}>&larr; Previous</button>
      <h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>{formatMonth(year, month)}</h2>
      <button onClick={handleNext}>Next &rarr;</button>
    </div>
  );
};

export default MonthSelector;
