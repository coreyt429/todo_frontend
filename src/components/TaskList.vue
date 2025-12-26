<template>
  <ul>
    <li>
      <div class="q-pa-md q-gutter-sm">
        <q-breadcrumbs>
          <q-breadcrumbs-el
            :label="labelText"
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
      <q-select
        dense
        outlined
        v-model="contextSelection"
        :options="contextOptions"
        label="Context"
        style="width: 180px"
        emit-value
        map-options
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
            <div class="text-caption row items-center q-gutter-xs">
              <span>Due:</span>
              <q-btn-dropdown
                dense
                flat
                size="sm"
                color="primary"
                :label="format_due_date(task.timestamps?.due ?? null)"
                @click.stop
              >
                <q-list style="min-width: 180px">
                  <q-item clickable v-ripple @click.stop="setDue(task, 'tomorrow')">
                    <q-item-section>Tomorrow</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click.stop="setDue(task, 'nextWeek')">
                    <q-item-section>Next Monday</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click.stop="setDue(task, 'nextMonth')">
                    <q-item-section>First of Next Month</q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </div>
          </q-toolbar>
          <div class="text-subtitle2">{{ task.notes }}</div>
        </q-card-section>
      </q-card>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'
import { useTodoStore } from 'stores/todo'
const props = defineProps({
  label: {
    type: String,
    required: false,
    default: 'Todo List',
  },
})

const todoStore = useTodoStore()
const labelText = computed(() => todoStore.activeLabel || props.label)
const hasUnassigned = computed(() =>
  todoStore.allTasksCombined.some(
    (t) => t.task_id !== 'placeholder' && (t.context === null || t.context === undefined || t.context === ''),
  ),
)

const contextOptions = computed(() => {
  const options = [{ label: 'All', value: 'All' }]
  if (hasUnassigned.value) {
    options.push({ label: 'Unassigned', value: 'Unassigned' })
  }
  const ctxs = todoStore.contexts || []
  ctxs.forEach((ctx) => {
    if (ctx === null || ctx === undefined || ctx === '') return
    options.push({ label: ctx, value: ctx })
  })
  return options
})

const contextSelection = computed({
  get: () => todoStore.filters.context || 'All',
  set: (val) => {
    todoStore.setFilters({ context: val || 'All' })
  },
})
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

function cob(date) {
  const d = new Date(date)
  d.setHours(17, 0, 0, 0)
  return d
}

function nextMonday(base) {
  const d = new Date(base)
  const day = d.getDay()
  const diff = (8 - day) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d
}

function firstOfNextMonth(base) {
  const d = new Date(base)
  d.setMonth(d.getMonth() + 1, 1)
  return d
}

async function setDue(task, option) {
  const now = new Date()
  let target
  if (option === 'tomorrow') target = cob(new Date(now.setDate(now.getDate() + 1)))
  else if (option === 'nextWeek') target = cob(nextMonday(new Date()))
  else if (option === 'nextMonth') target = cob(firstOfNextMonth(new Date()))
  else return

  const ts = { ...(task.timestamps || {}) }
  const newIso = target.toISOString()

  const due = ts.due ? new Date(ts.due) : null
  const tickle = ts.tickle ? new Date(ts.tickle) : null

  // Only push forward dates; do not move earlier than existing values
  if (!due || due < target) ts.due = newIso
  if (!tickle || tickle < target) ts.tickle = newIso

  const updates = { ...task, timestamps: ts }
  try {
    await todoStore.updateTask(task.task_id, updates)
    task.timestamps = updates.timestamps
    todoStore.applyFilters()
  } catch (err) {
    console.error('Failed to update due date:', err)
  }
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
