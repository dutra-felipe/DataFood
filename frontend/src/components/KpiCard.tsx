// frontend/src/components/KpiCard.tsx
import styles from './KpiCard.module.css';

// 1. Define os tipos de formatação que aceitamos
type FormatType = 'currency' | 'number';

type KpiCardProps = {
  title: string;
  value: string | number;
  isLoading: boolean;
  icon: string; // Emoji
  formatAs: FormatType;
  iconBgColor?: string; // Cor de fundo opcional para o ícone
};

// 2. Lógica de formatação CORRIGIDA
function formatValue(value: string | number, formatAs: FormatType): string {
  if (typeof value !== 'number') return value;

  if (formatAs === 'currency') {
    // Formata como moeda (ex: R$ 358,32)
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  if (formatAs === 'number') {
    // Formata como número simples (ex: 1.811.547)
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
  iconBgColor = 'var(--color-light-gray)', // Cor padrão
}: KpiCardProps) {
  return (
    <div className={styles.card}>
      {/* Ícone */}
      {isLoading ? (
        <div className={styles.loadingIcon} />
      ) : (
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
      )}

      {/* Texto (Título e Valor) */}
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