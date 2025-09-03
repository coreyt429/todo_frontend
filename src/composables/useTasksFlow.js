// src/composables/useTasksFlow.js
import { ref, computed, watch, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import dagre from '@dagrejs/dagre'

const ROOT_PROJECTS_ID = 'root-projects'
const ROOT_TASKS_ID = 'root-tasks'

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

  // Virtual root nodes
  const virtualRootNodes = computed(() => [
    {
      id: ROOT_PROJECTS_ID,
      type: 'input',
      data: { label: 'Projects' },
      position: { x: 0, y: 0 },
      draggable: false,
      style: {
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        border: '2px solid #546e7a',
        borderRadius: '10px',
        padding: '8px',
        background: '#eceff1',
        fontWeight: '600',
      },
    },
    {
      id: ROOT_TASKS_ID,
      type: 'input',
      data: { label: 'Tasks' },
      position: { x: 0, y: 0 },
      draggable: false,
      style: {
        width: `${nodeWidth}px`,
        height: `${nodeHeight}px`,
        border: '2px solid #455a64',
        borderRadius: '10px',
        padding: '8px',
        background: '#e3f2fd',
        fontWeight: '600',
      },
    },
  ])

  // Base nodes from tasks + virtual roots
  const baseNodes = computed(() => {
    const real = tasks.value.map((t) => ({
      id: t.task_id,
      data: {
        label: t.name ?? '(unnamed)',
        task: t,
      },
      position: { x: 0, y: 0 }, // dagre will place
      draggable: false,
      style: nodeStyle(t),
    }))
    return [...virtualRootNodes.value, ...real]
  })

  // Base edges:
  // - normal parent->child when both exist in the filtered set
  // - OR, if no parent, attach to Projects/Tasks virtual root based on t.type
  const baseEdges = computed(() => {
    const ids = taskMap.value
    const edges = []

    for (const t of tasks.value) {
      const id = t.task_id
      const pid = t.parent

      if (pid && ids.has(pid) && ids.has(id)) {
        edges.push({
          id: `e-${pid}-${id}`,
          source: pid,
          target: id,
        })
        continue
      }

      // parent missing or null → attach to appropriate virtual root
      if (!pid) {
        const ttype = (t?.type || 'task').toLowerCase()
        const root = ttype === 'project' ? ROOT_PROJECTS_ID : ROOT_TASKS_ID
        edges.push({
          id: `e-${root}-${id}`,
          source: root,
          target: id,
        })
        continue
      }

      // (Optional) If parent is outside filtered set, also attach to root for visibility:
      if (pid && !ids.has(pid)) {
        const ttype = (t?.type || 'task').toLowerCase()
        const root = ttype === 'project' ? ROOT_PROJECTS_ID : ROOT_TASKS_ID
        edges.push({
          id: `e-${root}-${id}`,
          source: root,
          target: id,
        })
      }
    }

    return edges
  })

  // Reactive clones used by Vue Flow (positions are applied here)
  const nodes = ref([])
  const edges = ref([])

  // Selection helpers
  const selectedId = ref(null)
  const onNodeClick = (_evt, node) => {
    selectedId.value = node?.id ?? null
  }

  // Vue Flow API
  const { fitView } = useVueFlow()

  // --- Layout with Dagre ---
  function layoutGraph(direction = rankdir) {
    const g = new dagre.graphlib.Graph()
      .setGraph({ rankdir: direction, nodesep, ranksep })
      .setDefaultEdgeLabel(() => ({}))

    for (const n of nodes.value) g.setNode(n.id, { width: nodeWidth, height: nodeHeight })
    for (const e of edges.value) g.setEdge(e.source, e.target)

    dagre.layout(g)

    nodes.value = nodes.value.map((n) => {
      const pos = g.node(n.id)
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

  // Compute style based on task fields
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

  // Sync graph with store + layout
  watch(
    [baseNodes, baseEdges],
    async () => {
      nodes.value = baseNodes.value.slice()
      edges.value = baseEdges.value.slice()
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

    // expose root ids if the page wants to pin/focus them
    ROOT_PROJECTS_ID,
    ROOT_TASKS_ID,
  }
}
