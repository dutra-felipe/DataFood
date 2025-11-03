// frontend/src/components/KpiCardGrid.tsx
import { useQuery } from '@tanstack/react-query';
import {
  type AnalyticsQuery,
  MetricFunction,
  fetchAnalyticsData,
} from '../services/api';
import { KpiCard } from './KpiCard';
import styles from './KpiCardGrid.module.css';

// ... (A constante KPI_QUERY permanece a mesma)
const KPI_QUERY: AnalyticsQuery = {
  metrics: [
    { field: 'total_amount', function: MetricFunction.SUM, alias: 'faturamento_total' },
    { field: 'sale_id', function: MetricFunction.COUNT, alias: 'total_pedidos' },
    { field: 'total_amount', function: MetricFunction.AVG, alias: 'ticket_medio' },
  ],
  dimensions: [],
};

export function KpiCardGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => fetchAnalyticsData(KPI_QUERY),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const kpis = data?.data?.[0];

  return (
    <div className={styles.grid}>
      <KpiCard
        title="Faturamento Total"
        value={isLoading ? 0 : kpis?.faturamento_total || 0}
        isLoading={isLoading || isError}
        icon="💰"
        formatAs="currency" // <-- CORRIGIDO
        iconBgColor="#f0fdf4" // Verde claro
      />
      <KpiCard
        title="Total de Pedidos"
        value={isLoading ? 0 : kpis?.total_pedidos || 0}
        isLoading={isLoading || isError}
        icon="📦"
        formatAs="number" // <-- CORRIGIDO
        iconBgColor="#eff6ff" // Azul claro
      />
      <KpiCard
        title="Ticket Médio"
        value={isLoading ? 0 : kpis?.ticket_medio || 0}
        isLoading={isLoading || isError}
        icon="🏷️"
        formatAs="currency" // <-- CORRIGIDO
        iconBgColor="#fefce8" // Amarelo claro
      />
    </div>
  );
}