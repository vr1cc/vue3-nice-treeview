import { Component } from 'vue'

export interface TreeViewNode {
  id: string | number
  label: string
  checked?: boolean
  selected?: boolean
  expanded?: boolean
  children?: TreeViewNode[]
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

export declare const NiceTreeViewPlugin: {
  install: (app: any) => void
}