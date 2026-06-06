import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration: number, trigger: boolean): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    let raf: number

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => { if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf) }
  }, [target, duration, trigger])

  return count
}
