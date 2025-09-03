<script setup>
import { ref, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import dagre from '@dagrejs/dagre'

const nodes = ref([
  { id: 'project', label: 'Project', position: { x: 0, y: 0 }, data: {} },
  { id: 'p1', label: 'Project 1', position: { x: 0, y: 0 } },
  { id: 'p2', label: 'Project 2', position: { x: 0, y: 0 } },
  { id: 't1', label: 'Task 1', position: { x: 0, y: 0 } },
  { id: 't2', label: 'Task 2', position: { x: 0, y: 0 } },
  { id: 't3', label: 'Task 3', position: { x: 0, y: 0 } },
  { id: 't4', label: 'Task 4', position: { x: 0, y: 0 } },
  { id: 't5', label: 'Task 5', position: { x: 0, y: 0 } },
  { id: 't6', label: 'Task 6', position: { x: 0, y: 0 } },
])

const edges = ref([
  { id: 'e_p_p1', source: 'project', target: 'p1' },
  { id: 'e_p_p2', source: 'project', target: 'p2' },
  { id: 'e_p1_t1', source: 'p1', target: 't1' },
  { id: 'e_p1_t2', source: 'p1', target: 't2' },
  { id: 'e_p1_t3', source: 'p1', target: 't3' },
  { id: 'e_p2_t4', source: 'p2', target: 't4' },
  { id: 'e_p2_t5', source: 'p2', target: 't5' },
  { id: 'e_p2_t6', source: 'p2', target: 't6' },
])

const { fitView } = useVueFlow()

// Simple left-to-right auto-layout with Dagre
function layoutLR() {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 70 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.value.forEach((n) => g.setNode(n.id, { width: 150, height: 40 }))
  edges.value.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  nodes.value = nodes.value.map((n) => {
    const { x, y } = g.node(n.id)
    return { ...n, position: { x, y }, draggable: false } // positions now managed by layout
  })
}

onMounted(() => {
  layoutLR()
  // slight delay helps ensure DOM is ready before fitView
  requestAnimationFrame(() => fitView({ padding: 0.2 }))
})
</script>

<template>
  <div class="q-pa-md" style="height: calc(100vh - 120px)">
    <VueFlow v-model:nodes="nodes" v-model:edges="edges" fit-view-on-init>
      <Controls />
      <MiniMap />
      <Background pattern-color="var(--q-primary)" gap="20" />
    </VueFlow>
  </div>
</template>
