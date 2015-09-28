import '../src/index';
import {
  runEventuallyWithPromiseAndDone,
  runEventuallyWithPromise,
  runEventuallyWithDone,
  stubIt,
  envFns
} from './utils';

function resetCounter () {
  counter = 0;
}

// get references to unpatched fns
let {
  describe: _describe,
  beforeEach: _beforeEach,
  beforeAll: _beforeAll,
  it: _it,
  fit: _fit
} = envFns;

let counter;

let interfaces = [
  {name: 'global/default interface', obj: global},
  {name: 'custom interface', obj: jasmineRequire.interface(jasmine, jasmine.getEnv())}
];

let runEventuallyFns = [
  runEventuallyWithPromise,
  runEventuallyWithDone,

  /*
   * In this case, the `done` call should take precedence.
   */
  runEventuallyWithPromiseAndDone
];

interfaces.forEach(i => {
  let obj = i.obj;

  runEventuallyFns.forEach(runEventually =>  {
    global.currentJasmineEnv = jasmine.getEnv();

    _describe(`using ${i.name} with ${runEventually.name}:`, () => {
      _beforeEach(() => {
        global.currentJasmineEnv = jasmine.getEnv();
      });

      _describe('beforeEach', () => {
        _beforeAll(resetCounter);

        obj.beforeEach(runEventually(() => {
          counter++;
        }));

        _it('should correctly handle completed async task', () => {
          expect(counter).toEqual(1);
        });

        _it('should correctly handle completed async task (after 2nd spec)', () => {
          expect(counter).toEqual(2);
        });
      });

      _describe('afterEach', () => {
        _beforeAll(resetCounter);

        obj.afterEach(runEventually(() => {
          counter++;
        }));

        _it('should correctly handle completed async task', () => {
          expect(counter).toEqual(0);
        });

        _it('should correctly handle completed async task (after 2nd spec)', () => {
          expect(counter).toEqual(1);
        });
      });

      _describe('beforeAll', () => {
        _beforeAll(resetCounter);

        obj.beforeAll(runEventually(() => {
          counter++;
        }));

        _it('should correctly handle completed async task', () => {
          expect(counter).toEqual(1);
        });

        _it('should correctly handle completed async task (after 2nd spec)', () => {
          expect(counter).toEqual(1);
        });
      });

      _describe('afterAll', () => {
        _beforeAll(resetCounter);

        _describe('', () => {
          obj.afterAll(runEventually(() => {
            counter++;
          }));

          stubIt();
        });

        _it('should correctly handle completed async task', () => {
          expect(counter).toBe(1);
        });

        _it('should correctly handle completed async task (after 2nd spec)', () => {
          expect(counter).toEqual(1);
        });
      });

      _describe('it', () => {
        _beforeAll(resetCounter);

        obj.it('[stub]', runEventually(() => {
          counter++;
        }));

        _it('should correctly handle completed async task', () => {
          expect(counter).toBe(1);
        });
      });
    });
  });
});

_describe('focused fns', () => {
  /*
   * We have to run the tests of focused fns (e.g. fit) in their own jasmine env
   * so that they don't clobber other tests.
   */

  let env = global.currentJasmineEnv = new jasmine.Env();
  let obj = jasmineRequire.interface(jasmine, env);

  _describe('fit', () => {
    _beforeAll(resetCounter);

    obj.fit('[stub]', runEventuallyWithPromise(() => {
      counter++;
    }));

    _fit('should correctly handle resolved promise', () => {
      expect(counter).toBe(1);
    });
  });
});

