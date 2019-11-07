'use strict';

const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment');
const isOnline = require('is-online');
const version = require('../../package.json').version;
const baseURL = require('../utils/baseUrl');

const log = message => console.log(message);

class Utils {
  constructor(msun) {
    this.msun = msun;
    this.request = axios.create({ baseURL });
  }

  getVersion() {
    return version;
  }

  async isOffline() {
    // Timeout: 4000ms
    // Version: v4

    return !(await isOnline());
  }

  async generateAccessToken() {
    const { email, apiKey, deviceId } = this.msun.config;

    let queryParams = {
      params: {
        email,
        apiKey,
        deviceId
      }
    };

    try {
      if (await this.isOffline())
        throw new Error(
          chalk.red('You are offline. Check your network status.')
        );

      const response = await this.request.get(
        '/api/msun/generateAccessToken',
        queryParams
      );

      const { accessToken } = response.data;

      // this.request.defaults.headers.common['Authorization'] = accessToken;
      this.request.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;
      this.request.defaults.headers.post['Content-Type'] = 'application/json';
      this.msun.initialized = true;

      return accessToken;
    } catch (error) {
      log(error);
      process.exit(1);
    }
  }

  getDateTimeString() {
    var [today, time] = moment()
      .format()
      .split('T');

    var now = time.split('+')[0];

    return { today, now };
  }

  makeTwoDigitsBeforeDecimalPoint(n) {
    if (typeof n !== 'number') {
      return false;
    }

    return parseFloat(n.toFixed(2));
  }

  // You should not publish the same data object
  // This method modifies the original data object
  async publishData(data) {
    let dataObject = data;

    try {
      // validate data
      dataObject = dataObject || false;

      if (!dataObject) throw new Error();

      dataObject.voltage = dataObject.voltage || false;
      dataObject.current = dataObject.current || false;
      dataObject.power = dataObject.power || false;
      dataObject.chargeRate = dataObject.chargeRate || false;

      const { voltage, current, power, chargeRate } = dataObject;

      if (!voltage || !current || !power || !chargeRate) {
        throw new Error('Unexpected data object format.');
      }

      dataObject.voltage = this.makeTwoDigitsBeforeDecimalPoint(voltage);
      dataObject.current = this.makeTwoDigitsBeforeDecimalPoint(current);
      dataObject.power = this.makeTwoDigitsBeforeDecimalPoint(power);
      dataObject.chargeRate = this.makeTwoDigitsBeforeDecimalPoint(chargeRate);

      const { today, now } = this.getDateTimeString();

      // create data object to send
      var message = {
        config: {
          date: new Date().toString(),
          today,
          now,
          deviceId: this.msun.config.deviceId
        },
        values: dataObject
      };

      if (await this.isOffline())
        throw new Error(chalk.yellow('You are offline. Queuing messages...'));

      // publish data
      const response = await this.request.post('/api/msun/publish', message);

      this.logDataSent(response);
    } catch (error) {
      log(error.toString().split('at')[0]);
      this.pushMessageToQueue(message);
    }
  }

  pushMessageToQueue(message) {
    var queue = this.msun.offlinePublishQueue;
    var maxSize = this.msun.offlineQueueMaxSize;
    var behavior = this.msun.offlineQueueDropBehavior; // oldest or newest

    try {
      if (queue.length > maxSize) {
        if (behavior === 'oldest') {
          queue.shift();
        } else if (behavior === 'newest') {
          queue.pop();
        } else {
          throw new Error(chalk.red('Undefined queue drop behavior'));
        }
      }

      queue.push(message);
    } catch (error) {
      log(error);
    }
  }

  async publishMessagesInQueue() {
    try {
      if (await this.isOffline()) {
        this.msun.publishingQueue = false;
        return;
      }

      this.msun.publishingQueue = true;
      var queue = this.msun.offlinePublishQueue;
      var length = queue.length;

      // Publish all messages in queue
      for (var i = 0; i < length; i++) {
        var message = queue.splice(0, 1)[0];
        await this.publishQueuedMessage(message, true);
      }
    } catch (error) {
      log(error);
    } finally {
      this.msun.publishingQueue = false;
    }
  }

  async publishQueuedMessage(message) {
    // If network error occurs while publishing queued messages
    // add the message back to the queue
    try {
      if (await this.isOffline())
        throw new Error(chalk.yellow('You are offline. Queuing messages...'));

      // publish data
      const response = await this.request.post('/api/msun/publish', message);

      this.logDataSent(response, true);
    } catch (error) {
      log(error.toString().split('at')[0]);
      this.pushMessageToQueue(message);
    }
  }

  logDataSent(response, queued) {
    var createdAt = response.data.date.split('G')[0];

    if (queued) {
      return console.log('Queued data sent!', `${createdAt}`);
    }

    return console.log('Data sent!', `${createdAt}`);
  }

  initMessage() {
    log(
      chalk.blue(
        `Hi, '${this.msun.config.email}' welcome to Morning Sun! [Authorized]\n\n`
      )
    );
  }
}

module.exports = Utils;
