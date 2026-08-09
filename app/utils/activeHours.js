const alwaysActive = () => ({ active: true, millisecondsUntilInactive: Infinity, millisecondsUntilActive: 0 })

function parseTime (time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time ?? '').trim())
  if (!match) return null
  const [hour, minute] = [Number(match[1]), Number(match[2])]
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

function parseDays (days) {
  const parsed = (Array.isArray(days) ? days : [])
    .map(Number)
    .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
  return new Set(parsed)
}

function activeHoursState (enabled, days, startTime, endTime, now = new Date()) {
  if (!enabled) return alwaysActive()

  const selectedDays = parseDays(days)
  const startAt = parseTime(startTime)
  const endAt = parseTime(endTime)

  // A schedule we cannot make sense of must not silently suppress breaks forever
  if (selectedDays.size === 0 || !startAt || !endAt) return alwaysActive()

  const intervals = []

  for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() + dayOffset)
    if (!selectedDays.has(start.getDay())) continue

    start.setHours(startAt.hour, startAt.minute, 0, 0)
    const end = new Date(start)
    end.setHours(endAt.hour, endAt.minute, 0, 0)
    if (end <= start) end.setDate(end.getDate() + 1)
    intervals.push({ start, end })
  }

  // The loop spans nine consecutive days, so a non-empty day set always yields one
  const nextInterval = intervals.find(({ start }) => start > now)
  if (!nextInterval) return alwaysActive()

  const currentInterval = intervals.find(({ start, end }) => start <= now && now < end)

  return {
    active: Boolean(currentInterval),
    millisecondsUntilInactive: currentInterval ? currentInterval.end - now : 0,
    millisecondsUntilActive: nextInterval.start - now
  }
}

export { activeHoursState }
