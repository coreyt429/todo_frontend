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
import { ref, watch, reactive } from 'vue'
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
  Add: {
    label: 'Add',
    icon: 'add',
    color: 'positive',
    action: () => todoStore.addTask(),
  },
  Delete: {
    label: 'Delete',
    icon: 'delete',
    color: 'negative',
    action: () => todoStore.deleteTask(todoStore.currentTaskId),
  },
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

function save_editorContent() {
  console.log('Saving content for current task:', todoStore.currentTaskId)
  if (todoStore.currentTaskId) {
    console.log('Current task ID:', todoStore.currentTaskId)
    console.log('Current language:', states.lang)
    let content = states.content
    if (states.lang === 'yaml') {
      content = yaml.load(states.content)
      console.log('Parsed YAML content:', content)
    } else {
      content = JSON.parse(states.content)
      console.log('Parsed JSON content:', content)
    }
    todoStore.updateTask(todoStore.currentTaskId, content)
  }
}

load_editorContent()

watch(
  () => todoStore.currentTaskId,
  (newTaskId) => {
    if (newTaskId) {
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
        states.content = yaml.dump(yaml.load(states.content))
      } else {
        states.content = JSON.stringify(yaml.load(states.content), null, 2)
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
