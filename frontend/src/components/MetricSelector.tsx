import { type Metric, MetricFunction } from '../services/api';
import styles from './Selector.module.css';

// 1. Define as métricas disponíveis que a Maria pode escolher
const AVAILABLE_METRICS: { id: string; name: string; func: MetricFunction; field: string }[] = [
  { id: 'sum_total_amount', name: 'Faturamento', func: MetricFunction.SUM, field: 'total_amount' },
  { id: 'count_sale_id', name: 'Pedidos', func: MetricFunction.COUNT, field: 'sale_id' },
  { id: 'avg_total_amount', name: 'Ticket Médio', func: MetricFunction.AVG, field: 'total_amount' },
  { id: 'sum_delivery_fee', name: 'Taxa de Entrega', func: MetricFunction.SUM, field: 'delivery_fee' },
];

// 2. Define as Props que o componente receberá da página principal
type MetricSelectorProps = {
  selectedMetrics: Metric[];
  onChange: (newMetrics: Metric[]) => void;
};

export function MetricSelector({ selectedMetrics, onChange }: MetricSelectorProps) {

  // 3. Lógica para adicionar/remover uma métrica
  const handleToggleMetric = (metricOption: (typeof AVAILABLE_METRICS)[0]) => {
    const isSelected = selectedMetrics.some(m => m.alias === metricOption.id);

    let newMetrics: Metric[];
    if (isSelected) {
      // Remove a métrica
      newMetrics = selectedMetrics.filter(m => m.alias !== metricOption.id);
    } else {
      // Adiciona a métrica
      const newMetric: Metric = {
        field: metricOption.field,
        function: metricOption.func,
        alias: metricOption.id, // Usamos o ID como alias para rastreamento
      };
      newMetrics = [...selectedMetrics, newMetric];
    }
    onChange(newMetrics); // Informa a página principal sobre a mudança
  };

  // 4. O Render do componente
  return (
    <div className={styles.container}>
      {AVAILABLE_METRICS.map(metricOption => {
        const isSelected = selectedMetrics.some(m => m.alias === metricOption.id);
        
        // Aplica a classe .pill e .pillSelected condicionalmente
        const pillClassName = `
          ${styles.pill} 
          ${isSelected ? styles.pillSelected : ''}
        `;

        return (
          <div
            key={metricOption.id}
            className={pillClassName.trim()}
            onClick={() => handleToggleMetric(metricOption)}
            data-metric-id={metricOption.id}
          >
            {metricOption.name}
          </div>
        );
      })}
    </div>
  );
}