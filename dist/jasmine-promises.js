(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var _patch = require('./patch');

if (!global.jasmine) {
  throw new Error('jasmine must be loaded before jasmine-promise');
}

(0, _patch.apply)();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./patch":2}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.apply = apply;
function cleanError(error) {
  function isFrameRelevant(frame) {
    return frame.indexOf('jasmine-promises') === -1;
  }

  if (error.stack) {
    var _frames = error.stack.split('\n');

    error.stack = _frames.filter(isFrameRelevant).join('\n');
  }

  return error;
}

function coerceToError(reason) {
  var error;

  if (reason instanceof Error) {
    error = reason;
  } else {
    error = new Error(reason);

    // generate stacktrace if it doesn't already exist
    try {
      throw error;
    } catch (_) {}
  }

  return error;
}

function patchDone(done) {
  var doneFailDelegate = done.fail;

  if (doneFailDelegate) {
    done.fail = function () {
      if (arguments[0]) {
        arguments[0] = cleanError(coerceToError(arguments[0]));
      }

      return doneFailDelegate.apply(this, arguments);
    };
  }
}

function patchFunction(obj, slot, fnArgIndex) {
  var delegate = obj[slot];

  obj[slot] = function () {
    var testFn = arguments[fnArgIndex];

    arguments[fnArgIndex] = function (done) {
      var testFnHasDoneArg = testFn.length >= 1;
      var returnValue = undefined;

      patchDone(done);

      try {
        if (testFnHasDoneArg) {
          returnValue = testFn.call(this, done);
        } else {
          returnValue = testFn.call(this);
          if (returnValue && returnValue.then) {
            returnValue.then(function () {
              done();
            });

            if (returnValue['catch'] && done.fail) {
              returnValue['catch'](function (error) {
                done.fail(error);
              });
            }
          } else {
            done();
          }
        }
      } catch (e) {
        done.fail(e);
      }

      return returnValue;
    };
    return delegate.apply(this, arguments);
  };
}

function patchInterfaceObj(interfaceObj) {
  var targets = [{ slot: 'afterEach', fnArgIndex: 0 }, { slot: 'beforeEach', fnArgIndex: 0 }, { slot: 'beforeAll', fnArgIndex: 0 }, { slot: 'afterAll', fnArgIndex: 0 }, { slot: 'it', fnArgIndex: 1 }, { slot: 'fit', fnArgIndex: 1 }];

  targets.forEach(function (target) {
    patchFunction(interfaceObj, target.slot, target.fnArgIndex);
  });
}

function patchInterfaceFn(obj) {
  var delegate = obj['interface'];
  obj['interface'] = function () {
    var interfaceObj = delegate.apply(this, arguments);

    patchInterfaceObj(interfaceObj);

    return interfaceObj;
  };
}

function apply() {
  patchInterfaceObj(global);
  patchInterfaceFn(global.jasmineRequire);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
