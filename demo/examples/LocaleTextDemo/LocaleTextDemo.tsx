
import { useState } from 'react';
import { DataGrid, GridColDef, GridLocaleText, GridToolbar } from '@opencorestack/opengridx';
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
        // Every other UI string (v3.9): toolbar, column menu, filter and columns panels, rows, pagination buttons
        gridLabel:                    'Grille de données',
        toolbarLabel:                 'Barre d’outils de la grille',
        toolbarSearchPlaceholder:     'Rechercher…',
        toolbarSearchLabel:           'Recherche globale',
        toolbarSearchClear:           'Effacer la recherche',
        toolbarColumns:               'Colonnes',
        toolbarColumnsLabel:          'Gérer les colonnes',
        toolbarColumnsPanelLabel:     'Visibilité des colonnes',
        toolbarFilters:               'Filtres',
        toolbarFiltersLabel:          'Filtres avancés',
        toolbarFiltersActive:         'Filtres actifs',
        toolbarFiltersClearAll:       'Tout effacer',
        toolbarFiltersClearAllTooltip: 'Effacer tous les filtres',
        toolbarFiltersClose:          'Fermer',
        toolbarFiltersCloseTooltip:   'Fermer les filtres',
        toolbarFiltersCloseLabel:     'Fermer le panneau des filtres',
        columnMenuLabel:              (h) => `Options de la colonne ${h}`,
        columnMenuSortAscending:      'Tri croissant',
        columnMenuSortDescending:     'Tri décroissant',
        columnMenuUnsort:             'Annuler le tri',
        columnMenuPinColumn:          'Épingler la colonne',
        columnMenuPinLeft:            'Épingler à gauche',
        columnMenuPinLeftLabel:       'Épingler à gauche',
        columnMenuPinRight:           'Épingler à droite',
        columnMenuPinRightLabel:      'Épingler à droite',
        columnMenuUnpin:              'Désépingler',
        columnMenuUnpinLabel:         'Désépingler la colonne',
        columnMenuHideColumn:         'Masquer la colonne',
        columnMenuHideColumnLabel:    (h) => `Masquer la colonne ${h}`,
        columnMenuManageColumns:      'Gérer les colonnes',
        columnMenuManageColumnsLabel: 'Gérer toutes les colonnes',
        headerColumnMenuButtonLabel:  (h) => `Ouvrir le menu de la colonne ${h}`,
        headerSelectAllLabel:         'Tout sélectionner',
        headerDeselectAllLabel:       'Tout désélectionner',
        columnsPanelSearchPlaceholder: 'Rechercher',
        columnsPanelDragToReorder:    'Glisser pour réordonner',
        columnsPanelShowHideAll:      'Tout afficher / masquer',
        columnsPanelReset:            'Réinitialiser',
        filterPanelValueLabel:        (h) => `Valeur du filtre pour ${h}`,
        filterPanelOperatorLabel:     (h) => `Opérateur pour ${h}`,
        filterPanelClearLabel:        (h) => `Effacer le filtre de ${h}`,
        filterPanelClearTooltip:      'Effacer',
        filterPanelAny:               'Tous',
        filterPanelTrue:              'vrai',
        filterPanelFalse:             'faux',
        filterPanelNumberPlaceholder: 'Nombre…',
        filterPanelValuePlaceholder:  'Valeur…',
        filterPanelMatch:             'Correspondance :',
        filterPanelAnd:               'TOUS (ET)',
        filterPanelOr:                'UN (OU)',
        filterPanelNoColumns:         'Aucune colonne filtrable.',
        filterPanelOperators: {
            contains: 'contient', equals: 'égal à', startsWith: 'commence par', endsWith: 'se termine par',
            isEmpty: 'est vide', isNotEmpty: "n'est pas vide", isAnyOf: "est l'un de", is: 'est', not: "n'est pas",
        },
        rowSelectLabel:               (id) => `Sélectionner la ligne ${id}`,
        rowDeselectLabel:             (id) => `Désélectionner la ligne ${id}`,
        paginationLabel:              'Pagination',
        paginationFirstPageLabel:     'Aller à la première page',
        paginationFirstPageTooltip:   'Première page',
        paginationPreviousPageLabel:  'Aller à la page précédente',
        paginationPreviousPageTooltip: 'Page précédente',
        paginationNextPageLabel:      'Aller à la page suivante',
        paginationNextPageTooltip:    'Page suivante',
        paginationLastPageLabel:      'Aller à la dernière page',
        paginationLastPageTooltip:    'Dernière page',
        liveRegionRowsFound:          (n) => `${n} ${n === 1 ? 'ligne trouvée' : 'lignes trouvées'}`,
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
            description="The localeText prop overrides every built-in UI string: pagination, the header filter row and, since v3.9, the toolbar, column menu, filter and columns panels, pivot and AI panels, row checkboxes and aria-labels. Switch locale below — labels update instantly without remounting the grid. Open the toolbar's filters or a column menu to see the French strings; use 'Clear rows' to see the noRowsLabel override."
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
                checkboxSelection
                slots={{ toolbar: GridToolbar }}
                height={400}
                localeText={localeText}
            />
        </DocsLayout>
    );
}
