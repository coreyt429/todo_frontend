import { defineStore } from 'pinia'
import { createTask, updateTask, deleteTask, listTasks } from '../boot/todoapi'
export const useTodoStore = defineStore('todo', {
  state: () => ({
    tasks: [],
    current_task: null,
  }),

  getters: {
    completedTasks: (state) => state.tasks.filter((t) => t.completed),
    incompleteTasks: (state) => state.tasks.filter((t) => !t.completed),
  },

  actions: {
    setCurrentTask(task) {
      this.current_task = task
    },
    async loadTasks() {
      this.tasks = await listTasks()
    },
    async addTask(task) {
      const taskId = await createTask(task)
      task.task_id = taskId
      this.tasks.push(task)
    },
    async updateTask(taskId, updates) {
      const success = await updateTask(taskId, updates)
      if (success) {
        const index = this.tasks.findIndex((t) => t.task_id === taskId)
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
