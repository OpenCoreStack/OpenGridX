// A simulated model for the demo: a few rules that turn about a dozen phrasings into grid state.
// No API key, no network. A real app calls its own model instead (see the integration sample).
import type { GridAiModelRequest } from '@opencorestack/opengridx/ai';
import { CUSTOMERS, PRODUCTS, REGIONS, STATUSES } from './salesData';

type Json = Record<string, unknown>;

const FIELD_WORDS: [RegExp, string][] = [
    [/\bregions?\b/, 'region'],
    [/\bcustomers?\b/, 'customer'],
    [/\bproducts?\b/, 'product'],
    [/\bstatus\b/, 'status'],
    [/\b(?:revenue|amount|sales)\b/, 'amt_usd'],
    [/\bunits?\b/, 'units'],
    [/\b(?:date|newest|oldest|latest|recent)\b/, 'orderDate'],
    [/\bpriority\b/, 'priority'],
];

function fieldIn(text: string): string | null {
    for (const [re, field] of FIELD_WORDS) if (re.test(text)) return field;
    return null;
}

function amountThreshold(text: string): { operator: string; value: number } | null {
    const match = /\b(over|above|more than|greater than|at least|under|below|less than)\s+\$?([\d,.]+)(k?)/.exec(text);
    if (!match) return null;
    const base = Number(match[2].replace(/,/g, ''));
    if (!Number.isFinite(base)) return null;
    const value = match[3] === 'k' ? base * 1000 : base;
    const operator = ['under', 'below', 'less than'].includes(match[1]) ? '<' : match[1] === 'at least' ? '>=' : '>';
    return { operator, value };
}

/** The rules. Several can match one prompt ("paid orders in the north over $10k, biggest first"). */
export function simulateModel(prompt: string): Json | string {
    const text = prompt.toLowerCase();
    const reply: Json = {};
    const said: string[] = [];

    if (/\b(?:reset|clear|start over)\b/.test(text)) {
        return { message: 'Cleared filters, sorting, grouping and summaries.', filterModel: { items: [] }, sortModel: [], rowGroupingModel: [], aggregationModel: {} };
    }
    if (/\bprofit\b|\bmargin\b/.test(text)) {
        // A field the table does not have: the validator drops it and the panel says so.
        return { message: 'Sorting by profit margin.', sortModel: [{ field: 'profit_margin', sort: 'desc' }] };
    }

    const items: Json[] = [];
    const statuses = STATUSES.filter((s) => text.includes(s.toLowerCase()));
    if (statuses.length === 1) items.push({ field: 'status', operator: 'is', value: statuses[0] });
    else if (statuses.length > 1) items.push({ field: 'status', operator: 'isAnyOf', value: statuses });
    const regions = REGIONS.filter((r) => new RegExp(`\\b${r.toLowerCase()}\\b`).test(text));
    if (regions.length === 1) items.push({ field: 'region', operator: 'equals', value: regions[0] });
    else if (regions.length > 1) items.push({ logicOperator: 'or', items: regions.map((r) => ({ field: 'region', operator: 'equals', value: r })) });
    const threshold = amountThreshold(text);
    if (threshold) items.push({ field: 'amt_usd', ...threshold });
    if (/\bpriority (?:orders|only)\b|\burgent\b/.test(text)) items.push({ field: 'priority', operator: 'is', value: true });
    const customer = CUSTOMERS.find((c) => text.includes(c.toLowerCase().split(' ')[0]));
    if (customer && !/\bby customer\b/.test(text)) items.push({ field: 'customer', operator: 'contains', value: customer.split(' ')[0] });
    if (items.length > 0) {
        reply.filterModel = { logicOperator: 'and', items };
        said.push(`${items.length} ${items.length === 1 ? 'filter' : 'filters'}`);
    }

    const top = /\btop\s+(\d+)/.exec(text);
    if (/\b(?:biggest|largest|highest|top)\b/.test(text)) reply.sortModel = [{ field: 'amt_usd', sort: 'desc' }];
    else if (/\b(?:smallest|lowest)\b/.test(text)) reply.sortModel = [{ field: 'amt_usd', sort: 'asc' }];
    else if (/\b(?:newest|latest|most recent)\b/.test(text)) reply.sortModel = [{ field: 'orderDate', sort: 'desc' }];
    else if (/\boldest\b/.test(text)) reply.sortModel = [{ field: 'orderDate', sort: 'asc' }];
    else {
        const sortBy = /\bsort(?:ed)? by ([a-z ]+)/.exec(text);
        const field = sortBy ? fieldIn(sortBy[1]) : null;
        if (field) reply.sortModel = [{ field, sort: /\b(?:desc|descending)\b/.test(text) ? 'desc' : 'asc' }];
    }
    if (reply.sortModel) said.push('sorted');

    // "sort by X" is a sort, not a grouping.
    const groupBy = /\bsort/.test(text) ? null : /\b(?:group(?:ed)? by|by|per|for each)\s+([a-z]+)/.exec(text);
    const groupField = groupBy ? fieldIn(groupBy[1]) : null;
    if (groupField && groupField !== 'amt_usd' && groupField !== 'units' && groupField !== 'orderDate') {
        reply.rowGroupingModel = [groupField];
        said.push(`grouped by ${groupField}`);
    }

    if (/\b(?:total|sum)\b/.test(text)) reply.aggregationModel = { amt_usd: 'sum', units: 'sum' };
    else if (/\baverage\b|\bavg\b/.test(text)) reply.aggregationModel = { [/\bunits?\b/.test(text) ? 'units' : 'amt_usd']: 'avg' };
    else if (/\bcount\b|\bhow many\b/.test(text)) reply.aggregationModel = { orderNo: 'count' };
    if (reply.aggregationModel) said.push('summarised');

    const hide = /\bhide ([a-z ]+)/.exec(text);
    if (hide) {
        const field = fieldIn(hide[1]);
        if (field) reply.columnVisibilityModel = { [field]: false };
    }
    if (/\bshow all columns\b/.test(text)) {
        reply.columnVisibilityModel = Object.fromEntries(['orderNo', 'orderDate', 'customer', 'region', 'product', 'amt_usd', 'units', 'status'].map((f) => [f, true]));
    }
    if (reply.columnVisibilityModel) said.push('changed the columns');

    if (PRODUCTS.some((p) => text.includes(p.toLowerCase())) && !items.some((i) => i.field === 'product')) {
        const product = PRODUCTS.find((p) => text.includes(p.toLowerCase()));
        reply.filterModel = { logicOperator: 'and', items: [...items, { field: 'product', operator: 'equals', value: product }] };
    }

    if (Object.keys(reply).length === 0) {
        return 'I can filter, sort, group, summarise and hide columns. Try "paid orders in the North over $10k" or "total revenue by region".';
    }
    const note = top ? ` The top ${top[1]} are at the top.` : '';
    return { message: `Done: ${said.join(', ') || 'updated the view'}.${note}`, ...reply };
}

/** `callModel` for `createGridAiPromptHandler`: answers after a short delay and honours the signal. */
export function callSimulatedModel(request: GridAiModelRequest, { signal }: { signal: AbortSignal }): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const timer = window.setTimeout(() => resolve(simulateModel(request.prompt)), 600);
        signal.addEventListener('abort', () => {
            window.clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
    });
}
