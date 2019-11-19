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
    const { apiKey, deviceId } = this.msun.config;

    let queryParams = {
      params: {
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
      const { accessToken, user, _deviceDocumentId } = response.data;

      // Set default request headers/content-type
      this.request.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;
      this.request.defaults.headers.post['Content-Type'] = 'application/json';

      return { accessToken, user, _deviceDocumentId };
    } catch (error) {
      this.failSpinner1(chalk.red('Failed to initialize.'));

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

    var errno = 0;

    try {
      // Validate data
      dataObject = dataObject || false;

      // Throw error if data object is empty
      if (!dataObject) {
        errno = 1;
        throw new Error(
          chalk.red(
            'Data object is empty. You must provide an object that contains values (power, voltage, and current).'
          )
        );
      }

      dataObject.voltage = dataObject.voltage || false;
      dataObject.current = dataObject.current || false;
      dataObject.power = dataObject.power || false;

      // Throw error if data object is not formated
      if (!dataObject.voltage || !dataObject.current || !dataObject.power) {
        errno = 1;
        throw new Error(
          chalk.red(
            'Invalid data object format. You must provide an object that contains values (power, voltage, and current).'
          )
        );
      }

      var { voltage, current, power } = dataObject;

      // Re-format data object
      dataObject.voltage = this.makeTwoDigitsBeforeDecimalPoint(voltage);
      dataObject.current = this.makeTwoDigitsBeforeDecimalPoint(current);
      dataObject.power = this.makeTwoDigitsBeforeDecimalPoint(power);

      // Throw error if data type is not a Number
      if (!dataObject.voltage || !dataObject.current || !dataObject.power) {
        errno = 1;
        throw new Error(
          chalk.red('Invalid data type. Data type must be a Number.')
        );
      }

      const { today, now } = this.getDateTimeString();

      // Create data object to send
      var message = {
        config: {
          date: new Date().toString(),
          timeinmillis: new Date().getTime(),
          today,
          now,
          deviceId: this.msun.config._deviceDocumentId
        },
        values: dataObject
      };

      // Throw error if there is no network connection
      if (await this.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish data.')
        );

      // Publish data
      // response.data contains the data added to database
      const { status } = await this.request.post('/api/msun/publish', message);

      if (status === 200) {
        var createdAt = message.config.date.split('G')[0];
        console.log(chalk.cyan('Data sent!', `created at ${createdAt}`));
      } else {
        throw new Error();
      }
    } catch (error) {
      if (errno === 1) {
        return log(error);
      }

      var shouldBeQueued = this.msun.config.offlineQueueing;
      // Queue data on publish failure
      if (shouldBeQueued) return this.pushMessageToQueue(message);
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
        if (!message) return;
        await this.publishQueuedMessage(message); // you may remove this await (for demo purpose)
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

      var { values: isData, level: isLog } = message;
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
      chalk.blue(
        `Hi, '${this.msun.config.user.displayName}' welcome to Morning Sun! \n\n`
      )
    );
  }
}

module.exports = Utils;
