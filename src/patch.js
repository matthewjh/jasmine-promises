function patchFunction(obj, slot, fnArgIndex) {
  let delegate = obj[slot];

  obj[slot] = function () {
    let testFn = arguments[fnArgIndex];

    arguments[fnArgIndex] = function (done) {
      let testFnHasDoneArg = testFn.length >= 1;
      let returnValue;

      if (testFnHasDoneArg) {
        returnValue = testFn.call(this, done);
      } else {
        returnValue = testFn.call(this);
        if (returnValue && returnValue.then) {
          returnValue.then(() => {
            done();
          });

          if (returnValue.catch && done.fail) {
            returnValue.catch((err) => {
              done.fail(err);
            });
          }

        } else {
          done();
        }
      }

      return returnValue;
    };

    return delegate.apply(this, arguments);
  };
}

function patchInterfaceObj (interfaceObj) {
  let targets = [
    {slot: 'afterEach', fnArgIndex: 0},
    {slot: 'beforeEach', fnArgIndex: 0},
    {slot: 'beforeAll', fnArgIndex: 0},
    {slot: 'afterAll', fnArgIndex: 0},
    {slot: 'it', fnArgIndex: 1},
    {slot: 'fit', fnArgIndex: 1}
  ];

  targets.forEach(target => {
    patchFunction(interfaceObj, target.slot, target.fnArgIndex);
  });
} 

function patchInterfaceFn (obj) {
  let delegate = obj.interface;
  obj.interface = function () {
    var interfaceObj = delegate.apply(this, arguments);

    patchInterfaceObj(interfaceObj);

    return interfaceObj;
  }
}

export function apply () {
  patchInterfaceObj(global);
  patchInterfaceFn(global.jasmineRequire);
}
