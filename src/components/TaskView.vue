// Here We need a component to display the details of a task // the component wil be called with a
task object as a prop // We should show an editor with the json representation of the task
<template>
  <q-card v-if="current_task">
    <q-card-section>
      <q-toolbar>
        <q-toolbar-title>Edit Task</q-toolbar-title>
      </q-toolbar>
      <q-input v-model="taskJson" type="textarea" autogrow label="Task JSON" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useTodoStore } from 'stores/todo'
const todoStore = useTodoStore()
const current_task = todoStore.current_task

import { ref, watch } from 'vue'

const taskJson = ref(JSON.stringify(current_task, null, 2))

watch(
  () => todoStore.current_task,
  (newTask) => {
    taskJson.value = JSON.stringify(newTask, null, 2)
  },
)
</script>
