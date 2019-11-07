'use strict';

require('dotenv').config();

const Config = require('./classes/Config');
const Log = require('./classes/Log');
const Utils = require('./classes/Utils');
const Version = require('../package.json').version;

const QUEUE_MAX_SIZE = 5;

class MorningSun {
  constructor(config) {
    let configObject = config;

    configObject = configObject || {};

    this.version = Version;

    configObject.email = configObject.email || false;
    configObject.apiKey = configObject.apiKey || false;
    configObject.deviceId = configObject.deviceId || false;
    configObject.validation = configObject.validation || false;
    configObject.display = configObject.display === false ? false : true;

    this.initialized = false;
    this.log = new Log(this);
    this.utils = new Utils(this);
    this.classes = {};

    // set options for these
    this.offlinePublishQueue = [];
    this.offlineQueueing = true;
    this.offlineQueueMaxSize = QUEUE_MAX_SIZE;
    this.offlineQueueDropBehavior = 'oldest'; // oldest or newest

    this.publishingQueue = false;

    this.config = new Config(this, configObject);
  }

  async init() {
    await this.config.set();
    if (this.initialized) this.utils.initMessage();
  }

  // Get current date and time (ex. 2019-11-06, 01:55:13)
  // return value: object (keys: today, now)
  getTime() {
    return this.utils.getDateTimeString();
  }

  // Publish data to cloud
  async publish(data) {
    if (this.offlinePublishQueue.length > 0 && !this.publishingQueue)
      this.utils.publishMessagesInQueue();

    await this.utils.publishData(data);
  }

  // Dev function
  getFakeDataObject() {
    var voltage = Math.random() * 10;
    var current = Math.random() * 10;
    var power = voltage * current;
    var chargeRate = Math.random() * 100;

    var data = {
      voltage,
      current,
      power,
      chargeRate
    };

    return data;
  }

  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
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
