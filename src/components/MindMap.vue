<template>
  <div id="map" ref="mapContainer"></div>
</template>
<script setup>
import MindElixir from 'mind-elixir'
import 'mind-elixir/style.css'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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
    nodes.set(task.task_id, {
      id: task.task_id,
      topic: task.name || 'Untitled task',
      expanded: true,
      tags: task.priority && task.priority !== 'Not set' ? [task.priority] : undefined,
      children: [],
    })
  })

  const sortedTasks = [...activeTasks.value].sort((a, b) =>
    (a.name || '').localeCompare(b.name || ''),
  )

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

  if (mindInstance.value?.destroy) {
    mindInstance.value.destroy()
  }

  mindInstance.value = new MindElixir({
    el: mapContainer.value,
    // Use SIDE so branches distribute around the root instead of a single side
    direction: MindElixir.SIDE,
  })
  mindInstance.value.init(data)

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
