import { defineStore } from 'pinia'
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  listTemplates,
  updateTemplate,
  createTemplate,
  deleteTemplate,
} from '../boot/todoapi'
import { date } from 'quasar'
// import { get } from 'ace-builds-internal/lib/net'
export const useTodoStore = defineStore('todo', {
  state: () => ({
    title: 'Todo List',
    filteredTasks: [],
    allTasks: [],
    allTemplates: [],
    currentTaskId: null,
    filters: {
      status: ['not_started', 'in_progress', 'blocked', 'Not set'],
      priority: ['low', 'medium', 'high', 'Not set'],
      startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
      endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
      search: '',
      type: ['project', 'task'],
      parent: null,
    },
  }),

  getters: {
    getFilters: (state) => state.filters,
    getAncestors: (state) => (task_id) => {
      console.log('getAncestors called from :', new Error().stack)
      console.log('Getting ancestors for task ID:', task_id)
      const task = state.allTasks.find((t) => t.task_id === task_id)
      if (!task) {
        console.warn('Task not found for ID:', task_id)
        return []
      }
      const ancestors = []
      let currentTask = task
      while (currentTask && currentTask.parent) {
        const parentTask = state.allTasks.find((t) => t.task_id === currentTask.parent)
        if (parentTask) {
          ancestors.push(parentTask)
          currentTask = parentTask
        } else {
          console.warn('Parent task not found for ID:', currentTask.parent)
          break
        }
      }
      console.log('Found ancestors:', ancestors)
      return ancestors.reverse()
    },
    taskById: (state) => (task_id) => {
      console.log('taskById called from :', new Error().stack)
      console.log('Getting task by ID:', task_id)
      // console.log('All tasks:', state.allTasks)
      console.log('All templates:', state.allTemplates)
      return (
        state.allTasks.find((t) => t.task_id === task_id) ||
        state.allTemplates.find((t) => t.template_id === task_id)
      )
    },
    childrenById: (state) => (task_id) => {
      console.log('childrenById called from :', new Error().stack)
      console.log('Getting children for task ID:', task_id)
      const children =
        state.allTasks.filter((t) => t.parent === task_id) ||
        state.allTemplates.filter((t) => t.parent === task_id)
      console.log('Found children:', children)
      return children.length > 0 ? children : null
    },
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
      this.allTasks = await listTasks()
      this.allTemplates = await listTemplates()
      setTimeout(() => {
        this.checkTemplates()
      }, 100)
      console.log('Loaded tasks:', this.allTasks.length, 'and templates:', this.allTemplates.length)
      this.applyFilters()
    },
    setCurrentTask(task) {
      console.log('Setting current task:', task)
      if (task.task_id) {
        this.currentTaskId = task.task_id
      } else if (task.template_id) {
        this.currentTaskId = task.template_id
      } else {
        console.warn('Task does not have task_id or template_id:', task)
      }
      console.log('Current task ID set to:', this.currentTaskId)
    },
    setFilters(filters) {
      console.log('HERE Setting filters:', filters)
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          this.filters[key] = filters[key]
        }
      })
      console.log('HERE Updated filters:', this.filters)
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
      console.log('HERE applyFilters called with filters:', this.filters)
      if (this.filters.parent) {
        console.log('HERE Applying filters with parent:', this.filters.parent)
        this.filteredTasks = this.allTasks.filter((task) => task.parent === this.filters.parent)
        console.log('HERE Filtered tasks after parent filter:', this.filteredTasks)
        console.log('Filtered tasks count:', this.filteredTasks.length)
        return
      }
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
          // Ensure startDate and endDate are Date objects (or get them from functions)
          let startDate =
            typeof this.filters.startDate === 'function'
              ? this.filters.startDate()
              : this.filters.startDate
          let endDate =
            typeof this.filters.endDate === 'function'
              ? this.filters.endDate()
              : this.filters.endDate
          // Check if either dueDate or tickleDate is within the date range
          const isDueInRange = dueDate
            ? date.isBetweenDates(dueDate, startDate, endDate, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          const isTickleInRange = tickleDate
            ? date.isBetweenDates(tickleDate, startDate, endDate, {
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
      if (this.filters.type.includes('template')) {
        this.filteredTasks = [...this.filteredTasks, ...this.allTemplates]
      }
      this.filteredTasks.sort((a, b) => {
        const dueA = a.timestamps.due ? new Date(a.timestamps.due) : null
        const dueB = b.timestamps.due ? new Date(b.timestamps.due) : null

        if (dueA === null && dueB !== null) return -1
        if (dueA !== null && dueB === null) return 1
        if (dueA !== null && dueB !== null) {
          if (dueA < dueB) return -1
          if (dueA > dueB) return 1
        }

        const priorityOrder = { high: 1, medium: 2, low: 3 }
        const priorityA = priorityOrder[a.priority] || 4
        const priorityB = priorityOrder[b.priority] || 4

        return priorityA - priorityB
      })
      console.log('Total tasks:', this.allTasks.length)
      console.log('Filtered tasks count:', this.filteredTasks.length)
    },
    testFilters(tmpFilters) {
      Object.keys(this.filters).forEach((key) => {
        if (!(key in tmpFilters)) {
          tmpFilters[key] = this.filters[key]
        }
      })
      const filteredTasks = this.allTasks.filter((task) => {
        const matchesStatus = tmpFilters.status.includes(task.status || 'Not set')
        const matchesType = tmpFilters.type.includes(task.type || 'Not set')
        const matchesPriority = tmpFilters.priority.includes(task.priority || 'Not set')
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
          // Ensure startDate and endDate are Date objects (or get them from functions)
          let startDate =
            typeof tmpFilters.startDate === 'function'
              ? tmpFilters.startDate()
              : tmpFilters.startDate
          let endDate =
            typeof tmpFilters.endDate === 'function' ? tmpFilters.endDate() : tmpFilters.endDate
          // Check if either dueDate or tickleDate is within the date range
          const isDueInRange = dueDate
            ? date.isBetweenDates(dueDate, startDate, endDate, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          const isTickleInRange = tickleDate
            ? date.isBetweenDates(tickleDate, startDate, endDate, {
                format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
              })
            : false
          return isDueInRange || isTickleInRange
        })()
        const matchesSearch = JSON.stringify(task)
          .toLowerCase()
          .includes(tmpFilters.search.toLowerCase())
        return matchesStatus && matchesPriority && matchesDate && matchesSearch && matchesType
      })

      if (tmpFilters.type.includes('template')) {
        filteredTasks.push(...this.allTemplates)
      }

      filteredTasks.sort((a, b) => {
        const dueA = a.timestamps.due ? new Date(a.timestamps.due) : null
        const dueB = b.timestamps.due ? new Date(b.timestamps.due) : null

        if (dueA === null && dueB !== null) return -1
        if (dueA !== null && dueB === null) return 1
        if (dueA !== null && dueB !== null) {
          if (dueA < dueB) return -1
          if (dueA > dueB) return 1
        }

        const priorityOrder = { high: 1, medium: 2, low: 3 }
        const priorityA = priorityOrder[a.priority] || 4
        const priorityB = priorityOrder[b.priority] || 4

        return priorityA - priorityB
      })

      return filteredTasks.length
    },
    async addTask(type) {
      if (type === 'task' || type === 'project') {
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
        const task = {
          name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          type: type,
          status: 'not_started',
          priority: 'low',
          parent: this.filters.parent || null,
          timestamps: {
            due: todayAtFivePM,
            tickle: todayAtFivePM,
          },
        }
        console.log(`addTask called with ${type}: ${JSON.stringify(task)}`)
        const taskId = await createTask(task)
        task.task_id = taskId
        this.allTasks.push(task)
        this.applyFilters()
        this.setCurrentTask(task)
      } else if (type === 'template') {
        const template = {
          name: 'New Template',
          criteria: {
            days: [1, 2, 3, 4, 5],
            period: 'daily',
            time: '17:00',
          },

          status: 'not_started',
          type: 'template',
        }
        console.log(`addTemplate called with ${type}: ${JSON.stringify(template)}`)
        const templateId = await createTemplate(template)
        template.template_id = templateId
        this.allTemplates.push(template)
        this.applyFilters()
        this.setCurrentTask(template)
      } else {
        console.warn('Invalid type provided:', type)
        return
      }
    },
    async updateTask(taskId, updates) {
      let success = false
      if (updates.task_id) {
        success = await updateTask(taskId, updates)
        if (success) {
          const index = this.allTasks.findIndex((t) => t.task_id === taskId)
          if (index !== -1) {
            Object.assign(this.allTasks[index], updates)
          }
          this.applyFilters()
        }
      } else if (updates.template_id) {
        success = await updateTemplate(updates.template_id, updates)
        if (success) {
          const index = this.allTemplates.findIndex((t) => t.template_id === updates.template_id)
          if (index !== -1) {
            Object.assign(this.allTemplates[index], updates)
          }
          this.applyFilters()
        }
      } else {
        console.warn('No task_id or template_id provided for update:', updates)
        return
      }
    },
    async deleteTask(taskId) {
      const task = this.taskById(taskId)
      if (task.type === 'template') {
        console.log('Deleting template:', taskId)
        const success = await deleteTemplate(taskId)
        console.log('deleteTemplate called with taskId:', taskId, 'success:', success)
        if (success) {
          this.allTemplates = this.allTemplates.filter((t) => t.template_id !== taskId)
          this.applyFilters()
        }
        return
      }
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
  async checkTemplates() {
    console.log('checkTemplates called from:', new Error().stack)
    for (const template of this.allTemplates) {
      console.log('Checking template:', template.template_id)
      console.log('Template criteria:', template.criteria)
    }
    console.log('Templates checked and updated if necessary.')
  },
})
