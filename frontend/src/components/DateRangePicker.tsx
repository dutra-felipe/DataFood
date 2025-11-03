import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './DateRangePicker.module.css';
import { forwardRef } from 'react';

export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

type DateRangePickerProps = {
  dateRange: DateRange;
  onChange: (newRange: DateRange) => void;
};

const getStartOfDay = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date;
};


export function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const CustomInput = forwardRef<HTMLButtonElement, { value?: string, onClick?: () => void }>(
    ({ value, onClick }, ref) => (
      <button 
        type="button" 
        className={styles.dateInput} 
        onClick={onClick} 
        ref={ref}
      >
        {value}
      </button>
    )
  );

  const handleSetThisMonth = () => {
    const today = new Date();
    const start = getStartOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
    const end = getEndOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    onChange({ startDate: start, endDate: end });
  };

  const handleSetLast7Days = () => {
    const end = getEndOfDay(new Date());
    const start = getStartOfDay(new Date());
    start.setDate(start.getDate() - 6);
    onChange({ startDate: start, endDate: end });
  };
  
  const handleSetLast6Months = () => {
    const end = getEndOfDay(new Date());
    const start = getStartOfDay(new Date());
    start.setMonth(start.getMonth() - 6);
    onChange({ startDate: start, endDate: end });
  };

  return (
    <div className={styles.container}>
      <span className={styles.label}>Período:</span>
      <div>
        <DatePicker
          selectsRange={true}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={(update) => {
            onChange({ startDate: update[0], endDate: update[1] });
          }}
          isClearable={true}
          dateFormat="dd/MM/yyyy"
          customInput={<CustomInput />}
        />
      </div>

      <button className={styles.presetButton} onClick={handleSetLast7Days}>
        Últimos 7 dias
      </button>
      <button className={styles.presetButton} onClick={handleSetThisMonth}>
        Este Mês
      </button>
      <button className={styles.presetButton} onClick={handleSetLast6Months}>
        Últimos 6 meses
      </button>
    </div>
  );
}