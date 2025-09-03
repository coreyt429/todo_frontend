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

function parseDueTimestamp(t) {
  const candidates = [
    t?.due_ts,
    t?.dueTs,
    t?.due_at,
    t?.dueAt,
    t?.due_date,
    t?.dueDate,
    t?.due,
    t?.deadline,
  ]
  for (const v of candidates) {
    if (v == null) continue
    if (typeof v === 'number' && !Number.isNaN(v)) {
      const ms = v > 1e12 ? v : v * 1000 // seconds vs ms
      return Number.isFinite(ms) ? ms : null
    }
    if (typeof v === 'string') {
      const ms = Date.parse(v)
      if (!Number.isNaN(ms)) return ms
    }
    if (v instanceof Date) return v.getTime()
  }
  return null
}

export function getDueBucket(t) {
  const ms = parseDueTimestamp(t)
  if (!ms) return { bucket: 'none', days: null }
  const now = Date.now()
  const diffDays = Math.floor((ms - now) / 86400000)
  if (diffDays < 0) return { bucket: 'overdue', days: diffDays }
  if (diffDays === 0) return { bucket: 'today', days: 0 }
  if (diffDays <= 3) return { bucket: 'soon', days: diffDays }
  return { bucket: 'later', days: diffDays }
}
