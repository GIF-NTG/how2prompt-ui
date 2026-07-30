import '@testing-library/jest-dom'

// jsdom doesn't implement ResizeObserver — react-fast-marquee (used by
// CatalogPage's featured section) calls it on mount, crashing every test
// that renders it without this polyfill.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
