import { Component } from 'vue'

export interface TreeViewNode {
  Id: string | number
  Label: string
  Checked?: boolean
  Selected?: boolean
  Expanded?: boolean
  Children?: TreeViewNode[]
  [key: string]: any
}

export interface NiceTreeViewProps {
  nodes: TreeViewNode[]
  showCheckboxes?: boolean
  multiSelect?: boolean
  showExpandCollapseButtons?: boolean
  showCheckUncheckButtons?: boolean
  showSearchBox?: boolean
  showToolbar?: boolean
  rtl?: boolean
  floatingHeader?: boolean
}

export const NiceTreeView: Component<NiceTreeViewProps>

export default NiceTreeView

declare const _default: {
  install: (app: any) => void
}

export { _default as install }