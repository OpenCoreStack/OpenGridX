
import { useState } from 'react';
import { DataGrid, GridColDef, GridLocaleText } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import sourceCode from './LocaleTextDemo.tsx?raw';
import './LocaleTextDemo.css';

interface Employee {
    id: number;
    name: string;
    department: string;
    salary: number;
    remote: boolean;
}

const allRows: Employee[] = [
    { id: 1,  name: 'Alice Johnson',  department: 'Engineering', salary: 95000, remote: true },
    { id: 2,  name: 'Bob Martinez',   department: 'Marketing',   salary: 72000, remote: false },
    { id: 3,  name: 'Carol White',    department: 'Engineering', salary: 110000, remote: true },
    { id: 4,  name: 'David Lee',      department: 'HR',          salary: 68000, remote: false },
    { id: 5,  name: 'Eva Chen',       department: 'Engineering', salary: 125000, remote: true },
    { id: 6,  name: 'Frank Garcia',   department: 'Marketing',   salary: 79000, remote: false },
    { id: 7,  name: 'Grace Kim',      department: 'Finance',     salary: 88000, remote: true },
    { id: 8,  name: 'Henry Brown',    department: 'Engineering', salary: 102000, remote: false },
    { id: 9,  name: 'Iris Wilson',    department: 'Finance',     salary: 91000, remote: true },
    { id: 10, name: 'James Taylor',   department: 'HR',          salary: 65000, remote: false },
];

const columns: GridColDef<Employee>[] = [
    { field: 'id',         headerName: 'ID',         width: 70,  type: 'number' },
    { field: 'name',       headerName: 'Name',        width: 180 },
    { field: 'department', headerName: 'Department',  width: 150 },
    { field: 'remote',     headerName: 'Remote',      width: 110, type: 'boolean' },
    {
        field: 'salary',
        headerName: 'Salary',
        width: 130,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (params) => `$${(params.value as number).toLocaleString()}`,
    },
];

type LocaleKey = 'English' | 'French' | 'Custom';

const localeMap: Record<LocaleKey, GridLocaleText | undefined> = {
    English: undefined,
    French: {
        paginationRowsPerPage: 'Lignes par page :',
        paginationOf:          (f, t, c) => `${f}–${t} sur ${c}`,
        paginationPage:        (p, pc) => `Page ${p} sur ${pc}`,
        noRowsLabel:           'Aucune donnée',
        // Header filter row (v3.6)
        headerFilterCustom:              'Filtre personnalisé',
        headerFilterCustomTooltip:       'Défini dans le panneau des filtres',
        headerFilterCellLabel:           (h) => `Filtrer ${h}`,
        headerFilterValueLabel:          (h) => `Valeur du filtre pour ${h}`,
        headerFilterOperatorButtonLabel: (h, op) => `Opérateur pour ${h} : ${op}`,
        headerFilterOperatorMenuLabel:   (h) => `Opérateurs pour ${h}`,
        headerFilterClearLabel:          (h) => `Effacer le filtre de ${h}`,
        headerFilterClearTooltip:        'Effacer',
        headerFilterAny:                 'Tous',
        headerFilterTrue:                'Oui',
        headerFilterFalse:               'Non',
        headerFilterOperators: {
            contains: 'Contient', equals: 'Égal à', startsWith: 'Commence par', endsWith: 'Se termine par',
            isEmpty: 'Est vide', isNotEmpty: "N'est pas vide", isAnyOf: "Est l'un de",
            '=': 'Égal à', '!=': 'Différent de', '>': 'Supérieur à', '>=': 'Supérieur ou égal à',
            '<': 'Inférieur à', '<=': 'Inférieur ou égal à', is: 'Est',
        },
    },
    Custom: {
        paginationRowsPerPage: 'Show:',
        paginationOf:          (f, t, c) => `Records ${f}–${t} of ${c}`,
        paginationPage:        (p, pc) => `${p}/${pc}`,
        noRowsLabel:           'Nothing to display',
    },
};

const BTN_BASE: React.CSSProperties = {
    padding: '6px 16px',
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: '0.875rem',
};

export default function LocaleTextDemo() {
    const [locale, setLocale]   = useState<LocaleKey>('English');
    const [rows,   setRows]     = useState<Employee[]>(allRows);
    const localeText = localeMap[locale];

    return (
        <DocsLayout
            title="Locale Text (i18n)"
            description="The localeText prop overrides the pagination strings and the header filter row's labels (operator names, Any/Yes/No, aria-labels). Switch locale below — labels update instantly without remounting the grid. Use 'Clear rows' to see the noRowsLabel override."
            sourceCode={sourceCode}
        >
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                {(['English', 'French', 'Custom'] as LocaleKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setLocale(key)}
                        style={{
                            ...BTN_BASE,
                            background:  locale === key ? '#6366f1' : '#fff',
                            color:       locale === key ? '#fff' : '#374151',
                            fontWeight:  locale === key ? 600 : 400,
                        }}
                    >
                        {key}
                    </button>
                ))}
                <span style={{ marginLeft: 8, color: '#6b7280', fontSize: '0.875rem' }}>
                    Active: <strong>{locale}</strong>
                </span>
                <button
                    onClick={() => setRows(rows.length === 0 ? allRows : [])}
                    style={{ ...BTN_BASE, marginLeft: 'auto', background: '#fff', color: '#374151' }}
                >
                    {rows.length === 0 ? 'Restore rows' : 'Clear rows'}
                </button>
            </div>

            <DataGrid
                rows={rows}
                columns={columns}
                pagination
                pageSizeOptions={[3, 5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 3, page: 0 } } }}
                headerFilters
                height={400}
                localeText={localeText}
            />
        </DocsLayout>
    );
}
