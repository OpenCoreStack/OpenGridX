import { useMemo, useState } from 'react';
import { Button, DataGrid, GridToolbar, useGridApiRef } from '@opencorestack/opengridx';
import { createGridAgentTools, createGridAiPromptHandler } from '@opencorestack/opengridx/ai';
import type { GridAgentToolResult, GridAiPromptResult } from '@opencorestack/opengridx/ai';
import { DocsLayout } from '../../components/DocsLayout';
import { callSimulatedModel } from './mockModel';
import { makeSales, SALES_COLUMNS, type Sale } from './salesData';
import './AiAssistantDemo.css';
import sourceCode from './AiAssistantDemo.tsx?raw';

const ROWS = makeSales(400);

const SUGGESTIONS = [
    'Paid orders in the North over $10k, biggest first',
    'Total revenue by region',
    'Average units per product',
    'Overdue or open orders, newest first',
    'Hide units',
    'Sort by profit margin',
    'Reset',
];

const INTEGRATION_SAMPLE = `import { createGridAiPromptHandler } from '@opencorestack/opengridx/ai';

// Your endpoint calls your model (OpenAI, Anthropic, Gemini, a local model…) with
// request.schema as the structured-output format, and returns the model's JSON.
const onPrompt = createGridAiPromptHandler({
  columns,
  parts: ['filter', 'sort', 'grouping', 'aggregation', 'columnVisibility'],
  callModel: async (request, { signal }) => {
    const res = await fetch('/api/grid-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request), // { prompt, schema, currentState, history }
      signal,
    });
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return res.json();
  },
});

<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}
  aiAssistant={{ onPrompt, suggestions: ['Top 10 by revenue', 'Group by region'] }}
/>`;

type Step =
    | { kind: 'user' | 'agent'; text: string }
    | { kind: 'tool'; name: string; input: Record<string, unknown> };

// A scripted agent run. In an app, the model picks these calls from the tool list.
const SCRIPT: Step[] = [
    { kind: 'user', text: 'Which regions have overdue orders over $5,000? Biggest totals first.' },
    { kind: 'tool', name: 'get_grid_state', input: {} },
    { kind: 'tool', name: 'set_filter', input: { filterModel: { items: [{ field: 'status', operator: 'is', value: 'Overdue' }, { field: 'amt_usd', operator: '>', value: 5000 }] } } },
    { kind: 'tool', name: 'set_grouping', input: { rowGroupingModel: ['region'] } },
    { kind: 'tool', name: 'set_aggregation', input: { aggregationModel: { amt_usd: 'sum' } } },
    { kind: 'tool', name: 'set_sort', input: { sortModel: [{ field: 'margin', sort: 'desc' }] } },
    { kind: 'agent', text: 'There is no "margin" column. Sorting by revenue instead.' },
    { kind: 'tool', name: 'set_sort', input: { sortModel: [{ field: 'amt_usd', sort: 'desc' }] } },
    { kind: 'agent', text: 'Overdue orders over $5,000 are grouped by region with their total revenue, biggest first.' },
];

function AssistantTab() {
    const onPrompt = useMemo(() => createGridAiPromptHandler({
        columns: SALES_COLUMNS,
        callModel: callSimulatedModel,
        parts: ['filter', 'sort', 'grouping', 'aggregation', 'columnVisibility'],
    }), []);
    const [log, setLog] = useState<string[]>([]);
    const onApply = (result: GridAiPromptResult) => {
        setLog((l) => [`Applied ${JSON.stringify(result.state)}`, ...l].slice(0, 5));
    };

    return (
        <>
            <p className="ai-assistant-demo__hint">
                Press <strong>Ask AI</strong> in the toolbar and type a request, or pick a suggestion. Every change shows as a
                chip you can remove; <strong>Undo</strong> puts the view back.
            </p>
            <DataGrid
                rows={ROWS}
                columns={SALES_COLUMNS}
                slots={{ toolbar: GridToolbar }}
                aiAssistant={{ onPrompt, suggestions: SUGGESTIONS }}
                onAiAssistantApply={onApply}
                groupingColDef={{ headerName: 'Group', width: 180 }}
                height={520}
            />
            {log.length > 0 && (
                <div className="ai-assistant-demo__log" aria-label="onAiAssistantApply log">
                    <strong>onAiAssistantApply</strong>
                    <ul>{log.map((entry, i) => <li key={i}><code>{entry}</code></li>)}</ul>
                </div>
            )}
            <h3>Integration</h3>
            <p>
                The grid never calls a model. <code>createGridAiPromptHandler</code> sends{' '}
                <code>{'{ prompt, schema, currentState, history }'}</code> to your endpoint and validates the reply; only a
                validated reply is applied. No vendor SDK is involved.
            </p>
            <pre className="ai-assistant-demo__code">{INTEGRATION_SAMPLE}</pre>
        </>
    );
}

// allowRowAccess is off: get_row_summary, the one tool that sends row values, is not offered.
const TOOL_NAMES = createGridAgentTools({ current: null }, SALES_COLUMNS).map((t) => t.name);

/** Long tool results (get_grid_state lists every column) are cut for the transcript. */
const shorten = (text: string) => (text.length > 220 ? `${text.slice(0, 220)}…` : text);

