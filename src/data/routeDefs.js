import dateHelper from 'src/plugins/dateUtils.js'

const routeDefs = [
  {
    route: '/',
    identity: 'today',
    label: 'Today',
    caption: 'Tasks For Today',
    startDate: dateHelper.Today.Start,
    endDate: dateHelper.Today.End,
    type: ['project', 'task'],
  },
  {
    route: '/overdue',
    identity: 'overdue',
    label: 'Overdue Tasks',
    caption: 'Tasks That Are Overdue',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.Now,
    type: ['project', 'task'],
  },
  {
    route: '/week',
    identity: 'week',
    label: 'This Week',
    caption: 'Tasks For This Week',
    startDate: dateHelper.Week.Start,
    endDate: dateHelper.Week.End,
    type: ['project', 'task'],
  },
  {
    route: '/month',
    identity: 'month',
    label: 'This Month',
    caption: 'Tasks For This Month',
    startDate: dateHelper.Month.Start,
    endDate: dateHelper.Month.End,
    type: ['project', 'task'],
  },
  {
    route: '/all',
    identity: 'all',
    label: 'All Tasks',
    caption: 'All Tasks',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    type: ['project', 'task'],
  },
  {
    route: '/projects',
    identity: 'projects',
    label: 'Projects',
    caption: 'Project Overview',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    type: ['project'],
  },
  {
    route: '/templates',
    identity: 'templates',
    label: 'Templates',
    caption: 'Task Templates',
    startDate: dateHelper.All.Start(),
    endDate: dateHelper.All.End(),
    type: ['template'],
  },
]

export default routeDefs
export { routeDefs }
