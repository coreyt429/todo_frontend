<file name=useTasksFlow.js path=/Users/coreyt/Documents/Dev/todo_frontend/src/composables>
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { getDueBucket } from '@/utils/dates'

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
  if (bucket === 'overdue') dueTxt = `D${days}` // negative days
  else if (bucket === 'today') dueTxt = 'D0'
  else if (bucket === 'soon' || bucket === 'later') dueTxt = `D+${days}`

  const bits = [priTxt, dueTxt].filter(Boolean)
  return bits.length ? `${name}  •  ${bits.join(' • ')}` : name
}

export function useTasksFlow() {
  const store = useTasksStore()

  const baseNodes = computed(() => {
    const nodes = []
    const ids = new Map()

    // Base nodes from tasks + virtual roots
    for (const t of store.tasks) {
      ids.set(t.id, t)
    }

    // Base nodes from tasks + virtual roots
    for (const t of store.tasks) {
      nodes.push({
        id: t.id,
        label: formatNodeLabel(t),
      })
    }

    // Add virtual root nodes for tasks without parents
    for (const root of store.virtualRoots) {
      nodes.push({ id: root, label: root })
    }

    return nodes
  })

  const baseEdges = computed(() => {
    const edges = []
    const ids = new Map(store.tasks.map((t) => [t.id, t]))

    for (const t of store.tasks) {
      const id = t.id
      const pid = t.parentId

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
      } else if (!pid) {
        for (const root of store.virtualRoots) {
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
      } else if (pid && !ids.has(pid)) {
        for (const root of store.virtualRoots) {
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
    }

    return edges
  })

  return {
    baseNodes,
    baseEdges,
  }
}
</file>
