// frontend/src/components/DataChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { type DimensionField, type Metric } from '../services/api';

type DataChartProps = {
  data: any[];
  // Precisamos saber o que plotar!
  metrics: Metric[];
  dimensions: DimensionField[];
};

export function DataChart({ data, metrics, dimensions }: DataChartProps) {
  if (data.length === 0 || metrics.length === 0 || dimensions.length === 0) {
    return null; // Não renderiza o gráfico se não tiver dados ou configuração
  }

  // Determina as chaves para o gráfico
  // Chave X (Dimensão, ex: "store_name")
  const dimensionKey = dimensions[0]; 
  // Chave Y (Métrica, ex: "faturamento_por_loja")
  const metricKey = metrics[0].alias || metrics[0].field; 
  // Nome da métrica (ex: "Faturamento")
  const metricName =
    document.querySelector(`[data-metric-id="${metricKey}"]`)?.textContent || metricKey;

  return (
    // ResponsiveContainer faz o gráfico preencher o espaço do 'pai'
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dimensionKey} tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip
            formatter={(value: number) =>
              typeof value === 'number' ? value.toFixed(2) : value
            }
          />
          <Legend />
          <Bar dataKey={metricKey} name={metricName} fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}