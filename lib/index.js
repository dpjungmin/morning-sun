'use strict';

require('dotenv').config();

const Config = require('./classes/Config');
const Log = require('./classes/Log');
const Utils = require('./classes/Utils');
const Version = require('../package.json').version;

class MorningSun {
  constructor(config) {
    let configObject = config;

    configObject = configObject || {};

    this.version = Version;

    configObject.email = configObject.email || false;
    configObject.apiKey = configObject.apiKey || false;
    configObject.deviceId = configObject.deviceId || false;
    configObject.validation = configObject.validation || false;
    configObject.removeMessages = configObject.removeMessages || false;
    configObject.display = configObject.display === false ? false : true;

    this.initialized = false;
    this.log = new Log(this);
    this.utils = new Utils(this);
    this.classes = {};

    this.config = new Config(this, configObject);
  }

  async init() {
    await this.config.set();
    if (!this.config.removeMessages && this.initialized) {
      this.utils.initMessage();
    }
  }

  // Get current date and time (ex. 2019-11-06, 01:55:13)
  // return value: object (keys: today, now)
  getTime() {
    return this.utils.getDateTimeString();
  }

  // Publish data to cloud
  async publish(data) {
    const response = await this.utils.publishData(data);

    if (!this.config.display) return;

    this.utils.consoleLog(response);
  }

  getConfig() {
    console.log(this.config);
  }

  getVersion() {
    return this.version;
  }
}

const device = config => new MorningSun(config);

module.exports = device;
