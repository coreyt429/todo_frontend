<template>
  <div id="map" ref="mapContainer"></div>
</template>
<script setup>
import MindElixir from 'mind-elixir'
import 'mind-elixir/style.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

function getPriorityRank(priority) {
  if (!priority) return 9
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 0
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'low':
      return 3
    default:
      return 9
  }
}

function getTaskTimestamp(task) {
  const timestamps = task.timestamp || task.timestamps || {}
  const tickle = timestamps.tickle || task.tickle
  const due = timestamps.due || task.due
  const created = timestamps.created || task.created
  if (tickle) return tickle
  if (due) return due
  if (created) return created
  return null
}

function getNodeStyle(task) {
  const ts = getTaskTimestamp(task)
  let dueDate = null
  if (ts) {
    const parsedDate = new Date(ts)
    if (!isNaN(parsedDate)) {
      dueDate = parsedDate
    }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (dueDate) {
    if (dueDate < today) {
      return { background: '#000000', color: '#f44336' }
    } else if (dueDate < tomorrow) {
      return { background: '#000000', color: '#ff9800' }
    }
  }

  const priority = (task.priority || '').toLowerCase()
  if (priority === 'high' || priority === 'urgent') {
    return { background: '#000000', color: '#ff9800' }
  } else if (priority === 'medium') {
    return { background: '#000000', color: '#ffeb3b' }
  } else if (priority === 'low') {
    return { background: '#000000', color: '#4caf50' }
  }

  return null
}

const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['node-select', 'add-child', 'add-sibling', 'move-in'])

const mapContainer = ref(null)
const mindInstance = ref(null)
let logTimer = null

const activeTasks = computed(() =>
  (props.tasks || []).filter(
    (task) => !['completed', 'skipped'].includes((task.status || '').toLowerCase()),
  ),
)

function buildMindData() {
  const nodes = new Map()
  const roots = []

  activeTasks.value.forEach((task) => {
    const node = {
      id: task.task_id,
      topic: task.name || 'Untitled task',
      expanded: true,
      tags: task.priority && task.priority !== 'Not set' ? [task.priority] : undefined,
      children: [],
    }
    const ts = getTaskTimestamp(task)
    if (ts) {
      node.note = `Due: ${ts}`
    }
    const style = getNodeStyle(task)
    if (style) {
      node.style = style
    }
    nodes.set(task.task_id, node)
  })

  const sortedTasks = [...activeTasks.value].sort((a, b) => {
    const pa = getPriorityRank(a.priority)
    const pb = getPriorityRank(b.priority)
    if (pa !== pb) return pa - pb

    const da = getTaskTimestamp(a)
    const db = getTaskTimestamp(b)

    if (da && db) {
      const dateA = new Date(da)
      const dateB = new Date(db)
      if (!isNaN(dateA) && !isNaN(dateB)) {
        if (dateA < dateB) return -1
        if (dateA > dateB) return 1
      }
    } else if (da && !db) {
      return -1
    } else if (!da && db) {
      return 1
    }

    return (a.name || '').localeCompare(b.name || '')
  })

  sortedTasks.forEach((task, index) => {
    const node = nodes.get(task.task_id)
    if (!node) return
    const parentId = task.parent
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId)?.children?.push(node)
    } else {
      node.direction = index % 2
      roots.push(node)
    }
  })

  return {
    nodeData: {
      id: 'mind-map-root',
      topic: 'Todo Mind Map',
      expanded: true,
      children: roots,
    },
  }
}

function renderMindMap() {
  if (!mapContainer.value) return
  const data = buildMindData()

  // if (mindInstance.value?.destroy) {
  //   mindInstance.value.destroy()
  // }
  if (!mindInstance.value) {
    mindInstance.value = new MindElixir({
      el: mapContainer.value,
      // Use SIDE so branches distribute around the root instead of a single side
      direction: MindElixir.SIDE,
    })
    mindInstance.value.init(data)
  } else {
    mindInstance.value.refresh(data)
  }

  // MindElixir fires "selectNewNode" when a node is selected
  // mindInstance.value.bus?.addListener?.('selectNewNode', (nodeObj) => {
  //   console.log('selectNewNode: Node selected:', nodeObj)
  //   if (!nodeObj) return
  //   emit('node-select', nodeObj.id)
  // })
  mindInstance.value.bus?.addListener?.('operation', (operation) => {
    console.log('operation event:', operation)
    if (!operation?.name) return
    if (operation.name === 'addChild') {
      const parentId =
        operation.obj?.parent?.id || mindInstance.value?.currentNode?.nodeObj?.id || null
      emit('add-child', { parentId, name: operation.obj?.topic || 'New Task' })
    } else if (operation.name === 'insertSibling') {
      const parentId =
        operation.obj?.parent?.id || mindInstance.value?.currentNode?.nodeObj?.parent?.id || null
      emit('add-sibling', { parentId, name: operation.obj?.topic || 'New Task' })
    } else if (operation.name === 'moveNodeIn') {
      const movedIds = (operation.objs || []).map((o) => o.id).filter(Boolean)
      const newParentId = operation.toObj?.id || null
      emit('move-in', { movedIds, newParentId })
    }
  })
  mindInstance.value.bus?.addListener('selectNodes', (nodes) => {
    const node = nodes[0]
    if (!node) return
    // node is the NodeObj, with your task_id in node.id
    console.log('selected node:', node)
    emit('node-select', node.id)
    // e.g. emit, update a ref, or dispatch to your store:
    // currentTaskId.value = node.id
  })
}

function startLogTimer() {
  if (logTimer) {
    clearInterval(logTimer)
  }
  logTimer = setInterval(() => {
    console.log('MindMap current node:', mindInstance.value?.currentNode || null)
  }, 10000)
}

watch(
  activeTasks,
  () => {
    renderMindMap()
  },
  { deep: true },
)

onMounted(() => {
  renderMindMap()
  startLogTimer()
})

onBeforeUnmount(() => {
  if (mindInstance.value?.destroy) {
    mindInstance.value.destroy()
  }
  if (logTimer) {
    clearInterval(logTimer)
    logTimer = null
  }
})
</script>
<style scoped>
#map {
  width: 100%;
  height: 90%;
}
</style>
