# Vue 3 Nice Treeview

A treeview component for Vue 3 with checkbox/highlight selection, multi/single select, search, and RTL support.

## Installation

```bash
npm install vue3-nice-treeview

## Usage

```javascript
import { createApp } from 'vue'
import { NiceTreeViewPlugin } from 'vue3-nice-treeview'
import 'vue3-nice-treeview/dist/style.css'

const app = createApp(App)
app.use(NiceTreeViewPlugin)
app.mount('#app')
```

```vue
<nice-treeview :nodes="treeData" @node-check-change="onSelectionChange" />
```

## Node Structure

```javascript
{
  id: 1,              // Required — unique identifier
  label: 'Node name', // Required — display text
  checked: false,     // Optional — checked state
  expanded: false,    // Optional — expanded state
  children: [...]     // Optional — child nodes
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `Array` | *required* | Tree data array |
| `showCheckboxes` | `Boolean` | `true` | Show checkboxes (false = highlight mode) |
| `multiSelect` | `Boolean` | `true` | Allow multiple selections |
| `showToolbar` | `Boolean` | `true` | Show toolbar |
| `showSearchBox` | `Boolean` | `true` | Show search input |
| `showExpandCollapseButtons` | `Boolean` | `true` | Show expand/collapse all buttons |
| `showCheckUncheckButtons` | `Boolean` | `true` | Show check/uncheck all buttons |
| `rtl` | `Boolean` | `false` | Right-to-left layout |
| `floatingHeader` | `Boolean` | `true` | Floating toolbar |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node-check-change` | `(node, selectedIds)` | Fires on selection change |

## License

MIT
