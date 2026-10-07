import React from 'react';
import type { GridToolbarSlotProps as GridToolbarSlotComponentProps } from '../../types';

type ToolbarProps = GridToolbarSlotComponentProps & Record<string, unknown>;
type ToolbarRender = (props: ToolbarProps) => React.ReactNode;

interface GridToolbarSlotProps {
    component: React.ComponentType<ToolbarProps>;
    toolbarProps: ToolbarProps;
}

interface InlineToolbarProps {
    render: ToolbarRender;
    toolbarProps: ToolbarProps;
}

/** A plain function component: not a class, and not a memo / forwardRef / lazy object. */
function isPlainFunctionComponent(component: React.ComponentType<ToolbarProps>): component is ToolbarRender {
    if (typeof component !== 'function') return false;
    const proto: unknown = component.prototype;
    return !(typeof proto === 'object' && proto !== null && 'isReactComponent' in proto);
}

/**
 * Runs a plain function toolbar inside its own fiber. The caller keys this element on the
 * function's source, so the fiber (and every hook in it) survives when the consumer redefines
 * the same toolbar inline on each render, but remounts when a different toolbar is passed.
 *
 * `render` calls hooks, so it must run on every render. React Compiler would memoize the call
 * like any other and skip it when `render` and `toolbarProps` are unchanged, which breaks the
 * toolbar's hooks; `'use no memo'` keeps this wrapper out of the compiler.
 */
function InlineToolbar({ render, toolbarProps }: InlineToolbarProps) {
    'use no memo';
    return <>{render(toolbarProps)}</>;
}

/**
 * Renders `slots.toolbar`.
 *
 * Consumers often write the toolbar as an inline function inside their own component, which
 * gives it a new identity on every render. Rendering that as `<Toolbar />` would remount it on
 * every keystroke and lose GridToolbar's state (open panels, typed search). A plain function is
 * therefore called from a wrapper keyed on its source text: the same code keeps its state, and
 * a switch to a toolbar with different code (and different hooks) remounts cleanly.
 *
 * Class, `React.memo`, `forwardRef` and `lazy` components cannot be called as functions, so they
 * are rendered as ordinary elements.
 */
export function GridToolbarSlot({ component, toolbarProps }: GridToolbarSlotProps) {
    if (isPlainFunctionComponent(component)) {
        return <InlineToolbar key={`fn:${component.toString()}`} render={component} toolbarProps={toolbarProps} />;
    }
    const Toolbar = component;
    return <Toolbar {...toolbarProps} />;
}
