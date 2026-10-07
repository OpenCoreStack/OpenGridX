export type AttemptResult<T> = { ok: true; value: T } | { ok: false; error: unknown };

/**
 * Calls `fn` and contains a throw. Components and hooks use it instead of an inline `try` / `catch`
 * around expressions with `?.`, `??`, `||` or `? :`: React Compiler cannot compile a function that has
 * those inside a `try` statement yet and skips the whole component or hook.
 */
export function attempt<T>(fn: () => T): AttemptResult<T> {
    try {
        return { ok: true, value: fn() };
    } catch (error) {
        return { ok: false, error };
    }
}
