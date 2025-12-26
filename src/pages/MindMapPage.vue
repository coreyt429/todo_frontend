<template>
  <q-page class="flex">
    <div class="row full-width">
      <div class="col left-column">
        <MindMap
          :tasks="activeTasks"
          @node-select="onNodeSelect"
          @add-child="onAddChild"
          @add-sibling="onAddSibling"
          @move-in="onMoveIn"
        />
      </div>
      <div v-if="todoStore.currentTaskId" class="col right-column">
        <TaskView />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import MindMap from 'components/MindMap.vue'
import { useTodoStore } from 'stores/todo'
import TaskView from 'src/components/TaskView.vue'
import { createTask } from 'src/boot/todoapi'
import { updateTask } from 'src/boot/todoapi'

const todoStore = useTodoStore()

// Use the same filtered list as the TaskList page to keep both views in sync
const activeTasks = computed(() => todoStore.filteredTasks || [])

// Guard to prevent duplicate task creation loops from mind map events
let isCreatingFromMindMap = false

function newUuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`
}

async function createChildTask(parentId, name) {
  if (isCreatingFromMindMap) {
    console.warn('Mind map createChildTask already in progress, skipping duplicate')
    return
  }
  isCreatingFromMindMap = true

  const task = todoStore.taskDefaults ? todoStore.taskDefaults('task') : { name: 'New Task' }
  task.parent = parentId && parentId !== 'mind-map-root' ? parentId : null
  task.name = name || task.name || 'New Task'
  task.task_id = newUuid()

  try {
    const createdId = await createTask(task)
    if (createdId) {
      task.task_id = createdId
    }
    todoStore.allTasks.push(task)
    todoStore.applyFilters()
    todoStore.setCurrentTask(task)
  } catch (err) {
    console.error('Failed to create task from mind map action:', err)
  } finally {
    isCreatingFromMindMap = false
  }
}

function onNodeSelect(taskId) {
  const task = todoStore.taskById(taskId)
  console.log('onNodeSelect: Selected task from mind map:', task)
  if (task) {
    todoStore.setCurrentTask(task)
  }
}

function onAddChild({ parentId, name }) {
  createChildTask(parentId, name)
}

function onAddSibling({ parentId, name }) {
  createChildTask(parentId, name)
}

async function onMoveIn({ movedIds, newParentId }) {
  if (!Array.isArray(movedIds) || movedIds.length === 0) return
  const parent = newParentId && newParentId !== 'mind-map-root' ? newParentId : null

  for (const id of movedIds) {
    const task = todoStore.taskById(id)
    if (!task) continue
    const updated = { ...task, parent }
    try {
      await updateTask(id, updated)
      task.parent = parent
    } catch (err) {
      console.error('Failed to update parent on moveNodeIn:', err)
    }
  }
  todoStore.applyFilters()
}

onMounted(() => {
  todoStore.title = 'Mind Map'
  if (
    !todoStore.allTasks.length ||
    (todoStore.allTasks.length === 1 && todoStore.allTasks[0]?.task_id === 'placeholder')
  ) {
    todoStore.loadTasks()
  }
})
</script>