interface TranscriptEntry {
    step: Step;
    result?: GridAgentToolResult;
}

function AgentTab() {
    const apiRef = useGridApiRef<Sale>();
    const [entries, setEntries] = useState<TranscriptEntry[]>([]);
    const [running, setRunning] = useState(false);
    const done = entries.length >= SCRIPT.length;

    const runStep = async (index: number): Promise<TranscriptEntry> => {
        const step = SCRIPT[index];
        if (step.kind !== 'tool') return { step };
        // The tools read apiRef.current only when they run, so they can be created at any time.
        const tool = createGridAgentTools(apiRef, SALES_COLUMNS).find((t) => t.name === step.name);
        return { step, result: tool ? await tool.execute(step.input) : { ok: false, errors: [{ path: '', message: 'No such tool' }] } };
    };

    const next = async () => {
        if (done || running) return;
        setRunning(true);
        const entry = await runStep(entries.length);
        setEntries((list) => [...list, entry]);
        setRunning(false);
    };

    const runAll = async () => {
        if (running) return;
        setRunning(true);
        const all = [...entries];
        for (let i = entries.length; i < SCRIPT.length; i++) {
            all.push(await runStep(i));
            setEntries([...all]);
        }
        setRunning(false);
    };

    const reset = () => {
        setEntries([]);
        apiRef.current.setFilterModel({ items: [] });
        apiRef.current.setSortModel([]);
        apiRef.current.setRowGroupingModel([]);
        apiRef.current.setAggregationModel({});
    };

    return (
        <>
            <p className="ai-assistant-demo__hint">
                <code>createGridAgentTools(apiRef, columns)</code> returns plain tools (<code>name</code>, <code>description</code>,{' '}
                <code>inputSchema</code>, <code>execute</code>) for the Vercel AI SDK, CopilotKit, OpenAI or Anthropic tool calling,
                or WebMCP. Tools here: {TOOL_NAMES.map((name) => <code key={name} className="ai-assistant-demo__tool">{name}</code>)}
            </p>
            <div className="ai-assistant-demo__actions">
                <Button variant="contained" color="primary" size="small" onClick={() => { void next(); }} disabled={done || running}>Next step</Button>
                <Button variant="outlined" size="small" onClick={() => { void runAll(); }} disabled={done || running}>Run all</Button>
                <Button variant="text" size="small" onClick={reset}>Reset</Button>
            </div>
            <div className="ai-assistant-demo__agent">
                <ol className="ai-assistant-demo__transcript" aria-label="Agent transcript">
                    {entries.length === 0 && <li className="ai-assistant-demo__empty">Press Next step to start the scripted agent.</li>}
                    {entries.map(({ step, result }, i) => (
                        <li key={i} className={`ai-assistant-demo__entry ai-assistant-demo__entry--${step.kind}`}>
                            {step.kind === 'tool' ? (
                                <>
                                    <div><span className="ai-assistant-demo__who">tool call</span> <code>{step.name}({JSON.stringify(step.input)})</code></div>
                                    <div className={result?.ok ? 'ai-assistant-demo__ok' : 'ai-assistant-demo__fail'}>
                                        <span className="ai-assistant-demo__who">result</span> <code>{shorten(JSON.stringify(result))}</code>
                                    </div>
                                </>
                            ) : (
                                <div><span className="ai-assistant-demo__who">{step.kind}</span> {step.text}</div>
                            )}
                        </li>
                    ))}
                </ol>
                <DataGrid
                    rows={ROWS}
                    columns={SALES_COLUMNS}
                    apiRef={apiRef}
                    groupingColDef={{ headerName: 'Group', width: 160 }}
                    height={460}
                />
            </div>
        </>
    );
}

export default function AiAssistantDemo() {
    const [tab, setTab] = useState<'assistant' | 'agent'>('assistant');
    return (
        <DocsLayout
            title="AI Assistant"
            description="Users describe the view they want in plain language; the grid applies the validated reply as chips with one-click Undo. Agents drive the same grid through plain tool objects. This page uses a simulated model: no API key, no network."
            sourceCode={sourceCode}
        >
            <div className="ai-assistant-demo__banner" role="note">
                <strong>Simulated model — no API key, no network.</strong> A small rule-based function in this demo
                (<code>mockModel.ts</code>) answers about a dozen phrasings. Your app plugs in its own model call.
            </div>
            <div className="ai-assistant-demo__tabs" role="tablist" aria-label="Demo">
                <button type="button" role="tab" id="ai-tab-assistant" aria-controls="ai-panel-assistant" aria-selected={tab === 'assistant'} onClick={() => setTab('assistant')}>
                    Ask AI panel
                </button>
                <button type="button" role="tab" id="ai-tab-agent" aria-controls="ai-panel-agent" aria-selected={tab === 'agent'} onClick={() => setTab('agent')}>
                    Agent tools
                </button>
            </div>
            <div role="tabpanel" id={`ai-panel-${tab}`} aria-labelledby={`ai-tab-${tab}`}>
                {tab === 'assistant' ? <AssistantTab /> : <AgentTab />}
            </div>
        </DocsLayout>
    );
}
