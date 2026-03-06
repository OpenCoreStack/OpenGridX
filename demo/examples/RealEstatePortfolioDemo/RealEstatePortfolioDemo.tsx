
import { useMemo, useState } from 'react';
import { DataGrid, GridColDef, GridAggregationModel, GridToolbar, GridFilterModel } from '../../../lib';
import './RealEstatePortfolioDemo.css';

// --- Mock Data ---

interface UnitInfo {
    unitNumber: string;
    tenant: string;
    rent: number;
    leaseEnd: string;
    bedrooms: number;
    bathrooms: number;
}

interface PropertyInfo {
    id: string;
    propertyName: string;
    image: string;
    location: string;
    status: 'Available' | 'Fully Occupied' | 'Under Maintenance';
    unitsOpen: number;
    value: number;
    monthlyRevenue: number;
    rating: number;
    totalUnits: number;
    units: UnitInfo[];
}

const mockProperties: PropertyInfo[] = [
    {
        id: '1',
        propertyName: 'Sunset Towers',
        image: '🏢',
        location: 'Downtown Metro',
        status: 'Available',
        unitsOpen: 2,
        value: 12500000,
        monthlyRevenue: 45000,
        rating: 4,
        totalUnits: 24,
        units: [
            { unitNumber: '101A', tenant: 'Vacant', rent: 2100, leaseEnd: '-', bedrooms: 2, bathrooms: 1.5 },
            { unitNumber: '101B', tenant: 'Alice Cooper', rent: 1950, leaseEnd: '2026-12-31', bedrooms: 1, bathrooms: 1 },
            { unitNumber: '205', tenant: 'Vacant', rent: 2800, leaseEnd: '-', bedrooms: 3, bathrooms: 2 }
        ]
    },
    {
        id: '2',
        propertyName: 'The Heights Plaza',
        image: '🏙️',
        location: 'Financial District',
        status: 'Fully Occupied',
        unitsOpen: 0,
        value: 28000000,
        monthlyRevenue: 120000,
        rating: 5,
        totalUnits: 40,
        units: [
            { unitNumber: 'PH-1', tenant: 'Globex Corp', rent: 12000, leaseEnd: '2028-05-31', bedrooms: 4, bathrooms: 4 },
            { unitNumber: 'PH-2', tenant: 'Wayne Ent.', rent: 11500, leaseEnd: '2027-08-31', bedrooms: 3, bathrooms: 3 }
        ]
    },
    {
        id: '3',
        propertyName: 'Maplewood Estates',
        image: '🏡',
        location: 'Suburban Ridge',
        status: 'Available',
        unitsOpen: 5,
        value: 4200000,
        monthlyRevenue: 18500,
        rating: 5,
        totalUnits: 12,
        units: [
            { unitNumber: 'House 1', tenant: 'The Smiths', rent: 3200, leaseEnd: '2026-10-15', bedrooms: 4, bathrooms: 2.5 },
            { unitNumber: 'House 2', tenant: 'Vacant', rent: 3100, leaseEnd: '-', bedrooms: 3, bathrooms: 2 }
        ]
    },
    {
        id: '4',
        propertyName: 'Oceanfront Lofts',
        image: '🏖️',
        location: 'Westside Marina',
        status: 'Under Maintenance',
        unitsOpen: 0,
        value: 8500000,
        monthlyRevenue: 15000,
        rating: 3,
        totalUnits: 8,
        units: [
            { unitNumber: 'Loft A', tenant: 'Maintenance', rent: 0, leaseEnd: '-', bedrooms: 2, bathrooms: 2 },
            { unitNumber: 'Loft B', tenant: 'Maintenance', rent: 0, leaseEnd: '-', bedrooms: 1, bathrooms: 1 }
        ]
    },
    {
        id: '5',
        propertyName: 'Tech Park Flex',
        image: '🏭',
        location: 'North Innovation Way',
        status: 'Available',
        unitsOpen: 1,
        value: 15000000,
        monthlyRevenue: 65000,
        rating: 4,
        totalUnits: 5,
        units: [
            { unitNumber: 'Suite 100', tenant: 'Startup Inc', rent: 12500, leaseEnd: '2025-06-30', bedrooms: 0, bathrooms: 2 },
            { unitNumber: 'Suite 200', tenant: 'Vacant', rent: 15000, leaseEnd: '-', bedrooms: 0, bathrooms: 4 }
        ]
    }
];

// --- Custom Cell Renderers ---

const StatusCell = ({ value }: { value: PropertyInfo['status'] }) => {
    let bg = '#e2e8f0';
    let color = '#475569';
    let icon = '';

    if (value === 'Available') {
        bg = '#dcfce7'; color = '#166534'; icon = '✓';
    } else if (value === 'Fully Occupied') {
        bg = '#fee2e2'; color = '#991b1b'; icon = '✕';
    } else if (value === 'Under Maintenance') {
        bg = '#fef3c7'; color = '#92400e'; icon = '↻';
    }

    return (
        <div className="re-status-pill" style={{ background: bg, color: color }}>
            <span>{icon}</span> {value}
        </div>
    );
};

