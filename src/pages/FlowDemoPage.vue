<script setup>
import FlowDemo from 'src/components/FlowDemo.vue'
import { useTodoStore } from 'stores/todo'

// const todoStore = useTodoStore()
import { useTasksFlow } from 'src/composables/useTasksFlow'

const { nodes, edges, selectedId, onNodeClick, layoutLR, layoutTB, fitGraph } =
  useTasksFlow(useTodoStore())
console.log(nodes, edges, selectedId, onNodeClick, layoutLR, layoutTB, fitGraph)
</script>

<template>
  <q-page padding>
    <FlowDemo
      v-model:nodes="nodes"
      v-model:edges="edges"
      :fit-view-on-init="true"
      @node-click="onNodeClick"
    />
  </q-page>
</template>
