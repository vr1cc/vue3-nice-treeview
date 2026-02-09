<template>
    <div class="position-relative" :class="[{'nice-treeview': isRoot}, rtl ? 'ntv-rtl' : 'ntv-ltr']">
        <div class="tree-header" :class="{'floating-header': floatingHeader}" v-if="isRoot && showToolbar">
            <div class="search-input">
                <input v-if="showSearchBox"
                       type="text"
                       v-model="searchText"
                       :placeholder="rtl ? 'جستجو...' : 'Search...'"
                       class="form-control ms-2"/>
                <i class="bi bi-x-lg text-gray-700 clear-txt" v-if="searchText?.trim().length > 0"
                   @click="clearTxt"></i>
            </div>

            <div class="tree-controls d-flex" v-if="showCheckUncheckButtons || showExpandCollapseButtons">
                <span v-if="showExpandCollapseButtons" @click="expandAll">
                  <i class="bi bi-arrows-angle-expand"></i>
                </span>
                <span v-if="showExpandCollapseButtons" @click="collapseAll">
                    <i class="bi bi-arrows-angle-contract"></i>
                </span>
                <span v-if="showCheckUncheckButtons && multiSelect" @click="checkAllNodes">
                    <i class="bi bi-check2-square"></i>
                </span>
                <span v-if="showCheckUncheckButtons && multiSelect" @click="uncheckAllNodes">
                    <i class="bi bi-square"></i>
                </span>
            </div>
        </div>

        <div class="position-relative" :class="{'border border-gray-300 rounded py-2 tree-container parent-content': isRoot, 'floating-content': isRoot && showToolbar && floatingHeader}">
            <div class="tree-view position-relative">
                <ul class="px-6">
                    <div v-for="node in nodes" :key="node.id" class="d-flex position-relative">
                        <i @click="toggleNode(node);" v-if="node.children && node.children.length"
                           class="bi mt-2 cursor-pointer position-absolute"
                           :class="`bi-${node.expanded ? 'chevron-down' : (rtl ? 'chevron-left' : 'chevron-right')}`"></i>
                        <i v-else class="bi fs-5 mt-2 cursor-pointer bi-dot"></i>
                        <li :class="node.children && node.children.length ? (node.expanded ? 'expanded' : 'collapsed') : 'final'">
                            <div class="node"
                                 :class="{'ntv-selected': !showCheckboxes && node.selected && (!node.children || !node.children.length), 'ntv-selectable': !showCheckboxes}"
                                 @click="!showCheckboxes ? onNodeClick(node, $event) : null">
                                <input :id="'chb_' + node.id" type="checkbox" class="form-check-input border-gray-400"
                                       v-if="showCheckboxes && (multiSelect || !node.children || !node.children.length)"
                                       v-model="node.checked"
                                       @change="onNodeCheckChange(node)"/>
                                <label :for="showCheckboxes && (multiSelect || !node.children || !node.children.length) ? 'chb_' + node.id : null"
                                       :class="['form-check-label', showCheckboxes ? 'cursor-default' : 'cursor-pointer', { 'bg-warning': node.match }]"
                                       @dblclick="toggleNode(node)">
                                    {{ node.label }}
                                </label>
                            </div>
                            <NiceTreeView v-if="node.children && node.children.length && node.expanded"
                                      :nodes="node.children"
                                      :showCheckboxes="showCheckboxes"
                                      :multiSelect="multiSelect"
                                      :showSearchBox="false"
                                      :show-expand-collapse-buttons="false"
                                      :show-check-uncheck-buttons="false"
                                      :rtl="rtl"
                                      @node-check-change="onChildChange"/>
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import {getCurrentInstance, nextTick, onMounted, onUpdated, ref, watch} from "vue";

