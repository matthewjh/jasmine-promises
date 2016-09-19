import 'es6-promise';
import {
  runEventuallyWithPromiseAndDone,
  runEventuallyWithPromise,
  runEventuallyWithDone,
  runSync,
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
  runEventuallyWithPromiseAndDone,
  runEventuallyWithPromise,
  runEventuallyWithDone,
  runSync
].forEach(run => {
  describe(`jasmine Env with ${run.name}`, () => {
    let env;
    let jasmine;

    beforeEach(() => {
      env = new global.jasmine.Env();
      jasmine = global.jasmineRequire.interface(global.jasmine, env);
    });

    it('should correctly order execution', (done) => {
      let log = [];
      let logId = id => {
        log.push(`${id}`); 
      };
      
      jasmine.beforeAll(run(() => logId('A')));
      jasmine.beforeEach(run(() => logId('B')));
      
      jasmine.describe('',  () => {
        jasmine.beforeAll(run(() => logId('C')));
        jasmine.beforeEach(run(() => logId('D')));
        
        jasmine.it('', run(() => logId('E')));
        jasmine.it('', run(() => logId('F')));
        jasmine.it('', run(() => logId('G')));

        jasmine.afterAll(run(() => logId('H')));
        jasmine.afterEach(run(() => logId('I')));       
      });

      jasmine.it('', run(() => logId('J')));
      jasmine.it('', run(() => logId('K')));
      jasmine.it('', run(() => logId('L')));

      env.addReporter({
        specDone () {
          log.push('-');
        },

        suiteDone () {
          log.push('|');
        },
        
        jasmineDone () {
          expect(log).toEqual([
            'A', 'C',
            'B', 'D', 'E', 'I', '-',
            'B', 'D', 'F', 'I', '-',
            'B', 'D', 'G', 'I', '-',
            'H', '|',
            'B', 'J', '-',
            'B', 'K', '-',
            'B', 'L', '-'
          ]);
          
          done();
        }
      });

      env.execute();
    });

    it('should correctly order execution for a focused spec', (done) => {
      let log = [];
      let logId = id => {
        log.push(`${id}`); 
      };
      
      jasmine.beforeAll(run(() => logId('A')));
      jasmine.beforeEach(run(() => logId('B')));
      
      jasmine.describe('',  () => {
        jasmine.beforeAll(run(() => logId('C')));
        jasmine.beforeEach(run(() => logId('D')));
        
        jasmine.fit('', run(() => logId('E')));
        jasmine.it('', run(() => logId('F')));
        jasmine.it('', run(() => logId('G')));

        jasmine.afterAll(run(() => logId('H')));
        jasmine.afterEach(run(() => logId('I')));       
      });

      jasmine.it('', run(() => logId('J')));
      jasmine.it('', run(() => logId('K')));
      jasmine.it('', run(() => logId('L')));

      env.addReporter({
        specDone () {
          log.push('-');
        },

        suiteDone () {
          log.push('|');
        },
        
        jasmineDone () {
          expect(log).toEqual([
            'A', 'C',
            'B', 'D', 'E', 'I', '-',
            '-', '-',
            'H', '|',
            '-',
            '-',
            '-'
          ]);
          
          done();
        }
      });

      env.execute();
    });

    it('should have correct `this` binding', (done) => {
      jasmine.it(run(function () {
        expect(this).toBe(env);
      }));

      env.addReporter({
        jasmineDone () {
          done();
        }
      });

      env.execute();
    });

    it('should correctly report expectations', (done) => {
      var log = [];
      
      jasmine.it('', run(() => {
        jasmine.expect(5).toBe(3);
        jasmine.expect(5).toBe(5);
      }));

      jasmine.it('', run(() => {
        jasmine.expect('Hello, World').toEqual('Hello, World');
      }));
      
      env.addReporter({
        specDone (info) {
          log.push(info);
        },
        
        jasmineDone () {
          expect(log[0].failedExpectations.length).toBe(1);
          expect(log[0].passedExpectations.length).toBe(1);
          expect(log[0].status).toEqual('failed');

          expect(log[1].passedExpectations.length).toBe(1);
          expect(log[1].failedExpectations.length).toBe(0);
          expect(log[1].status).toEqual('passed');
          
          done();
        }
      });

      env.execute();
    });
  });
});
