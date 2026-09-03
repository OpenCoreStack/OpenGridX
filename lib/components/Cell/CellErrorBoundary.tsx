import React from 'react';

interface CellErrorBoundaryProps {
    children: React.ReactNode;
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

    override render() {
        if (this.state.hasError) {
            return (
                <div
                    className="ogx__cell-error"
                    role="alert"
                    aria-label={`Error in cell: ${this.props.field}`}
                    title={this.state.error?.message ?? 'Render error'}
                >
                    ⚠
                </div>
            );
        }
        return this.props.children;
    }
}
