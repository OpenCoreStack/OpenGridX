import React from 'react';

// Must live at module scope (not inline) so React sees a stable component type.
// Calling renderFn() here puts the throw one level BELOW CellErrorBoundary,
// which is required — a component cannot catch errors thrown in its own render().
function CellRenderTarget({ renderFn }: { renderFn: () => React.ReactNode }) {
    return <>{renderFn()}</>;
}

interface CellErrorBoundaryProps {
    renderFn: () => React.ReactNode;
    field: string;
    resetKey?: unknown;
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
        if (state.hasError && props.resetKey !== state.resetKey) {
            return { hasError: false, error: null, resetKey: props.resetKey };
        }
        if (props.resetKey !== state.resetKey) {
            return { resetKey: props.resetKey };
        }
        return null;
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
                    role="status"
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
