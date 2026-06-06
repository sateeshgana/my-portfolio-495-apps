import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRef } from 'react'
import { useParticles } from './useParticles'

global.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    disconnect: vi.fn(),
  }
})

describe('useParticles', () => {
  beforeEach(() => {
    // jsdom doesn't implement canvas — stub getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
    })
  })

  it('runs without error when given a canvas ref', () => {
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLCanvasElement>(document.createElement('canvas'))
      useParticles(ref, 10)
    })
    expect(() => unmount()).not.toThrow()
  })
})
