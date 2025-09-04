import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { dateHelper } from 'src/plugins/dateUtils.js'
import {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  searchTasksByField,
  listTemplates,
  updateTemplate,
  createTemplate,
  deleteTemplate,
} from '../boot/todoapi'
import { date } from 'quasar'

const filterDefaults = {
  // Default filters for tasks
  status: ['not_started', 'in_progress', 'blocked', 'Not set'],
  statusList: ['not_started', 'in_progress', 'blocked', 'completed', 'skipped', 'Not set'],
  priority: ['low', 'medium', 'high', 'Not set'],
  startDate: dateHelper.All.Start,
  endDate: dateHelper.All.End,
  search: '',
  type: ['project', 'task'],
  parent: null,
}

export const useTodoStore = defineStore('todo', {
  state: () => ({
    title: 'Todo List', // Default title for the todo list
    currentTaskId: null, // Holds the ID of the currently selected task or template
    filteredTasks: [], // Current filtered task list
    showCompleted: ref(
      localStorage.getItem('showCompleted') !== null
        ? JSON.parse(localStorage.getItem('showCompleted'))
        : false,
    ), // Flag to show completed tasks
    allTasks: [
      {
        name: 'Tasks Loading',
        task_id: 'placeholder',
        status: 'in_progress',
        timestamps: { due: dateHelper.Today.BusinessClosing },
      },
    ], // All tasks fetched from the API
    allTemplates: [], // All templates fetched from the API
    filters: {
      // Default filters for tasks
      status: filterDefaults.status,
      priority: filterDefaults.priority,
      startDate: filterDefaults.startDate,
      endDate: filterDefaults.endDate,
      search: filterDefaults.search,
      type: filterDefaults.type,
      parent: null,
    },
  }),

  getters: {
    /**
     * Getter returning a function that fetches tasks by arbitrary field/value via API.
     * Usage: const rows = await store.searchTasksBy('status', 'in_progress')
     */
    searchTasksBy: () => async (field, value) => {
      if (!field || value === undefined) {
        throw new Error('searchTasksBy requires both field and value')
      }
      return await searchTasksByField(field, value)
    },
    getAncestors: (state) => (task_id) => {
      // Returns an array of ancestor tasks for the given task_id
      // This is useful for displaying the task hierarchy in the UI
      console.log(`getAncestors(${task_id}) called from:`, new Error().stack)
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
      return ancestors.reverse()
    },
    taskById: (state) => (task_id) => {
      // Returns the task or template by its ID
      console.log(`taskById(${task_id}) called from:`, new Error().stack)
      return (
        state.allTasks.find((t) => t.task_id === task_id) ||
        state.allTemplates.find((t) => t.template_id === task_id)
      )
    },
  },

  actions: {
    async loadTasks() {
      // Fetches all tasks and templates from the API and applies filters
      console.log('loadTasks() called from:', new Error().stack)
      this.allTasks = await listTasks()
      this.allTemplates = await listTemplates()
      this.applyFilters()
      setTimeout(() => {
        alert(
          'This is a placeholder alert for template checks.\n\nThis will be replaced with a more sophisticated notification system in the future.',
        )
        this.checkTemplates()
      }, 10000)
    },
    setCurrentTask(task) {
      // Sets the current task or template based on the provided task object
      console.log(`setCurrentTask(${JSON.stringify(task)}) called from:`, new Error().stack)
      if (task.task_id) {
        this.currentTaskId = task.task_id
      } else if (task.template_id) {
        this.currentTaskId = task.template_id
      } else {
        console.warn('Task does not have task_id or template_id:', task)
      }
    },
    childrenById(task_id) {
      // Returns an array of child tasks for the given task_id
      console.log(`childrenById(${task_id}) called from:`, new Error().stack)
      const children =
        this.allTasks.filter((t) => t.parent === task_id) ||
        this.allTemplates.filter((t) => t.parent === task_id)
      return children.length > 0 ? children : null
    },
    setFilters(filters) {
      console.log(`setFilters(${JSON.stringify(filters)}) called from:`, new Error().stack)
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined) {
          this.filters[key] = filters[key]
        }
      })
      this.applyFilters()
    },
    resetFilters() {
      // Resets the filters to their default values
      console.log('resetFilters() called from:', new Error().stack)
      Object.keys(this.filters).forEach((key) => {
        if (key in filterDefaults) {
          this.filters[key] = filterDefaults[key]
        } else {
          delete this.filters[key]
        }
      })
      this.applyFilters()
    },
    applyFilters() {
      // Applies the current filters to the task list with a lock and timeout mechanism
      console.log('applyFilters() called from:', new Error().stack)
      if (this._applyFiltersLock) {
        console.log('applyFilters() is already running, skipping...')
        return
      }
      this._applyFiltersLock = true
      this.filteredTasks = this.getFilteredList({})
      this._applyFiltersLock = false
      console.log('applyFilters() completed.')
    },
    getDate(dateObj) {
      // Returns a date object based on the provided dateObj
      console.log(`getDate(${JSON.stringify(dateObj)}) called from:`, new Error().stack)
      const realDate = typeof dateObj === 'function' ? dateObj() : dateObj
      return realDate
    },
    matchTaskFilter(task, filterDefs) {
      // Checks if a task matches the provided filter definitions
      console.log(
        `matchTaskFilter(${JSON.stringify(task)}, ${JSON.stringify(filterDefs)}) called from:`,
        new Error().stack,
      )
      const matchesStatus = filterDefs.status.includes(task.status || 'Not set')
      const matchesType = filterDefs.type.includes(task.type || 'Not set')
      const matchesPriority = filterDefs.priority.includes(task.priority || 'Not set')
      const matchesTemplate = !filterDefs.template || task.template_id === filterDefs.template
      const matchesDate = (() => {
        const dates = ['due', 'tickle']
          .map((key) => task.timestamps[key] && new Date(task.timestamps[key]))
          .filter(Boolean)

        if (dates.length === 0) return true

        const startDate = this.getDate(filterDefs.startDate)
        const endDate = this.getDate(filterDefs.endDate)
        return dates.some((dateObj) =>
          date.isBetweenDates(dateObj, startDate, endDate, {
            format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ',
          }),
        )
      })()
      const matchesSearch = JSON.stringify(task)
        .toLowerCase()
        .includes(filterDefs.search.toLowerCase())
      return (
        matchesStatus &&
        matchesPriority &&
        matchesDate &&
        matchesSearch &&
        matchesType &&
        matchesTemplate
      )
    },
    tasklistSort(tasks) {
      // sort task list by due date and priority
      console.log(`tasklistSort(${JSON.stringify(tasks)}) called from:`, new Error().stack)
      tasks.sort((a, b) => {
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
      return tasks
    },
    getFilteredList(filterDefs = {}) {
      // Returns a filtered list of tasks based on the provided filter definitions
      console.log(`getFilteredList(${JSON.stringify(filterDefs)}) called from:`, new Error().stack)
      // Merge default filters with provided filter definitions
      Object.keys(this.filters).forEach((key) => {
        console.log(`getFilteredList: Checking filter key: ${key}`)
        if (!(key in filterDefs)) {
          filterDefs[key] = this.filters[key]
        }
        console.log(`getFilteredList: Filter key ${key} set to:`, filterDefs[key])
      })
      // Short circuit if list is looking for children of a specific parent
      if (filterDefs.parent) {
        const children = this.childrenById(filterDefs.parent)
        return children
          ? children.filter((child) => filterDefs.status.includes(child.status || 'Not set'))
          : []
      }
      // compile task list
      const compiledtasks = []
      compiledtasks.push(...this.allTasks)
      if (filterDefs.type.includes('template')) {
        compiledtasks.push(...this.allTemplates)
      }
      // Filter tasks
      const matchedTasks = compiledtasks.filter((task) => this.matchTaskFilter(task, filterDefs))
      // return sorted tasks
      return this.tasklistSort(matchedTasks)
    },
    testFilters(tmpFilters) {
      console.log(`testFilters(${JSON.stringify(tmpFilters)}) called from:`, new Error().stack)
      const filteredTasks = this.getFilteredList(tmpFilters)
      return filteredTasks.length
    },
    taskDefaults(type = 'task') {
      // Returns default task object based on the type
      console.log(`taskDefaults(${type}) called from:`, new Error().stack)
      const taskTemplate = {
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type: type,
        status: 'not_started',
        priority: 'low',
        parent: this.filters.parent || null,
        timestamps: {
          due: dateHelper.Week.BusinessClosing(),
          tickle: dateHelper.Tomorrow.BusinessOpening(),
        },
      }
      if (type === 'template') {
        taskTemplate.criteria = {
          days: [1, 2, 3, 4, 5],
          period: 'daily',
          time: '17:00',
        }
        taskTemplate.task_type = 'task'
        taskTemplate.timestamps = {}
      }
      return taskTemplate
    },
    async addTask(type) {
      console.log(`addTask(${type}) called from:`, new Error().stack)
      const task = this.taskDefaults(type)
      if (type === 'task' || type === 'project') {
        const taskId = await createTask(task)
        task.task_id = taskId
        this.allTasks.push(task)
      } else if (type === 'template') {
        const templateId = await createTemplate(task)
        task.template_id = templateId
        this.allTemplates.push(task)
      } else {
        console.warn('Invalid type provided:', type)
        return
      }
      this.setCurrentTask(task)
      this.applyFilters()
    },
    async createTaskFromTemplate(template) {
      // Creates a new task from the provided template
      console.log(
        `createTaskFromTemplate(${JSON.stringify(template)}) called from:`,
        new Error().stack,
      )
      const newTask = {}
      Object.keys(template).forEach((key) => {
        if (key !== 'type' && key !== 'criteria' && key !== 'timestamps') {
          newTask[key] = template[key]
        }
      })
      console.log(
        `createTaskFromTemplate(): New Task after template processing: ${JSON.stringify(newTask)}`,
        new Error().stack,
      )
      newTask.type = template.task_type || 'task'
      newTask.status = 'not_started'
      newTask.priority = template.priority || 'low'
      newTask.timestamps = {
        due: dateHelper.Today.BusinessClosing(),
        tickle: dateHelper.Today.BusinessOpening(),
      }
      console.log(
        `createTaskFromTemplate(): New Task after type, status, priority, timestamps: ${JSON.stringify(newTask)}`,
        new Error().stack,
      )
      const taskId = await createTask(newTask)
      newTask.task_id = taskId

      this.allTasks.push(newTask)
      // this.applyFilters()
      console.log('createTaskFromTemplate: New task created from template:', newTask)
    },
    async updateTask(taskId, updates) {
      console.log(
        `updateTask(${taskId}, ${JSON.stringify(updates)}) called from:`,
        new Error().stack,
      )
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
      console.log(`deleteTask(${taskId}) called from:`, new Error().stack)
      const task = this.taskById(taskId)
      if (task.type === 'template') {
        const success = await deleteTemplate(taskId)
        if (success) {
          this.allTemplates = this.allTemplates.filter((t) => t.template_id !== taskId)
          this.applyFilters()
        }
        return
      }
      const success = await deleteTask(taskId)
      if (success) {
        this.allTasks = this.allTasks.filter((t) => t.task_id !== taskId)
        this.applyFilters()
      }
    },
    checkTemplateCriteria(template) {
      console.log(
        `checkTemplateCriteria(${JSON.stringify(template)}) called from:`,
        new Error().stack,
      )
      const now = new Date()
      const currentDayOfWeek = now.getDay() // 0 (Sunday) to 6 (Saturday)
      const currentDayOfMonth = now.getDate() // 1 to 31

      let matches = false
      if (template.criteria.period === 'daily' || template.criteria.period === 'weekly') {
        matches = template.criteria.days.includes(currentDayOfWeek)
      } else if (template.criteria.period === 'monthly') {
        matches = template.criteria.days.includes(currentDayOfMonth)
      }
      return matches
    },
    async checkTemplates() {
      // Checks all templates against today's date and creates tasks if criteria match
      console.log('checkTemplates() called from:', new Error().stack)
      for (const template of this.allTemplates) {
        console.log(`checkTemplates: Checking template ${template.template_id}...`)
        console.log(`checkTemplates: Template criteria: ${JSON.stringify(template.criteria)}`)
        if (this.checkTemplateCriteria(template)) {
          console.log(`checkTemplates: Template ${template.template_id} matches today.`)
          // Use API-backed getter instead of local filter logic
          const templateTasks = await this.searchTasksBy('template_id', template.template_id)

          // Consider a task "existing for today" if its due or tickle is within today
          const start = dateHelper.Today.Start()
          const end = dateHelper.Today.End()
          const templateTasksToday = (templateTasks || []).filter((t) => {
            const due = t?.timestamps?.due ? new Date(t.timestamps.due) : null
            const tickle = t?.timestamps?.tickle ? new Date(t.timestamps.tickle) : null
            const inRange =
              (due && due >= start && due <= end) || (tickle && tickle >= start && tickle <= end)
            return inRange
          })

          console.log(
            `checkTemplates: API search returned ${templateTasks?.length || 0} tasks; ${templateTasksToday.length} are for today.`,
          )

          if (templateTasksToday.length < 1) {
            const newTask = this.createTaskFromTemplate(template)
            console.log(
              `checkTemplates: Created new task from template ${template.template_id}:`,
              newTask,
            )
          }
        }
      }
      console.log('Templates checked and updated if necessary.')
    },
  },
})

watch(
  () => useTodoStore().showCompleted.valueOf(),
  (newVal) => {
    console.log('showCompleted changed:', newVal)
    localStorage.setItem('showCompleted', JSON.stringify(newVal))
    if (newVal) {
      const store = useTodoStore()
      const statusList = Array.isArray(store.filters.status) ? [...store.filters.status] : []
      if (!statusList.includes('completed')) statusList.push('completed')
      if (!statusList.includes('skipped')) statusList.push('skipped')
      store.setFilters({ status: statusList })
    } else {
      const store = useTodoStore()
      const statusList = Array.isArray(store.filters.status) ? [...store.filters.status] : []
      store.setFilters({
        status: statusList.filter((status) => !['completed', 'skipped'].includes(status)),
      })
    }
  },
)
