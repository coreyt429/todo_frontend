// src/composables/useTasksFlow.js
import { ref, computed, watch, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import dagre from '@dagrejs/dagre'

/**
 * Build a Vue Flow graph from tasks in todoStore.filteredTasks.
 *
 * Usage (inside a component/page that renders <VueFlow>):
 *   import { useTodoStore } from 'stores/todo'
 *   import { useTasksFlow } from 'src/composables/useTasksFlow'
 *   const todoStore = useTodoStore()
 *   const { nodes, edges, selectedId, onNodeClick, layoutLR, layoutTB, fitGraph } =
 *     useTasksFlow(todoStore)
 */
export function useTasksFlow(todoStore, opts = {}) {
  const {
    nodeWidth = 180,
    nodeHeight = 48,
    ranksep = 80,
    nodesep = 40,
    rankdir = 'LR', // default initial layout direction
  } = opts

  // Bring tasks from store
  const tasks = computed(() =>
    Array.isArray(todoStore.filteredTasks) ? todoStore.filteredTasks : [],
  )

  // Map: task_id -> task
  const taskMap = computed(() => {
    const m = new Map()
    for (const t of tasks.value) {
      if (t?.task_id) m.set(t.task_id, t)
    }
    return m
  })

  // Base nodes from tasks
  const baseNodes = computed(() => {
    return tasks.value.map((t) => ({
      id: t.task_id,
      data: {
        label: t.name ?? '(unnamed)',
        task: t,
      },
      position: { x: 0, y: 0 }, // dagre will place
      draggable: false,
      style: nodeStyle(t),
    }))
  })

  // Base edges where source/target both exist in this filtered set
  const baseEdges = computed(() => {
    const ids = taskMap.value
    const edges = []
    for (const t of tasks.value) {
      const pid = t.parent
      if (pid && ids.has(pid) && ids.has(t.task_id)) {
        edges.push({
          id: `e-${pid}-${t.task_id}`,
          source: pid,
          target: t.task_id,
        })
      }
    }
    return edges
  })

  // Reactive clones used by Vue Flow (so we can write positions without mutating base)
  const nodes = ref([])
  const edges = ref([])

  // Selection helpers
  const selectedId = ref(null)
  const onNodeClick = (_evt, node) => {
    selectedId.value = node?.id ?? null
  }

  // Vue Flow API (only works in a component that renders <VueFlow> somewhere in its template)
  const { fitView } = useVueFlow()

  // --- Layout with Dagre ---
  function layoutGraph(direction = rankdir) {
    // Prepare dagre graph
    const g = new dagre.graphlib.Graph()
      .setGraph({ rankdir: direction, nodesep, ranksep })
      .setDefaultEdgeLabel(() => ({}))

    // Add nodes with known dimensions
    for (const n of nodes.value) g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
    for (const e of edges.value) g.setEdge(e.source, e.target)

    dagre.layout(g)

    // Apply new positions
    nodes.value = nodes.value.map((n) => {
      const pos = g.node(n.id)
      // dagre can omit nodes if disconnected; keep (0,0) in that case
      const x = pos?.x ?? 0
      const y = pos?.y ?? 0
      return { ...n, position: { x, y }, draggable: false }
    })
  }

  async function layoutLR() {
    layoutGraph('LR')
    await nextTick()
    fitView({ padding: 0.2 })
  }

  async function layoutTB() {
    layoutGraph('TB')
    await nextTick()
    fitView({ padding: 0.2 })
  }

  async function fitGraph() {
    await nextTick()
    fitView({ padding: 0.2 })
  }

  // Compute style based on task fields (tweak as you like)
  function nodeStyle(t) {
    const pri = (t?.priority || '').toLowerCase()
    const stat = (t?.status || '').toLowerCase()

    let border = '#ccc'
    if (pri === 'high') border = '#e53935'
    else if (pri === 'medium') border = '#fb8c00'
    else if (pri === 'low') border = '#43a047'

    let bg = '#fff'
    if (stat === 'done' || stat === 'completed') bg = '#e8f5e9'
    else if (stat === 'in_progress') bg = '#e3f2fd'
    else if (stat === 'blocked') bg = '#ffebee'

    return {
      width: `${nodeWidth}px`,
      height: `${nodeHeight}px`,
      border: `1px solid ${border}`,
      borderRadius: '8px',
      padding: '8px',
      background: bg,
      fontSize: '13px',
    }
  }

  // Keep graph in sync with store and re-layout
  watch(
    [baseNodes, baseEdges],
    async () => {
      nodes.value = baseNodes.value.slice()
      edges.value = baseEdges.value.slice()
      // initial/refresh layout
      await nextTick()
      layoutGraph(rankdir)
      await nextTick()
      fitView({ padding: 0.2 })
    },
    { immediate: true },
  )

  return {
    // graph
    nodes,
    edges,

    // selection
    selectedId,
    onNodeClick,

    // layout & view
    layoutLR,
    layoutTB,
    fitGraph,
  }
}
