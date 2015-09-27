import '../src/index';
import {
  describe as _describe,
  beforeEach as _beforeEach,
  beforeAll as _beforeAll,
  it as _it,
  fit as _fit
} from '../src/delegates';

function runEventually (taskFn) {
  return new Promise(resolve => {
    setTimeout(() => {
      setTimeout(() => {
        taskFn();
        resolve();
      });
    }, 100);
  });
}

function runEventuallyFn (taskFn) {
  return () => {
    return runEventually(taskFn);
  };
}

function resetCounter () {
  counter = 0;
}

function stubIt () {
  _it('[stub]', () => {});
}

let counter;

let interfaces = [
  {name: 'global/default interface', obj: global},
  {name: 'custom interface', obj: jasmineRequire.interface(jasmine, jasmine.getEnv())}
];

interfaces.forEach(i => {
  let obj = i.obj;

  _describe(`using ${i.name}:`, () => {
    _describe('beforeEach', () => {
      _beforeAll(resetCounter);

      obj.beforeEach(runEventuallyFn(() => {
        counter++;
      }));

      _it('should correctly handle resolved promise', () => {
        expect(counter).toEqual(1);
      });

      _it('should correctly handle resolved promise (after 2nd spec)', () => {
        expect(counter).toEqual(2);
      });
    });

    _describe('afterEach', () => {
      _beforeAll(resetCounter);

      obj.afterEach(runEventuallyFn(() => {
        counter++;
      }));

      _it('should correctly handle resolved promise', () => {
        expect(counter).toEqual(0);
      });

      _it('should correctly handle resolved promise (after 2nd spec)', () => {
        expect(counter).toEqual(1);
      });
    });

    _describe('beforeAll', () => {
      _beforeAll(resetCounter);

      obj.beforeAll(runEventuallyFn(() => {
        counter++;
      }));

      _it('should correctly handle resolved promise', () => {
        expect(counter).toEqual(1);
      });

      _it('should correctly handle resolved promise (after 2nd spec)', () => {
        expect(counter).toEqual(1);
      });
    });

    _describe('afterAll', () => {
      _beforeAll(resetCounter);

      _describe('', () => {
        obj.afterAll(runEventuallyFn(() => {
          counter++;
        }));

        stubIt();
      });

      _it('should correctly handle resolved promise', () => {
        expect(counter).toBe(1);
      });

      _it('should correctly handle resolved promise (after 2nd spec)', () => {
        expect(counter).toEqual(1);
      });
    });

    _describe('it', () => {
      _beforeAll(resetCounter);

      obj.it('[stub]', runEventuallyFn(() => {
        counter++;
      }));

      _it('should correctly handle resolved promise', () => {
        expect(counter).toBe(1);
      });
    });
  });
});

_describe('focused fns', () => {
  /*
   * We have to run the tests of focused fns (e.g. fit) in their own jasmine env
   * so that they don't clobber other tests.
   */

  let env = new jasmine.Env();
  let obj = jasmineRequire.interface(jasmine, env);

  env.describe('fit', () => {
    env.beforeAll(resetCounter);

    obj.fit('[stub]', runEventuallyFn(() => {
      counter++;
    }));

    env.fit('should correctly handle resolved promise', () => {
      expect(counter).toBe(1);
    });
  });
});

