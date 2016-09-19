import {
  getUnpatchedEnv,
  getUnpatchedFn
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

describe('jasmine default interface patch', () => {
  let unpatchedIt = getUnpatchedFn(jasmine.getEnv(), 'it');
  
  it('should be patched', () => {
    expect(global.it).not.toBe(unpatchedIt);
  });
});
