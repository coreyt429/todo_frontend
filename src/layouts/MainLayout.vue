<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> {{ todoStore.title }} </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          :startDate="link.startDate"
          :endDate="link.endDate"
          :type="link.type"
        />
      </q-list>
      <q-separator />
      <div class="row justify-end q-mt-md q-gutter-sm">
        <q-btn icon="download" color="primary" @click="downloadBackup" round flat />
        <q-btn icon="filter_list" color="primary" @click="showFilters = !showFilters" round flat />
        <q-btn
          :icon="todoStore.viewMode === 'map' ? 'list' : 'account_tree'"
          color="primary"
          @click="toggleView"
          round
          flat
        >
          <q-tooltip>{{ todoStore.viewMode === 'map' ? 'List View' : 'Mind Map View' }}</q-tooltip>
        </q-btn>
        <!-- Add more action buttons here as needed -->
      </div>
      <q-card v-if="showFilters" class="q-mt-sm">
        <q-card-section>
          <q-checkbox v-model="todoStore.showCompleted" label="Show Completed" color="primary" />
        </q-card-section>
      </q-card>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { menuDefs } from 'src/data/menuDefs'
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { onMounted } from 'vue'
import { useTodoStore } from 'stores/todo'
import { backupData } from 'src/boot/todoapi'

const linksList = menuDefs
const todoStore = useTodoStore()
const showFilters = ref(false)

onMounted(() => {
  todoStore.loadTasks()
  console.log('HERE: ', todoStore.showCompleted.valueOf())
})

const leftDrawerOpen = ref(false)

async function downloadBackup() {
  try {
    const data = await backupData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `todo_data.${timestamp}.json`
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error downloading tasks:', error)
  }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleView() {
  todoStore.viewMode = todoStore.viewMode === 'map' ? 'list' : 'map'
}
</script>
