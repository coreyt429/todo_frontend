// src/plugins/todoTasks.js
export default ({ app }) => {
  console.log('Initializing tasks plugin')
  app.config.globalProperties.$authToken = localStorage.getItem('auth_token')
  if (window.location.hostname === 'localhost') {
    app.config.globalProperties.$apiUrl = import.meta.env.VITE_TODO_API_URL
  } else {
    app.config.globalProperties.$apiUrl = window.location.origin
  }
}
