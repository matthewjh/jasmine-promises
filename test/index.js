import 'es6-promise';
import '../src/index';
import {
  runEventuallyWithPromiseAndDone,
  runEventuallyWithPromise,
  runEventuallyWithDone,
  runSync,
  failEventuallyWithPromise,
  failEventuallyWithDone,
  failSync,
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
  afterEach: _afterEach,
  afterAll: _afterAll,
  it: _it,
  fit: _fit
} = jasmine.getEnv();

let counter;

let interfaces = [
  {name: 'global/default interface', obj: global},
  {name: 'custom interface', obj: jasmineRequire.interface(jasmine, jasmine.getEnv())}
];

let runFns = [
  runSync,
  runEventuallyWithPromise,
  runEventuallyWithDone,

  /*
   * In this case, the `done` call should take precedence.
   */
  runEventuallyWithPromiseAndDone
];

let failFns = [
  failEventuallyWithPromise,
  failEventuallyWithDone,
  failSync
];

interfaces.forEach(i => {
  let obj = i.obj;

  runFns.forEach(run =>  {

    _describe(`using ${i.name} with ${run.name}:`, () => {
      _beforeEach(() => {
        global.currentJasmineEnv = jasmine.getEnv();
      });

      _describe('beforeEach', () => {
        _beforeAll(resetCounter);

        obj.beforeEach(run(() => {
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

        obj.afterEach(run(() => {
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

        obj.beforeAll(run(() => {
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
          obj.afterAll(run(() => {
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

        obj.it('[stub]', run(() => {
          counter++;
        }));

        _it('should correctly handle completed async task', () => {
          expect(counter).toBe(1);
        });
      });
    });
  });

  // failFns.forEach(fail => {
  //   _describe(`using ${i.name} with ${fail.name}:`, () => {
  //     _describe('it', () => {
  //       _it('should execute it block after failing beforeEach', fail());

  //       _afterEach(() => {
  //         console.log('hier');
  //       });
  //     });
  //   });
  // });
});

_describe('focused fns', () => {
  /*
   * We have to run the tests of focused fns (e.g. fit) in their own jasmine env
   * so that they don't clobber other tests.
   */

  _it('should correctly handle completed async task', (done) => {
    let log = [];
    let env = new jasmine.Env();

    env.addReporter({
      jasmineDone: () => {
        expect(log).toEqual([
          'a',
          'b'
        ]);
        done();
      }
    });

    let obj = jasmineRequire.interface(jasmine, env);

    env.describe('fit', () => {
      obj.fit('[stub]', runEventuallyWithPromise(() => {
        log.push('a');
      }));

      env.fit('[stub]', () => {
        log.push('b');
      });
    });

    env.execute();
  });
});
