import React from 'react';

// Must live at module scope (not inline) so React sees a stable component type.
// Calling renderFn() here puts the throw one level BELOW CellErrorBoundary,
// which is required — a component cannot catch errors thrown in its own render().
// `renderFn` runs the consumer's renderCell, which may call hooks, so it must run on every render:
// 'use no memo' stops React Compiler from memoizing the call (see GridToolbarSlot's InlineToolbar).
function CellRenderTarget({ renderFn }: { renderFn: () => React.ReactNode }) {
    'use no memo';
    return <>{renderFn()}</>;
}

interface CellErrorBoundaryProps {
    renderFn: () => React.ReactNode;
    field: string;
    /** The error is cleared when this changes. An array is compared element by element. */
    resetKey?: unknown;
}

function sameResetKey(a: unknown, b: unknown): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
    }
    return Object.is(a, b);
}

interface CellErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    resetKey?: unknown;
}

export class CellErrorBoundary extends React.Component<CellErrorBoundaryProps, CellErrorBoundaryState> {
    constructor(props: CellErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, resetKey: props.resetKey };
    }

    static getDerivedStateFromProps(
        props: CellErrorBoundaryProps,
        state: CellErrorBoundaryState
    ): Partial<CellErrorBoundaryState> | null {
        if (sameResetKey(props.resetKey, state.resetKey)) return null;
        if (state.hasError) {
            return { hasError: false, error: null, resetKey: props.resetKey };
        }
        return { resetKey: props.resetKey };
    }

    static getDerivedStateFromError(error: Error): Partial<CellErrorBoundaryState> {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, info: React.ErrorInfo) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[CellErrorBoundary] field="${this.props.field}"`, error, info.componentStack);
        }
    }

    override render() {
        if (this.state.hasError) {
            return (
                <div
                    className="ogx__cell-error"
                    role="img"
                    aria-label={`Error in cell: ${this.props.field}`}
                    title={this.state.error?.message ?? 'Render error'}
                >
                    ⚠
                </div>
            );
        }
        return <CellRenderTarget renderFn={this.props.renderFn} />;
    }
}
