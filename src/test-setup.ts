import '@testing-library/jest-dom'

// jsdom does not implement requestAnimationFrame/cancelAnimationFrame
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16) as unknown as number
}
if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = (id) => clearTimeout(id)
}
