import styles from './ChartTypeSelector.module.css';

export type ChartType = 'bar' | 'line';

type ChartTypeSelectorProps = {
  selectedType: ChartType;
  onChange: (type: ChartType) => void;
};

export function ChartTypeSelector({
  selectedType,
  onChange,
}: ChartTypeSelectorProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${
          selectedType === 'bar' ? styles.active : ''
        }`}
        onClick={() => onChange('bar')}
      >
        Barras
      </button>
      <button
        className={`${styles.button} ${
          selectedType === 'line' ? styles.active : ''
        }`}
        onClick={() => onChange('line')}
      >
        Linha
      </button>
    </div>
  );
}