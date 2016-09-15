import {getUnpatchedFn} from '../src/utils';

export {getUnpatchedFn} from '../src/utils';

function getRandomDelay () {
  return Math.random() * 100;
}

export function runEventuallyWithPromise (taskFn) {
  return function () {
    return new Promise(resolve => {
      setTimeout(() => {
        setTimeout(() => {
          taskFn.call(this);
          resolve();
        });
      }, getRandomDelay());
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
    }, getRandomDelay());
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
      }, getRandomDelay());
    });
  };
}

export function runSync (taskFn) {
  return function () {
    taskFn.call(this);
  };
}

export function failEventuallyWithPromiseError (errorMessage) {
  return () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        let e = new Error(errorMessage);

        reject(e);
      }, getRandomDelay());
    });
  };
}

export function failEventuallyWithDoneError (errorMessage) {
  return (done) => {
    setTimeout(() => {
      let e = new Error(errorMessage);

      done.fail(e);
    }, getRandomDelay());
  };
}

export function failSyncWithError (errorMessage) {
  return () => {
    let e = new Error(errorMessage);

    throw e;
  };
}

export function failEventuallyWithPromiseString (errorMessage) {
  return () => {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(errorMessage);
      }, getRandomDelay());
    });
  };
}

export function failEventuallyWithDoneString (errorMessage) {
  return (done) => {
    setTimeout(() => {
      done.fail(errorMessage);
    }, getRandomDelay());
  };
}

export function failSyncWithString (errorMessage) {
  return () => {
    throw errorMessage;
  };
}

export function getUnpatchedEnv (env = jasmine.getEnv()) {
  let unpatchedEnv = Object.create(env);
  
  [
    'it',
    'fit',
    'beforeEach',
    'beforeAll',
    'afterEach',
    'afterAll'
  ].forEach(s => {
    let fn = getUnpatchedFn(env, s);

    unpatchedEnv[s] = fn.bind(unpatchedEnv);
  });

  return unpatchedEnv;
}
