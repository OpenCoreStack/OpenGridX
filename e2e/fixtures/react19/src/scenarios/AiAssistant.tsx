import { useMemo, useState } from 'react';
import { DataGrid, GridToolbar, useGridApiRef } from '@opencorestack/opengridx';
import { createGridAgentTools, createGridAiPromptHandler, type GridAgentToolResult } from '@opencorestack/opengridx/ai';
import { invoiceColumns, makeInvoices, type Invoice } from '../data';

// A mock model: no network. It answers like a chat model, with text around a fenced JSON block.
async function callModel(request: { prompt: string }): Promise<string> {
  const prompt = request.prompt.toLowerCase();
  if (prompt.includes('north')) {
    return 'Showing the North, biggest first.\n```json\n{"filterModel":{"items":[{"field":"region","operator":"equals","value":"North"}]},"sortModel":[{"field":"amount","sort":"desc"}],"columnVisibilityModel":{"tax":"no"}}\n```';
  }
  return 'I can only change filters, sorting and columns.';
}

export default function AiAssistant() {
  const rows = useMemo<Invoice[]>(() => makeInvoices(2000), []);
  const apiRef = useGridApiRef<Invoice>();
  const onPrompt = useMemo(() => createGridAiPromptHandler({ columns: invoiceColumns, callModel, parts: ['filter', 'sort', 'columnVisibility'] }), []);
  const tools = useMemo(() => createGridAgentTools(apiRef, invoiceColumns), [apiRef]);
  const [toolResult, setToolResult] = useState<GridAgentToolResult | null>(null);

  const runTool = async () => {
    const setSort = tools.find((t) => t.name === 'set_sort');
    if (setSort) setToolResult(await setSort.execute({ sortModel: [{ field: 'amount', sort: 'asc' }] }));
  };

  return (
    <div className="page">
      <div className="bar">
        <span data-testid="ai-tools">{tools.map((t) => t.name).join(',')}</span>
        <button type="button" data-testid="ai-run-tool" onClick={() => { void runTool(); }}>Run set_sort</button>
        <span data-testid="ai-tool-result">{toolResult ? JSON.stringify(toolResult) : ''}</span>
      </div>
      <DataGrid
        rows={rows}
        columns={invoiceColumns}
        apiRef={apiRef}
        slots={{ toolbar: GridToolbar }}
        aiAssistant={{ onPrompt, suggestions: ['North, biggest first'] }}
        height={600}
      />
    </div>
  );
}
