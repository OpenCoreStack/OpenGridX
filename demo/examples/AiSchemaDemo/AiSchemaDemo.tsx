import { useMemo, useState } from 'react';
import { Button, DataGrid } from '@opencorestack/opengridx';
import type { GridAggregationModel, GridColDef, GridFilterModel, GridSortItem } from '@opencorestack/opengridx';
import { getGridAiSchema, validateGridAiState } from '@opencorestack/opengridx/ai';
import { DocsLayout } from '../../components/DocsLayout';
import './AiSchemaDemo.css';
import sourceCode from './AiSchemaDemo.tsx?raw';

interface Sale {
    id: number;
    orderNo: string;
    orderDate: string;
    customer: string;
    region: string;
    product: string;
    amt_usd: number;
    units: number;
    status: 'Open' | 'Paid' | 'Overdue';
    priority: boolean;
}

const REGIONS = ['North', 'South', 'East', 'West'];
const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark Industries'];
const PRODUCTS = ['Laptop', 'Monitor', 'Dock', 'Keyboard', 'Headset'];
const STATUSES: Sale['status'][] = ['Open', 'Paid', 'Overdue'];

/** Deterministic rows, so every visit shows the same data. */
function makeSales(count: number): Sale[] {
    let seed = 7;
    const next = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
    return Array.from({ length: count }, (_, i) => {
        const units = 1 + Math.floor(next() * 40);
        const day = new Date(2026, 0, 1 + Math.floor(next() * 270));
        return {
            id: i + 1,
            orderNo: `SO-${String(10_000 + i)}`,
            orderDate: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`,
            customer: CUSTOMERS[Math.floor(next() * CUSTOMERS.length)],
            region: REGIONS[Math.floor(next() * REGIONS.length)],
            product: PRODUCTS[Math.floor(next() * PRODUCTS.length)],
            amt_usd: Math.round(units * (80 + next() * 900)),
            units,
            status: STATUSES[Math.floor(next() * STATUSES.length)],
            priority: next() > 0.7,
        };
    });
}

const ROWS = makeSales(300);

const usd = (value: unknown) => (typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : '');

// headerName and description go into the schema, so the model can map "revenue" to amt_usd.
// aiExamples is sent to the model as well: only list values you are happy to share.
const COLUMNS: GridColDef<Sale>[] = [
    { field: 'orderNo', headerName: 'Order', width: 110, groupable: false },
    { field: 'orderDate', headerName: 'Order date', type: 'date', width: 120 },
    { field: 'customer', headerName: 'Customer', width: 160, aiExamples: ['Acme Corp', 'Globex'] },
    { field: 'region', headerName: 'Region', width: 100, aiExamples: REGIONS },
    { field: 'product', headerName: 'Product', width: 120 },
    { field: 'amt_usd', headerName: 'Revenue', description: 'Order revenue in US dollars', type: 'number', width: 130, valueFormatter: ({ value }) => usd(value) },
    { field: 'units', headerName: 'Units', type: 'number', width: 90, availableAggregationFunctions: ['sum', 'avg', 'max'] },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: STATUSES, width: 110 },
    { field: 'priority', headerName: 'Priority', type: 'boolean', width: 90, hideable: false },
];

const EXAMPLES: { label: string; prompt: string; output: unknown }[] = [
    {
        label: 'Correct request',
        prompt: 'Paid orders over $10,000 in the North or East, biggest first, grouped by region with total revenue',
        output: {
            schemaVersion: 1,
            filterModel: {
                logicOperator: 'and',
                items: [
                    { field: 'status', operator: 'is', value: 'Paid' },
                    { field: 'amt_usd', operator: '>', value: 10000 },
                    { logicOperator: 'or', items: [
                        { field: 'region', operator: 'equals', value: 'North' },
                        { field: 'region', operator: 'equals', value: 'East' },
                    ] },
                ],
            },
            sortModel: [{ field: 'amt_usd', sort: 'desc' }],
            rowGroupingModel: ['region'],
            aggregationModel: { amt_usd: 'sum', units: 'sum' },
        },
    },
    {
        label: 'Made-up field',
        prompt: 'Sort by profit margin',
        output: {
            sortModel: [{ field: 'profit_margin', sort: 'desc' }, { field: 'amt_usd', sort: 'desc' }],
            filterModel: { items: [{ field: 'salesRep', operator: 'equals', value: 'Dana' }] },
        },
    },
    {
        label: 'Wrong operator',
        prompt: 'Revenue containing 500, orders after June',
        output: {
            filterModel: {
                items: [
                    { field: 'amt_usd', operator: 'contains', value: '500' },
                    { field: 'orderDate', operator: 'after', value: '2026-06-30' },
                ],
            },
            aggregationModel: { units: 'median' },
        },
    },
    {
        label: 'Strings to coerce',
        prompt: 'At least 1,200 dollars, priority only, status overdue or open',
        output: {
            filterModel: {
                items: [
                    { field: 'amt_usd', operator: '>=', value: '$1,200' },
                    { field: 'priority', operator: 'is', value: 'yes' },
                    { field: 'status', operator: 'isAnyOf', value: ['overdue', 'OPEN'] },
                ],
            },
            sortModel: [{ field: 'orderDate', sort: 'ASC' }],
        },
    },
];

const INTEGRATION_SAMPLE = `import { getGridAiSchema, validateGridAiState } from '@opencorestack/opengridx/ai';

const schema = getGridAiSchema(columns, { include: ['filter', 'sort', 'grouping', 'aggregation'] });

async function ask(prompt: string) {
  // Your own endpoint calls your own model with structured output (schema as the response format).
  const res = await fetch('/api/grid-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, schema, currentState: { filterModel, sortModel } }),
  });
  const { state, errors } = validateGridAiState(await res.text(), columns);
  if (errors.length) console.info('Dropped from the reply:', errors);
  if (state.filterModel) setFilterModel(state.filterModel);
  if (state.sortModel) setSortModel(state.sortModel);
}`;

export default function AiSchemaDemo() {
    const schema = useMemo(() => getGridAiSchema(COLUMNS), []);
    const schemaText = useMemo(() => JSON.stringify(schema, null, 2), [schema]);
    const [exampleIndex, setExampleIndex] = useState(0);
    const [text, setText] = useState(() => JSON.stringify(EXAMPLES[0].output, null, 2));
    const result = useMemo(() => validateGridAiState(text, COLUMNS), [text]);

    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = useState<GridSortItem[]>([]);
    const [grouping, setGrouping] = useState<string[]>([]);
    const [aggregation, setAggregation] = useState<GridAggregationModel>({});

    const pickExample = (index: number) => {
        setExampleIndex(index);
        setText(JSON.stringify(EXAMPLES[index].output, null, 2));
    };

    // Only the parts the reply contains are applied; the rest of the grid state is kept.
    const apply = () => {
        const { state } = result;
        if (state.filterModel) setFilterModel(state.filterModel);
        if (state.sortModel) setSortModel(state.sortModel);
        if (state.rowGroupingModel) setGrouping(state.rowGroupingModel);
        if (state.aggregationModel) setAggregation(state.aggregationModel);
    };

    const reset = () => {
        setFilterModel({ items: [] });
        setSortModel([]);
        setGrouping([]);
        setAggregation({});
    };

    return (
        <DocsLayout
            title="AI: Grid Schema & Validator"
            description="The @opencorestack/opengridx/ai entry point turns your column definitions into a JSON Schema for a language model, and checks the model's reply before the grid applies it. No AI service is called on this page, and none is bundled: your app sends { prompt, schema, currentState } to its own model."
            sourceCode={sourceCode}
        >
            <div className="ai-demo-note">
                The schema below is built from the column definitions only: field names, header names, descriptions, types,
                operators and allowed functions. No row data is read. The only values from your data that leave the app are
                the ones you list in <code>aiExamples</code> (here: a few customers and the regions).
            </div>

            <details className="ai-demo-schema">
                <summary>
                    Generated schema (<code>schemaVersion {schema.schemaVersion}</code>, {schemaText.length.toLocaleString('en-US')} characters)
                </summary>
                <pre>{schemaText}</pre>
            </details>

            <div className="ai-demo-panels">
                <section className="ai-demo-panel" aria-labelledby="ai-demo-output-title">
                    <h3 id="ai-demo-output-title">Model output</h3>
                    <div className="ai-demo-examples" role="group" aria-label="Example replies">
                        {EXAMPLES.map((example, i) => (
                            <Button
                                key={example.label}
                                size="small"
                                variant={i === exampleIndex ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => pickExample(i)}
                            >
                                {example.label}
                            </Button>
                        ))}
                    </div>
                    <p className="ai-demo-prompt">Prompt: <em>{EXAMPLES[exampleIndex].prompt}</em></p>
                    <textarea
                        className="ai-demo-textarea"
                        aria-label="Model output (JSON)"
                        spellCheck={false}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </section>

                <section className="ai-demo-panel" aria-labelledby="ai-demo-result-title">
                    <h3 id="ai-demo-result-title">validateGridAiState</h3>
                    <h4>Errors ({result.errors.length})</h4>
                    {result.errors.length === 0 ? (
                        <p className="ai-demo-ok">Nothing dropped.</p>
                    ) : (
                        <ul className="ai-demo-errors">
                            {result.errors.map((error, i) => (
                                <li key={`${error.path}-${i}`}><code>{error.path || '(root)'}</code> {error.message}</li>
                            ))}
                        </ul>
                    )}
                    <h4>Validated state</h4>
                    <pre className="ai-demo-state">{JSON.stringify(result.state, null, 2)}</pre>
                    <div className="ai-demo-actions">
                        <Button variant="contained" color="primary" onClick={apply} disabled={Object.keys(result.state).length === 0}>
                            Apply to grid
                        </Button>
                        <Button variant="outlined" onClick={reset}>Reset grid</Button>
                    </div>
                </section>
            </div>

            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                filterModel={filterModel}
                onFilterModelChange={setFilterModel}
                sortModel={sortModel}
                onSortModelChange={setSortModel}
                rowGroupingModel={grouping}
                groupingColDef={{ headerName: 'Group', width: 180 }}
                aggregationModel={aggregation}
                onAggregationModelChange={setAggregation}
                height={460}
            />

            <div className="ai-demo-usage">
                <strong>Integration:</strong> the app owns the model call. Send the prompt, the schema and the current state
                to your own endpoint, then validate the reply before applying it.
                <pre>{INTEGRATION_SAMPLE}</pre>
            </div>
        </DocsLayout>
    );
}
