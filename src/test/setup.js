// Vitest global setup.
//
// Under Node 22, jsdom runs can end up with Node's broken built-in
// `localStorage` (no backing file -> `setItem` is not a function). The app's
// try/catch wrappers absorb the failures silently, so tests observe an
// always-empty store with no error — e.g. the onboarding progress bus never
// records anything. Browsers are unaffected; tests just need a working
// in-memory stand-in.
if (
  typeof localStorage === 'undefined' ||
  typeof localStorage?.setItem !== 'function'
) {
  const memory = new Map();
  const shim = {
    getItem: (k) => (memory.has(String(k)) ? memory.get(String(k)) : null),
    setItem: (k, v) => {
      memory.set(String(k), String(v));
    },
    removeItem: (k) => {
      memory.delete(String(k));
    },
    clear: () => memory.clear(),
    key: (i) => Array.from(memory.keys())[i] ?? null,
    get length() {
      return memory.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: shim,
    configurable: true,
  });
}
