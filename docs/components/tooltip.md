# `<GridTooltip />`

The `GridTooltip` component provides a lightweight, accessible tooltip for any HTML or React element. It is commonly used within columns, actions, or toolbars to display extra information when a user hovers over or focuses a component.

## 📑 Overview
- **Portal Rendering**: Tooltips are portalled into the closest `DataGridThemeProvider` (`.ogx-theme-provider`), so they use the theme's overlay colours like the grid's menus and panels, or into `document.body` outside a provider. They are `position: fixed` and follow the target when the page or a container scrolls.
- **Dynamic Calculation**: Tooltips calculate their placement relative to the target element when they open.
- **Support for React Elements**: It wraps its child element to attach event listeners and calculate position.
- **Customizable Delays**: Support for `enterDelay` and `leaveDelay`.

---

## 🛠️ Usage

### Tooltip with a Button
Wrap any React element with the `GridTooltip` and provide a `title`.

```tsx
import { GridTooltip } from '@opencorestack/opengridx';

<GridTooltip title="Click to Export">
  <button onClick={handleExport}>
    Export as Excel
  </button>
</GridTooltip>
```

### Tooltip with Custom Placement
You can choose from four different placements: `top`, `bottom`, `left`, or `right`.

```tsx
<GridTooltip title="Top Placement" placement="top">
  <span>Hover me</span>
</GridTooltip>

<GridTooltip title="Bottom Placement" placement="bottom">
  <span>Hover me</span>
</GridTooltip>

<GridTooltip title="Left Placement" placement="left">
  <span>Hover me</span>
</GridTooltip>

<GridTooltip title="Right Placement" placement="right">
  <span>Hover me</span>
</GridTooltip>
```

---

## ⚙️ Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`title`** | `React.ReactNode` | — | Content (text, JSX, etc.) to show inside the tooltip. |
| **`children`** | `React.ReactElement` | — | The target element the tooltip is attached to. |
| **`placement`** | `'top'`, `'bottom'`, `'left'`, `'right'` | `'top'` | Direction where the tooltip appears. |
| **`enterDelay`** | `number` | `200` | Delay (ms) before showing the tooltip on hover or focus. |
| **`leaveDelay`** | `number` | `0` | Delay (ms) before hiding the tooltip on mouse leave or blur. |

---

## 🎨 Customization

The internal tooltip component is not replaceable via the slots API. For column-header tooltips, set the `description` field on `GridColDef` — it renders as the native `title` attribute on the header cell (v2.0.0+):

```tsx
{ field: 'revenue', headerName: 'Revenue', description: 'Total billed revenue for the period' }
```

## 📝 Accessibility
- The tooltip opens on hover and on keyboard focus of the child (focus events bubble to the wrapper), and closes on mouse leave, blur or Escape.
- The open tooltip has `role="tooltip"` and an id, and the child's `aria-describedby` references it (added to any `aria-describedby` the child already has) while it is open.
- The tooltip describes its child; it does not name it. Icon-only buttons still need an `aria-label`.
