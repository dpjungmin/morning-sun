'use strict';

const chalk = require('chalk');

const log = message => console.log(message);
const logs = (log1, log2) => console.log(log1, log2);

class Logs {
  constructor(msun) {
    this.msun = msun;
  }

  async critical(message = null) {
    try {
      if (message === null) throw new Error();

      const { today, now } = this.msun.utils.getDateTimeString();

      const body = {
        date: new Date().toString(),
        type: 'critical',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(chalk.red('Log[critical]:', message), chalk.yellow(`[sent!]`));
      } else {
        throw new Error();
      }
    } catch (error) {
      this.errorMessage(message);
      log(error);
    }
  }

  async error(message = null) {
    try {
      if (message === null) throw new Error();

      const { today, now } = this.msun.utils.getDateTimeString();

      const body = {
        date: new Date().toString(),
        type: 'error',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(
          chalk.keyword('orange')('Log[error]:', message),
          chalk.yellow(`[sent!]`)
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      this.errorMessage(message);
      log(error);
    }
  }

  async warning(message = null) {
    try {
      if (message === null) throw new Error();

      const { today, now } = this.msun.utils.getDateTimeString();

      const body = {
        date: new Date().toString(),
        type: 'warning',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(
          chalk.hex('#FFEB6E')('Log[warning]:', message),
          chalk.yellow(`[sent!]`)
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      this.errorMessage(message);
      log(error);
    }
  }

  async info(message = null) {
    try {
      if (message === null) throw new Error();

      const { today, now } = this.msun.utils.getDateTimeString();

      const body = {
        date: new Date().toString(),
        type: 'info',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(chalk.blue('Log[info]:', message), chalk.yellow(`[sent!]`));
      } else {
        throw new Error();
      }
    } catch (error) {
      this.errorMessage(message);
      log(error);
    }
  }

  errorMessage(message) {
    log(chalk.inverse(`Failed to publish message: ${message}`));
  }
}

module.exports = Logs;
