import { describe, it, expect } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

type ToolbarType = React.ComponentType<Record<string, unknown>>;
const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name' }];
const ROWS = [{ id: 1, name: 'Ann' }];

describe('slots.toolbar', () => {
    it('renders a React.memo toolbar', () => {
        const Memo = React.memo(function MemoToolbar() { return <div data-testid="tb">memo</div>; });
        render(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: Memo as ToolbarType }} />);
        expect(screen.getByTestId('tb').textContent).toBe('memo');
    });

    it('renders a forwardRef toolbar', () => {
        const Fwd = React.forwardRef<HTMLDivElement, Record<string, unknown>>(function FwdToolbar(_props, ref) {
            return <div ref={ref} data-testid="tb">fwd</div>;
        });
        render(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: Fwd as ToolbarType }} />);
        expect(screen.getByTestId('tb').textContent).toBe('fwd');
    });

    it('renders a class toolbar and passes it the grid props', () => {
        class ClassToolbar extends React.Component<Record<string, unknown>> {
            render() {
                const cols = this.props.columns as GridColDef[];
                return <div data-testid="tb">{cols.map(c => c.field).join(',')}</div>;
            }
        }
        render(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: ClassToolbar }} />);
        expect(screen.getByTestId('tb').textContent).toBe('name');
    });

    it('remounts cleanly when switched to a toolbar with different hooks', () => {
        function A() { const [v] = useState('a'); return <div data-testid="tb">{v}</div>; }
        function B() {
            const [b] = useState('b');
            const [v] = useState('x');
            const m = React.useMemo(() => b + v, [b, v]);
            return <div data-testid="tb">{m}</div>;
        }
        const { rerender } = render(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: A }} />);
        expect(screen.getByTestId('tb').textContent).toBe('a');
        rerender(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: B }} />);
        expect(screen.getByTestId('tb').textContent).toBe('bx');
    });

    it('keeps the state of a toolbar that the parent redefines inline on every render', () => {
        function Parent() {
            const [renders, setRenders] = useState(0);
            // A new function identity on every render of Parent.
            const Inline = () => {
                const [count, setCount] = useState(0);
                return <button type="button" data-testid="tb" onClick={() => setCount(c => c + 1)}>{count}</button>;
            };
            return (
                <>
                    <button type="button" data-testid="rerender" onClick={() => setRenders(r => r + 1)}>{renders}</button>
                    <DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: Inline }} />
                </>
            );
        }
        render(<Parent />);
        fireEvent.click(screen.getByTestId('tb'));
        fireEvent.click(screen.getByTestId('tb'));
        fireEvent.click(screen.getByTestId('rerender'));
        expect(screen.getByTestId('tb').textContent).toBe('2');
    });
});
