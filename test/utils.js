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

export function failEventuallyWithPromise () {
  return () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        let e = new Error();

        reject(e);
      }, 100);
    });
  };
}

export function failEventuallyWithDone () {
  return (done) => {
    setTimeout(() => {
      let e = new Error();

      done.fail(e);
    }, 100);
  };
}

export function failSync () {
  return () => {
    let e = new Error();

    throw e;
  };
}

export function stubIt (env = jasmine.getEnv()) {
  env.it('[stub]', () => {});
}
