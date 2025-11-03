// frontend/src/services/api.ts
import axios from 'axios';

// MetricFunction
export const MetricFunction = {
  SUM: "sum", COUNT: "count", AVG: "avg",
} as const;
export type MetricFunction = typeof MetricFunction[keyof typeof MetricFunction];

// DimensionField
export const DimensionField = {
  PRODUCT_NAME: "product_name", CHANNEL_NAME: "channel_name",
  STORE_NAME: "store_name", PAYMENT_TYPE: "payment_type",
  SALE_STATUS: "sale_status", DAY_OF_WEEK: "day_of_week",
  HOUR_OF_DAY: "hour_of_day", SALE_DATE: "sale_date",
} as const;
export type DimensionField = typeof DimensionField[keyof typeof DimensionField];

// FilterOperator
export const FilterOperator = {
  EQUALS: "equals", NOT_EQUALS: "not_equals",
  GREATER_THAN: "greater_than", LESS_THAN: "less_than",
  IN: "in",
} as const;
export type FilterOperator = typeof FilterOperator[keyof typeof FilterOperator];

// SortDirection
export const SortDirection = {
  ASC: "asc", DESC: "desc",
} as const;
export type SortDirection = typeof SortDirection[keyof typeof SortDirection];

// Interfaces
export interface Metric {
  field: string; function: MetricFunction; alias?: string;
}
export interface Filter {
  field: string; operator: FilterOperator; value: any;
}
export interface OrderBy {
  field: string; direction: SortDirection;
}
export interface TimeRangeFilter {
  start_date: string; end_date: string;
}
export interface AnalyticsQuery {
  metrics: Metric[]; dimensions: DimensionField[];
  filters?: Filter[]; time_range?: TimeRangeFilter;
  order_by?: OrderBy; limit?: number;
}
export interface ApiResponse {
  data: any[];
}

// API Client
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export type SelectOption = {
  id: string | number;
  name: string;
};

// Busca Canais e Status (listas de strings simples)
const fetchSimpleOptions = async (endpoint: string): Promise<SelectOption[]> => {
  const { data } = await apiClient.get(endpoint);
  return data.data.map((item: string) => ({ id: item, name: item }));
};

// Busca Lojas e Produtos (listas de objetos {id, name})
const fetchObjectOptions = async (endpoint: string): Promise<SelectOption[]> => {
  const { data } = await apiClient.get(endpoint);
  return data.data;
};

export const fetchChannelOptions = () => fetchSimpleOptions('/options/channels');
export const fetchStatusOptions = () => fetchSimpleOptions('/options/sale_status');
export const fetchStoreOptions = () => fetchObjectOptions('/options/stores');
export const fetchProductOptions = () => fetchObjectOptions('/options/products');

export const fetchAnalyticsData = async (query: AnalyticsQuery): Promise<ApiResponse> => {
  const { data } = await apiClient.post('/query', query);
  return data;
};

export const FRIENDLY_NAMES: Record<string, string> = {
  product_name: 'Produto',
  channel_name: 'Canal',
  store_name: 'Loja',
  payment_type: 'Tipo de Pagamento',
  sale_status: 'Status',
  day_of_week: 'Dia da Semana',
  hour_of_day: 'Hora',
  sale_date: 'Data',

  faturamento: 'Faturamento',
  pedidos: 'Pedidos',
  ticket_medio: 'Ticket Médio',
  taxa_entrega: 'Taxa de Entrega',
};