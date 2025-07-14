<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Todo List</q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { onMounted } from 'vue'
import { useTodoStore } from 'stores/todo'

const todoStore = useTodoStore()

onMounted(() => {
  todoStore.loadTasks()
})

const linksList = [
  {
    title: 'All',
    caption: 'all tasks',
    icon: 'all_inclusive',
    link: '/#/',
  },
  {
    title: 'Overdue',
    caption: 'Overdue tasks',
    icon: 'assignment_late',
    link: '/#/overdue',
  },
  {
    title: 'Today',
    caption: 'Tasks for today',
    icon: 'today',
    link: '/#/today',
  },
  {
    title: 'This Week',
    caption: 'Tasks for the current week',
    icon: 'view_week',
    link: '/#/week',
  },
  {
    title: 'This Month',
    caption: 'Tasks for the current month',
    icon: 'calendar_month',
    link: '/#/month',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
