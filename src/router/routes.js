const now = new Date()
const dayOfWeek = now.getDay()
const diffToSunday = now.getDate() - dayOfWeek
const diffToSaturday = now.getDate() + (6 - dayOfWeek)

const filtered_routes = [
  {
    route: '/',
    identity: 'today',
    label: 'Today',
    caption: 'Tasks For Today',
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(24, 0, 0, 0)),
    type: ['project', 'task'],
  },
  {
    route: '/overdue',
    identity: 'overdue',
    label: 'Overdue Tasks',
    caption: 'Tasks That Are Overdue',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: now,
    type: ['project', 'task'],
  },
  {
    route: '/week',
    identity: 'week',
    label: 'This Week',
    caption: 'Tasks For This Week',
    startDate: new Date(now.setDate(diffToSunday)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setDate(diffToSaturday)).setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    route: '/month',
    identity: 'month',
    label: 'This Month',
    caption: 'Tasks For This Month',
    startDate: new Date(now.setDate(1)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setMonth(now.getMonth() + 1, 0)).setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    route: '/all',
    identity: 'all',
    label: 'All Tasks',
    caption: 'All Tasks',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['project', 'task'],
  },
  {
    route: '/projects',
    identity: 'projects',
    label: 'Projects',
    caption: 'Project Overview',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['project'],
  },
  {
    route: '/templates',
    identity: 'templates',
    label: 'Templates',
    caption: 'Task Templates',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
    type: ['template'],
  },
]

const routes = []

filtered_routes.forEach((route) => {
  console.log(
    `Adding route: ${route.route} with startDate: ${route.startDate} and endDate: ${route.endDate}`,
  )
  routes.push({
    path: route.route,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        props: {
          startDate: new Date(route.startDate),
          endDate: new Date(route.endDate),
          type: route.type,
          title: route.caption,
          label: route.label,
        },
      },
    ],
  })
})

routes.push({
  path: '/:catchAll(.*)*',
  component: () => import('pages/ErrorNotFound.vue'),
})

console.log(routes)

// const routes = [
//   {
//     path: '/',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       {
//         path: '',
//         component: () => import('pages/IndexPage.vue'),
//       },
//     ],
//   },
//   {
//     path: '/today',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       {
//         path: '',
//         component: () => import('pages/IndexPage.vue'),
//         props: {
//           startDate: new Date(new Date().setHours(0, 0, 0, 0)),
//           endDate: new Date(new Date().setHours(24, 0, 0, 0)),
//         },
//       },
//     ],
//   },
//   {
//     path: '/week',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       {
//         path: '',
//         component: () => import('pages/IndexPage.vue'),
//         props: {
//           startDate: (() => {
//             const now = new Date()
//             const dayOfWeek = now.getDay()
//             const diffToSunday = now.getDate() - dayOfWeek
//             const sunday = new Date(now.setDate(diffToSunday))
//             return new Date(sunday.setHours(0, 0, 0, 0))
//           })(),
//           endDate: (() => {
//             const now = new Date()
//             const dayOfWeek = now.getDay()
//             const diffToSaturday = now.getDate() - dayOfWeek + 6
//             const saturday = new Date(now.setDate(diffToSaturday))
//             return new Date(saturday.setHours(24, 0, 0, 0))
//           })(),
//         },
//       },
//     ],
//   },
//   {
//     path: '/month',
//     component: () => import('layouts/MainLayout.vue'),
//     children: [
//       {
//         path: '',
//         component: () => import('pages/IndexPage.vue'),
//         props: {
//           startDate: (() => {
//             const now = new Date()
//             const dayOfWeek = now.getDay()
//             const diffToSunday = now.getDate() - dayOfWeek
//             const sunday = new Date(now.setDate(diffToSunday))
//             return new Date(sunday.setHours(0, 0, 0, 0))
//           })(),
//           endDate: (() => {
//             const now = new Date()
//             const dayOfWeek = now.getDay()
//             const diffToSaturday = now.getDate() - dayOfWeek + 6
//             const saturday = new Date(now.setDate(diffToSaturday))
//             return new Date(saturday.setHours(24, 0, 0, 0))
//           })(),
//         },
//       },
//     ],
//   },

// Always leave this as last one,
// but you can also remove it

// ]

export default routes
