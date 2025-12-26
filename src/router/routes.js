import routeDefs from 'src/data/routeDefs.js'

const routes = []

routeDefs.forEach((route) => {
  console.log(
    `Adding route: ${route.route} with startDate: ${route.startDate} and endDate: ${route.endDate}`,
  )
  routes.push({
    path: route.route,
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: (to, from, next) => {
      const apiKey = localStorage.getItem('auth_token') || ''
      if (!apiKey) {
        next('/login')
      } else {
        next()
      }
    },
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
  path: '/flow-demo',
  component: () => import('layouts/FlowDemoLayout.vue'),
  children: [
    {
      path: '',
      component: () => import('pages/FlowDemoPage.vue'),
    },
  ],
})

routes.push({
  path: '/mindmap',
  component: () => import('layouts/MainLayout.vue'),
  beforeEnter: (to, from, next) => {
    const apiKey = localStorage.getItem('auth_token') || ''
    if (!apiKey) {
      next('/login')
    } else {
      next()
    }
  },
  children: [
    {
      path: '',
      component: () => import('pages/MindMapPage.vue'),
    },
  ],
})

routes.push({
  path: '/login',
  component: () => import('layouts/LoginLayout.vue'),
  children: [
    {
      path: '',
      component: () => import('pages/LoginPage.vue'),
    },
  ],
})

routes.push({
  path: '/:catchAll(.*)*',
  component: () => import('pages/ErrorNotFound.vue'),
})

console.log(routes)

export default routes
