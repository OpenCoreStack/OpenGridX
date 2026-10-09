// The "validated" brand of the AI toolkit. `validateGridAiState` (in the `/ai` entry point) puts it on
// its result and on the result's `state`; the grid's `aiAssistant` applies a state only when it carries
// it. Shared by both bundles, so it holds no AI code: just the registered symbol and two helpers.

/** `Symbol.for('opengridx.ai.validated')`: the same symbol in every bundle and realm. */
export const GRID_AI_VALIDATED_BRAND: symbol = Symbol.for('opengridx.ai.validated');

/** Brands `value` (non-enumerable, so it does not change equality, spreading or JSON) and returns it. */
export function brandGridAiValidated<T extends object>(value: T): T {
    Object.defineProperty(value, GRID_AI_VALIDATED_BRAND, { value: true, enumerable: false });
    return value;
}

/** Whether `value` carries the brand. */
export function isGridAiValidated(value: unknown): boolean {
    return typeof value === 'object' && value !== null && (value as Record<symbol, unknown>)[GRID_AI_VALIDATED_BRAND] === true;
}
