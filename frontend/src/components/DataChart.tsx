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
import { type DimensionField, type Metric, FRIENDLY_NAMES } from '../services/api';
import { type ChartType } from './ChartTypeSelector';

const translateName = (name: string) => {
  return FRIENDLY_NAMES[name] || name;
};

const CommonChartComponents = ({
  dimensionKey,
}: {
  dimensionKey: string;
}) => (
  <>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
    <XAxis
      dataKey={dimensionKey}
      tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
      stroke="var(--color-border)"
    />
    <YAxis
      tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
      stroke="var(--color-border)"
    />
    <Tooltip
      contentStyle={{
        backgroundColor: 'var(--color-white)',
        borderColor: 'var(--color-border)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
      formatter={(value: number, name: string) => [
        typeof value === 'number'
          ? value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : value,
        translateName(name),
      ]}
      labelFormatter={(label) => translateName(label)}
    />
    <Legend formatter={(value) => translateName(value)} />
  </>
);

type DataChartProps = {
  data: any[];
  metrics: Metric[];
  dimensions: DimensionField[];
  chartType: ChartType;
};

export function DataChart({
  data,
  metrics,
  dimensions,
  chartType,
}: DataChartProps) {
  if (data.length === 0 || metrics.length === 0 || dimensions.length === 0) {
    return null;
  }

  const dimensionKey = dimensions[0];
  const metricKey = metrics[0].alias || metrics[0].field;
  const metricName = translateName(metricKey);

  const chartContent = (
    <>
      <CommonChartComponents dimensionKey={dimensionKey} />
      {chartType === 'bar' ? (
        <Bar dataKey={metricKey} name={metricName} fill="var(--color-primary)" />
      ) : (
        <Line
          type="monotone"
          dataKey={metricKey}
          name={metricName}
          stroke="var(--color-primary)"
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