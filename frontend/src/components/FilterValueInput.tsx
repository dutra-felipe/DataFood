import { useQuery } from '@tanstack/react-query';
import {
  type Filter,
  FilterOperator,
  DimensionField,
  fetchChannelOptions,
  fetchStatusOptions,
  fetchStoreOptions,
  fetchProductOptions,
  type SelectOption,
} from '../services/api';
import styles from './FilterPanel.module.css'; 

type FilterValueInputProps = {
  filter: Filter;
  onChange: (newValue: any) => void;
};

const DAY_OF_WEEK_OPTIONS = [
  { name: 'Segunda-feira', value: '1' },
  { name: 'Terça-feira', value: '2' },
  { name: 'Quarta-feira', value: '3' },
  { name: 'Quinta-feira', value: '4' },
  { name: 'Sexta-feira', value: '5' },
  { name: 'Sábado', value: '6' },
  { name: 'Domingo', value: '7' },
];

export function FilterValueInput({ filter, onChange }: FilterValueInputProps) {
  
  const fieldsWithApiOptions = [
    DimensionField.CHANNEL_NAME,
    DimensionField.SALE_STATUS,
    DimensionField.STORE_NAME,
    DimensionField.PRODUCT_NAME,
  ];

  const operatorsForDropdown = [
    FilterOperator.EQUALS,
    FilterOperator.NOT_EQUALS,
  ];

  const { data: options, isLoading } = useQuery<SelectOption[] | null>({
    queryKey: ['filterOptions', filter.field],
    queryFn: () => {
      switch (filter.field) {
        case DimensionField.CHANNEL_NAME:
          return fetchChannelOptions();
        case DimensionField.SALE_STATUS:
          return fetchStatusOptions();
        case DimensionField.STORE_NAME:
          return fetchStoreOptions();
        case DimensionField.PRODUCT_NAME:
          return fetchProductOptions();
        default:
          return Promise.resolve(null);
      }
    },
    enabled:
      (fieldsWithApiOptions as string[]).includes(filter.field) &&
      (operatorsForDropdown as string[]).includes(filter.operator),
    staleTime: 1000 * 60 * 10,
  });


  if (filter.field === DimensionField.DAY_OF_WEEK) {
    return (
      <select
        className={styles.selectInput}
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione...</option>
        {DAY_OF_WEEK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  }

  if (filter.field === DimensionField.HOUR_OF_DAY) {
    return (
      <input
        type="number"
        className={styles.valueInput}
        value={filter.value}
        min="0"
        max="23"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (options && (operatorsForDropdown as string[]).includes(filter.operator)) {
    return (
      <select
        className={styles.selectInput}
        value={filter.value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
      >
        <option value="">{isLoading ? 'Carregando...' : 'Selecione...'}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      className={styles.valueInput}
      value={filter.value}
      placeholder={
        filter.operator === FilterOperator.IN
          ? 'Valores separados por vírgula'
          : 'Digite um valor...'
      }
      onChange={(e) => onChange(e.target.value)}
    />
  );
}