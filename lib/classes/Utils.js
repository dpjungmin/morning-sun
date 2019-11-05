'use strict';

const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment');
const version = require('../../package.json').version;
const baseURL = require('../utils/baseUrl');

const log = message => console.log(message);

class Utils {
  constructor(msun) {
    this.msun = msun;
    this.request = axios.create({ baseURL });

    const { today, now } = this.getDateTimeString();
    this.today = today;
    this.now = now;
  }

  getVersion() {
    return version;
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

      return accessToken;
    } catch (error) {
      this.throwErrorMessage(
        'Error happened when initializing.',
        '\nThis might be your problem:'
      );
      log('1. Invalid Email. Check your account.');
      console.log(
        '2. Invalid Api Key. Genereate your Api key from our site.',
        '(https://hawkins19.appspot.com)'
      );
      log(
        '3. Invalid Device ID. You must create a device before you initialize.\n'
      );
    } finally {
      this.msun.initialized = true;
    }
  }

  getDateTimeString() {
    var [today, time] = moment()
      .format()
      .split('T');

    var now = time.split('+')[0];

    return { today, now };
  }

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
        throw new Error();
      }

      // create data object to send
      var message = {
        config: {
          date: new Date().toString(),
          today: this.today,
          now: this.now,
          deviceId: this.msun.config.deviceId
        },
        values: dataObject
      };

      log(message);

      // publish data
      await this.request.post('/api/msun/publish', message);
    } catch (error) {
      log(error);
      this.throwErrorMessage(
        'Publish error.',
        'Please check your data format.'
      );
    }
  }

  throwErrorMessage(start = 'error', underline = '', end = '') {
    log(chalk.red(start, chalk.underline.yellow(underline), end));
  }

  initMessage() {
    log(chalk.blue(`Hi, '${this.msun.config.email}' welcome to Morning Sun!`));
    log(chalk.blue('Successfuly initialized.\n'));
  }
}

module.exports = Utils;
