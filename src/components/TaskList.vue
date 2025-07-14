<template>
  <ul>
    <li>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            :label="props.label"
            clickable
            @click="todoStore.setFilters({ parent: null })"
          />
          <q-breadcrumbs-el
            v-for="ancestor in todoStore.getAncestors(todoStore.filters.parent)"
            :key="ancestor.task_id"
            :label="ancestor.name"
            clickable
            @click="todoStore.setFilters({ parent: ancestor.task_id })"
          />
          <q-breadcrumbs-el
            v-if="todoStore.filters.parent"
            :label="todoStore.taskById(todoStore.filters.parent)?.name"
            :key="todoStore.filters.parent"
          />
        </q-breadcrumbs>
      </div>
    </li>
    <li style="display: flex; align-items: center; gap: 8px">
      <q-input
        filled
        v-model="todoStore.filters.search"
        label="Search tasks"
        @keyup="todoStore.applyFilters"
        style="flex: 1"
      />
      <q-btn-dropdown icon="add" color="primary" no-caps label="New">
        <q-list>
          <q-item clickable v-ripple @click="todoStore.addTask('task')">
            <q-item-section>Task</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="todoStore.addTask('project')">
            <q-item-section>Project</q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="todoStore.addTask('template')">
            <q-item-section>Template</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </li>

    <li v-if="todoStore.filteredTasks.length === 0">
      <q-card class="q-pa-md">
        <q-card-section>
          <div style="display: flex; align-items: center; gap: 16px">
            <q-icon name="error_outline" color="negative" size="64px" />
            <div style="font-size: 1.5rem">No tasks found</div>
          </div>
        </q-card-section>
      </q-card>
    </li>
    <li v-for="task in todoStore.filteredTasks" :key="task.id">
      <q-card @click="open_task(task)">
        <q-card-section>
          <q-toolbar>
            <q-avatar
              :icon="status_icons[task.status] || 'help_outline'"
              :color="priority_colors[task.priority] || 'grey'"
            />
            <q-toolbar-title>
              {{ task.name }}
              <div
                class="text-caption"
                @click.stop="todoStore.setFilters({ parent: task.task_id })"
                style="cursor: pointer"
              >
                {{ todoStore.childrenById(task.task_id)?.length || 0 }} subtasks
              </div>
            </q-toolbar-title>
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
const props = defineProps({
  label: {
    type: String,
    required: false,
    default: 'Todo List',
  },
})

const todoStore = useTodoStore()
console.log('HERE:', todoStore.filters.parent)
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
  console.log(task.task_id || task.template_id)
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
