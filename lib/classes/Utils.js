'use strict';

const Ora = require('ora');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment');
const isOnline = require('is-online');
const version = require('../../package.json').version;
const baseURL = require('../utils/baseUrl');

const log = message => console.log(message);

const spinner1 = new Ora({
  color: 'cyan',
  spinner: 'point'
});

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
      // Throw error if there is no network connection
      if (await this.isOffline())
        throw new Error(chalk.red('Check your network connection.'));

      // Send request to server
      const response = await this.request.get(
        '/api/msun/generateAccessToken',
        queryParams
      );

      // Server will send an error message if credentials don't match
      if (response.data.error) throw new Error(chalk.red(response.data.error));

      // Server returns a jsonwebtoken
      const { accessToken } = response.data;

      // Set default request headers/content-type
      this.request.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;
      this.request.defaults.headers.post['Content-Type'] = 'application/json';

      return accessToken;
    } catch (error) {
      this.failSpinner1(chalk.red('Failed to initialize.'));

      var errorMessage = error.toString().split('at')[0];

      if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage += ' This might be a problem of our server.';
        log(chalk.red(errorMessage));
        process.exit(1);
      }

      log(`\n${errorMessage.split(':')[1]}\n`);
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
      // Validate data
      dataObject = dataObject || false;

      // Throw error if data object is empty
      if (!dataObject)
        throw new Error(
          chalk.red('Data object is empty. You must provide a data object.')
        );

      dataObject.voltage = dataObject.voltage || false;
      dataObject.current = dataObject.current || false;
      dataObject.power = dataObject.power || false;
      dataObject.chargeRate = dataObject.chargeRate || false;

      const { voltage, current, power, chargeRate } = dataObject;

      // Throw error if data object is not formated
      if (!voltage || !current || !power || !chargeRate)
        throw new Error(chalk.red('Invalid data object format.'));

      // Re-format data object
      dataObject.voltage = this.makeTwoDigitsBeforeDecimalPoint(voltage);
      dataObject.current = this.makeTwoDigitsBeforeDecimalPoint(current);
      dataObject.power = this.makeTwoDigitsBeforeDecimalPoint(power);
      dataObject.chargeRate = this.makeTwoDigitsBeforeDecimalPoint(chargeRate);

      const { today, now } = this.getDateTimeString();

      // Create data object to send
      var message = {
        config: {
          date: new Date().toString(),
          today,
          now,
          deviceId: this.msun.config.deviceId
        },
        values: dataObject
      };

      // Throw error if there is no network connection
      if (await this.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish data.')
        );

      // Publish data
      await this.request.post('/api/msun/publish', message);

      var createdAt = message.config.date.split('G')[0];
      console.log(chalk.cyan('Data sent!', `created at ${createdAt}`));
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;
      // Queue data on publish failure
      if (shouldBeQueued) return this.pushMessageToQueue(message);

      // Only log errors when user does not want queueing
      log(error);
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
      'failed to publish',
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

      // Publish all messages in queue starting from the oldest
      for (var i = 0; i < length; i++) {
        var message = queue.splice(0, 1)[0];
        this.publishQueuedMessage(message);
      }

      this.msun.publishingQueue = false;
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
            'Offline while publishing queued data. Adding the data back to the queue.'
          )
        );

      var { values: isData, type: isLog } = message;
      isData = isData || false;
      isLog = isLog || false;

      if (isData) {
        let createdAt = message.config.date.split('G')[0];
        await this.request.post('/api/msun/publish', message);
        console.log(
          chalk.magenta.bold('[Dequeuing]'),
          'published',
          chalk.italic.blue.underline('data'),
          chalk.whiteBright(`created at ${createdAt}`)
        );
      } else if (isLog) {
        let createdAt = message.date.split('G')[0];
        await this.request.post('/api/msun/log', message);
        console.log(
          chalk.magenta.bold('[Dequeuing]'),
          'published',
          chalk.italic.yellow.underline('log'),
          chalk.whiteBright(`created at ${createdAt}`)
        );
      }
    } catch (error) {
      log(error);
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

    return console.log(chalk.cyan('Data sent!', `created at ${createdAt}`));
  }

  startSpinner1(text) {
    spinner1.start(text);
  }

  succeedSpinner1(text) {
    spinner1.succeed(text);
    spinner1.stop();
  }

  failSpinner1(text) {
    spinner1.fail(text);
    spinner1.stop();
  }

  initMessage() {
    log(
      chalk.blue(`Hi, '${this.msun.config.email}' welcome to Morning Sun! \n\n`)
    );
  }
}

module.exports = Utils;
