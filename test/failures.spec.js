import 'es6-promise';
import '../src/index';
import {
  failEventuallyWithPromiseError,
  failEventuallyWithDoneError,
  failSyncWithError,
  failEventuallyWithPromiseString,
  failEventuallyWithDoneString,
  failSyncWithString,
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
  failEventuallyWithPromiseError,
  failEventuallyWithDoneError,
  failSyncWithError,
  failEventuallyWithPromiseString,
  failEventuallyWithDoneString,
  failSyncWithString
];

interfaces.forEach(i => {
  let obj = i.obj;

  failFns.forEach(fail => {

    _describe(`using ${i.name} with ${fail.name}:`, () => {
      let env;
      let obj;
      let reportedErrorMessages;
      let reportedErrorStacktraces;

      _beforeEach(() => {
        env = new jasmine.Env();
        obj = jasmineRequire.interface(jasmine, env);
        reportedErrorMessages = [];
        reportedErrorStacktraces = [];

        env.addReporter({
          specDone: (info) => {
            if (info.failedExpectations[0]) {
              let errorMessage = info.failedExpectations[0].message;
              let errorStack = info.failedExpectations[0].stack;
              
              if (errorMessage) {
                let match = errorMessage.match(/\$.*\$/);
                let strippedMessage = match && match[0];
                reportedErrorMessages.push(strippedMessage);
              }

              if (errorStack) {
                reportedErrorStacktraces.push(errorStack);
              }
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

            reportedErrorStacktraces.forEach(s => {
              expect(s).not.toContain('jasmine-promises');
            });
            
            done();
          }
        });

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

            reportedErrorStacktraces.forEach(s => {
              expect(s.split('\n').length > 0).toBeTruthy();
              expect(s).not.toContain('jasmine-promises');
            });
            
            done();
          }
        });

        env.execute();
      });

    });
  });
});
