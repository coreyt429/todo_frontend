<template>
  <q-page>
    <div class="q-pa-sm row items-center q-gutter-sm">
      <q-btn color="primary" label="Add child" :disable="!selectedId" @click="addChild" />
      <div v-if="selectedId" class="text-caption">Selected: {{ selectedId }}</div>
      <div class="row items-center q-gutter-xs text-caption" style="margin-left: 12px">
        <div class="text-weight-medium" style="margin-right: 4px">Legend:</div>
        <!-- Priority (border color) -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #e53935;
            border-radius: 6px;
            padding: 2px 6px;
          "
        >
          high
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #fb8c00;
            border-radius: 6px;
            padding: 2px 6px;
          "
        >
          medium
        </div>
        <div
          style="
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #43a047;
            border-radius: 6px;
            padding: 2px 6px;
          "
        >
          low
        </div>
        <div class="q-ml-md" style="display: flex; align-items: center; gap: 6px">
          <!-- Due (left accent) -->
          <div
            style="
              display: flex;
              align-items: center;
              border-left: 6px solid #e53935;
              padding-left: 6px;
            "
          >
            overdue
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              border-left: 6px solid #fbc02d;
              padding-left: 6px;
            "
          >
            today
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              border-left: 6px solid #ffa000;
              padding-left: 6px;
            "
          >
            soon
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              border-left: 6px solid #43a047;
              padding-left: 6px;
            "
          >
            later
          </div>
        </div>
      </div>
    </div>

    <div style="height: 600px">
      <VueFlow
        v-model:nodes="localNodes"
        v-model:edges="localEdges"
        :fit-view-on-init="false"
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
import { ref, watch, nextTick, onMounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { Background } from '@vue-flow/background'
import dagre from '@dagrejs/dagre'

/**
 * Props:
 * - nodes, edges: arrays from the parent/page (e.g., built from Pinia via a composable).
 * - layoutDir: 'LR' | 'RL' | 'TB' | 'BT'
 * - autoFit: whether to fitView after layout
 * - nodeSize: { width, height } used by Dagre to compute positions
 */
const props = defineProps({
  nodes: { type: Array, required: true, default: () => [] },
  edges: { type: Array, required: true, default: () => [] },
  layoutDir: { type: String, default: 'LR' },
  autoFit: { type: Boolean, default: true },
  nodeSize: {
    type: Object,
    default: () => ({ width: 180, height: 40 }),
  },
})

/**
 * Emits:
 * - add-child: { parentId, label }  (parent updates store, which flows back as new props)
 * - node-click: nodeId
 * - update:selectedId: nodeId
 */
const emit = defineEmits(['add-child', 'node-click', 'update:selectedId'])

/* Local state fed to <VueFlow> */
const localNodes = ref([])
const localEdges = ref([])
const selectedId = ref('')

const { fitView } = useVueFlow()

function layoutWithDagre(rawNodes, rawEdges, direction = 'TB') {
  const { width, height } = props.nodeSize
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 40, ranksep: 60, marginx: 20, marginy: 20 })

  rawNodes.forEach((n) => g.setNode(n.id, { width, height }))
  rawEdges.forEach((e) => g.setEdge(e.source, e.target))

  dagre.layout(g)

  const isHorizontal = direction === 'LR' || direction === 'RL'
  const nodes = rawNodes.map((n) => {
    const { x, y } = g.node(n.id) || { x: 0, y: 0 }
    return {
      ...n,
      position: { x: x - width / 2, y: y - height / 2 },
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      draggable: false,
    }
  })

  return { nodes, edges: rawEdges }
}

async function relayoutAndApply(rawNodes, rawEdges, direction) {
  const { nodes, edges } = layoutWithDagre(rawNodes, rawEdges, direction)
  localNodes.value = nodes
  localEdges.value = edges
  if (props.autoFit) {
    await nextTick()
    fitView({ padding: 0.2 })
  }
}

function onNodeClick(evt) {
  const node = evt?.node
  selectedId.value = node?.id || ''
  emit('node-click', selectedId.value)
  emit('update:selectedId', selectedId.value)
}

function addChild() {
  if (!selectedId.value) return
  const parentId = selectedId.value
  const label =
    (typeof window !== 'undefined' && window.prompt('New node label:', 'New Task')) || 'New Task'
  emit('add-child', { parentId, label })
  // Parent updates its data/store; when props change, our watcher re-layouts.
}

/* Re-run layout whenever parent updates nodes/edges or layoutDir changes */
watch(
  () => [props.nodes, props.edges, props.layoutDir, props.nodeSize.width, props.nodeSize.height],
  () => relayoutAndApply(props.nodes, props.edges, props.layoutDir),
  { immediate: true, deep: true },
)

onMounted(() => {
  // initial fit is handled by the watcher with immediate:true
})
</script>
