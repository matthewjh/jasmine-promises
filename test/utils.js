export function runEventuallyWithPromise (taskFn) {
  return () => {
    return new Promise(resolve => {
      setTimeout(() => {
        setTimeout(() => {
          taskFn();
          resolve();
        });
      }, 100);
    });
  };
}

export function stubIt () {
  envFns.it('[stub]', () => {});
}

/*
 * Jasmine fns that will run in env referenced by global.currentJasmineEnv
 */
export let envFns = {
  beforeEach() {
    return global.currentJasmineEnv.beforeEach.apply(global.currentJasmineEnv, arguments);
  },

  beforeAll() {
    return global.currentJasmineEnv.beforeAll.apply(global.currentJasmineEnv, arguments);
  },

  afterEach() {
    return global.currentJasmineEnv.afterEach.apply(global.currentJasmineEnv, arguments);
  },

  afterAll() {
    return global.currentJasmineEnv.afterAll.apply(global.currentJasmineEnv, arguments);
  },

  describe() {
    return global.currentJasmineEnv.describe.apply(global.currentJasmineEnv, arguments);
  },

  fdescribe() {
    return global.currentJasmineEnv.fdescribe.apply(global.currentJasmineEnv, arguments);
  },

  it() {
    return global.currentJasmineEnv.it.apply(global.currentJasmineEnv, arguments);
  },

  fit() {
    return global.currentJasmineEnv.fit.apply(global.currentJasmineEnv, arguments);
  },
};
