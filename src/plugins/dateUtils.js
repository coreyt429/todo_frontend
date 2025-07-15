const dateHelper = {
  Today: {
    Start: () => new Date(new Date().setHours(0, 0, 0, 0)),
    End: () => new Date(new Date().setHours(24, 0, 0, 0)),
    BusinessOpening: () => new Date(new Date().setHours(9, 0, 0, 0)),
    BusinessClosing: () => new Date(new Date().setHours(17, 0, 0, 0)),
  },
  Tomorrow: {
    Start: () => new Date(new Date().setHours(0, 0, 0, 0) + 86400000),
    End: () => new Date(new Date().setHours(24, 0, 0, 0) + 86400000),
    BusinessOpening: () => new Date(new Date().setHours(9, 0, 0, 0) + 86400000),
    BusinessClosing: () => new Date(new Date().setHours(17, 0, 0, 0) + 86400000),
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
    BusinessOpening: () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const monday = new Date(now.setDate(now.getDate() - dayOfWeek + 1))
      monday.setHours(9, 0, 0, 0)
      return monday
    },
    BusinessClosing: () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      const friday = new Date(now.setDate(now.getDate() - dayOfWeek + 5))
      friday.setHours(17, 0, 0, 0)
      return friday
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
    BusinessOpening: () => {
      const now = new Date()
      let monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      while (monthStart.getDay() === 0 || monthStart.getDay() === 6) {
        monthStart.setDate(monthStart.getDate() + 1)
      }
      monthStart.setHours(9, 0, 0, 0)
      return monthStart
    },
    BusinessClosing: () => {
      const now = new Date()
      let monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      while (monthEnd.getDay() === 0 || monthEnd.getDay() === 6) {
        monthEnd.setDate(monthEnd.getDate() - 1)
      }
      monthEnd.setHours(17, 0, 0, 0)
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
