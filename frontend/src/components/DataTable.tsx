// frontend/src/components/DataTable.tsx
import styles from './DataTable.module.css';

type DataTableProps = {
  data: any[];
};

export function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) {
    return <p>Nenhum dado para exibir.</p>;
  }

  const headers = Object.keys(data[0]);

  // --- ADICIONADO O WRAPPER ---
  return (
    <div className={styles.tableWrapper}> 
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>
                  {typeof row[header] === 'number'
                    ? row[header].toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}