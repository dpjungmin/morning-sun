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
    // Timeout: 5000ms
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

      if (response.data.error) throw new Error(chalk.red(response.data.error));

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

      if (!dataObject) return false;

      dataObject.voltage = dataObject.voltage || false;
      dataObject.current = dataObject.current || false;
      dataObject.power = dataObject.power || false;
      dataObject.chargeRate = dataObject.chargeRate || false;

      const { voltage, current, power, chargeRate } = dataObject;

      if (!voltage || !current || !power || !chargeRate) return false;

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
        throw new Error(
          chalk.yellow('You are offline. Failed to publish data.')
        );

      // publish data
      const response = await this.request.post('/api/msun/publish', message);

      this.logDataSent(response);

      return true;
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;

      if (shouldBeQueued) {
        this.pushMessageToQueue(message);
        return true;
      }

      log(error);
      return true;
    }
  }

  pushMessageToQueue(message) {
    var queue = this.msun.offlinePublishQueue;
    var maxSize = this.msun.offlineQueueMaxSize;
    var behavior = this.msun.config.offlineQueueDropBehavior; // oldest or newest

    queue.push(message);

    if (queue.length > maxSize) {
      if (behavior === 'oldest') {
        queue.shift();
      } else if (behavior === 'newest') {
        queue.pop();
      }
    }

    console.log(
      chalk.greenBright.bold('[Enqueuing]'),
      'data/log was added to the queue',
      chalk.blue(
        `[MAX QUEUE SIZE: ${maxSize}, CURRENT QUEUE SIZE: ${queue.length}]`
      )
    );
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
        this.publishQueuedMessage(message, true);
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
        throw new Error(
          chalk.yellow(
            'Offline while publishing queued messages. Queuing messages again... '
          )
        );

      var { values: isData, type: isLog } = message;
      isData = isData || false;
      isLog = isLog || false;

      if (isData) {
        const response = await this.request.post('/api/msun/publish', message);
        this.logDataSent(response, 'data');
      }

      if (isLog) {
        const response = await this.request.post('/api/msun/log', message);
        this.logDataSent(response, 'log');
      }
    } catch (error) {
      log(error.toString().split('at')[0]);
      this.pushMessageToQueue(message);
    }
  }

  logDataSent(response, type = false) {
    var createdAt = response.data.date.split('G')[0];

    if (type) {
      return console.log(
        chalk.magenta.bold('[Dequeuing]'),
        'published',
        chalk.italic.underline(`${type}`),
        chalk.whiteBright(`created at ${createdAt}`)
      );
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
