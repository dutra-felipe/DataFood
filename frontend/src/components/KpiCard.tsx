import styles from './KpiCard.module.css';

type FormatType = 'currency' | 'number';

type KpiCardProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
  icon: string;
  formatAs: FormatType;
  iconBgColor?: string;
};

function formatValue(value: string | number, formatAs: FormatType): string {
  if (typeof value !== 'number') return value;

  if (formatAs === 'currency') {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  if (formatAs === 'number') {
    return value.toLocaleString('pt-BR');
  }

  return String(value);
}

export function KpiCard({
  title,
  value,
  isLoading,
  icon,
  formatAs,
  iconBgColor = 'var(--color-light-gray)',
}: KpiCardProps) {
  return (
    <div className={styles.card}>
      {isLoading ? (
        <div className={styles.loadingIcon} />
      ) : (
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
      )}

      <div className={styles.textWrapper}>
        <h3 className={styles.title}>{title}</h3>
        {isLoading ? (
          <div className={styles.loadingValue} />
        ) : (
          <div className={styles.value}>{formatValue(value, formatAs)}</div>
        )}
      </div>
    </div>
  );
}