import { KpiCard } from './KpiCard';
import styles from './KpiCardGrid.module.css';

type KpiCardGridProps = {
  kpiData: {
    faturamento_total?: number;
    total_pedidos?: number;
    ticket_medio?: number;
  } | null;
  isLoading: boolean;
  isError: boolean;
};

export function KpiCardGrid({ kpiData, isLoading, isError }: KpiCardGridProps) {
  const kpis = kpiData;

  return (
    <div className={styles.grid}>
      <KpiCard
        title="Faturamento Total"
        value={isLoading ? 0 : kpis?.faturamento_total || 0}
        isLoading={isLoading || isError}
        icon="💰"
        formatAs="currency"
        iconBgColor="#f0fdf4"
      />
      <KpiCard
        title="Total de Pedidos"
        value={isLoading ? 0 : kpis?.total_pedidos || 0}
        isLoading={isLoading || isError}
        icon="📦"
        formatAs="number"
        iconBgColor="#eff6ff"
      />
      <KpiCard
        title="Ticket Médio"
        value={isLoading ? 0 : kpis?.ticket_medio || 0}
        isLoading={isLoading || isError}
        icon="🏷️"
        formatAs="currency"
        iconBgColor="#fefce8"
      />
    </div>
  );
}