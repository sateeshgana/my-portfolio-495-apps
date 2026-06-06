import { useEffect, useRef, useState } from 'react'

export function useTypewriter(strings: string[], speed = 60): string {
  const [displayed, setDisplayed] = useState('')
  const stateRef = useRef({
    stringIndex: 0,
    charIndex: 0,
    deleting: false,
  })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      const { stringIndex, charIndex, deleting } = stateRef.current
      const current = strings[stringIndex % strings.length]
      const delay = deleting ? speed / 2 : speed

      timer = setTimeout(() => {
        if (!deleting) {
          if (charIndex < current.length) {
            stateRef.current.charIndex = charIndex + 1
            setDisplayed(current.slice(0, charIndex + 1))
            tick()
          } else {
            // pause at end before deleting
            timer = setTimeout(() => {
              stateRef.current.deleting = true
              tick()
            }, 1800)
          }
        } else {
          if (charIndex > 0) {
            stateRef.current.charIndex = charIndex - 1
            setDisplayed(current.slice(0, charIndex - 1))
            tick()
          } else {
            stateRef.current.deleting = false
            stateRef.current.stringIndex = (stringIndex + 1) % strings.length
            tick()
          }
        }
      }, delay)
    }

    tick()

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return displayed
}