export default {
    name: "NiceTreeView",
    props: {
        nodes: {type: Array, required: true},
        rtl: {type: Boolean, default: false},
        showCheckboxes: {type: Boolean, default: true},
        multiSelect: {type: Boolean, default: true},
        showToolbar: {type: Boolean, default: true},
        floatingHeader: {type: Boolean, default: false},
        showExpandCollapseButtons: {type: Boolean, default: true},
        showCheckUncheckButtons: {type: Boolean, default: true},
        showSearchBox: {type: Boolean, default: true}
    },
    emits: ["node-check-change"],
    setup(props, {emit}) {
        const instance = getCurrentInstance();
        const isRoot = !instance.parent || instance.parent.type.name !== "NiceTreeView";
        const searchText = ref("");

        function traverseNodes(nodes, callback) {
            if (!Array.isArray(nodes)) return;
            nodes.forEach(node => {
                callback(node);
                if (node.children && node.children.length > 0)
                    traverseNodes(node.children, callback);
            });
        }

        function getRootNodes() {
            let comp = instance;
            while (comp.parent && comp.parent.type.name === "NiceTreeView") {
                comp = comp.parent;
            }
            return comp.props.nodes;
        }

        function filterNodes(nodes) {
            let hasMatch = false;
            nodes.forEach(node => {
                const match = node.label.toLowerCase().includes(searchText.value.toLowerCase());
                node.match = match;

                if (node.children?.length) {
                    const childMatch = filterNodes(node.children);
                    node.expanded = childMatch;
                    hasMatch = hasMatch || match || childMatch;
                } else {
                    hasMatch = hasMatch || match;
                }
            });
            return hasMatch;
        }

        function toggleNode(node) {
            if (node.children) node.expanded = !node.expanded;
        }

        function expandAll() {
            traverseNodes(props.nodes, n => {
                if (n.children) n.expanded = true;
            });
        }

        function collapseAll() {
            traverseNodes(props.nodes, n => {
                if (n.children) n.expanded = false;
            });
        }

        function cascadeCheck(node, isChecked) {
            node.checked = isChecked;
            node.indeterminate = false;
            if (node.children && node.children.length > 0)
                node.children.forEach(c => cascadeCheck(c, isChecked));
        }

        function collectChecked(nodes) {
            const result = [];
            nodes?.forEach(n => {
                if (n.children?.length) result.push(...collectChecked(n.children));
                else if (n.checked) result.push(n.id);
            });
            return result;
        }

        function collectSelected(nodes) {
            const result = [];
            nodes?.forEach(n => {
                if (n.children?.length) result.push(...collectSelected(n.children));
                else if (n.selected) result.push(n.id);
            });
            return result;
        }

        function cascadeSelect(node, isSelected) {
            if (node.children && node.children.length > 0) {
                node.children.forEach(c => cascadeSelect(c, isSelected));
            } else {
                node.selected = isSelected;
            }
        }

        function areAllLeavesSelected(node) {
            if (!node.children || !node.children.length) return !!node.selected;
            return node.children.every(c => areAllLeavesSelected(c));
        }

        function updateParentStates(nodes) {
            nodes?.forEach(n => {
                if (n.children?.length) {
                    updateParentStates(n.children);
                    const allChecked = n.children.every(c => c.checked);
                    const noneChecked = n.children.every(c => !c.checked && !c.indeterminate);
                    const someChecked = n.children.some(c => c.checked || c.indeterminate);
                    if (!document.activeElement || document.activeElement.id !== "chb_" + n.id)
                        n.checked = allChecked;
                    n.indeterminate = !allChecked && someChecked && !noneChecked;
                }
            });
        }

        function setIndeterminateVisual(nodes) {
            if (!Array.isArray(nodes)) return;
            nodes.forEach(n => {
                const el = document.getElementById("chb_" + n.id);
                if (el) el.indeterminate = !!n.indeterminate;
                if (Array.isArray(n.children) && n.children.length > 0)
                    setIndeterminateVisual(n.children);
            });
        }

        function clearAllChecks(rootNodes) {
            traverseNodes(rootNodes, n => {
                n.checked = false;
                n.indeterminate = false;
            });
        }

        function clearAllSelections(rootNodes) {
            traverseNodes(rootNodes, n => {
                n.selected = false;
            });
        }

        function checkAllNodes() {
            if (!props.multiSelect) return;
            if (props.showCheckboxes) {
                traverseNodes(props.nodes, n => {
                    n.checked = true;
                    n.indeterminate = false;
                });
                emitCheckedChange();
            } else {
                traverseNodes(props.nodes, n => {
                    if (!n.children || !n.children.length) n.selected = true;
                });
                emitSelectedChange();
            }
        }

        function uncheckAllNodes() {
            if (!props.multiSelect) return;
            if (props.showCheckboxes) {
                traverseNodes(props.nodes, n => {
                    n.checked = false;
                    n.indeterminate = false;
                });
                emitCheckedChange();
            } else {
                traverseNodes(props.nodes, n => {
                    n.selected = false;
                });
                emitSelectedChange();
            }
        }

        function emitCheckedChange(changedNode = null) {
            const rootNodes = getRootNodes();
            updateParentStates(rootNodes);
            const allChecked = collectChecked(rootNodes);
            emit("node-check-change", changedNode, allChecked);
            nextTick(() => setIndeterminateVisual(rootNodes));
        }

        function emitSelectedChange(changedNode = null) {
            const rootNodes = getRootNodes();
            const allSelected = collectSelected(rootNodes);
            emit("node-check-change", changedNode, allSelected);
        }

        function onNodeCheckChange(node) {
            const rootNodes = getRootNodes();

            if (props.multiSelect) {
                if (node.children?.length) cascadeCheck(node, node.checked);
                updateParentStates(rootNodes);
                nextTick(() => {
                    setIndeterminateVisual(rootNodes);
                    const allChecked = collectChecked(rootNodes);
                    emit("node-check-change", node, allChecked);
                });
            } else {
                if (node.checked) {
                    clearAllChecks(rootNodes);
                    node.checked = true;
                }
                nextTick(() => {
                    const allChecked = collectChecked(rootNodes);
                    emit("node-check-change", node, allChecked);
                });
            }
        }

        function onNodeClick(node, event) {
            if (props.showCheckboxes) return;
            if (!props.multiSelect && node.children && node.children.length) return;

            const rootNodes = getRootNodes();
            const isParent = node.children && node.children.length > 0;

            if (props.multiSelect) {
                if (event.ctrlKey || event.metaKey) {
                    if (isParent) {
                        const allSelected = areAllLeavesSelected(node);
                        cascadeSelect(node, !allSelected);
                    } else {
                        node.selected = !node.selected;
                    }
                } else {
                    clearAllSelections(rootNodes);
                    if (isParent) {
                        cascadeSelect(node, true);
                    } else {
                        node.selected = true;
                    }
                }
            } else {
                clearAllSelections(rootNodes);
                node.selected = true;
            }

            emitSelectedChange(node);
        }

        function onChildChange(changedNode, allIds) {
            if (props.showCheckboxes && props.multiSelect) {
                emitCheckedChange(changedNode);
            } else {
                emit("node-check-change", changedNode, allIds);
            }
        }

        watch(searchText, () => {
            nextTick(() => {
                const text = searchText.value?.trim();

                if (!text || text.length === 0) {
                    traverseNodes(props.nodes, node => {
                        node.match = false;
                        if (node.children) node.expanded = true;
                    });
                } else {
                    filterNodes(props.nodes);
                }

                if (props.showCheckboxes && props.multiSelect) {
                    setIndeterminateVisual(props.nodes);
                }
            });
        });

        watch(
            () => props.nodes,
            (newVal) => {
                if (!Array.isArray(newVal) || newVal.length === 0) return;
                nextTick(() => {
                    if (props.showCheckboxes && props.multiSelect) {
                        updateParentStates(props.nodes);
                        setIndeterminateVisual(props.nodes);
                    }
                });
            },
            {deep: true, immediate: true}
        );

        onMounted(() => nextTick(() => {
            if (props.showCheckboxes && props.multiSelect)
                setIndeterminateVisual(props.nodes);
        }));
        onUpdated(() => nextTick(() => {
            if (props.showCheckboxes && props.multiSelect)
                setIndeterminateVisual(props.nodes);
        }));

        function clearTxt() {
            searchText.value = '';
        }

        return {
            toggleNode,
            onNodeCheckChange,
            onNodeClick,
            onChildChange,
            expandAll,
            collapseAll,
            checkAllNodes,
            uncheckAllNodes,
            isRoot,
            searchText,
            clearTxt,
        };
    }
};
</script>

