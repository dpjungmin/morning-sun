'use strict';

const _ = require('lodash');

class Config {
  constructor(msun, config) {
    this.msun = msun;

    try {
      const { email, apiKey, deviceId } = config;

      if (!email || !apiKey || !deviceId)
        throw new Error('Provide a valid Email, Api key, Device ID');
      this.update(config);
    } catch (error) {
      console.log(error);
    }
  }

  update(config) {
    return _.merge(this, config);
  }

  async set() {
    try {
      await this.generateToken();
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }

  async generateToken() {
    const accessToken = await this.msun.utils.generateAccessToken();

    this.accessToken = accessToken;
  }
}

module.exports = Config;
