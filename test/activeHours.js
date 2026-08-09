import { expect } from 'vitest'
import { activeHoursState } from '../app/utils/activeHours.js'

const at = value => new Date(value)

describe('active hours', () => {
  it('is always active when disabled', () => {
    const state = activeHoursState(false, [], '09:00', '17:00', at('2026-07-27T20:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(Infinity)
  })

  it('is active within a selected day', () => {
    const state = activeHoursState(true, [1], '09:00', '17:00', at('2026-07-27T12:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(5 * 60 * 60 * 1000)
  })

  it('waits until the next selected day', () => {
    const state = activeHoursState(true, [1, 2, 3, 4, 5], '09:00', '17:00', at('2026-07-31T18:00:00'))

    expect(state.active).toBe(false)
    expect(state.millisecondsUntilActive).toBe(63 * 60 * 60 * 1000)
  })

  it('supports a window that crosses midnight', () => {
    const state = activeHoursState(true, [1], '22:00', '06:00', at('2026-07-28T02:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(4 * 60 * 60 * 1000)
  })

  it('treats matching start and end times as a full day', () => {
    const state = activeHoursState(true, [1], '09:00', '09:00', at('2026-07-28T08:00:00'))

    expect(state.active).toBe(true)
  })

  it('stays active when no days are selected', () => {
    const state = activeHoursState(true, [], '09:00', '17:00', at('2026-07-27T12:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(Infinity)
  })

  it('stays active when the times cannot be parsed', () => {
    const state = activeHoursState(true, [1, 2, 3, 4, 5], '', '25:00', at('2026-07-29T14:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(Infinity)
  })

  it('accepts days stored as strings', () => {
    const state = activeHoursState(true, ['1', '2', '3', '4', '5'], '09:00', '17:00', at('2026-07-29T14:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(3 * 60 * 60 * 1000)
  })

  it('ignores unusable days alongside valid ones', () => {
    const state = activeHoursState(true, [3, 'x', null, 9], '09:00', '17:00', at('2026-07-29T14:00:00'))

    expect(state.active).toBe(true)
    expect(state.millisecondsUntilInactive).toBe(3 * 60 * 60 * 1000)
  })
})
