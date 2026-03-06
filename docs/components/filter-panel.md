# `<FilterPanel />`

A persistent UI component for managing complex multi-column filter rules.

## ⚙️ Key Concepts

The Filter Panel allows users to define a list of `GridFilterItem` objects. Each item consists of:
- **Field**: Which column to filter.
- **Operator**: How to compare (e.g., `contains`, `equals`, `>`, `is empty`).
- **Value**: The target value for comparison.

## 🔌 Integration

The `<DataGrid />` manages the visibility of the Filter Panel via its internal state. It is usually triggered from the Column Menu or the Toolbar.

## 📝 Configuration

Filter operators are automatically determined based on the column's `type`:
- `string`: contains, equals, startsWith, endsWith, isAnyOf.
- `number`: =, !=, >, >=, <, <=.
- `date` / `dateTime`: is, isNot, isAfter, isBefore.
- `boolean`: isTrue, isFalse.

## 🎨 Slot Usage

While the Filter Panel is a complex internal component, its appearance can be influenced by CSS variables or by providing a custom implementation to the `filterPanel` slot in advanced use cases.
