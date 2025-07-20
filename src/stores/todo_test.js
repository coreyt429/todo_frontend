import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { dateHelper } from 'src/plugins/dateUtils.js'
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

export const useTodoStore = defineStore('todo', () => {
  /* ---------------------------------------------------------------------------
   * STATE (reactive primitives)
   * ------------------------------------------------------------------------- */
  const title = ref('Todo List')
  const filteredTasks = ref([])
  const allTasks = ref([])
  const allTemplates = ref([])
  const currentTaskId = ref(null)

  const filters = reactive({
    status: ['not_started', 'in_progress', 'blocked', 'Not set'],
    priority: ['low', 'medium', 'high', 'Not set'],
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    search: '',
    type: ['project', 'task'],
    parent: null,
  })

  /* ---------------------------------------------------------------------------
   * GETTERS (computed)
   * ------------------------------------------------------------------------- */
  const getFilters = computed(() => filters)

  const taskById = (task_id) =>
    computed(() => {
      return (
        allTasks.value.find((t) => t.task_id === task_id) ||
        allTemplates.value.find((t) => t.template_id === task_id)
      )
    })

  const getAncestors = (task_id) =>
    computed(() => {
      const task = allTasks.value.find((t) => t.task_id === task_id)
      if (!task) return []
      const ancestors = []
      let currentTask = task
      while (currentTask && currentTask.parent) {
        const parentTask = allTasks.value.find((t) => t.task_id === currentTask.parent)
        if (parentTask) {
          ancestors.push(parentTask)
          currentTask = parentTask
        } else break
      }
      return ancestors.reverse()
    })

  const childrenById = (task_id) =>
    computed(() => {
      const children =
        allTasks.value.filter((t) => t.parent === task_id) ||
        allTemplates.value.filter((t) => t.parent === task_id)
      return children.length > 0 ? children : null
    })

  /* ---------------------------------------------------------------------------
   * ACTIONS
   * ------------------------------------------------------------------------- */
  async function loadTasks() {
    allTasks.value = await listTasks()
    allTemplates.value = await listTemplates()
    setTimeout(checkTemplates, 100)
    applyFilters()
  }

  function setCurrentTask(task) {
    if (task.task_id) currentTaskId.value = task.task_id
    else if (task.template_id) currentTaskId.value = task.template_id
  }

  function setFilters(newFilters) {
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] !== undefined) filters[key] = newFilters[key]
    })
    applyFilters()
  }

  function resetFilters() {
    filters.status = [
      'Not set',
      ...new Set(
        allTasks.value
          .map((task) => task.status)
          .filter((s) => !['completed', 'cancelled', 'skipped'].includes(s)),
      ),
    ]
    filters.priority = ['Not set', ...new Set(allTasks.value.map((task) => task.priority))]
    filters.startDate = dateHelper.All.Start
    filters.endDate = dateHelper.All.End
    filters.type = 'task'
    filters.search = ''
    applyFilters()
  }

  function applyFilters() {
    if (filters.parent) {
      filteredTasks.value = allTasks.value.filter((t) => t.parent === filters.parent)
      return
    }

    filteredTasks.value = allTasks.value.filter((task) => {
      const matchesStatus = filters.status.includes(task.status || 'Not set')
      const matchesType = filters.type.includes(task.type || 'Not set')
      const matchesPriority = filters.priority.includes(task.priority || 'Not set')

      const start =
        typeof filters.startDate === 'function' ? filters.startDate() : filters.startDate
      const end = typeof filters.endDate === 'function' ? filters.endDate() : filters.endDate

      const dueDate = task.timestamps.due ? new Date(task.timestamps.due) : null
      const tickleDate = task.timestamps.tickle ? new Date(task.timestamps.tickle) : null
      const inDateRange = (d) =>
        d && date.isBetweenDates(d, start, end, { format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ' })

      const matchesDate =
        !dueDate && !tickleDate ? true : inDateRange(dueDate) || inDateRange(tickleDate)

      const matchesSearch = JSON.stringify(task)
        .toLowerCase()
        .includes(filters.search.toLowerCase())

      return matchesStatus && matchesPriority && matchesDate && matchesSearch && matchesType
    })

    if (filters.type.includes('template')) {
      filteredTasks.value.push(...allTemplates.value)
    }

    filteredTasks.value.sort((a, b) => {
      const dueA = a.timestamps.due ? new Date(a.timestamps.due) : null
      const dueB = b.timestamps.due ? new Date(b.timestamps.due) : null
      if (dueA === null && dueB !== null) return -1
      if (dueA !== null && dueB === null) return 1
      if (dueA && dueB && dueA !== dueB) return dueA - dueB

      const order = { high: 1, medium: 2, low: 3 }
      return (order[a.priority] || 4) - (order[b.priority] || 4)
    })
  }

  function testFilters(tmpFilters) {
    Object.keys(filters).forEach((k) => {
      if (!(k in tmpFilters)) tmpFilters[k] = filters[k]
    })
    return applyFiltersWith(tmpFilters).length
  }

  function applyFiltersWith(f) {
    /* local filtering helper used by testFilters */
    const res = allTasks.value.filter((task) => {
      const matchesStatus = f.status.includes(task.status || 'Not set')
      const matchesType = f.type.includes(task.type || 'Not set')
      const matchesPriority = f.priority.includes(task.priority || 'Not set')

      const start = typeof f.startDate === 'function' ? f.startDate() : f.startDate
      const end = typeof f.endDate === 'function' ? f.endDate() : f.endDate

      const dueDate = task.timestamps.due ? new Date(task.timestamps.due) : null
      const tickleDate = task.timestamps.tickle ? new Date(task.timestamps.tickle) : null
      const inDateRange = (d) =>
        d && date.isBetweenDates(d, start, end, { format: 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ' })

      const matchesDate =
        !dueDate && !tickleDate ? true : inDateRange(dueDate) || inDateRange(tickleDate)

      const matchesSearch = JSON.stringify(task).toLowerCase().includes(f.search.toLowerCase())

      return matchesStatus && matchesPriority && matchesDate && matchesSearch && matchesType
    })

    if (f.type.includes('template')) res.push(...allTemplates.value)

    res.sort((a, b) => {
      const dueA = a.timestamps.due ? new Date(a.timestamps.due) : null
      const dueB = b.timestamps.due ? new Date(b.timestamps.due) : null
      if (dueA === null && dueB !== null) return -1
      if (dueA !== null && dueB === null) return 1
      if (dueA && dueB && dueA !== dueB) return dueA - dueB
      const order = { high: 1, medium: 2, low: 3 }
      return (order[a.priority] || 4) - (order[b.priority] || 4)
    })
    return res
  }

  async function addTask(type) {
    if (type === 'task' || type === 'project') {
      const now = new Date()
      const todayAtFivePM = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        17,
        0,
        0,
      ).toISOString()
      const task = {
        name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
        status: 'not_started',
        priority: 'low',
        parent: filters.parent || null,
        timestamps: { due: todayAtFivePM, tickle: todayAtFivePM },
      }
      const taskId = await createTask(task)
      task.task_id = taskId
      allTasks.value.push(task)
      applyFilters()
      setCurrentTask(task)
    } else if (type === 'template') {
      const template = {
        name: 'New Template',
        criteria: { days: [1, 2, 3, 4, 5], period: 'daily', time: '17:00' },
        status: 'not_started',
        type: 'template',
      }
      const templateId = await createTemplate(template)
      template.template_id = templateId
      allTemplates.value.push(template)
      applyFilters()
      setCurrentTask(template)
    }
  }

  async function updateTaskAction(taskId, updates) {
    let success = false
    if (updates.task_id) {
      success = await updateTask(taskId, updates)
      if (success) {
        const idx = allTasks.value.findIndex((t) => t.task_id === taskId)
        if (idx !== -1) Object.assign(allTasks.value[idx], updates)
        applyFilters()
      }
    } else if (updates.template_id) {
      success = await updateTemplate(updates.template_id, updates)
      if (success) {
        const idx = allTemplates.value.findIndex((t) => t.template_id === updates.template_id)
        if (idx !== -1) Object.assign(allTemplates.value[idx], updates)
        applyFilters()
      }
    }
  }

  async function deleteTaskAction(taskId) {
    const task = taskById(taskId).value
    if (task.type === 'template') {
      const success = await deleteTemplate(taskId)
      if (success) {
        allTemplates.value = allTemplates.value.filter((t) => t.template_id !== taskId)
        applyFilters()
      }
      return
    }
    const success = await deleteTask(taskId)
    if (success) {
      allTasks.value = allTasks.value.filter((t) => t.task_id !== taskId)
      applyFilters()
    }
  }

  async function checkTemplates() {
    for (const template of allTemplates.value) {
      console.log('Checking template:', template.template_id)
    }
  }

  /* ---------------------------------------------------------------------------
   * expose state / getters / actions
   * ------------------------------------------------------------------------- */
  return {
    /* state */
    title,
    filteredTasks,
    allTasks,
    allTemplates,
    currentTaskId,
    filters,

    /* getters */
    getFilters,
    taskById,
    getAncestors,
    childrenById,

    /* actions */
    loadTasks,
    setCurrentTask,
    setFilters,
    resetFilters,
    applyFilters,
    testFilters,
    addTask,
    updateTaskAction,
    deleteTaskAction,
    checkTemplates,
  }
})
