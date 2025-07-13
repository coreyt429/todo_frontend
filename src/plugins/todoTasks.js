// src/plugins/todoTasks.js
export default ({ app }) => {
  console.log('Initializing tasks plugin')
  app.config.globalProperties.$apiKey = import.meta.env.VITE_TODO_API_KEY
  app.config.globalProperties.$apiUrl = import.meta.env.VITE_TODO_API_URL
}

// const BASE_URL = process.env.TODO_API_URL
// const AUTH_TOKEN = process.env.TODO_API_KEY

// function test_callback(response) {
//   console.log('test_callback')
//   console.log(response)
//   task = task_list[9]
// }

// function test_callback2(response) {
//   console.log('test_callback2')
//   console.log(response)
// }

// function load_tasks(callback = test_callback) {
//   fetch(BASE_URL + '/task', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       task_list = data // Store the fetched data in the global variable
//       console.log('Task list loaded:', task_list)
//       callback(task_list) // Render the categorized tree structure
//     })
//     .catch((error) => console.error('Error:', error))
// }

// function get_task(task_id, callback = test_callback) {
//   console.log('get_task(' + task_id + ')')
//   fetch(`${BASE_URL}/task/${task_id}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log('Task updated:', data)
//       if (callback) {
//         callback(data)
//       }
//     })
//     .catch((error) => console.error('Error:', error))
// }

// function update_task(task, callback = test_callback) {
//   if (task.type === 'template') {
//     update_template(task, callback)
//     return
//   }
//   console.log('update_task(' + JSON.stringify(task) + ')')
//   let url = `${BASE_URL}/task`
//   let method = 'POST'
//   if (task.task_id) {
//     url = `${url}/${task.task_id}`
//     method = 'PUT'
//   }
//   fetch(url, {
//     method: method,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//     body: JSON.stringify(task),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log('Task updated:', data)
//       if (callback) {
//         callback(data)
//       }
//     })
//     .catch((error) => console.error('Error:', error))
// }

// // Date check functions
// function isToday(date) {
//   const today = new Date()
//   return (
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear()
//   )
// }

// function isOverdue(date) {
//   const today = new Date()
//   return date < today
// }

// function isThisWeek(date) {
//   const today = new Date()
//   const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
//   const lastDayOfWeek = new Date(firstDayOfWeek)
//   lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6)
//   return date >= firstDayOfWeek && date <= lastDayOfWeek
// }

// function isThisMonth(date) {
//   const today = new Date()
//   return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
// }

// function isThisQuarter(date) {
//   const today = new Date()
//   const currentQuarter = Math.floor((today.getMonth() + 3) / 3)
//   const startMonth = (currentQuarter - 1) * 3
//   const startOfQuarter = new Date(today.getFullYear(), startMonth, 1)
//   const endOfQuarter = new Date(today.getFullYear(), startMonth + 3, 0)
//   return date >= startOfQuarter && date <= endOfQuarter
// }

// // Template functions

// function load_templates(callback = test_callback) {
//   fetch(BASE_URL + '/template', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       template_list = data // Store the fetched data in the global variable
//       console.log('template list loaded:', template_list)
//       callback(template_list) // Render the categorized tree structure
//     })
//     .catch((error) => console.error('Error:', error))
// }

// function get_template(template_id, callback = test_callback) {
//   console.log('get_template(' + template_id + ')')
//   fetch(`${BASE_URL}/template/${template_id}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log('template updated:', data)
//       if (callback) {
//         callback(data)
//       }
//     })
//     .catch((error) => console.error('Error:', error))
// }

// function update_template(template, callback = test_callback) {
//   console.log('update_template(' + JSON.stringify(template) + ')')
//   let url = `${BASE_URL}/template`
//   let method = 'POST'
//   if (template.template_id) {
//     url = `${url}/${template.template_id}`
//     method = 'PUT'
//   }
//   fetch(url, {
//     method: method,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${AUTH_TOKEN}`,
//     },
//     mode: 'cors',
//     body: JSON.stringify(template),
//   })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
//       return response.json()
//     })
//     .then((data) => {
//       console.log('template updated:', data)
//       if (callback) {
//         callback(data)
//       }
//     })
//     .catch((error) => console.error('Error:', error))
// }
