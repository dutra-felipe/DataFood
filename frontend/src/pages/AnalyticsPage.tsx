import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeToggle } from '../components/ThemeToggle';
import {
  type AnalyticsQuery,
  type DimensionField,
  type Metric,
  type Filter,
  fetchAnalyticsData,
  MetricFunction,
  DimensionField as DimFieldEnum,
} from '../services/api';

import styles from './AnalyticsPage.module.css';
import { FilterPanel } from '../components/FilterPanel';
import { DataTable } from '../components/DataTable';
import { DataChart } from '../components/DataChart';
import { KpiCardGrid } from '../components/KpiCardGrid';
import {
  ChartTypeSelector,
  type ChartType,
} from '../components/ChartTypeSelector';
import { CSVLink } from 'react-csv';

import {
  DataSelector,
  type DataSelectorOption,
} from '../components/DataSelector';

const METRIC_OPTIONS: (DataSelectorOption & { metric: Metric })[] = [
  {
    id: 'sum_total_amount',
    name: 'Faturamento',
    metric: {
      field: 'total_amount',
      function: MetricFunction.SUM,
      alias: 'faturamento',
    },
  },
  {
    id: 'count_sale_id',
    name: 'Pedidos',
    metric: {
      field: 'sale_id',
      function: MetricFunction.COUNT,
      alias: 'pedidos',
    },
  },
  {
    id: 'avg_total_amount',
    name: 'Ticket Médio',
    metric: {
      field: 'total_amount',
      function: MetricFunction.AVG,
      alias: 'ticket_medio',
    },
  },
  {
    id: 'sum_delivery_fee',
    name: 'Taxa de Entrega',
    metric: {
      field: 'delivery_fee',
      function: MetricFunction.SUM,
      alias: 'taxa_entrega',
    },
  },
];

const DIMENSION_OPTIONS: (DataSelectorOption & { field: DimensionField })[] = [
  { id: 'store_name', name: 'Loja', field: DimFieldEnum.STORE_NAME },
  { id: 'channel_name', name: 'Canal', field: DimFieldEnum.CHANNEL_NAME },
  { id: 'product_name', name: 'Produto', field: DimFieldEnum.PRODUCT_NAME },
  { id: 'payment_type', name: 'Pagamento', field: DimFieldEnum.PAYMENT_TYPE },
  { id: 'sale_date', name: 'Data', field: DimFieldEnum.SALE_DATE },
  { id: 'day_of_week', name: 'Dia da Semana', field: DimFieldEnum.DAY_OF_WEEK },
  { id: 'hour_of_day', name: 'Hora do Dia', field: DimFieldEnum.HOUR_OF_DAY },
];

export function AnalyticsPage() {
  const [selectedMetrics, setSelectedMetrics] = useState<DataSelectorOption[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<DataSelectorOption[]>([]);
  
  const [filters, setFilters] = useState<Filter[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');

  const getMetricsForQuery = (): Metric[] => {
    return selectedMetrics.map(opt => {
      const fullOption = METRIC_OPTIONS.find(m => m.id === opt.id);
      return fullOption!.metric;
    });
  };

  const getDimensionsForQuery = (): DimensionField[] => {
    return selectedDimensions.map(opt => {
      const fullOption = DIMENSION_OPTIONS.find(d => d.id === opt.id);
      return fullOption!.field;
    });
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', selectedMetrics, selectedDimensions, filters],
    queryFn: () => {
      const query: AnalyticsQuery = {
        metrics: getMetricsForQuery(),
        dimensions: getDimensionsForQuery(),
        filters: filters,
      };
      return fetchAnalyticsData(query);
    },
    enabled: false,
    staleTime: 1000 * 30,
  });

  const handleRunQuery = () => {
    if (selectedMetrics.length > 0 && selectedDimensions.length > 0) {
      refetch();
    } else {
      alert('Por favor, selecione pelo menos uma métrica e uma dimensão.');
    }
  };

  const chartMetrics = getMetricsForQuery();
  const chartDimensions = getDimensionsForQuery();
  const csvData = data?.data || [];
  
  const csvFilename = `relatorio_${selectedDimensions.map(d => d.name).join('_')}_por_${selectedMetrics.map(m => m.name).join('_')}.csv`

  return (
    <div className={styles.container}>
      <KpiCardGrid />

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel de Análise Customizada</h1>
          <p className={styles.subtitle}>
            Faça uma pergunta ao seu negócio: construa sua análise abaixo.
          </p>
        </div>
        
        <ThemeToggle />
      </header>

      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            1. O que medir? (Métricas)
          </label>
          <DataSelector
            options={METRIC_OPTIONS}
            selectedItems={selectedMetrics}
            onChange={setSelectedMetrics}
            buttonText="+ Adicionar Métrica"
          />
        </div>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            2. Agrupar por? (Dimensões)
          </label>
          <DataSelector
            options={DIMENSION_OPTIONS}
            selectedItems={selectedDimensions}
            onChange={setSelectedDimensions}
            buttonText="+ Adicionar Dimensão"
          />
        </div>
        <div className={`${styles.controlGroup} ${styles.colSpan2}`}>
          <label className={styles.controlLabel}>
            3. Filtrar por? (Filtros)
          </label>
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>
      </div>

      <div className={styles.actions}>
        {csvData.length > 0 && !isLoading && (
          <CSVLink
            data={csvData}
            filename={csvFilename}
            className={styles.exportButton}
          >
            Exportar CSV
          </CSVLink>
        )}
        <button
          onClick={handleRunQuery}
          disabled={isLoading}
          className={styles.runButton}
        >
          {isLoading ? 'Analisando...' : 'Analisar'}
        </button>
      </div>

      <div className={styles.resultsCard}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Resultados</h2>
          {csvData.length > 0 && (
            <ChartTypeSelector
              selectedType={chartType}
              onChange={setChartType}
            />
          )}
        </div>

        {isLoading && <p className={styles.resultsStatus}>Carregando dados...</p>}
        {isError && (
          <div className={styles.resultsError}>
            <p>Erro ao buscar dados:</p>
            <pre className={styles.resultsPre}>{(error as Error).message}</pre>
          </div>
        )}
        {csvData.length > 0 && (
          <div>
            <DataChart
              data={csvData}
              metrics={chartMetrics}
              dimensions={chartDimensions}
              chartType={chartType}
            />
            <DataTable data={csvData} />
          </div>
        )}
        {!csvData.length && !isLoading && !isError && (
          <p className={styles.resultsStatus}>
            Selecione suas métricas e dimensões e clique em "Analisar".
          </p>
        )}
      </div>
    </div>
  );
}