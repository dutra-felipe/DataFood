// frontend/src/components/DimensionSelector.tsx
import { DimensionField } from '../services/api';
import styles from './Selector.module.css'; // Reutilizamos o mesmo estilo!

// 1. Define as dimensões disponíveis
const AVAILABLE_DIMENSIONS: { id: DimensionField; name: string }[] = [
  { id: DimensionField.STORE_NAME, name: 'Loja' },
  { id: DimensionField.CHANNEL_NAME, name: 'Canal' },
  { id: DimensionField.PRODUCT_NAME, name: 'Produto' },
  { id: DimensionField.PAYMENT_TYPE, name: 'Pagamento' },
  { id: DimensionField.SALE_DATE, name: 'Data' },
  { id: DimensionField.DAY_OF_WEEK, name: 'Dia da Semana' },
  { id: DimensionField.HOUR_OF_DAY, name: 'Hora do Dia' },
];

// 2. Define as Props
type DimensionSelectorProps = {
  selectedDimensions: DimensionField[];
  onChange: (newDimensions: DimensionField[]) => void;
};

export function DimensionSelector({ selectedDimensions, onChange }: DimensionSelectorProps) {

  // 3. Lógica para adicionar/remover
  const handleToggleDimension = (dimensionOption: (typeof AVAILABLE_DIMENSIONS)[0]) => {
    const isSelected = selectedDimensions.includes(dimensionOption.id);

    let newDimensions: DimensionField[];
    if (isSelected) {
      newDimensions = selectedDimensions.filter(d => d !== dimensionOption.id);
    } else {
      newDimensions = [...selectedDimensions, dimensionOption.id];
    }
    onChange(newDimensions); // Informa a página principal
  };

  // 4. O Render
  return (
    <div className={styles.container}>
      {AVAILABLE_DIMENSIONS.map(dimOption => {
        const isSelected = selectedDimensions.includes(dimOption.id);
        const pillClassName = `
          ${styles.pill} 
          ${isSelected ? styles.pillSelected : ''}
        `;

        return (
          <div
            key={dimOption.id}
            className={pillClassName.trim()}
            onClick={() => handleToggleDimension(dimOption)}
          >
            {dimOption.name}
          </div>
        );
      })}
    </div>
  );
}