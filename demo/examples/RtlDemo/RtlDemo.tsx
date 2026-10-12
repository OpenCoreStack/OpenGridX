import { useState } from 'react';
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import './RtlDemo.css';
import sourceCode from './RtlDemo.tsx?raw';

interface Employee {
    id: number;
    name: string;
    city: string;
    department: string;
    salary: number;
    remote: boolean;
}

type Language = 'ar' | 'he';

// Sample data in Arabic and Hebrew; numbers stay Western digits (formatted per locale below).
const SAMPLE: Record<Language, { names: string[]; cities: string[]; departments: string[] }> = {
    ar: {
        names: ['أحمد علي', 'فاطمة حسن', 'محمد سعيد', 'ليلى خالد', 'يوسف إبراهيم', 'مريم عمر', 'خالد ناصر', 'سارة يوسف'],
        cities: ['القاهرة', 'دبي', 'الرياض', 'عمّان', 'الدار البيضاء', 'بيروت'],
        departments: ['الهندسة', 'المبيعات', 'المالية', 'الموارد البشرية'],
    },
    he: {
        names: ['דוד כהן', 'שרה לוי', 'יוסף מזרחי', 'רחל פרץ', 'משה ביטון', 'נועה אברהם', 'אורי פרידמן', 'מיכל דהן'],
        cities: ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'אילת', 'נתניה'],
        departments: ['הנדסה', 'מכירות', 'כספים', 'משאבי אנוש'],
    },
};

const HEADERS: Record<Language, Record<keyof Omit<Employee, 'id'>, string>> = {
    ar: { name: 'الاسم', city: 'المدينة', department: 'القسم', salary: 'الراتب', remote: 'عن بُعد' },
    he: { name: 'שם', city: 'עיר', department: 'מחלקה', salary: 'שכר', remote: 'מרחוק' },
};

function makeRows(language: Language): Employee[] {
    const { names, cities, departments } = SAMPLE[language];
    return Array.from({ length: 200 }, (_, i) => ({
        id: i + 1,
        name: names[i % names.length],
        city: cities[(i * 7) % cities.length],
        department: departments[(i * 3) % departments.length],
        salary: 4000 + ((i * 937) % 9000),
        remote: i % 3 === 0,
    }));
}

function makeColumns(language: Language): GridColDef<Employee>[] {
    const h = HEADERS[language];
    const money = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'he-IL', { maximumFractionDigits: 0 });
    return [
        { field: 'id', headerName: '#', type: 'number', width: 80 },
        { field: 'name', headerName: h.name, width: 180, editable: true },
        { field: 'city', headerName: h.city, width: 160, editable: true },
        { field: 'department', headerName: h.department, width: 170, editable: true },
        { field: 'salary', headerName: h.salary, type: 'number', width: 140, editable: true,
          valueFormatter: ({ value }) => (typeof value === 'number' ? money.format(value) : '') },
        { field: 'remote', headerName: h.remote, type: 'boolean', width: 120 },
    ];
}

export default function RtlDemo() {
    const [rtl, setRtl] = useState(true);
    const [language, setLanguage] = useState<Language>('ar');
    const [pinned, setPinned] = useState(true);
    const rows = makeRows(language);
    const columns = makeColumns(language);

    return (
        <DocsLayout
            title="Right-to-Left"
            description="Put the grid inside dir=&quot;rtl&quot; (or set document.dir): columns run from the right, ArrowLeft moves to the next column, resize handles and the fill handle sit on the left edge, and toolbar panels open towards the grid. pinnedColumns.left sticks to the inline start (the right edge) and pinnedColumns.right to the end (the left edge); pagination arrows and tree chevrons are mirrored. See the RTL guide."
            sourceCode={sourceCode}
        >
            <div className="rtl-demo-controls">
                <label className="rtl-demo-control">
                    <input type="checkbox" checked={rtl} onChange={(e) => setRtl(e.target.checked)} />
                    <code>dir="rtl"</code>
                </label>
                <label className="rtl-demo-control">
                    <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                    Pinned columns
                </label>
                <label className="rtl-demo-control">
                    <input type="radio" name="rtl-demo-language" checked={language === 'ar'} onChange={() => setLanguage('ar')} />
                    العربية
                </label>
                <label className="rtl-demo-control">
                    <input type="radio" name="rtl-demo-language" checked={language === 'he'} onChange={() => setLanguage('he')} />
                    עברית
                </label>
            </div>

            <div dir={rtl ? 'rtl' : 'ltr'} lang={language} className="rtl-demo-grid">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height={480}
                    checkboxSelection
                    cellSelection
                    headerFilters
                    pinCheckboxColumn={pinned}
                    pinnedColumns={pinned ? { left: ['id', 'name'], right: ['remote'] } : undefined}
                    slots={{ toolbar: GridToolbar }}
                />
            </div>
        </DocsLayout>
    );
}
