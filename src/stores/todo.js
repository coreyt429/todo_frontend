import { defineStore } from 'pinia'
import { createTask, updateTask, deleteTask, listTasks } from '../boot/todoapi'
import { date } from 'quasar'
export const useTodoStore = defineStore('todo', {
  state: () => ({
    title: 'Todo List',
    filteredTasks: [],
    allTasks: [],
    currentTaskId: null,
    filters: {
      status: ['not_started', 'in_progress', 'blocked', 'Not set'],
      priority: ['low', 'medium', 'high', 'Not set'],
      startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
      endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
      search: '',
      type: ['project', 'task'],
    },
  }),

  getters: {
    taskById: (state) => (task_id) => state.allTasks.find((t) => t.task_id === task_id),
    startDate: (state) => (target) => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToSunday = now.getDate() - dayOfWeek
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      switch (target) {
        case 'today':
          return new Date(new Date().setHours(0, 0, 0, 0))
        case 'week':
          return new Date(now.setDate(diffToSunday)).setHours(0, 0, 0, 0)
        case 'month':
          return firstDayOfMonth.setHours(0, 0, 0, 0)
        case 'all':
          return new Date('1900-01-01').setHours(0, 0, 0, 0)
        case 'overdue':
          return new Date('1900-01-01').setHours(0, 0, 0, 0)
        default:
          return state.filters.startDate
      }
    },
    endDate: (state) => (target) => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const diffToSaturday = now.getDate() + (6 - dayOfWeek)
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      switch (target) {
        case 'today':
          return new Date(new Date().setHours(24, 0, 0, 0))
        case 'week':
          return new Date(now.setDate(diffToSaturday)).setHours(24, 0, 0, 0)
        case 'month':
          return lastDayOfMonth.setHours(24, 0, 0, 0)
        case 'all':
          return new Date('2100-01-01').setHours(24, 0, 0, 0)
        case 'overdue':
          return now
        default:
          return state.filters.startDate
      }
    },
  },

  actions: {
    async loadTasks() {
      console.log('loadTasks called from:', new Error().stack)
      console.log('loadTasks...')
      this.allTasks = await listTasks()
      this.applyFilters()
    },
    setCurrentTask(task) {
      this.currentTaskId = task.task_id
    },
    setFilters(filters) {
      console.log('Setting filters:', filters)
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          this.filters[key] = filters[key]
        }
      })
      console.log('Updated filters:', this.filters)
      this.applyFilters()
    },
    resetFilters() {
      console.log('resetFilters')
      this.filters = {
        status: [
          'Not set',
          ...new Set(
            this.allTasks
              .map((task) => task.status)
              .filter((status) => !['completed', 'cancelled', 'skipped'].includes(status)),
          ),
        ],
        priority: ['Not set', ...new Set(this.allTasks.map((task) => task.priority))],
        startDate: date.formatDate(new Date('1900-01-01'), 'YYYY-MM-DD'),
        endDate: date.formatDate(new Date('2100-01-01'), 'YYYY-MM-DD'),
        type: 'task',
        search: '',
      }
      this.applyFilters()
    },
    applyFilters() {
      this.filteredTasks = this.allTasks.filter((task) => {
        const matchesStatus = this.filters.status.includes(task.status || 'Not set')
        const matchesType = this.filters.type.includes(task.type || 'Not set')
        const matchesPriority = this.filters.priority.includes(task.priority || 'Not set')
        const matchesDate = (() => {
          let dueDate = null
          if (task.timestamps.due) {
            dueDate = new Date(task.timestamps.due)
          }
          let tickleDate = null
          if (task.timestamps.tickle) {
            tickleDate = new Date(task.timestamps.tickle)
          }

          // If neither dueDate nor tickleDate exists, match the task
          if (!dueDate && !tickleDate) {
            return true
          }
          // Check if either dueDate or tickleDate is within the date range
          const isDueInRange = dueDate
            ? date.isBetweenDates(dueDate, this.filters.startDate, this.filters.endDate, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          const isTickleInRange = tickleDate
            ? date.isBetweenDates(tickleDate, this.filters.startDate, this.filters.endDate, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          return isDueInRange || isTickleInRange
        })()
        const matchesSearch = JSON.stringify(task)
          .toLowerCase()
          .includes(this.filters.search.toLowerCase())
        return matchesStatus && matchesPriority && matchesDate && matchesSearch && matchesType
      })
      console.log('Total tasks:', this.allTasks.length)
      console.log('Filtered tasks count:', this.filteredTasks.length)
    },
    testFilters(tmpFilters) {
      return this.allTasks.filter((task) => {
        const matchesStatus = tmpFilters.status.includes(task.status || 'Not set')
        const matchesPriority = tmpFilters.priority.includes(task.priority || 'Not set')
        const matchesDate = (() => {
          const dueDate = task.timestamps.due
          const tickleDate = task.timestamps.tickle

          if (!dueDate && !tickleDate) {
            return true
          }

          const isDueInRange = dueDate
            ? date.isBetween(dueDate, tmpFilters.startDate, tmpFilters.endDate, 'YYYY-MM-DD')
            : false
          const isTickleInRange = tickleDate
            ? date.isBetween(tickleDate, tmpFilters.startDate, tmpFilters.endDate, 'YYYY-MM-DD')
            : false

          return isDueInRange || isTickleInRange
        })()
        const matchesSearch = JSON.stringify(task)
          .toLowerCase()
          .includes(tmpFilters.search.toLowerCase())
        return matchesStatus && matchesPriority && matchesDate && matchesSearch
      }).length
    },
    async addTask(task) {
      if (!task) {
        const now = new Date()
        const todayAtFivePM = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          17, // 5:00 PM
          0,
          0,
          0,
        ).toISOString()

        task = {
          name: 'New Task',
          status: 'not_started',
          priority: 'low',
          timestamps: {
            due: todayAtFivePM,
            tickle: todayAtFivePM,
          },
        }
      }
      console.log('addTask called with task:', task)
      const taskId = await createTask(task)
      task.task_id = taskId
      this.allTasks.push(task)
      this.applyFilters()
      this.setCurrentTask(task)
    },
    async updateTask(taskId, updates) {
      const success = await updateTask(taskId, updates)
      if (success) {
        const index = this.allTasks.findIndex((t) => t.task_id === taskId)
        if (index !== -1) {
          Object.assign(this.allTasks[index], updates)
        }
        this.applyFilters()
      }
    },
    async deleteTask(taskId) {
      const success = await deleteTask(taskId)
      console.log('deleteTask called with taskId:', taskId, 'success:', success)
      if (success) {
        console.log(this.allTasks.length, ' tasks before deletion')
        this.allTasks = this.allTasks.filter((t) => t.task_id !== taskId)
        console.log(this.allTasks.length, ' tasks after deletion')
        this.applyFilters()
      }
    },
  },
})
