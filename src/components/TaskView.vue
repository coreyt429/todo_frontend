// Here We need a component to display the details of a task // the component wil be called with a
task object as a prop // We should show an editor with the json representation of the task
<template>
  <q-card v-if="todoStore.currentTaskId">
    <q-card-section>
      <q-bar>
        <div>{{ taskLabel }}</div>
        <q-space />
        <q-btn flat round icon="close" class="q-ml-auto" @click="todoStore.currentTaskId = null" />
      </q-bar>
      <q-input v-model="taskJson" type="textarea" autogrow label="Task JSON" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useTodoStore } from 'stores/todo'
const todoStore = useTodoStore()
const taskLabel = ref('Edit Task')
import { ref, watch } from 'vue'

const taskJson = ref(JSON.stringify(todoStore.taskById(todoStore.currentTaskId), null, 2))
console.log('Current task:', todoStore.currentTaskId)
console.log('Task JSON:', taskJson.value)

watch(
  () => todoStore.currentTaskId,
  (newTaskId) => {
    taskJson.value = JSON.stringify(todoStore.taskById(newTaskId), null, 2)
    console.log('Current task updated:', newTaskId)
    console.log('Task JSON:', taskJson.value)
  },
)
</script>
