'use strict';

require('dotenv').config();

const Config = require('./classes/Config');
const Logs = require('./classes/Logs');
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

    this.initialized = false;
    this.logs = new Logs(this);
    this.utils = new Utils(this);
    this.classes = {};

    this.config = new Config(this, configObject);
  }

  async init() {
    await this.config.set();
    if (!this.removeMessages && this.initialized) {
      this.utils.initMessage();
    }
  }

  time() {
    return this.utils.getDateTimeString();
  }

  async publish(data) {
    await this.utils.publishData(data);
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
