let keyCache = {};

function getKey (name) {
  let key;
  let verboseName = '$jasmine-promises-delegate-' + name;

  if (!keyCache[name]) {
    if (typeof global.Symbol === 'function') {
      keyCache[name] = Symbol(verboseName);
    } else {
      keyCache[name] = verboseName;
    }
  }

  return keyCache[name];
}

export function patchFn (obj, slot, patch) {
  let k = getKey(slot);
  let delegate = obj[slot];

  if (delegate && !obj[k]) {
    Object.defineProperty(obj, k, {
      value: delegate,
      enumerable: false
    });

    obj[slot] = function () {
      return patch.call(this, delegate, arguments);
    };
  }
}

export function getUnpatchedFn (obj, slot) {
  let k = getKey(slot);
  let unpatchedFn = obj[k];

  if (!unpatchedFn) {
    throw new Error('object has no unpatched fn for ' + slot);
  }

  return unpatchedFn;
}

export function cleanError (error) {
  function isFrameRelevant (frame) {
    return frame.indexOf('jasmine-promises') === -1;
  }

  if (error.stack) {
    let frames = error.stack.split('\n');

    error.stack = frames.filter(isFrameRelevant).join('\n');
  }

  return error;
}

export function coerceToError (reason) {
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
