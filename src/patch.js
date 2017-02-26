import {
  cleanError,
  coerceToError,
  patchFn
} from './utils';

function patchDone (done) {
  let doneFailDelegate = done.fail;

  if (doneFailDelegate) {
    done.fail = function () {
      if (arguments[0]) {
        arguments[0] = cleanError(coerceToError(arguments[0]));
      }
      
      return doneFailDelegate.apply(this, arguments);
    };
  }
}

function patchJasmineFn (obj, slot, fnArgIndex) {
  let delegate = obj[slot];

  patchFn(obj, slot, function (delegate, args) {
    let testFn = args[fnArgIndex];

    args[fnArgIndex] = function (done) {
      let testFnHasDoneArg = testFn.length >= 1;
      let returnValue;

      patchDone(done);

      try {
        if (testFnHasDoneArg) {
          returnValue = testFn.call(this, done);
        } else {
          returnValue = testFn.call(this);
          if (returnValue && returnValue.then) {
            returnValue.then(done, done.fail);
          } else {
            done();
          }
        }
      } catch (e) {
        done.fail(e);
      }

      return returnValue;
    };
    
    return delegate.apply(this, args);
  });
}

function patchEnv (env) {
  let targets = [
    {slot: 'afterEach', fnArgIndex: 0},
    {slot: 'beforeEach', fnArgIndex: 0},
    {slot: 'beforeAll', fnArgIndex: 0},
    {slot: 'afterAll', fnArgIndex: 0},
    {slot: 'it', fnArgIndex: 1},
    {slot: 'fit', fnArgIndex: 1}
  ];

  targets.forEach(target => {
    patchJasmineFn(env, target.slot, target.fnArgIndex);
  });
} 

function patchEnvCtor (obj, slot) {
  patchFn(obj, slot, function (delegate, args) {
    var target = Object.create(delegate.prototype);
    var obj = delegate.apply(target, arguments);
    var retVal = obj || target;

    patchEnv(retVal);

    return retVal;
  });
}

export function apply () {
  patchEnv(global.jasmine.getEnv());

  if (global.jasmine.Env) {
    patchEnvCtor(global.jasmine, 'Env');
  }
}
