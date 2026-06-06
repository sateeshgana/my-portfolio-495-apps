import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from './useCountUp'

describe('useCountUp', () => {
  let time = 0

  beforeEach(() => {
    time = 0
    vi.useFakeTimers()
    vi.spyOn(performance, 'now').mockImplementation(() => time)
    global.requestAnimationFrame = vi.fn((cb) => {
      return setTimeout(() => { time += 16; cb(time) }, 16) as unknown as number
    })
    global.cancelAnimationFrame = (id) => clearTimeout(id)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('returns 0 before trigger', () => {
    const { result } = renderHook(() => useCountUp(100, 1000, false))
    expect(result.current).toBe(0)
  })

  it('returns target value after duration when triggered', () => {
    const { result } = renderHook(() => useCountUp(100, 500, true))
    act(() => { vi.advanceTimersByTime(600) })
    expect(result.current).toBe(100)
  })
})
