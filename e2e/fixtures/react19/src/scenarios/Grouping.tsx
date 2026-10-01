import { useMemo, useState } from 'react';
import {
  DataGrid,
  exportToCsv,
  exportToExcelAdvanced,
  exportToPdf,
  useGridApiRef,
  type GridAggregationModel,
} from '@opencorestack/opengridx';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

const report = (e: unknown): void => console.error('export failed', e);

export default function Grouping() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(5000), []);
  const apiRef = useGridApiRef<Invoice>();
  const [aggregation, setAggregation] = useState<GridAggregationModel>({ amount: 'sum', tax: 'sum' });

  const exportArgs = () => {
    const api = apiRef.current;
    return {
      rows: api.getAllFilteredRows(),
      columns: api.getVisibleColumns(),
      groupedRows: api.getGroupedExportRows() ?? undefined,
    };
  };

  return (
    <div className="page">
      <div className="bar">
        <button
          type="button"
          data-testid="export-csv"
          onClick={() => {
            const { rows: r, columns, groupedRows } = exportArgs();
            exportToCsv(r, columns, { fileName: 'grouped.csv', groupedRows });
          }}
        >
          CSV
        </button>
        <button
          type="button"
          data-testid="export-xlsx"
          onClick={() => {
            const { rows: r, columns, groupedRows } = exportArgs();
            exportToExcelAdvanced(r, columns, { fileName: 'grouped.xlsx', groupedRows }).catch(report);
          }}
        >
          XLSX
        </button>
        <button
          type="button"
          data-testid="export-pdf"
          onClick={() => {
            const { rows: r, columns, groupedRows } = exportArgs();
            exportToPdf(r, columns, {
              fileName: 'grouped',
              title: 'Invoices by region',
              groupedRows,
              aggregationModel: aggregation,
              aggregationResult: apiRef.current.getAggregationResult(),
            }).catch(report);
          }}
        >
          PDF
        </button>
      </div>
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={invoiceColumns}
        rowGroupingModel={['region', 'status']}
        aggregationModel={aggregation}
        onAggregationModelChange={setAggregation}
        groupingColDef={{ headerName: 'Region / Status', width: 240 }}
        height={600}
      />
    </div>
  );
}
