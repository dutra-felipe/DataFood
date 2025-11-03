// frontend/src/components/DataChart.tsx
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { type DimensionField, type Metric } from '../services/api';
import { type ChartType } from './ChartTypeSelector';

type DataChartProps = {
  data: any[];
  metrics: Metric[];
  dimensions: DimensionField[];
  chartType: ChartType;
};

const CommonChartComponents = ({ 
  dimensionKey 
}: { 
  dimensionKey: string 
}) => (
  <>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey={dimensionKey} tick={{ fontSize: 12 }} />
    <YAxis />
    <Tooltip
      formatter={(value: number) =>
        typeof value === 'number'
          ? value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : value
      }
    />
    <Legend />
  </>
);

export function DataChart({ data, metrics, dimensions, chartType }: DataChartProps) {
  if (data.length === 0 || metrics.length === 0 || dimensions.length === 0) {
    return null;
  }

  const dimensionKey = dimensions[0]; 
  const metricKey = metrics[0].alias || metrics[0].field; 
  const metricName = document.querySelector(`[data-metric-id="${metricKey}"]`)?.textContent || metricKey;
  const chartContent = (
    <>
      <CommonChartComponents dimensionKey={dimensionKey} />
      {chartType === 'bar' ? (
        <Bar dataKey={metricKey} name={metricName} fill="#4A6FFF" />
      ) : (
        <Line
          type="monotone"
          dataKey={metricKey}
          name={metricName}
          stroke="#4A6FFF"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      )}
    </>
  );

  return (
    <div style={{ width: '100%', height: 400, marginBottom: '2rem' }}>
      <ResponsiveContainer>
        {chartType === 'bar' ? (
          <BarChart data={data}>{chartContent}</BarChart>
        ) : (
          <LineChart data={data}>{chartContent}</LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}