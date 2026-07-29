import { expect } from 'vitest'
import { workScheduleState } from '../app/utils/workSchedule.js'

const at = value => new Date(value)

describe('work schedule', () => {
  it('is always active when disabled', () => {
    const state = workScheduleState(false, [], '09:00', '17:00', at('2026-07-27T20:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(Infinity)
  })

  it('is active within a selected day', () => {
    const state = workScheduleState(true, [1], '09:00', '17:00', at('2026-07-27T12:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(5 * 60 * 60 * 1000)
  })

  it('waits until the next selected day', () => {
    const state = workScheduleState(true, [1, 2, 3, 4, 5], '09:00', '17:00', at('2026-07-31T18:00:00'))

    expect(state.active).toBe(false)
    expect(state.millisecondsUntilActive).toBe(63 * 60 * 60 * 1000)
  })

  it('supports a window that crosses midnight', () => {
    const state = workScheduleState(true, [1], '22:00', '06:00', at('2026-07-28T02:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(4 * 60 * 60 * 1000)
  })

  it('treats matching start and end times as a full day', () => {
    const state = workScheduleState(true, [1], '09:00', '09:00', at('2026-07-28T08:00:00'))

    expect(state.active).toBe(true)
  })

  it('stays inactive when no days are selected', () => {
    const state = workScheduleState(true, [], '09:00', '17:00', at('2026-07-27T12:00:00'))

    expect(state.active).toBe(false)
    expect(state.millisecondsUntilActive).toBe(24 * 60 * 60 * 1000)
  })
})
