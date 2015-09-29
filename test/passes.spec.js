import 'es6-promise';
import '../src/index';
import {
  runEventuallyWithPromiseAndDone,
  runEventuallyWithPromise,
  runEventuallyWithDone,
  runSync,
  stubIt,
  interfaces
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

let runFns = [
  runSync,
  runEventuallyWithPromise,
  runEventuallyWithDone,

  /*
   * In this case, the `done` call should take precedence.
   */
  runEventuallyWithPromiseAndDone
];

interfaces.forEach(i => {
  let obj = i.obj;

  runFns.forEach(run =>  {

    _describe(`using ${i.name} with ${run.name}:`, () => {

      _describe('beforeEach', () => {
        _beforeAll(resetCounter);

        obj.beforeEach(run(() => {
          counter++;
        }));

        _it('should correctly handle completed spec', () => {
          expect(counter).toEqual(1);
        });

        _it('should correctly handle completed 2nd spec', () => {
          expect(counter).toEqual(2);
        });
      });

      _describe('afterEach', () => {
        _beforeAll(resetCounter);

        obj.afterEach(run(() => {
          counter++;
        }));

        _it('should correctly handle completed spec', () => {
          expect(counter).toEqual(0);
        });

        _it('should correctly handle completed 2nd spec', () => {
          expect(counter).toEqual(1);
        });
      });

      _describe('beforeAll', () => {
        _beforeAll(resetCounter);

        obj.beforeAll(run(() => {
          counter++;
        }));

        _it('should correctly handle completed spec', () => {
          expect(counter).toEqual(1);
        });

        _it('should correctly handle completed 2nd spec', () => {
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

        _it('should correctly handle completed spec', () => {
          expect(counter).toBe(1);
        });

        _it('should correctly handle completed 2nd spec', () => {
          expect(counter).toEqual(1);
        });
      });

      _describe('it', () => {
        _beforeAll(resetCounter);

        obj.it('[stub]', run(() => {
          counter++;
        }));

        _it('should correctly handle completed spec', () => {
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

  _it('should correctly handle completed specs', (done) => {
    let log = [];
    let env = new jasmine.Env();

    let obj = jasmineRequire.interface(jasmine, env);

    env.describe('fit', () => {
      obj.fit('[stub]', runEventuallyWithPromise(() => {
        log.push('a');
      }));

      env.fit('[stub]', () => {
        log.push('b');
      });
    });

    env.addReporter({
      jasmineDone: () => {
        expect(log).toEqual([
          'a',
          'b'
        ]);
        done();
      }
    });

    env.execute();
  });
});
