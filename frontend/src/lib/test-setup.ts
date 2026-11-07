import "@testing-library/jest-dom/vitest";

// Creates temporary storage for automated tests.
const storage = new Map<string, string>();

const localStorageMock = {
  getItem(key: string) {
    return storage.get(key) ?? null;
  },

  setItem(key: string, value: string) {
    storage.set(key, String(value));
  },

  removeItem(key: string) {
    storage.delete(key);
  },

  clear() {
    storage.clear();
  },

  key(index: number) {
    return Array.from(storage.keys())[index] ?? null;
  },

  get length() {
    return storage.size;
  },
};

// Replaces browser storage with the test version.
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});
