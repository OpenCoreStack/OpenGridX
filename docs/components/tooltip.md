# `<GridTooltip />`

The `GridTooltip` component provides a lightweight, accessible tooltip for any HTML or React element. It is commonly used within columns, actions, or toolbars to display extra information when a user hovers over a component.

## 📑 Overview
- **Portal Rendering**: Tooltips are rendered at the end of `document.body` for unobstructed positioning.
- **Dynamic Calculation**: Tooltips calculate their placement relative to the target element on hover.
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
```

---

## ⚙️ Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`title`** | `React.ReactNode` | — | Content (text, JSX, etc.) to show inside the tooltip. |
| **`children`** | `React.ReactElement` | — | The target element the tooltip is attached to. |
| **`placement`** | `'top'`, `'bottom'`, `'left'`, `'right'` | `'top'` | Direction where the tooltip appears. |
| **`enterDelay`** | `number` | `200` | Delay (ms) before showing the tooltip. |
| **`leaveDelay`** | `number` | `0` | Delay (ms) before hiding the tooltip. |

---

## 🎨 Slot Implementation
In the DataGrid, specialized components like the Toolbar often use tooltips within their built-in actions. These can be customized or replaced using the slots API.

```tsx
<DataGrid
  slots={{
    tooltip: GridTooltip
  }}
/>
```

## 📝 Accessibility
- Tooltips are triggered by mouse hover events (`onMouseEnter`/`onMouseLeave`).
- It is recommended to use descriptive `aria-label` tags on the child element for screen readers, as tooltips are visually focused.
