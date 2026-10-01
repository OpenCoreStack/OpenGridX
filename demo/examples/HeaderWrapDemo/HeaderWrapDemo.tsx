import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './HeaderWrapDemo.css';
import sourceCode from './HeaderWrapDemo.tsx?raw';

interface FundRow {
    id: number;
    fund: string;
    nav: number;
    ytd: number;
    ocf: number;
    aum: number;
    sharpe: number;
    drawdown: number;
}

const ROWS: FundRow[] = [
    { id: 1, fund: 'Global Equity Income — Acc', nav: 18.42, ytd: 7.9, ocf: 0.62, aum: 4210, sharpe: 0.94, drawdown: -18.3 },
    { id: 2, fund: 'Emerging Markets Value — Inc', nav: 11.07, ytd: 3.1, ocf: 0.91, aum: 1385, sharpe: 0.41, drawdown: -27.6 },
    { id: 3, fund: 'Sterling Corporate Bond — Acc', nav: 1.284, ytd: 2.4, ocf: 0.35, aum: 2960, sharpe: 0.22, drawdown: -14.1 },
    { id: 4, fund: 'US Smaller Companies — Acc', nav: 42.9, ytd: 11.6, ocf: 0.84, aum: 870, sharpe: 0.77, drawdown: -31.2 },
    { id: 5, fund: 'European Dividend Growth — Inc', nav: 6.53, ytd: 5.2, ocf: 0.71, aum: 1540, sharpe: 0.58, drawdown: -21.9 },
    { id: 6, fund: 'Global Infrastructure — Acc', nav: 2.118, ytd: 4.7, ocf: 0.78, aum: 2275, sharpe: 0.66, drawdown: -16.4 },
    { id: 7, fund: 'Short-Dated Gilt Index — Acc', nav: 1.012, ytd: 1.8, ocf: 0.1, aum: 5120, sharpe: 0.15, drawdown: -6.2 },
    { id: 8, fund: 'Asia Pacific ex-Japan — Inc', nav: 9.76, ytd: 6.3, ocf: 0.88, aum: 1190, sharpe: 0.49, drawdown: -25.8 },
];

const percent = ({ value }: { value: unknown }) => `${Number(value).toFixed(1)}%`;

const COLUMNS: GridColDef<FundRow>[] = [
    // This column opts out: its title stays on one line and ends in an ellipsis.
    { field: 'fund', headerName: 'Fund name and share class', width: 200, wrapHeaderText: false },
    { field: 'nav', headerName: 'Net asset value per share (USD)', width: 120, type: 'number' },
    { field: 'ytd', headerName: 'Year-to-date total return', width: 115, type: 'number', valueFormatter: percent },
    { field: 'ocf', headerName: 'Ongoing charges figure (OCF)', width: 115, type: 'number', valueFormatter: percent },
    { field: 'aum', headerName: 'Assets under management (USD millions)', width: 135, type: 'number',
      valueFormatter: ({ value }) => Number(value).toLocaleString() },
    { field: 'sharpe', headerName: 'Three-year annualised Sharpe ratio', width: 120, type: 'number' },
    { field: 'drawdown', headerName: 'Maximum drawdown over the trailing five-year period', width: 135, type: 'number', valueFormatter: percent },
];

const HEADER_HEIGHTS = [56, 72, 88] as const;

export default function HeaderWrapDemo() {
    const [wrapHeaderText, setWrapHeaderText] = useState(true);
    const [headerHeight, setHeaderHeight] = useState<number>(56);

    return (
        <DocsLayout
            title="Wrapped Header Text"
            description="Long column titles can wrap onto several lines instead of being cut with an ellipsis. The header keeps its headerHeight: titles take as many lines as fit (2 at 56px, 3 at 72px, 4 at 88px) and still end in an ellipsis if they are longer. Hover a header to see its full title."
            sourceCode={sourceCode}
        >
            <div className="header-wrap-controls">
                <label className="header-wrap-control">
                    <input
                        type="checkbox"
                        checked={wrapHeaderText}
                        onChange={(e) => setWrapHeaderText(e.target.checked)}
                    />
                    <code>wrapHeaderText</code>
                </label>
                <label className="header-wrap-control">
                    <code>headerHeight</code>
                    <select value={headerHeight} onChange={(e) => setHeaderHeight(Number(e.target.value))}>
                        {HEADER_HEIGHTS.map(h => <option key={h} value={h}>{h}px</option>)}
                    </select>
                </label>
            </div>
            <div className="header-wrap-hint">
                <em>Fund name and share class</em> sets <code>wrapHeaderText: false</code>, so it keeps one line
                with an ellipsis while the others wrap. Sort, the column menu and the resize handle work as usual;
                double-click a resize handle to fit the column to its title on one line.
            </div>
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                wrapHeaderText={wrapHeaderText}
                headerHeight={headerHeight}
                height={480}
            />
            <div className="header-wrap-usage">
                <strong>Usage:</strong>
                <pre>{`const columns: GridColDef[] = [
  // Opts out of the grid setting: one line with an ellipsis
  { field: 'fund', headerName: 'Fund name and share class', wrapHeaderText: false },
  { field: 'nav', headerName: 'Net asset value per share (USD)', width: 120 },
];

// 56px fits 2 lines, 72px 3, 88px 4. The header never grows on its own.
<DataGrid rows={rows} columns={columns} wrapHeaderText headerHeight={72} />`}</pre>
            </div>
        </DocsLayout>
    );
}
