<template>
  <q-item clickable tag="a" :target="props.target" :href="props.link">
    <q-item-section v-if="props.icon" avatar>
      <q-btn dense round flat :icon="props.icon">
        <q-badge color="primary" floating transparent>
          {{ todoStore.testFilters(filters) }}
        </q-badge>
      </q-btn>

      <!-- <div class="row items-center no-wrap">
        <q-icon :name="props.icon" />
        <q-badge rounded color="primary" class="q-ml-sm" :label="todoStore.testFilters(filters)">
        </q-badge>
      </div> -->
    </q-item-section>

    <q-item-section>
      <q-item-label>
        {{ props.title }}
      </q-item-label>

      <q-item-label caption>
        {{ props.caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
import { useTodoStore } from 'stores/todo'
const todoStore = useTodoStore()
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '_self',
  },
  startDate: {
    type: [Date, Function],
    default: null,
  },
  endDate: {
    type: [Date, Function],
    default: null,
  },
  type: {
    type: Array,
    default: () => ['project', 'task'],
  },
})

const filters = {
  startDate: props.startDate,
  endDate: props.endDate,
  type: props.type,
}

console.log('EssentialLink props:', props)
</script>
