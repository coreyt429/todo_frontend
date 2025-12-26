<template>
  <q-item clickable @click.prevent="applyFilters">
    <q-item-section v-if="props.icon" avatar>
      <q-btn dense round flat :icon="props.icon">
        <q-badge color="primary" floating transparent>
          {{ badgeCount }}
        </q-badge>
      </q-btn>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { computed } from 'vue'
import { useTodoStore } from 'stores/todo'

const todoStore = useTodoStore()

const props = defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  link: { type: String, default: '#' },
  icon: { type: String, default: '' },
  target: { type: String, default: '_self' },
  startDate: { type: [Date, Function], default: null },
  endDate: { type: [Date, Function], default: null },
  type: { type: Array, default: () => ['project', 'task'] },
})

// Reactive computed filters that depend on props and store filters
const filters = computed(() => ({
  startDate: props.startDate || todoStore.filters.startDate,
  endDate: props.endDate || todoStore.filters.endDate,
  type: props.type || todoStore.filters.type,
  status: todoStore.filters.status,
  priority: todoStore.filters.priority,
  search: todoStore.filters.search,
}))

// Computed badgeCount explicitly depends on store tasks and filters
const badgeCount = computed(() => todoStore.testFilters(filters.value))

function applyFilters() {
  todoStore.title = props.caption || props.title || 'Todo List'
  todoStore.activeLabel = props.title || props.caption || 'Todo List'
  todoStore.setFilters({
    startDate: props.startDate || todoStore.filters.startDate,
    endDate: props.endDate || todoStore.filters.endDate,
    type: props.type || todoStore.filters.type,
    parent: null,
  })
}
</script>
