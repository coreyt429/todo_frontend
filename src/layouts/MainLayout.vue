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
import { menuDefs } from 'src/data/menuDefs'
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { onMounted } from 'vue'
import { useTodoStore } from 'stores/todo'

const linksList = menuDefs
const todoStore = useTodoStore()

onMounted(() => {
  todoStore.loadTasks()
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
