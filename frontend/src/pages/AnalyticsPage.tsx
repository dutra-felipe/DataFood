import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  type AnalyticsQuery, 
  type DimensionField, 
  type Metric, 
  fetchAnalyticsData 
} from '../services/api';
// Importamos o CSS Module. 'styles' será um objeto com nossas classes.
import styles from './AnalyticsPage.module.css'; 

// --- IMPORTAÇÕES ADICIONADAS ---
import { MetricSelector } from '../components/MetricSelector';
import { DimensionSelector } from '../components/DimensionSelector';
import { DataTable } from '../components/DataTable';
import { DataChart } from '../components/DataChart';
// ------------------------------

export function AnalyticsPage() {
  // O estado que guarda as seleções do usuário
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dimensions, setDimensions] = useState<DimensionField[]>([]);

  // O hook que busca os dados da API
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', metrics, dimensions], // A chave de cache depende da consulta
    queryFn: () => {
      // Monta o objeto de consulta final a partir do nosso estado
      const query: AnalyticsQuery = {
        metrics: metrics,
        dimensions: dimensions,
      };
      return fetchAnalyticsData(query);
    },
    enabled: false, // Só roda quando chamamos 'refetch()'
  });

  // A função que é chamada quando o botão "Analisar" é clicado
  const handleRunQuery = () => {
    if (metrics.length > 0 && dimensions.length > 0) {
      refetch(); // Diz ao React Query: "Rode a consulta agora!"
    } else {
      alert('Por favor, selecione pelo menos uma métrica e uma dimensão.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Análise</h1>
        <p className={styles.subtitle}>
          Faça uma pergunta ao seu negócio: construa sua análise abaixo.
        </p>
      </header>

      {/* ÁREA DE CONTROLES */}
      <div className={styles.controlsGrid}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            1. O que medir? (Métricas)
          </label>
          
          {/* --- SUBSTITUÍDO --- */}
          <MetricSelector 
            selectedMetrics={metrics}
            onChange={setMetrics}
          />
          {/* ------------------- */}

        </div>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            2. Agrupar por? (Dimensões)
          </label>
          
          {/* --- SUBSTITUÍDO --- */}
          <DimensionSelector 
            selectedDimensions={dimensions}
            onChange={setDimensions}
          />
          {/* ------------------- */}

        </div>
        <div className={`${styles.controlGroup} ${styles.colSpan2}`}>
          <label className={styles.controlLabel}>
            3. Filtrar por? (Filtros)
          </label>
          <div className={styles.controlPlaceholder}>
            (Componente de Filtros)
          </div>
        </div>
      </div>

      {/* BOTÃO DE AÇÃO */}
      <div className={styles.actions}>
        <button
          onClick={handleRunQuery}
          disabled={isLoading}
          className={styles.runButton}
        >
          {isLoading ? 'Analisando...' : 'Analisar'}
        </button>
      </div>

      {/* ÁREA DE RESULTADOS */}
      <div className={styles.resultsCard}>
        <h2 className={styles.resultsTitle}>Resultados</h2>
        
        {isLoading && <p className={styles.resultsStatus}>Carregando dados...</p>}
        
        {isError && (
          <div className={styles.resultsError}>
            <p>Erro ao buscar dados:</p>
            <pre className={styles.resultsPre}>{(error as Error).message}</pre>
          </div>
        )}
        {data && data.data.length > 0 && (
          <div>
            {/* 1. O Gráfico */}
            <DataChart 
              data={data.data} 
              metrics={metrics} 
              dimensions={dimensions} 
            />
            
            {/* 2. A Tabela */}
            <DataTable data={data.data} />
          </div>
        )}
        
        {/* Mensagem de 'Sem Resultados' */}
        {data && data.data.length === 0 && (
          <p className={styles.resultsStatus}>
            Nenhum resultado encontrado para esta consulta.
          </p>
        )}
        
        {/* Mensagem Inicial */}
        {!data && !isLoading && !isError && (
          <p className={styles.resultsStatus}>
            Selecione suas métricas e dimensões e clique em "Analisar".
          </p>
        )}
      </div>
    </div>
  );
}