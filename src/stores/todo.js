import { defineStore } from 'pinia'
import { createTask, updateTask, deleteTask, listTasks } from '../boot/todoapi'
export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter((t) => t.completed),
    incompleteTasks: (state) => state.tasks.filter((t) => !t.completed),
  },

  actions: {
    async loadTasks() {
      this.tasks = await listTasks()
    },
    async addTask(task) {
      const taskId = await createTask(task)
      task.id = taskId
      this.tasks.push(task)
    },
    async updateTask(taskId, updates) {
      const success = await updateTask(taskId, updates)
      if (success) {
        const index = this.tasks.findIndex((t) => t.id === taskId)
        if (index !== -1) {
          Object.assign(this.tasks[index], updates)
        }
      }
    },
    async deleteTask(taskId) {
      const success = await deleteTask(taskId)
      if (success) {
        this.tasks = this.tasks.filter((t) => t.id !== taskId)
      }
    },
  },
})