<style scoped>
.position-relative {
    position: relative;
}

.position-absolute {
    position: absolute;
}

.d-flex {
    display: flex;
}

.align-items-center {
    align-items: center;
}

.justify-content-center {
    justify-content: center;
}

.mt-1 {
    margin-top: 0.2rem;
}

.mt-2 {
    margin-top: 0.3rem;
}

.ms-2 {
    margin-left: 0.5rem;
}

.me-2 {
    margin-right: 0.5rem;
}

.ntv-rtl .ms-2 {
    margin-left: 0.5rem;
    margin-right: 0;
}

.ntv-ltr .ms-2 {
    margin-right: 0.5rem;
    margin-left: 0;
}

.py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}

.px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

.border {
    border: 1px solid #dee2e6;
}

.border-gray-300 {
    border-color: #dee2e6;
}

.border-gray-400 {
    border-color: #ced4da;
}

.rounded {
    border-radius: 0.375rem;
}

.bg-warning {
    background-color: #ffc107;
}

.text-gray-700 {
    color: #495057;
}

.cursor-pointer {
    cursor: pointer;
}

.cursor-default {
    cursor: default;
}

.form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    font-family: inherit;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    color: #212529;
    background-color: #fff;
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-check-input {
    width: 1.2rem;
    height: 1.2rem;
    vertical-align: top;
    background-color: #fff;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0.4em;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
}

.form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='m6 10 3 3 6-6'/%3e%3c/svg%3e");
}

.form-check-input:indeterminate {
    background-color: #0d6efd;
    border-color: #0d6efd;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M6 10h8'/%3e%3c/svg%3e");
}

.form-check-input:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-check-label {
    cursor: pointer;
}

