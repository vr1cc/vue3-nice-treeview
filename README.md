# Vue 3 Nice Treeview

A simple, easy-to-use treeview component for Vue 3 with recursive rendering, multi/single select, checkbox and highlight modes.

## Features

- ✅ Recursive tree structure with unlimited nesting
- ✅ Expand / collapse nodes
- ✅ Checkbox mode with cascade check and indeterminate state
- ✅ Single-select checkbox mode (radio-like, leaf nodes only)
- ✅ Highlight selection mode (no checkboxes, click to select)
- ✅ Multi-select with Ctrl+Click (in highlight mode)
- ✅ Built-in search / filter
- ✅ Check all / uncheck all toolbar buttons
- ✅ Expand all / collapse all toolbar buttons
- ✅ Floating or inline toolbar
- ✅ RTL and LTR support
- ✅ No Bootstrap CSS required (all styles are built-in)
- ✅ Only requires Bootstrap Icons
- ✅ TypeScript support

## Installation

```bash
npm install vue3-nice-treeview
# or
yarn add vue3-nice-treeview
# or
pnpm add vue3-nice-treeview
```

## Requirements

This component uses **Bootstrap Icons** for icons. Add it via CDN or npm:

### CDN (in your index.html)
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
```

### npm
```bash
npm install bootstrap-icons
```
Then import in your main entry file:
```javascript
import 'bootstrap-icons/font/bootstrap-icons.css'
```

> **Note:** Bootstrap CSS is **NOT** needed. All utility styles are built into the component.

## Usage

### Global Registration

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { install } from 'vue3-nice-treeview'
import 'vue3-nice-treeview/dist/style.css'

const app = createApp(App)
app.use({ install })
app.mount('#app')
```

Then use anywhere:
```vue
<template>
  <nice-treeview :nodes="treeData" @node-check-change="onSelectionChange" />
</template>
```

### Local Import

```vue
<script setup>
import { ref } from 'vue'
import { NiceTreeView } from 'vue3-nice-treeview'
import 'vue3-nice-treeview/dist/style.css'

const treeData = ref([
  {
    Id: 1,
    Label: 'Fruits',
    Expanded: true,
    Children: [
      { Id: 2, Label: 'Apple' },
      { Id: 3, Label: 'Banana' },
      {
        Id: 4,
        Label: 'Citrus',
        Children: [
          { Id: 5, Label: 'Orange' },
          { Id: 6, Label: 'Lemon' }
        ]
      }
    ]
  },
  {
    Id: 7,
    Label: 'Vegetables',
    Children: [
      { Id: 8, Label: 'Carrot' },
      { Id: 9, Label: 'Broccoli' }
    ]
  }
])

function onSelectionChange(node, selectedIds) {
  console.log('Changed node:', node)
  console.log('All selected IDs:', selectedIds)
}
</script>

<template>
  <NiceTreeView :nodes="treeData" @node-check-change="onSelectionChange" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `Array` | *required* | The tree data. An array of node objects that defines the tree structure. |
| `showCheckboxes` | `Boolean` | `true` | When `true`, checkboxes appear next to nodes for selection. When `false`, nodes are selected by clicking on them (highlight mode). |
| `multiSelect` | `Boolean` | `true` | When `true`, multiple nodes can be selected at the same time. When `false`, only one node can be selected at a time (single-select). |
| `showToolbar` | `Boolean` | `true` | Controls whether the toolbar (search box and action buttons) is visible at the top of the tree. |
| `showSearchBox` | `Boolean` | `true` | Shows a search input in the toolbar. Type to filter and highlight matching nodes. |
| `showExpandCollapseButtons` | `Boolean` | `true` | Shows expand-all and collapse-all buttons in the toolbar. |
| `showCheckUncheckButtons` | `Boolean` | `true` | Shows check-all and uncheck-all buttons in the toolbar. Only visible when `multiSelect` is `true`. |
| `rtl` | `Boolean` | `false` | Enables right-to-left layout. Useful for languages like Persian, Arabic, and Hebrew. |
| `floatingHeader` | `Boolean` | `true` | When `true`, the toolbar floats over the top of the tree. When `false`, it sits above the tree as a separate row. |

## Selection Modes

The combination of `showCheckboxes` and `multiSelect` gives you four different selection behaviors:

### 1. Checkboxes + Multi-Select (default)
```vue
<NiceTreeView :nodes="data" :showCheckboxes="true" :multiSelect="true" />
```
Checkboxes appear on **all nodes**. Checking a parent automatically checks all its children. Parent nodes show an indeterminate state when some (but not all) children are checked.

### 2. Checkboxes + Single-Select
```vue
<NiceTreeView :nodes="data" :showCheckboxes="true" :multiSelect="false" />
```
Checkboxes appear **only on leaf nodes** (nodes without children). Only **one** checkbox can be checked at a time across the entire tree — like a radio button.

### 3. Highlight + Multi-Select
```vue
<NiceTreeView :nodes="data" :showCheckboxes="false" :multiSelect="true" />
```
No checkboxes. Click a **leaf node** to select and highlight it. Use **Ctrl+Click** to select multiple nodes. Clicking a **parent node** selects all its descendant leaf nodes.

### 4. Highlight + Single-Select
```vue
<NiceTreeView :nodes="data" :showCheckboxes="false" :multiSelect="false" />
```
No checkboxes. Click a **leaf node** to select it. Only one node can be highlighted at a time. Parent nodes are not selectable.

## Node Structure

Each node in the `nodes` array should follow this shape:

```javascript
{
  Id: 1,               // Unique identifier (string or number)
  Label: 'Node name',  // Display text shown in the tree
  Checked: false,      // Whether the node is checked (checkbox mode)
  Expanded: true,      // Whether the node is expanded (parent nodes)
  Children: [...]      // Array of child nodes (optional, makes it a parent)
}
```

Only `Id` and `Label` are required. All other fields are optional and will default to `false` / `undefined`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node-check-change` | `(node, selectedIds)` | Fires whenever the selection changes. `node` is the node that was clicked/toggled (or `null` for check-all/uncheck-all). `selectedIds` is an array of all currently selected **leaf node** IDs. |

### Example

```vue
<template>
  <NiceTreeView :nodes="treeData" @node-check-change="handleChange" />
</template>

<script setup>
function handleChange(changedNode, allSelectedIds) {
  // changedNode = the node the user just interacted with
  // allSelectedIds = [2, 5, 8] — IDs of all selected leaf nodes
  console.log(changedNode, allSelectedIds)
}
</script>
```

## RTL Support

For right-to-left languages, simply enable the `rtl` prop:

```vue
<NiceTreeView :nodes="treeData" :rtl="true" />
```

## License

MIT
