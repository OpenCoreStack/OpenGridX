import React from 'react';

interface CellErrorBoundaryProps {
    children: React.ReactNode;
    field: string;
}

interface CellErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class CellErrorBoundary extends React.Component<CellErrorBoundaryProps, CellErrorBoundaryState> {
    constructor(props: CellErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): CellErrorBoundaryState {
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
