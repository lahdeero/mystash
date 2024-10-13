// vitest-globals.d.ts
export {};

declare global {
  namespace Vitest {
    const describe: (name: string, fn: () => void) => void;
    const test: (name: string, fn: () => Promise<void> | void) => void;
    const it: (name: string, fn: () => Promise<void> | void) => void;
    const expect: (value: any) => {
      toBe: (expected: any) => void;
      // You can add other expect methods you use
    };
    const beforeEach: (fn: () => Promise<void> | void) => void;
    const afterEach: (fn: () => Promise<void> | void) => void;
    const beforeAll: (fn: () => Promise<void> | void) => void;
    const afterAll: (fn: () => Promise<void> | void) => void;
    const vi: {
      fn: (fn?: (...args: any[]) => any) => any;
      // You can add other vi methods you use
    };
  }
}