const RatingCell = ({ value }: { value: number }) => {
    return (
        <div className="re-rating-box">
            {'★'.repeat(value)}{'☆'.repeat(5 - value)}
        </div>
    );
};

const PropertyCell = ({ row }: { row: PropertyInfo }) => (
    <div className="re-property-cell-root">
        <div className="re-property-img-box">
            {row.image}
        </div>
        <span className="re-property-name">{row.propertyName}</span>
    </div>
);

// --- Detail Panel Renderer ---

const DetailPanel = ({ row }: { row: PropertyInfo }) => {
    return (
        <div className="re-detail-panel">
            <h4 className="re-detail-title">Unit Details</h4>
            <table className="re-detail-table">
                <thead>
                    <tr>
                        <th>Unit #</th>
                        <th>Tenant</th>
                        <th>Lease End</th>
                        <th>Bedrooms</th>
                        <th>Bathrooms</th>
                        <th style={{ textAlign: 'right' }}>Monthly Rent</th>
                    </tr>
                </thead>
                <tbody>
                    {row.units.map((u, i) => (
                        <tr key={i}>
                            <td className="re-unit-number">{u.unitNumber}</td>
                            <td className="re-unit-tenant">
                                {u.tenant === 'Vacant' ? <span className="re-unit-vacant">Vacant</span> : u.tenant}
                            </td>
                            <td className="re-unit-data">{u.leaseEnd}</td>
                            <td className="re-unit-data">{u.bedrooms}</td>
                            <td className="re-unit-data">{u.bathrooms}</td>
                            <td className="re-unit-rent">
                                ${u.rent.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export default function RealEstatePortfolioDemo() {
    const [filter, setFilter] = useState<'All' | 'Available' | 'Fully Occupied' | 'Under Maintenance'>('All');
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [], logicOperator: 'and' });
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>({});
    const [pinnedColumns, setPinnedColumns] = useState<any>({ left: ['propertyName'] });

    const filteredRows = useMemo(() => {
        if (filter === 'All') return mockProperties;
        return mockProperties.filter(p => p.status === filter);
    }, [filter]);

    const columns = useMemo<GridColDef<PropertyInfo>[]>(() => [
        { field: 'propertyName', headerName: 'Property', width: 280, renderCell: (p) => <PropertyCell row={p.row} /> },
        { field: 'location', headerName: 'Location', width: 160 },
        { field: 'status', headerName: 'Status', width: 180, renderCell: (p) => <StatusCell value={p.value} /> },
        { field: 'unitsOpen', headerName: 'Open Units', width: 120, type: 'number', align: 'right' },
        { field: 'totalUnits', headerName: 'Total Units', width: 120, type: 'number', align: 'right' },
        { field: 'value', headerName: 'Est. Value', width: 140, type: 'number', align: 'right', valueFormatter: p => `$${(p.value / 1000000).toFixed(1)}M` },
        { field: 'monthlyRevenue', headerName: 'Monthly Rev', width: 140, type: 'number', align: 'right', valueFormatter: p => `$${p.value.toLocaleString()}` },
        { field: 'rating', headerName: 'Score', width: 120, renderCell: (p) => <RatingCell value={p.value} /> },
    ], []);

    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
        monthlyRevenue: 'sum',
        value: 'sum',
        rating: 'avg',
    });

    return (
        <div className="re-portfolio-container">
            <h2>Real Estate Portfolio</h2>
            <p className="re-portfolio-description">Custom cell renderers, master-detail panel for property units, and dynamic filtering.</p>

            <div className="re-portfolio-grid-wrapper">
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    rowHeight={64}
                    headerHeight={56}
                    autoHeight
                    filterModel={filterModel}
                    onFilterModelChange={setFilterModel}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={setColumnVisibilityModel}
                    getDetailPanelContent={(params) => <DetailPanel row={params.row} />}
                    aggregationModel={aggregationModel}
                    onAggregationModelChange={setAggregationModel}
                    pinExpandColumn
                    pinnedColumns={pinnedColumns}
                    onPinnedColumnsChange={setPinnedColumns}
                    height={500}
                    slots={{
                        toolbar: (props) => (
                            <div className="re-toolbar-wrapper">
                                <GridToolbar {...props} style={{ borderRadius: '8px 8px 0 0' }}>
                                    <div className="re-filter-btns">
                                        {(['All', 'Available', 'Fully Occupied', 'Under Maintenance'] as const).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setFilter(opt)}
                                                className={`re-filter-btn ${filter === opt ? 'active' : ''}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </GridToolbar>
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
}
