import {
  type Filter,
  FilterOperator,
  DimensionField,
} from '../services/api';
import styles from './FilterPanel.module.css';
import { FilterValueInput } from './FilterValueInput'; 

const FILTERABLE_FIELDS = [
  { label: 'Canal', value: DimensionField.CHANNEL_NAME },
  { label: 'Loja', value: DimensionField.STORE_NAME },
  { label: 'Produto', value: DimensionField.PRODUCT_NAME },
  { label: 'Status do Pedido', value: DimensionField.SALE_STATUS },
  { label: 'Dia da Semana', value: DimensionField.DAY_OF_WEEK },
  { label: 'Hora do Dia', value: DimensionField.HOUR_OF_DAY },
];

const OPERATORS = [
  { label: 'é igual a', value: FilterOperator.EQUALS },
  { label: 'não é igual a', value: FilterOperator.NOT_EQUALS },
  { label: 'maior que', value: FilterOperator.GREATER_THAN },
  { label: 'menor que', value: FilterOperator.LESS_THAN },
  { label: 'está em', value: FilterOperator.IN },
];

type FilterPanelProps = {
  filters: Filter[];
  onChange: (newFilters: Filter[]) => void;
};

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const addFilter = () => {
    const newFilter: Filter = {
      field: DimensionField.CHANNEL_NAME,
      operator: FilterOperator.EQUALS,
      value: '',
    };
    onChange([...filters, newFilter]);
  };

  const removeFilter = (indexToRemove: number) => {
    onChange(filters.filter((_, index) => index !== indexToRemove));
  };

  const updateFilter = (indexToUpdate: number, part: Partial<Filter>) => {
    const newFilters = filters.map((filter, index) => {
      if (index === indexToUpdate) {
        return { ...filter, ...part };
      }
      return filter;
    });
    onChange(newFilters);
  };

  const handleFieldChange = (index: number, newField: string) => {
    updateFilter(index, {
      field: newField,
      value: '',
    });
  };

  return (
    <div className={styles.panel}>
      {filters.map((filter, index) => (
        <div key={index} className={styles.filterRow}>
          <select
            className={styles.selectInput}
            value={filter.field}
            onChange={(e) => handleFieldChange(index, e.target.value)}
          >
            {FILTERABLE_FIELDS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className={styles.selectInput}
            value={filter.operator}
            onChange={(e) =>
              updateFilter(index, { operator: e.target.value as FilterOperator })
            }
          >
            {OPERATORS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <FilterValueInput
            filter={filter}
            onChange={(newValue) => updateFilter(index, { value: newValue })}
          />

          <button
            className={styles.removeButton}
            onClick={() => removeFilter(index)}
            title="Remover filtro"
          >
            &times;
          </button>
        </div>
      ))}

      <button className={styles.addButton} onClick={addFilter}>
        + Adicionar Filtro
      </button>
    </div>
  );
}