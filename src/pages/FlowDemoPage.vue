<script setup>
import FlowDemo from 'src/components/FlowDemo.vue'
import { useTodoStore } from 'stores/todo'
import { computed } from 'vue'
import { getDueBucket } from 'src/plugins/dateUtils.js'

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

// Base nodes from tasks + virtual roots
const todoStore = useTodoStore()
const nodes = computed(() => {
  const tasks = todoStore.tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
  console.log(`FlowDemoPage: (nodes) ${JSON.stringify(tasks, null, 2)}`)
  return tasks.map((t) => ({
    id: t.id,
    label: formatNodeLabel(t),
    data: t,
  }))
})

const edges = computed(() => {
  const tasks = todoStore.tasks.filter((t) => t.status !== 'completed' && t.status !== 'skipped')
  console.log(`FlowDemoPage: (edges) ${JSON.stringify(tasks, null, 2)}`)
  const edgesArr = []
  const ids = new Map(tasks.map((t) => [t.id, t]))

  // Build edges based on parent-child relationships
  for (const t of tasks) {
    const id = t.id
    const pid = t.parentId
    if (pid && ids.has(pid) && ids.has(id)) {
      {
        const child = ids.get(id)
        const vis = edgeVisualForTask(child)
        edgesArr.push({
          id: `e-${pid}-${id}`,
          source: pid,
          target: id,
          ...vis,
        })
      }
    } else if (!pid) {
      for (const root of ['virtualRoot1', 'virtualRoot2']) {
        {
          const child = ids.get(id) || t
          const vis = edgeVisualForTask(child)
          edgesArr.push({
            id: `e-${root}-${id}`,
            source: root,
            target: id,
            ...vis,
          })
        }
      }
    } else if (pid && !ids.has(pid)) {
      for (const root of ['virtualRoot1', 'virtualRoot2']) {
        {
          const child = ids.get(id) || t
          const vis = edgeVisualForTask(child)
          edgesArr.push({
            id: `e-${root}-${id}`,
            source: root,
            target: id,
            ...vis,
          })
        }
      }
    }
  }
  console.log(`FlowDemoPage: ${JSON.stringify(edgesArr, null, 2)}`)
  return edgesArr
})

// Dummy placeholders for missing properties
const selectedId = null
function onNodeClick() {}
function layoutLR() {}
function layoutTB() {}
function fitGraph() {}

console.log(nodes, edges, selectedId, onNodeClick, layoutLR, layoutTB, fitGraph)
</script>

<template>
  <q-page padding>
    <FlowDemo
      v-model:nodes="nodes"
      v-model:edges="edges"
      :fit-view-on-init="true"
      @node-click="onNodeClick"
    />
  </q-page>
</template>
