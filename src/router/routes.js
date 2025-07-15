import routeDefs from 'src/data/routeDefs.js'

const routes = []

routeDefs.forEach((route) => {
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
          startDate: route.startDate,
          endDate: route.endDate,
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
