import { describe, expect, it } from 'vitest'
import { isStaleBuildError } from './staleBuild'

describe('stale build detection', () => {
  it('recognises "old file after a deploy" errors from each browser', () => {
    expect(isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/AdminBookings-DlMaDVRL.js'))).toBe(true)
    expect(isStaleBuildError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleBuildError(new TypeError('error loading dynamically imported module'))).toBe(true)
  })
  it('ignores ordinary errors', () => {
    expect(isStaleBuildError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isStaleBuildError(null)).toBe(false)
  })
})
