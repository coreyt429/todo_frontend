import { defineStore } from 'pinia'
import { createTask, updateTask, deleteTask, listTasks } from '../boot/todoapi'
import { date } from 'quasar'
export const useTodoStore = defineStore('todo', {
  state: () => ({
    filteredTasks: [],
    allTasks: [],
    currentTaskId: null,
    filters: {
      status: ['not_started', 'in_progress', 'blocked', 'Not set'],
      priority: ['low', 'medium', 'high', 'Not set'],
      date: {
        start: date.formatDate(new Date('1900-01-01'), 'YYYY-MM-DD'),
        end: date.formatDate(new Date('2100-01-01'), 'YYYY-MM-DD'),
      },
      search: '',
    },
  }),

  getters: {
    taskById: (state) => (task_id) => state.allTasks.find((t) => t.task_id === task_id),
    //   filteredTasks: (state) => state.allTasks.filter((t) => !t.completed),
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
      console.log('before:', this.filters.date.start, this.filters.date.end)
      // this.filters = { ...this.filters, ...filters }
      console.log('step one:', this.filters.date.start, this.filters.date.end)

      if (filters.date) {
        this.filters.date.start = filters.date.start
        this.filters.date.end = filters.date.end
      }
      console.log('after:', this.filters.date.start, this.filters.date.end)

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
        date: {
          start: date.formatDate(new Date('1900-01-01'), 'YYYY-MM-DD'),
          end: date.formatDate(new Date('2100-01-01'), 'YYYY-MM-DD'),
        },
        search: '',
      }
      this.applyFilters()
    },
    applyFilters() {
      console.log('applyFilters:', this.filters.date.start, this.filters.date.end)

      this.filteredTasks = this.allTasks.filter((task) => {
        const matchesStatus = this.filters.status.includes(task.status || 'Not set')

        const matchesPriority = this.filters.priority.includes(task.priority || 'Not set')
        console.log('matchesPriority:', matchesPriority)
        console.log(task.priority || 'Not set')
        console.log('matchesStatus:', matchesStatus, 'matchesPriority:', matchesPriority)
        const matchesDate = (() => {
          let dueDate = null
          if (task.timestamps.due) {
            console.log('task.timestamps.due:', task.timestamps.due)
            dueDate = new Date(task.timestamps.due)
            console.log('dueDate:', dueDate)
          }
          let tickleDate = null
          if (task.timestamps.tickle) {
            console.log('task.timestamps.tickle:', task.timestamps.tickle)
            tickleDate = new Date(task.timestamps.tickle)
          }

          // If neither dueDate nor tickleDate exists, match the task
          if (!dueDate && !tickleDate) {
            return true
          }
          console.log(dueDate || 'no due date', tickleDate || 'no tickle date')
          // Check if either dueDate or tickleDate is within the date range
          const isDueInRange = dueDate
            ? date.isBetweenDates(dueDate, this.filters.date.start, this.filters.date.end, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          console.log('isDueInRange', isDueInRange)
          console.log('filter start:', this.filters.date.start, 'end:', this.filters.date.end)
          console.log('dueDate:', dueDate, 'tickleDate:', tickleDate)
          const isTickleInRange = tickleDate
            ? date.isBetweenDates(tickleDate, this.filters.date.start, this.filters.date.end, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          console.log('isTickleInRange', isTickleInRange)

          return isDueInRange || isTickleInRange
        })()
        const matchesSearch = JSON.stringify(task)
          .toLowerCase()
          .includes(this.filters.search.toLowerCase())
        console.log('matches:', {
          matchesStatus,
          matchesPriority,
          matchesDate,
          matchesSearch,
        })
        return matchesStatus && matchesPriority && matchesDate && matchesSearch
      })
      console.log('Filtered tasks:', this.filteredTasks)
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
            ? date.isBetween(dueDate, tmpFilters.date.start, tmpFilters.date.end, 'YYYY-MM-DD')
            : false
          const isTickleInRange = tickleDate
            ? date.isBetween(tickleDate, tmpFilters.date.start, tmpFilters.date.end, 'YYYY-MM-DD')
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
      const taskId = await createTask(task)
      task.task_id = taskId
      this.allTasks.push(task)
      this.applyFilters()
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
      if (success) {
        this.allTasks = this.allTasks.filter((t) => t.id !== taskId)
        this.applyFilters()
      }
    },
  },
})
