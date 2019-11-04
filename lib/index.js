'use strict';

require('dotenv').config();

const Config = require('./classes/Config');
const Logs = require('./classes/Logs');
const Firestore = require('../config/dbRef');
const Utils = require('./classes/Utils');
const Version = require('../package.json').version;

class MorningSun {
  constructor() {
    this.logs = new Logs(this);
    this.firestore = new Firestore(this);
    this.utils = new Utils(this);
    this.classes = {};
  }

  init(config) {
    let configObject = config;

    configObject = configObject || {};

    this.version = Version;

    configObject.email = configObject.email || false;
    configObject.apiKey = configObject.apiKey || false;
    configObject.deviceId = configObject.deviceId || false;

    this.config = new Config(this, configObject);

    this.firestore.validateApiKey();
  }

  publish(data) {
    // manage publishing data
  }

  getVersion() {
    return this.version;
  }

  test() {
    this.logs.critical();
    this.logs.error();
    this.logs.warning();
    this.logs.info();
  }
}

const morningSun = new MorningSun();

module.exports = morningSun;
