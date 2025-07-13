<template>
  <q-page class="flex">
    <div class="row full-width">
      <div cols="6" class="col left-column">
        <TaskList />
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
    type: Date,
    required: false,
    default: null,
  },
  endDate: {
    type: Date,
    required: false,
    default: null,
  },
})
onMounted(() => {
  if (props.startDate && props.endDate) {
    console.log('Start and end dates provided:', props.startDate, props.endDate)
    todoStore.setFilters({
      date: {
        start: props.startDate,
        end: props.endDate,
      },
    })
  } else {
    console.log('No start or end date provided')
  }
})

watch(
  () => todoStore.currentTaskId,
  (taskId) => {
    console.log(JSON.stringify(todoStore.taskById(taskId), null, 2))
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
