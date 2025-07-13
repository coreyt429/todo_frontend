<template>
  <q-page class="flex flex-center">
    <div class="row full-width">
      <div cols="6" class="col">
        <TaskList />
      </div>
      <div v-if="current_task" cols="6" class="col">
        <TaskView />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import TaskList from 'src/components/TaskList.vue'
import { getCurrentInstance } from 'vue'
import { useTodoStore } from 'stores/todo'

const todoStore = useTodoStore()
const current_task = todoStore.current_task
const { proxy } = getCurrentInstance()
console.log(proxy.$apiKey)
</script>
