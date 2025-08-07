<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> {{ todoStore.title }} </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useTodoStore } from 'stores/todo'

const $q = useQuasar()
const todoStore = useTodoStore()
todoStore.title = 'Login'

function toggleLeftDrawer() {
  $q.drawer.toggle()
}
</script>
