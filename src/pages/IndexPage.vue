<template>
  <q-page class="flex">
    <div class="row full-width">
      <div cols="6" class="col left-column">
        <TaskList :label="props.label" />
      </div>
      <div v-if="todoStore.currentTaskId" cols="6" class="col right-column">
        <TaskView />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import TaskList from 'src/components/TaskList.vue'
import TaskView from 'src/components/TaskView.vue'
// import { getCurrentInstance } from 'vue'
import { useTodoStore } from 'stores/todo'
import { watch, onMounted } from 'vue'

const todoStore = useTodoStore()
// const { proxy } = getCurrentInstance()
const props = defineProps({
  startDate: {
    type: [Date, Function],
    required: false,
    default: null,
  },
  endDate: {
    type: [Date, Function],
    required: false,
    default: null,
  },
  title: {
    type: String,
    required: false,
    default: 'Title Missing',
  },
  label: {
    type: String,
    required: false,
    default: 'Label Missing',
  },
  type: {
    type: Array,
    required: false,
    default: () => ['task', 'project'],
  },
})

onMounted(() => {
  if (props.startDate && props.endDate) {
    console.log('Start and end dates provided:', props.startDate, props.endDate)
    todoStore.setFilters({
      startDate: props.startDate,
      end: props.endDate,
    })
  } else {
    console.log('No start or end date provided')
  }

  if (
    !todoStore.activeTasks.length ||
    (todoStore.activeTasks.length === 1 && todoStore.activeTasks[0]?.task_id === 'placeholder')
  ) {
    todoStore.loadTasks()
  }
})

watch(
  () => [props.type, props.endDate, props.startDate],
  () => {
    todoStore.setFilters(props)
  },
  { immediate: true },
)

watch(
  () => [props.startDate, props.endDate],
  ([start, end]) => {
    if (start && end) {
      console.log('Updated start/end from route props:', start, end)
      todoStore.setFilters({
        date: {
          start,
          end,
        },
      })
    }
  },
  { immediate: true },
)

watch(
  () => props.title,
  (newTitle) => {
    console.log('Updating title from props:', newTitle, todoStore.title)
    ;((todoStore.title = newTitle || 'Todo List'), todoStore.setFilters({ parent: null }))
  },
  { immediate: true },
)
watch(
  () => todoStore.currentTaskId?.value,
  (taskId) => {
    if (taskId) {
      console.log(JSON.stringify(todoStore.taskById(taskId), null, 2))
    }
  },
)
</script>

<style scoped>
.right-column {
  padding-left: 10px;
}
.left-column {
  padding-right: 10px;
}
</style>
