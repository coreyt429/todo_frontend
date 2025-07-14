const now = new Date()
const dayOfWeek = now.getDay()
const diffToSunday = now.getDate() - dayOfWeek
const diffToSaturday = now.getDate() + (6 - dayOfWeek)

const date_routes = [
  {
    route: '/',
    identity: 'all',
    label: 'All Tasks',
    caption: 'All tasks, regardless of date',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: new Date('2100-01-01').setHours(24, 0, 0, 0),
  },
  {
    route: '/today',
    identity: 'today',
    label: 'Today',
    caption: 'All tasks for today',
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(new Date().setHours(24, 0, 0, 0)),
  },
  {
    route: '/overdue',
    identity: 'overdue',
    label: 'Overdue Tasks',
    caption: 'All tasks that are overdue',
    startDate: new Date('1900-01-01').setHours(0, 0, 0, 0),
    endDate: now,
  },
  {
    route: '/week',
    identity: 'week',
    label: 'This Week',
    caption: 'All tasks for this week',
    startDate: new Date(now.setDate(diffToSunday)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setDate(diffToSaturday)).setHours(24, 0, 0, 0),
  },
  {
    route: '/month',
    identity: 'month',
    label: 'This Month',
    caption: 'All tasks for this month',
    startDate: new Date(now.setDate(1)).setHours(0, 0, 0, 0),
    endDate: new Date(now.setMonth(now.getMonth() + 1, 0)).setHours(24, 0, 0, 0),
  },
]

console.log(date_routes)

const routes = []

date_routes.forEach((route) => {
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
