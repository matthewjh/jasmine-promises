import 'es6-promise';
import {
  failEventuallyWithPromiseError,
  failEventuallyWithDoneError,
  failSyncWithError,
  failEventuallyWithPromiseString,
  failEventuallyWithDoneString,
  failSyncWithString,
  getUnpatchedEnv
} from './utils';

let {
  describe,
  fdescribe,
  it,
  fit,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
  expect
} = getUnpatchedEnv();

[
  failEventuallyWithPromiseError,
  failEventuallyWithDoneError,
  failSyncWithError,
  failEventuallyWithPromiseString,
  failEventuallyWithDoneString,
  failSyncWithString
].forEach(fail => {
  describe(`jasmine Env with ${fail.name}:`, () => {
    let env;
    let jasmine;
    let reportedErrorMessages;
    let reportedErrorStacktraces;

    beforeEach(() => {
      env = new global.jasmine.Env();
      jasmine = global.jasmineRequire.interface(global.jasmine, env);
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

    it('should correctly report failure in focused specs', (done) => {
      jasmine.fit('', fail('$FIT_FAILURE$'));

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

    it('should correctly report failure in specs', (done) => {
      jasmine.it('', fail('$IT_FAILURE$'));

      jasmine.describe('beforeEach', () => {
        jasmine.beforeEach(fail('$BEFORE_EACH_FAILURE$'));

        jasmine.it('', () => {});
      });

      jasmine.describe('beforeAll', () => {
        jasmine.beforeAll(fail('$BEFORE_ALL_FAILURE$'));

        jasmine.it('', () => {});
      });

      jasmine.describe('afterEach', () => {
        jasmine.afterEach(fail('$AFTER_EACH_FAILURE$'));

        jasmine.it('', () => {});
      });

      jasmine.describe('afterAll', () => {
        jasmine.afterAll(fail('$AFTER_ALL_FAILURE$'));

        jasmine.it('', () => {});
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
