import React from 'react';


interface SkeletonRowProps {
    columns: any[];
    rowHeight: number;
    checkboxSelection?: boolean;
    hasDetailPanel?: boolean;
    rowReordering?: boolean;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
    columns,
    rowHeight,
    checkboxSelection = false,
    hasDetailPanel = false,
    rowReordering = false
}) => {
    return (
        <div
            className="ogx__row ogx__skeleton-row"
            style={{ height: rowHeight }}
            role="row"
        >
            { }
            {checkboxSelection && (
                <div
                    className="ogx__cell ogx__skeleton-cell"
                    style={{ width: 48, minWidth: 48 }}
                >
                    <div className="ogx-skeleton-box" style={{ width: 18, height: 18, borderRadius: 2 }} />
                </div>
            )}

            { }
            {hasDetailPanel && (
                <div
                    className="ogx__cell ogx__skeleton-cell"
                    style={{ width: 48, minWidth: 48 }}
                >
                    <div className="ogx-skeleton-box" style={{ width: 18, height: 18, borderRadius: 2 }} />
                </div>
            )}

            { }
            {rowReordering && (
                <div
                    className="ogx__cell ogx__skeleton-cell"
                    style={{ width: 48, minWidth: 48 }}
                >
                    <div className="ogx-skeleton-box" style={{ width: 18, height: 18, borderRadius: 2 }} />
                </div>
            )}

            { }
            {columns.map((col, index) => {
                const width = col.width || 150;
                const skeletonWidth = Math.min(width * 0.7, width - 20);

                return (
                    <div
                        key={col.field || index}
                        className="ogx__cell ogx__skeleton-cell"
                        style={{
                            width,
                            minWidth: col.minWidth,
                            maxWidth: col.maxWidth,
                            left: col.left,
                            right: col.right,
                            position: col.isSpacer ? 'relative' : (col.pinned ? 'sticky' : 'relative'),
                            zIndex: col.zIndex
                        }}
                    >
                        {!col.isSpacer && (
                            <div
                                className="ogx-skeleton-box"
                                style={{
                                    width: skeletonWidth,
                                    height: 16,
                                    borderRadius: 4
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
