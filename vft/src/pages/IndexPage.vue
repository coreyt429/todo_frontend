<template>
  <q-page>
    <div class="q-pa-sm row items-center q-gutter-sm">
      <q-btn color="primary" label="Add child" :disable="!selectedId" @click="addChild" />
      <div v-if="selectedId" class="text-caption">Selected: {{ selectedId }}</div>
    </div>
    <div style="height: 600px">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :fit-view-on-init="true"
        @node-click="onNodeClick"
      >
        <Background />
        <Controls />
        <MiniMap />
      </VueFlow>
    </div>
  </q-page>
</template>

<script setup>
import { nextTick, ref, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'
import dagre from '@dagrejs/dagre'

const LAYOUT_DIR = 'LR' // left-to-right: parents on the left, children expand to the right

// --- dagre auto-layout helper (top-to-bottom) ---
const nodeWidth = 180
const nodeHeight = 40

function layoutWithDagre(rawNodes, rawEdges, direction = 'TB') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 60, marginx: 20, marginy: 20 })

  // dagre only needs sizes; Vue Flow will render using returned positions
  rawNodes.forEach((n) => {
    g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
  })
  rawEdges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  const isHorizontal = direction === 'LR' || direction === 'RL'

  const nodes = rawNodes.map((n) => {
    const { x, y } = g.node(n.id)
    return {
      ...n,
      position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
    }
  })
  return { nodes, edges: rawEdges }
}

// --- sample data ---
const baseNodes = [
  { id: 'projects', data: { label: 'Projects' }, type: 'input', position: { x: 0, y: 0 } },
  { id: 'project-1', data: { label: 'Project 1' }, position: { x: 0, y: 0 } },
  { id: 'project-2', data: { label: 'Project 2' }, position: { x: 0, y: 0 } },

  { id: 'p1-task-a', data: { label: 'P1: Task A' }, position: { x: 0, y: 0 } },
  { id: 'p1-task-b', data: { label: 'P1: Task B' }, position: { x: 0, y: 0 } },
  { id: 'p1-task-c', data: { label: 'P1: Task C' }, position: { x: 0, y: 0 } },

  { id: 'p2-task-a', data: { label: 'P2: Task A' }, position: { x: 0, y: 0 } },
  { id: 'p2-task-b', data: { label: 'P2: Task B' }, position: { x: 0, y: 0 } },
  { id: 'p2-task-c', data: { label: 'P2: Task C' }, position: { x: 0, y: 0 } },
]

const baseEdges = [
  { id: 'e-projects-1', source: 'projects', target: 'project-1' },
  { id: 'e-projects-2', source: 'projects', target: 'project-2' },

  { id: 'e-p1-a', source: 'project-1', target: 'p1-task-a' },
  { id: 'e-p1-b', source: 'project-1', target: 'p1-task-b' },
  { id: 'e-p1-c', source: 'project-1', target: 'p1-task-c' },

  { id: 'e-p2-a', source: 'project-2', target: 'p2-task-a' },
  { id: 'e-p2-b', source: 'project-2', target: 'p2-task-b' },
  { id: 'e-p2-c', source: 'project-2', target: 'p2-task-c' },
]

const nodes = ref([])
const edges = ref([])

const { fitView } = useVueFlow()
const selectedId = ref('')

function onNodeClick(data) {
  const node = data.node
  selectedId.value = node?.id || ''
  console.log('node clicked:', node)
}

function relayoutAndApply(rawNodes, rawEdges, direction = 'TB') {
  const { nodes: layoutedNodes, edges: layoutedEdges } = layoutWithDagre(
    rawNodes,
    rawEdges,
    direction,
  )
  nodes.value = layoutedNodes
  edges.value = layoutedEdges
  nextTick(() => fitView({ padding: 0.2 }))
}

function addChild() {
  if (!selectedId.value) return
  const parentId = selectedId.value
  const label = window.prompt('New node label:', 'New Task') || 'New Task'
  const newId = (crypto?.randomUUID && crypto.randomUUID()) || `node-${Date.now()}`

  baseNodes.push({ id: newId, data: { label }, position: { x: 0, y: 0 } })
  baseEdges.push({ id: `e-${parentId}-${newId}`, source: parentId, target: newId })

  relayoutAndApply(baseNodes, baseEdges, LAYOUT_DIR)
}

onMounted(() => {
  relayoutAndApply(baseNodes, baseEdges, LAYOUT_DIR)
})
</script>
