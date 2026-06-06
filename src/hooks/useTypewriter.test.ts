import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('starts with an empty string', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hello', 'World'], 50)
    )
    expect(result.current).toBe('')
  })

  it('types out the first character after one tick', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hi'], 50)
    )
    act(() => { vi.advanceTimersByTime(50) })
    expect(result.current).toBe('H')
  })

  it('completes the first string', () => {
    const { result } = renderHook(() =>
      useTypewriter(['Hi'], 50)
    )
    act(() => { vi.advanceTimersByTime(50 * 2) })
    expect(result.current).toBe('Hi')
  })
})
