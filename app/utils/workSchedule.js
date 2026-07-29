const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000

function timeParts (time) {
  return time.split(':').map(Number)
}

function workScheduleState (enabled, days, startTime, endTime, now = new Date()) {
  if (!enabled) {
    return { active: true, millisecondsUntilInactive: Infinity, millisecondsUntilActive: 0 }
  }

  const selectedDays = new Set(days)
  const [startHour, startMinute] = timeParts(startTime)
  const [endHour, endMinute] = timeParts(endTime)
  const intervals = []

  for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() + dayOffset)
    if (!selectedDays.has(start.getDay())) continue

    start.setHours(startHour, startMinute, 0, 0)
    const end = new Date(start)
    end.setHours(endHour, endMinute, 0, 0)
    if (end <= start) end.setDate(end.getDate() + 1)
    intervals.push({ start, end })
  }

  const currentInterval = intervals.find(({ start, end }) => start <= now && now < end)
  if (currentInterval) {
    const nextInterval = intervals.find(({ start }) => start > now)
    return {
      active: true,
      millisecondsUntilInactive: currentInterval.end - now,
      millisecondsUntilActive: nextInterval ? nextInterval.start - now : DAY_IN_MILLISECONDS
    }
  }

  const nextInterval = intervals.find(({ start }) => start > now)
  return {
    active: false,
    millisecondsUntilInactive: 0,
    millisecondsUntilActive: nextInterval ? nextInterval.start - now : DAY_IN_MILLISECONDS
  }
}

export { workScheduleState }
