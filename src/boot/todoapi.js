// src/boot/todoapi.js
// --- Axios client ---
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_TODO_API_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TODO_API_KEY}`,
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

export default ({ app }) => {
  console.log('Initializing tasks plugin')
  app.config.globalProperties.$apiKey = import.meta.env.VITE_TODO_API_KEY
  app.config.globalProperties.$apiUrl = import.meta.env.VITE_TODO_API_URL

  // Expose helpers globally so Pinia stores or components can use them via this.$todoApi
  app.config.globalProperties.$todoApi = {
    createTask,
    updateTask,
    deleteTask,
    listTasks,
  }
}
export { createTask, updateTask, deleteTask, listTasks }

// The following functions can be used to interact with the Todo API
