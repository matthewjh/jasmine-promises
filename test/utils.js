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

export function runEventuallyWithDone (taskFn) {
  return (done) => {
    setTimeout(() => {
      setTimeout(() => {
        taskFn();
        done();
      });
    }, 100);
  };
}

export function runEventuallyWithPromiseAndDone (taskFn) {
  return (done) => {
    return new Promise(resolve => {
      resolve();
      setTimeout(() => {
        setTimeout(() => {
          taskFn();
          done();
        });
      }, 100);
    });
  };
}

export function runSync (taskFn) {
  return () => {
    taskFn();
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
