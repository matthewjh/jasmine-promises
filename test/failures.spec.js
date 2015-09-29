import 'es6-promise';
import '../src/index';
import {
  failEventuallyWithPromise,
  failEventuallyWithDone,
  failSync,
  stubIt,
  interfaces
} from './utils';

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

let failFns = [
  failEventuallyWithPromise,
  failEventuallyWithDone,
  failSync
];

interfaces.forEach(i => {
  let obj = i.obj;

  failFns.forEach(fail => {

    _describe(`using ${i.name} with ${fail.name}:`, () => {
      let env;
      let obj;
      let reportedErrorMessages;

      _beforeEach(() => {
        env = new jasmine.Env();
        obj = jasmineRequire.interface(jasmine, env);
        reportedErrorMessages = [];

        env.addReporter({
          specDone: (info) => {
            let errorMessage = info.failedExpectations[0] && info.failedExpectations[0].message;

            if (errorMessage) {
              let match = errorMessage.match(/\$.*\$/);
              let strippedMessage = match && match[0];
              reportedErrorMessages.push(strippedMessage);
            }
          }
        });
      });

      _it('should correctly report failure in focused specs', (done) => {
        obj.fit('[stub]', fail('$FIT_FAILURE$'));

        env.addReporter({
          jasmineDone: () => {
            expect(reportedErrorMessages).toEqual([
              '$FIT_FAILURE$',
            ]);
            done();
          }
        })

        env.execute();        
      });

      _it('should correctly report failure in specs', (done) => {
        obj.it('[stub]', fail('$IT_FAILURE$'));

        env.describe('beforeEach', () => {
          obj.beforeEach(fail('$BEFORE_EACH_FAILURE$'));

          stubIt(env);
        });

        env.describe('beforeAll', () => {
          obj.beforeAll(fail('$BEFORE_ALL_FAILURE$'));

          stubIt(env);
        });

        env.describe('afterEach', () => {
          obj.afterEach(fail('$AFTER_EACH_FAILURE$'));

          stubIt(env);
        });

        env.describe('afterAll', () => {
          obj.afterAll(fail('$AFTER_ALL_FAILURE$'));

          stubIt(env);
        });

        env.addReporter({
          jasmineDone: () => {
            expect(reportedErrorMessages).toEqual([
              '$IT_FAILURE$',
              '$BEFORE_EACH_FAILURE$',
              '$BEFORE_ALL_FAILURE$',
              '$AFTER_EACH_FAILURE$'
            ]);
            done();
          }
        })

        env.execute();
      });

    });
  });
});
