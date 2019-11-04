'use strict';

const _ = require('lodash');

class Config {
  constructor(morningSun, config) {
    this.morningSun = morningSun;

    try {
      const { email, apiKey, deviceId } = config;
      if (!email || !apiKey || !deviceId) {
        throw new Error();
      }

      this.update(config);
    } catch (error) {
      this.morningSun.utils.throwErrorMessage(
        'You must provide an',
        'email, apiKey, deviceId',
        'in the config object.'
      );
    }
  }

  update(config) {
    return _.merge(this, config);
  }
}

module.exports = Config;
