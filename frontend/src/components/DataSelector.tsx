import { useState, useRef, useEffect } from 'react';
import styles from './DataSelector.module.css';

export type DataSelectorOption = {
  id: string;
  name: string;
};

type DataSelectorProps = {
  options: DataSelectorOption[];
  selectedItems: DataSelectorOption[];
  onChange: (newSelectedItems: DataSelectorOption[]) => void;
  buttonText: string;
};

export function DataSelector({
  options,
  selectedItems,
  onChange,
  buttonText,
}: DataSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
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


  const handleRemoveItem = (itemToRemove: DataSelectorOption) => {
    const newItems = selectedItems.filter(item => item.id !== itemToRemove.id);
    onChange(newItems);
  };

  const handleAddItem = (itemToAdd: DataSelectorOption) => {
    if (!selectedItems.some(item => item.id === itemToAdd.id)) {
      onChange([...selectedItems, itemToAdd]);
    }
    setIsOpen(false);
  };

  const availableOptions = options.filter(
    opt => !selectedItems.some(item => item.id === opt.id)
  );

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
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

      {availableOptions.length > 0 && (
        <button className={styles.addButton} onClick={() => setIsOpen(!isOpen)}>
          {buttonText}
        </button>
      )}

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