import NiceTreeView from './src/components/NiceTreeView.vue'

export { NiceTreeView }

export default NiceTreeView

export function install(app) {
  app.component('nice-treeview', NiceTreeView)
  app.component('NiceTreeView', NiceTreeView)
}