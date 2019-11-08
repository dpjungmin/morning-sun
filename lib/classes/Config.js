'use strict';

const _ = require('lodash');
const chalk = require('chalk');

class Config {
  constructor(msun, config) {
    this.msun = msun;

    try {
      const { email, apiKey, deviceId } = config;

      if (!email || !apiKey || !deviceId)
        throw new Error(
          chalk.red('You must provide an Email, Api key, Device ID')
        );
      this.update(config);
    } catch (error) {
      var errorMessage = error.toString().split('at')[0];
      console.log(`\n${errorMessage.split(':')[1]}\n`);
    }
  }

  update(config) {
    return _.merge(this, config);
  }

  async set() {
    this.msun.utils.startSpinner1(chalk.blue('Initializing'));
    await this.generateToken();
    this.msun.utils.succeedSpinner1(chalk.green('Successfuly Initializied!\n'));
    this.msun.utils.initMessage();
  }

  async generateToken() {
    const accessToken = await this.msun.utils.generateAccessToken();

    this.accessToken = accessToken;
  }
}

module.exports = Config;
