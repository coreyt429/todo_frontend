const dateHelper = {
  Today: {
    Start: () => new Date(new Date().setHours(0, 0, 0, 0)),
    End: () => new Date(new Date().setHours(24, 0, 0, 0)),
  },
  Week: {
    Start: () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const weekStart = new Date(now.setDate(now.getDate() - dayOfWeek))
      weekStart.setHours(0, 0, 0, 0)
      return weekStart
    },
    End: () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const weekEnd = new Date(now.setDate(now.getDate() + (6 - dayOfWeek)))
      weekEnd.setHours(0, 0, 0, 0)
      return weekEnd
    },
  },
  Month: {
    Start: () => {
      const now = new Date()
      const monthStart = new Date(now.setDate(1))
      monthStart.setHours(0, 0, 0, 0)
      return monthStart
    },
    End: () => {
      const now = new Date()
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      monthEnd.setHours(24, 0, 0, 0)
      return monthEnd
    },
  },
  All: {
    Start: () => new Date(new Date('1900-01-01').setHours(0, 0, 0, 0)),
    End: () => new Date(new Date('2100-01-01').setHours(24, 0, 0, 0)),
  },
  Now: () => {
    return new Date()
  },
}

export { dateHelper }
export default dateHelper
