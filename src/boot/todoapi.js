// src/boot/todoapi.js
// --- Axios client ---
import axios from 'axios'

const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
const baseURL = isLocalhost
  ? import.meta.env.VITE_TODO_API_URL
  : `${location.protocol}//${location.host}`

const api = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    'Content-Type': 'application/json',
  },
})

// --- Helper functions for /task endpoint ---
/**
 * Create a new task.
 * @param {Object} taskData - The payload for the new task.
 * @returns {Promise<string>} task_id of the newly created task.
 */
async function createTask(taskData) {
  console.log('Creating task with data:', taskData)
  const { data } = await api.post('/task/', taskData)
  return data.task_id
}

/**
 * Update an existing task.
 * @param {string} taskId - UUID of the task to update.
 * @param {Object} updates - Partial task data to update.
 * @returns {Promise<boolean>} True if the task was updated successfully, false otherwise.
 */
async function updateTask(taskId, updates) {
  try {
    console.log('Updating task:', taskId, 'with updates:', updates)
    const response = await api.put(`/task/${taskId}`, updates)
    return response.status === 200
  } catch (error) {
    console.error('Failed to update task:', error)
    return false
  }
}

/**
 * Delete a task.
 * @param {string} taskId - UUID of the task to delete.
 * @returns {Promise<boolean>} True if the task was deleted successfully, false otherwise.
 */
async function deleteTask(taskId) {
  try {
    const response = await api.delete(`/task/${taskId}`)
    return response.status === 200
  } catch (error) {
    console.error('Failed to delete task:', error)
    alert('Failed to delete task. ' + error.response.data.message)
    return false
  }
}

/**
 * Fetch all tasks.
 * @returns {Promise<Array>} List of tasks.
 */
async function listTasks() {
  const { data } = await api.get('/task/')
  console.log('Fetched tasks:', data)
  return data
}

/**
 * Create a new template.
 * @param {Object} templateData - The payload for the new template.
 * @returns {Promise<string>} template_id of the newly created template.
 */
async function createTemplate(templateData) {
  console.log('Creating template with data:', templateData)
  const { data } = await api.post('/template/', templateData)
  return data.template_id
}

/**
 * Update an existing template.
 * @param {string} templateId - UUID of the template to update.
 * @param {Object} updates - Partial template data to update.
 * @returns {Promise<boolean>} True if the template was updated successfully, false otherwise.
 */
async function updateTemplate(templateId, updates) {
  try {
    console.log('Updating template:', templateId, 'with updates:', updates)
    const response = await api.put(`/template/${templateId}`, updates)
    return response.status === 200
  } catch (error) {
    console.error('Failed to update template:', error)
    return false
  }
}

/**
 * Delete a template.
 * @param {string} templateId - UUID of the template to delete.
 * @returns {Promise<boolean>} True if the template was deleted successfully, false otherwise.
 */
async function deleteTemplate(templateId) {
  try {
    const response = await api.delete(`/template/${templateId}`)
    return response.status === 200
  } catch (error) {
    console.error('Failed to delete template:', error)
    return false
  }
}

/**
 * Fetch all templates.
 * @returns {Promise<Array>} List of templates.
 */
async function listTemplates() {
  const { data } = await api.get('/template/')
  console.log('Fetched templates:', data)
  return data
}

async function backupData() {
  const { data } = await api.get('/backup')
  console.log('Fetched backup:', data)
  return data
}

export default ({ app }) => {
  console.log('Initializing todoapi plugin')
  app.config.globalProperties.$apiKey = localStorage.getItem('auth_token') || ''
  app.config.globalProperties.$apiUrl = baseURL

  // Expose helpers globally so Pinia stores or components can use them via this.$todoApi
  app.config.globalProperties.$todoApi = {
    createTask,
    updateTask,
    deleteTask,
    listTasks,
  }
}
export {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listTemplates,
  backupData,
}

// The following functions can be used to interact with the Todo API
