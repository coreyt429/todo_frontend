<template>
  <ul>
    <li style="display: flex; align-items: center; gap: 8px">
      <q-input
        filled
        v-model="todoStore.filters.search"
        label="Search tasks"
        @keyup="todoStore.applyFilters"
        style="flex: 1"
      />
      <q-btn icon="add" color="primary" round @click="() => todoStore.addTask()" />
    </li>
    <li v-for="task in todoStore.filteredTasks" :key="task.id">
      <q-card @click="open_task(task)">
        <q-card-section>
          <q-toolbar>
            <q-avatar
              :icon="status_icons[task.status] || 'help_outline'"
              :color="priority_colors[task.priority] || 'grey'"
            />
            <q-toolbar-title>{{ task.name }}</q-toolbar-title>
            <div class="text-caption">Due: {{ format_due_date(task.timestamps?.due ?? null) }}</div>
          </q-toolbar>
          <div class="text-subtitle2">{{ task.notes }}</div>
        </q-card-section>
      </q-card>
    </li>
  </ul>
</template>

<script setup>
import { useTodoStore } from 'stores/todo'
const todoStore = useTodoStore()
const status_icons = {
  not_started: 'inbox',
  in_progress: 'construction',
  blocked: 'block',
  completed: 'check_circle',
}
const priority_colors = {
  high: 'red',
  medium: 'orange',
  low: 'green',
}

function open_task(task) {
  console.log('Opening task:', task)
  console.log(task.task_id)
  todoStore.setCurrentTask(task)
}

function format_due_date(due) {
  if (!due) return 'No due date'
  const date = new Date(due)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()

  // const hours = date.getHours()
  // const minutes = date.getMinutes()
  const pad = (n) => n.toString().padStart(2, '0')
  // const timeStr = `${pad(hours)}:${pad(minutes)}`
  const time12 = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (isToday) return `Today ${time12}`
  if (isTomorrow) return `Tomorrow ${time12}`

  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${time12}`
}
</script>

<style scoped>
.q-card {
  margin: 10px 0;
  width: 100%;
  box-sizing: border-box;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
li {
  margin: 10px 0;
  width: 100%;
}
</style>
