<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> {{ todoStore.title }} </q-toolbar-title>

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
    title: 'Today',
    caption: 'Tasks For Today',
    icon: 'today',
    link: '/#/',
  },
  {
    title: 'Overdue',
    caption: 'Tasks That Are Overdue',
    icon: 'assignment_late',
    link: '/#/overdue',
  },

  {
    title: 'This Week',
    caption: 'Tasks For This Week',
    icon: 'view_week',
    link: '/#/week',
  },
  {
    title: 'This Month',
    caption: 'Tasks For This Month',
    icon: 'calendar_month',
    link: '/#/month',
  },
  {
    title: 'All',
    caption: 'All Tasks',
    icon: 'all_inclusive',
    link: '/#/all',
  },
  {
    title: 'Projects',
    caption: 'Project Overview',
    icon: 'view_timeline',
    link: '/#/projects',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
