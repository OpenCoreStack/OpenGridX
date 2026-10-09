import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { DataGrid, useGridApiRef } from '@opencorestack/opengridx';
import type { GridApi } from '@opencorestack/opengridx';
import { columns, pinnedColumns } from './data';
import type { BenchRow } from './data';

export interface BenchGridProps {
  rows: BenchRow[];
  rowHeight: number;
  onApiRef: (apiRef: MutableRefObject<GridApi<BenchRow>>) => void;
}

/** The grid under test. It fills the page (1280×800): no `height` prop, so it fills its container. */
export default function BenchGrid({ rows, rowHeight, onApiRef }: BenchGridProps) {
  const apiRef = useGridApiRef<BenchRow>();
  useEffect(() => {
    onApiRef(apiRef);
  }, [apiRef, onApiRef]);
  return (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      rowHeight={rowHeight}
      pinnedColumns={pinnedColumns}
      ariaLabel="Benchmark grid"
    />
  );
}
