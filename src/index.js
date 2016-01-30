import {apply} from './patch';

if (!global.jasmine) {
  throw new Error('jasmine must be loaded before jasmine-promise');
}

apply();
