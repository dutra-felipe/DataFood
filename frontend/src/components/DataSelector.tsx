import { useState, useRef, useEffect } from 'react';
import styles from './DataSelector.module.css';

// 1. Define o formato de "opção" que o seletor espera
export type DataSelectorOption = {
  id: string;
  name: string;
};

// 2. Define as Props do componente
type DataSelectorProps = {
  // Todas as opções disponíveis para escolher
  options: DataSelectorOption[];
  // As opções que já foram selecionadas (vem da página principal)
  selectedItems: DataSelectorOption[];
  // A função para notificar a página principal sobre mudanças
  onChange: (newSelectedItems: DataSelectorOption[]) => void;
  // O texto do botão (ex: "+ Adicionar Métrica")
  buttonText: string;
};

export function DataSelector({
  options,
  selectedItems,
  onChange,
  buttonText,
}: DataSelectorProps) {
  // 3. Estado interno para controlar se o dropdown está aberto
  const [isOpen, setIsOpen] = useState(false);
  
  // 4. Lógica para fechar o dropdown ao clicar fora dele
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);


  // 5. Lógica para adicionar ou remover itens
  const handleRemoveItem = (itemToRemove: DataSelectorOption) => {
    const newItems = selectedItems.filter(item => item.id !== itemToRemove.id);
    onChange(newItems);
  };

  const handleAddItem = (itemToAdd: DataSelectorOption) => {
    // Evita adicionar itens duplicados
    if (!selectedItems.some(item => item.id === itemToAdd.id)) {
      onChange([...selectedItems, itemToAdd]);
    }
    setIsOpen(false); // Fecha o dropdown após selecionar
  };

  // Filtra as opções para mostrar apenas as que AINDA NÃO foram selecionadas
  const availableOptions = options.filter(
    opt => !selectedItems.some(item => item.id === opt.id)
  );

  // 6. O Render do componente
  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      {/* Renderiza as "pílulas" dos itens já selecionados */}
      {selectedItems.map(item => (
        <div key={item.id} className={styles.pill}>
          {item.name}
          <button
            className={styles.pillRemoveButton}
            onClick={() => handleRemoveItem(item)}
            title={`Remover ${item.name}`}
          >
            &times;
          </button>
        </div>
      ))}

      {/* Renderiza o botão de "+ Adicionar" se houver opções disponíveis */}
      {availableOptions.length > 0 && (
        <button className={styles.addButton} onClick={() => setIsOpen(!isOpen)}>
          {buttonText}
        </button>
      )}

      {/* Renderiza o Dropdown (se estiver aberto) */}
      {isOpen && (
        <div className={styles.dropdown}>
          {availableOptions.map(option => (
            <div
              key={option.id}
              className={styles.dropdownItem}
              onClick={() => handleAddItem(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}