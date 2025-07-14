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

const now = new Date()
const dayOfWeek = now.getDay()
const diffToSunday = now.getDate() - dayOfWeek
const diffToSaturday = now.getDate() + (6 - dayOfWeek)

const linksList = [
  {
    title: 'Today',
    caption: 'Tasks For Today',
    icon: 'today',
    link: '/#/',
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(24, 0, 0, 0)),
    type: ['project', 'task'],
  },
  {
    title: 'Overdue',
    caption: 'Tasks That Are Overdue',
    icon: 'assignment_late',
    link: '/#/overdue',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: now,
    type: ['project', 'task'],
  },

  {
    title: 'This Week',
    caption: 'Tasks For This Week',
    icon: 'view_week',
    link: '/#/week',
    startDate: new Date(now.setDate(diffToSunday)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setDate(diffToSaturday)).setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    title: 'This Month',
    caption: 'Tasks For This Month',
    icon: 'calendar_month',
    link: '/#/month',
    startDate: new Date(now.setDate(1)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setMonth(now.getMonth() + 1, 0)).setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    title: 'All',
    caption: 'All Tasks',
    icon: 'all_inclusive',
    link: '/#/all',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    title: 'Projects',
    caption: 'Project Overview',
    icon: 'view_timeline',
    link: '/#/projects',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['project'],
  },
  {
    title: 'Templates',
    caption: 'Task Templates',
    icon: 'description',
    link: '/#/templates',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['template'],
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
