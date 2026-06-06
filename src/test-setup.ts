import '@testing-library/jest-dom'

// jsdom does not implement requestAnimationFrame/cancelAnimationFrame
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number
}
if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = (id) => clearTimeout(id)
}

// jsdom does not implement IntersectionObserver
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver
}
