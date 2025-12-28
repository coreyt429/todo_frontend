// Here We need a component to display the details of a task // the component wil be called with a
task object as a prop // We should show an editor with the json representation of the task
<template>
  <q-card v-if="todoStore.currentTaskId">
    <q-card-section>
      <q-bar>
        <div>{{ taskLabel }}</div>
        <q-space />
        <div class="col-4 flex justify-end">
          <q-btn-toggle
            v-model="states.lang"
            :options="[
              { label: 'YAML', value: 'yaml' },
              { label: 'JSON', value: 'json' },
            ]"
            no-caps
            rounded
            unelevated
            outlined
            toggle-color="positive"
            color="grey-3"
            text-color="primary"
            class="q-ml-md"
          />
        </div>
        <q-btn flat round icon="close" class="q-ml-auto" @click="todoStore.currentTaskId = null" />
      </q-bar>
    </q-card-section>

    <q-separator />

    <q-card-section class="row items-center q-gutter-md">
      <div class="text-caption row items-center q-gutter-xs">
        <span>Due:</span>
        <q-btn-dropdown
          dense
          flat
          size="sm"
          color="primary"
          :label="formatDue(currentTask?.timestamps?.due || null)"
        >
          <q-list style="min-width: 200px">
            <q-item clickable v-ripple @click.stop="setDue(currentTask, 'today')">
              <q-item-section>Today</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click.stop="setDue(currentTask, 'tomorrow')">
              <q-item-section>Tomorrow</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click.stop="setDue(currentTask, 'nextWeek')">
              <q-item-section>Next Monday</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click.stop="setDue(currentTask, 'nextMonth')">
              <q-item-section>First of Next Month</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click.stop="setDue(currentTask, 'nextQuarter')">
              <q-item-section>First of Next Quarter</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="text-caption row items-center q-gutter-xs">
        <span>Status:</span>
        <q-btn-dropdown
          dense
          flat
          size="sm"
          color="primary"
          :label="currentTask.status || 'Not set'"
        >
          <q-list style="min-width: 180px">
            <q-item
              v-for="opt in statusOptions"
              :key="opt.value"
              clickable
              v-ripple
              @click.stop="setStatus(currentTask, opt.value)"
            >
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
      <div class="text-caption row items-center q-gutter-xs">
        <span>Context:</span>
        <q-btn-dropdown
          dense
          flat
          size="sm"
          color="primary"
          :label="formatContext(currentTask.context)"
        >
          <q-list style="min-width: 200px">
            <q-item clickable v-ripple @click.stop="setContext(currentTask, null)">
              <q-item-section>Unassigned</q-item-section>
            </q-item>
            <q-item
              v-for="opt in contextOptions"
              :key="opt.value"
              clickable
              v-ripple
              @click.stop="setContext(currentTask, opt.value)"
            >
              <q-item-section>{{ opt.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <VAceEditor
        ref="aceRef"
        v-model:value="states.content"
        class="vue-ace-editor full-width"
        :placeholder="`Enter your ${states.lang} code here`"
        :lang="states.lang"
        :theme="states.theme"
        :options="{
          useWorker: true,
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true,
          wrapBehavioursEnabled: false,
        }"
      />
    </q-card-section>
    <q-separator />
    <q-card-section class="row items-center">
      <!-- Configurable Buttons -->
      <div class="q-pa-md row justify-center">
        <q-btn
          v-for="(button, index) in buttons"
          :key="index"
          :label="button.label"
          :icon="button.icon"
          :color="button.color"
          @click="button.action"
          class="q-mx-sm"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { useTodoStore } from 'stores/todo'
import { VAceEditor } from 'vue3-ace-editor'
import 'src/plugins/ace-config'
import yaml from 'js-yaml'
const todoStore = useTodoStore()
const taskLabel = ref('Edit Task')
const states = reactive({
  lang: 'yaml',
  theme: 'github_dark',
  content: null,
})
const currentTask = computed(() => todoStore.taskById(todoStore.currentTaskId) || {})

const buttons = ref({
  Save: {
    label: 'Save',
    icon: 'save',
    color: 'primary',
    action: () => save_editorContent(),
  },
  Reset: {
    label: 'Reset',
    icon: 'refresh',
    color: 'secondary',
    action: () => load_editorContent(),
  },

  Delete: {
    label: 'Delete',
    icon: 'delete',
    color: 'negative',
    action: () => todoStore.deleteTask(todoStore.currentTaskId),
  },
})

const statusOptions = computed(() => {
  const set = new Set(['not_started', 'in_progress', 'blocked', 'completed', 'skipped'])
  todoStore.allTasksCombined.forEach((t) => {
    if (t.status) set.add(t.status)
  })
  return Array.from(set).map((s) => ({ label: s, value: s }))
})
const contextOptions = computed(() => {
  const set = new Set()
  todoStore.contexts.forEach((c) => {
    if (c !== null && c !== undefined && c !== '') set.add(c)
  })
  return Array.from(set).map((c) => ({ label: c, value: c }))
})

function load_editorContent() {
  console.log('Loading content for current task:', todoStore.currentTaskId)
  if (todoStore.currentTaskId) {
    console.log('Current task ID:', todoStore.currentTaskId)
    console.log('Current language:', states.lang)
    if (states.lang === 'yaml') {
      console.log('Loading task in YAML format')
      states.content = yaml.dump(todoStore.taskById(todoStore.currentTaskId))
      console.log('YAML content:', states.content)
    } else {
      console.log('Loading task in JSON format')
      states.content = JSON.stringify(todoStore.taskById(todoStore.currentTaskId), null, 2)
      console.log('JSON content:', states.content)
    }
  }
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

function firstOfNextQuarter(base) {
  const d = new Date(base)
  const month = d.getMonth()
  const nextQuarterMonth = Math.floor(month / 3) * 3 + 3
  d.setMonth(nextQuarterMonth, 1)
  return d
}

function formatDue(due) {
  if (!due) return 'No due date'
  const date = new Date(due)
  if (isNaN(date)) return 'Invalid'
  const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  return date.toLocaleString(undefined, options)
}

async function setDue(task, option) {
  if (!task) return
  const now = new Date()
  let target
  if (option === 'today') target = cob(new Date())
  else if (option === 'tomorrow') target = cob(new Date(now.setDate(now.getDate() + 1)))
  else if (option === 'nextWeek') target = cob(nextMonday(new Date()))
  else if (option === 'nextMonth') target = cob(firstOfNextMonth(new Date()))
  else if (option === 'nextQuarter') target = cob(firstOfNextQuarter(new Date()))
  else return

  const ts = { ...(task.timestamps || {}) }
  const newIso = target.toISOString()
  const due = ts.due ? new Date(ts.due) : null
  const tickle = ts.tickle ? new Date(ts.tickle) : null
  if (!due || due < target) ts.due = newIso
  if (!tickle || tickle < target) ts.tickle = newIso

  const updates = { ...task, timestamps: ts }
  try {
    await todoStore.updateTask(task.task_id, updates)
    task.timestamps = updates.timestamps
    todoStore.applyFilters()
    load_editorContent()
  } catch (err) {
    console.error('Failed to update due date:', err)
  }
}

async function setStatus(task, status) {
  if (!task || !status) return
  const updates = { ...task, status }
  try {
    await todoStore.updateTask(task.task_id, updates)
    task.status = status
    todoStore.applyFilters()
    load_editorContent()
  } catch (err) {
    console.error('Failed to update status:', err)
  }
}

function formatContext(ctx) {
  if (ctx === null || ctx === undefined || ctx === '') return 'Unassigned'
  return ctx
}

async function setContext(task, context) {
  if (!task) return
  const normalized = context === '' ? null : context
  const updates = { ...task, context: normalized }
  try {
    await todoStore.updateTask(task.task_id, updates)
    task.context = normalized
    todoStore.applyFilters()
    load_editorContent()
  } catch (err) {
    console.error('Failed to update context:', err)
  }
}

function save_editorContent() {
  console.log('Saving content for current task:', todoStore.currentTaskId)
  if (todoStore.currentTaskId) {
    console.log('Current task ID:', todoStore.currentTaskId)
    console.log('Current language:', states.lang)
    let content = states.content
    if (states.lang === 'yaml') {
      try {
        console.log('Parsing YAML content')
        content = yaml.load(states.content)
        console.log('Parsed YAML content:', content)
      } catch (e) {
        console.error('Failed to parse YAML:', e)
        alert('Invalid YAML format. Please check your input.')
        return
      }
    } else {
      try {
        content = JSON.parse(states.content)
        console.log('Parsed JSON content:', content)
      } catch (e) {
        console.error('Failed to parse JSON:', e)
        alert('Invalid JSON format. Please check your input.')
        return
      }
    }
    todoStore.updateTask(todoStore.currentTaskId, content)
  }
}

load_editorContent()

watch(
  () => todoStore.currentTaskId,
  (newTaskId) => {
    console.log('Current task ID changed:', newTaskId)
    if (newTaskId) {
      console.log('Loading editor content for new task ID:', newTaskId)
      load_editorContent()
    }
    console.log('Current task updated:', newTaskId)
    console.log('Task JSON:', states.content.value)
  },
)

// watch for changes to states.lang and update editor content accordingly
watch(
  () => states.lang,
  (newLang) => {
    console.log('Language changed:', newLang)
    if (states.content !== null) {
      if (newLang === 'yaml') {
        try {
          states.content = yaml.dump(yaml.load(states.content))
        } catch (e) {
          console.error('Failed to convert JSON to YAML:', e)
          alert('Invalid JSON format. Please check your input.')
        }
      } else {
        try {
          states.content = JSON.stringify(yaml.load(states.content), null, 2)
        } catch (e) {
          console.error('Failed to convert YAML to JSON:', e)
          alert('Invalid YAML format. Please check your input.')
        }
      }
    }
  },
)

// Map Ctrl+S / Cmd+S to Save action
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    save_editorContent()
  }
})
</script>

<style scoped>
.vue-ace-editor {
  font-size: 16px;
  border: 1px solid;
  width: 100%;
  height: auto;
  min-height: 300px;
  max-height: 80vh;
  resize: vertical;
  overflow: auto;
}
.vue-ace-editor .ace_content {
  height: 100%;
}
</style>
