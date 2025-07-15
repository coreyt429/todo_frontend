import { dateHelper } from 'src/plugins/dateUtils'

export const menuDefs = [
  {
    title: 'Today',
    caption: 'Tasks For Today',
    icon: 'today',
    link: '/#/',
    startDate: dateHelper.Today.Start,
    endDate: dateHelper.Today.End,
    type: ['project', 'task'],
  },
  {
    title: 'Overdue',
    caption: 'Tasks That Are Overdue',
    icon: 'assignment_late',
    link: '/#/overdue',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.Now,
    type: ['project', 'task'],
  },

  {
    title: 'This Week',
    caption: 'Tasks For This Week',
    icon: 'view_week',
    link: '/#/week',
    startDate: dateHelper.Week.Start,
    endDate: dateHelper.Week.End,
    type: ['project', 'task'],
  },
  {
    title: 'This Month',
    caption: 'Tasks For This Month',
    icon: 'calendar_month',
    link: '/#/month',
    startDate: dateHelper.Month.Start,
    endDate: dateHelper.Month.End,
    type: ['project', 'task'],
  },
  {
    title: 'All',
    caption: 'All Tasks',
    icon: 'all_inclusive',
    link: '/#/all',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    type: ['project', 'task'],
  },
  {
    title: 'Projects',
    caption: 'Project Overview',
    icon: 'view_timeline',
    link: '/#/projects',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    type: ['project'],
  },
  {
    title: 'Templates',
    caption: 'Task Templates',
    icon: 'description',
    link: '/#/templates',
    startDate: dateHelper.All.Start,
    endDate: dateHelper.All.End,
    type: ['template'],
  },
]
export default menuDefs
