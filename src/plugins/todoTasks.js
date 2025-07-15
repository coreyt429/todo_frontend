// src/plugins/todoTasks.js
export default ({ app }) => {
  console.log('Initializing tasks plugin')
  app.config.globalProperties.$apiKey = import.meta.env.VITE_TODO_API_KEY
  app.config.globalProperties.$apiUrl = import.meta.env.VITE_TODO_API_URL
}
