

export interface SkeletonProps {
    rows?: number;
    columns?: number;
}

export function Skeleton({ rows = 5, columns = 5 }: SkeletonProps) {
    return (
        <div className="ogx__skeleton">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="ogx__skeleton-row">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={colIndex} className="ogx__skeleton-cell">
                            <div className="ogx__skeleton-content" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