.nice-treeview {
    font-family: Tahoma, 'Segoe UI', Arial, sans-serif;
}

.ntv-rtl .tree-view {
    direction: rtl;
}

.ntv-rtl .node {
    margin-right: 14px;
    margin-left: 0;
}

.ntv-rtl .node label {
    margin-right: 0;
    margin-left: 0;
}

.ntv-rtl li {
    border-right: 1px dashed #dadada;
    border-left: none;
}

.ntv-rtl i {
    right: -5px;
    left: auto;
}

.ntv-rtl ul:first-child {
    margin-right: 0;
    margin-left: auto;
}

.ntv-rtl input[type=checkbox] {
    margin-left: 5px;
    margin-right: 3px;
}

.ntv-rtl li:before {
    right: 0;
    left: auto;
}

.ntv-rtl .tree-header {
    left: -5px;
    right: auto;
}

.ntv-rtl .tree-header input[type=text] {
    direction: rtl;
    padding: 3px 7px 3px 17px;
}

.ntv-rtl i.clear-txt {
    left: 11px;
    right: unset;
}

.ntv-ltr .tree-view {
    direction: ltr;
}

.ntv-ltr .node {
    margin-left: 14px;
    margin-right: 0;
}

.ntv-ltr .node label {
    margin-left: 0;
    margin-right: 0;
}

.ntv-ltr li {
    border-left: 1px dashed #dadada;
    border-right: none;
}

.ntv-ltr i {
    left: -5px;
    right: auto;
}

.ntv-ltr ul:first-child {
    margin-left: 0;
    margin-right: auto;
}

.ntv-ltr input[type=checkbox] {
    margin-right: 5px;
    margin-left: 3px;
}

.ntv-ltr li:before {
    left: 0;
    right: auto;
}

.ntv-ltr .tree-header {
    right: -5px;
    left: auto;
}

.ntv-ltr .tree-header .search-input {
    order: 2;
}

.ntv-ltr .tree-header .tree-controls {
    order: 1;
}

.ntv-ltr i.clear-txt {
    right: 11px;
    left: unset;
}

.ntv-ltr .tree-header input[type=text] {
    direction: ltr;
    padding: 3px 17px 3px 7px;
}

.node {
    display: flex;
    align-items: center;
    padding: 2px 3px 3px 3px;
}

li {
    list-style: none;
}

li label {
    color: #8a8a8a;
    padding-right: 5px;
    padding-left: 5px;
}

li.final label {
    color: #2d2d2d;
    font-weight: 500;
}

.ntv-selectable {
    cursor: pointer;
}

.ntv-selectable label {
    cursor: pointer !important;
}

i {
    top: 0px;
    padding: 0.16rem;
    color: black;
    z-index: 9;
    position: absolute;
    background: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    font-size: 9px;
    line-height: 9;
    border: 1px solid gray;
}

ul:first-child {
    position: relative;
    margin-top: 0;
    margin-bottom: 0;
}

i.bi-dot {
    color: transparent;
    background: transparent;
    border: none;
    cursor: default;
}

li:before {
    position: absolute;
    content: "---";
    letter-spacing: 3px;
    font-size: 10px;
    color: #dadada;
    margin-top: 8px;
}

input[type="checkbox"]:indeterminate {
    background-color: #bbcef5;
}

.tree-controls {
    display: flex;
    height: 100%;
    align-items: center;
}

.tree-controls span {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    cursor: pointer;
}

.tree-controls span i {
    font-size: 0.75rem;
    position: unset;
    top: auto;
    right: auto;
}

.tree-header {
    display: flex;
    align-items: center;
    gap: 9px;
    z-index: 2;
}

.tree-header.floating-header {
    position: absolute;
    top: 2px;
    justify-content: flex-end;
}

.tree-header:not(.floating-header) {
    position: relative;
    margin-bottom: 0.5rem;
}

.ntv-rtl .tree-header:not(.floating-header) {
    justify-content: flex-end;
}

.ntv-ltr .tree-header:not(.floating-header) {
    justify-content: flex-start;
}

.floating-content {
    padding-top: 1.55rem !important;
}

div.search-input {
    position: relative;
}

.tree-header input[type=text] {
    width: 80px;
    font-size: 0.9rem;
    line-height: 1;
    transition: all linear 0.2s 0.3s;
}

.tree-header input[type=text]:focus {
    width: 144px;
    transition: all linear 0.2s;
}

i.clear-txt {
    border: none;
    position: absolute;
    top: 25%;
    opacity: 0.5;
    cursor: pointer;
}

i.clear-txt:hover {
    opacity: 1;
}

.ntv-selected {
    background-color: #cfe2ff;
    border-radius: 0.25rem;
}

.ntv-selected label {
    color: #084298 !important;
}
</style>