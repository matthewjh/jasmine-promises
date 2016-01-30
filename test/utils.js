export function runEventuallyWithPromise (taskFn) {
  return function () {
    return new Promise(resolve => {
      setTimeout(() => {
        setTimeout(() => {
          taskFn.call(this);
          resolve();
        });
      }, 100);
    });
  };
}

export function runEventuallyWithDone (taskFn) {
  return function (done) {
    setTimeout(() => {
      setTimeout(() => {
        taskFn.call(this);
        done();
      });
    }, 100);
  };
}

export function runEventuallyWithPromiseAndDone (taskFn) {
  return function (done) {
    return new Promise(resolve => {
      resolve();
      setTimeout(() => {
        setTimeout(() => {
          taskFn.call(this);
          done();
        });
      }, 100);
    });
  };
}

export function runSync (taskFn) {
  return function () {
    taskFn.call(this);
  };
}

export function failEventuallyWithPromise (errorMessage) {
  return () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        let e = new Error(errorMessage);

        reject(e);
      }, 100);
    });
  };
}

export function failEventuallyWithDone (errorMessage) {
  return (done) => {
    setTimeout(() => {
      let e = new Error(errorMessage);

      done.fail(e);
    }, 100);
  };
}

export function failSync (errorMessage) {
  return () => {
    let e = new Error(errorMessage);

    throw e;
  };
}

export function stubIt (env = jasmine.getEnv()) {
  env.it('[stub]', () => {});
}

export let interfaces = [
  {name: 'global/default interface', obj: global},
  {name: 'custom interface', obj: jasmineRequire.interface(jasmine, jasmine.getEnv())}
];
