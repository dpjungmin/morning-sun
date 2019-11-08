'use strict';

require('dotenv').config();

const Config = require('./classes/Config');
const Log = require('./classes/Log');
const Utils = require('./classes/Utils');
const Version = require('../package.json').version;

const QUEUE_MAX_SIZE = 50;

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
    configObject.offlineQueueing =
      configObject.offlineQueueing === false ? false : true;
    configObject.offlineQueueDropBehavior =
      configObject.offlineQueueDropBehavior === 'newest' ? 'newest' : 'oldest';

    this.log = new Log(this);
    this.utils = new Utils(this);
    this.classes = {};

    this.offlinePublishQueue = [];
    this.offlineQueueMaxSize = QUEUE_MAX_SIZE;
    this.publishingQueue = false;

    this.config = new Config(this, configObject);
  }

  async init() {
    await this.config.set();
  }

  // Get current date and time (ex. 2019-11-06, 01:55:13)
  // return value: object (keys: today, now)
  getTime() {
    return this.utils.getDateTimeString();
  }

  // Publish data to cloud
  publish(data) {
    // Publish data when
    // 1. queue in not empty
    // 2. process is not publishing data in queue
    if (this.offlinePublishQueue.length > 0 && !this.publishingQueue)
      this.utils.publishMessagesInQueue();

    this.utils.publishData(data);
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
