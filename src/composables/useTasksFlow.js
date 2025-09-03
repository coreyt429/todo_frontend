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

  // --- Visual helpers for edges and labels ----------------------------------
  function edgeVisualForTask(t) {
    const pri = (t?.priority || '').toLowerCase()
    const { bucket } = getDueBucket(t)

    // Color priority first, then urgency if overdue/today
    let stroke = '#90a4ae'
    let strokeWidth = 1.5

    if (pri === 'high') {
      stroke = '#e53935'
      strokeWidth = 2.5
    } else if (pri === 'medium') {
      stroke = '#fb8c00'
      strokeWidth = 2
    } else if (pri === 'low') {
      stroke = '#43a047'
      strokeWidth = 2
    }

    if (bucket === 'overdue') {
      stroke = '#e53935'
      strokeWidth = Math.max(strokeWidth, 3)
    } else if (bucket === 'today') {
      stroke = '#fbc02d'
      strokeWidth = Math.max(strokeWidth, 2.5)
    } else if (bucket === 'soon') {
      stroke = '#ffa000'
      strokeWidth = Math.max(strokeWidth, 2)
    }

    const style = { stroke, strokeWidth }
    const animated = bucket === 'overdue'
    return { style, animated }
  }

  function formatNodeLabel(t) {
    const name = t?.name ?? '(unnamed)'
    const pri = (t?.priority || '').toLowerCase()
    const { bucket, days } = getDueBucket(t)

    const priTxt = pri ? pri.charAt(0).toUpperCase() + pri.slice(1) : null
    let dueTxt = null
    if (bucket === 'overdue')
      dueTxt = `D${days}` // negative days
    else if (bucket === 'today') dueTxt = 'D0'
    else if (bucket === 'soon' || bucket === 'later') dueTxt = `D+${days}`

    const bits = [priTxt, dueTxt].filter(Boolean)
    return bits.length ? `${name}  •  ${bits.join(' • ')}` : name
  }

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
        label: formatNodeLabel(t),
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
        {
          const child = ids.get(id)
          const vis = edgeVisualForTask(child)
          edges.push({
            id: `e-${pid}-${id}`,
            source: pid,
            target: id,
            ...vis,
          })
        }
        continue
      }

      // parent missing or null → attach to appropriate virtual root
      if (!pid) {
        const ttype = (t?.type || 'task').toLowerCase()
        const root = ttype === 'project' ? ROOT_PROJECTS_ID : ROOT_TASKS_ID
        {
          const child = ids.get(id) || t
          const vis = edgeVisualForTask(child)
          edges.push({
            id: `e-${root}-${id}`,
            source: root,
            target: id,
            ...vis,
          })
        }
        continue
      }

      // (Optional) If parent is outside filtered set, also attach to root for visibility:
      if (pid && !ids.has(pid)) {
        const ttype = (t?.type || 'task').toLowerCase()
        const root = ttype === 'project' ? ROOT_PROJECTS_ID : ROOT_TASKS_ID
        {
          const child = ids.get(id) || t
          const vis = edgeVisualForTask(child)
          edges.push({
            id: `e-${root}-${id}`,
            source: root,
            target: id,
            ...vis,
          })
        }
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

  // --- Due-date helpers -----------------------------------------------------
  function parseDueTimestamp(t) {
    const candidates = [
      t?.due_ts,
      t?.dueTs,
      t?.due_at,
      t?.dueAt,
      t?.due_date,
      t?.dueDate,
      t?.due,
      t?.deadline,
    ]
    for (const v of candidates) {
      if (v == null) continue
      if (typeof v === 'number' && !Number.isNaN(v)) {
        // Heuristic: seconds vs ms
        const ms = v > 1e12 ? v : v * 1000
        return Number.isFinite(ms) ? ms : null
      }
      if (typeof v === 'string') {
        const ms = Date.parse(v)
        if (!Number.isNaN(ms)) return ms
      }
      if (v instanceof Date) return v.getTime()
    }
    return null
  }

  function getDueBucket(t) {
    const ms = parseDueTimestamp(t)
    if (!ms) return { bucket: 'none', days: null }
    const now = Date.now()
    const diffDays = Math.floor((ms - now) / 86400000) // 86_400_000 ms/day
    if (diffDays < 0) return { bucket: 'overdue', days: diffDays }
    if (diffDays === 0) return { bucket: 'today', days: 0 }
    if (diffDays <= 3) return { bucket: 'soon', days: diffDays }
    return { bucket: 'later', days: diffDays }
  }

  // Compute style based on task fields (priority + status + due timestamp)
  function nodeStyle(t) {
    const pri = (t?.priority || '').toLowerCase()
    const stat = (t?.status || '').toLowerCase()

    // Priority → outer border color/weight
    let borderColor = '#90a4ae' // default blue-grey
    let borderWidth = 1
    if (pri === 'high') {
      borderColor = '#e53935'
      borderWidth = 2
    } else if (pri === 'medium') {
      borderColor = '#fb8c00'
      borderWidth = 2
    } else if (pri === 'low') {
      borderColor = '#43a047'
      borderWidth = 2
    }

    // Status → base background
    let bg = '#ffffff'
    if (stat === 'done' || stat === 'completed') bg = '#e8f5e9'
    else if (stat === 'in_progress') bg = '#e3f2fd'
    else if (stat === 'blocked') bg = '#ffebee'

    // Due bucket → left accent bar + subtle inset to signal urgency
    const { bucket } = getDueBucket(t)
    let dueAccent = '#cfd8dc' // none/unknown
    let inset = ''
    if (bucket === 'overdue') {
      dueAccent = '#e53935'
      inset = 'inset 0 0 0 2px #ffcdd2'
    } else if (bucket === 'today') {
      dueAccent = '#fbc02d'
      inset = 'inset 0 0 0 2px #fff59d'
    } else if (bucket === 'soon') {
      dueAccent = '#ffa000'
      inset = 'inset 0 0 0 2px #ffe082'
    } else if (bucket === 'later') {
      dueAccent = '#43a047'
      inset = 'inset 0 0 0 2px #c8e6c9'
    }

    return {
      width: `${nodeWidth}px`,
      height: `${nodeHeight}px`,
      border: `${borderWidth}px solid ${borderColor}`,
      borderRadius: '8px',
      padding: '8px 8px 8px 10px',
      background: bg,
      fontSize: '13px',
      // due accent on the left
      borderLeft: `6px solid ${dueAccent}`,
      boxShadow: inset,
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
