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
      if (message === null || message.length === 0)
        return log(chalk.red('You should provide a log message'));

      const { today, now } = this.msun.utils.getDateTimeString();

      var body = {
        date: new Date().toString(),
        type: 'critical',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      if (await this.msun.utils.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish log.')
        );

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(chalk.red('Log[critical]:', message), chalk.cyan(`sent!`));
      } else {
        throw new Error();
      }
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;

      if (shouldBeQueued) return this.msun.utils.pushMessageToQueue(body);

      this.errorMessage(message, error);
    }
  }

  async error(message = null) {
    try {
      if (message === null || message.length === 0)
        return log(chalk.red('You should provide a log message'));

      const { today, now } = this.msun.utils.getDateTimeString();

      var body = {
        date: new Date().toString(),
        type: 'error',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      if (await this.msun.utils.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish log.')
        );

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(
          chalk.keyword('orange')('Log[error]:', message),
          chalk.cyan(`sent!`)
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;

      if (shouldBeQueued) return this.msun.utils.pushMessageToQueue(body);

      this.errorMessage(message, error);
    }
  }

  async warning(message = null) {
    try {
      if (message === null || message.length === 0)
        return log(chalk.red('You should provide a log message'));

      const { today, now } = this.msun.utils.getDateTimeString();

      var body = {
        date: new Date().toString(),
        type: 'warning',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      if (await this.msun.utils.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish log.')
        );

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(
          chalk.hex('#FFEB6E')('Log[warning]:', message),
          chalk.cyan(`sent!`)
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;

      if (shouldBeQueued) return this.msun.utils.pushMessageToQueue(body);

      this.errorMessage(message, error);
    }
  }

  async info(message = null) {
    try {
      if (message === null || message.length === 0)
        return log(chalk.red('You should provide a log message'));

      const { today, now } = this.msun.utils.getDateTimeString();

      var body = {
        date: new Date().toString(),
        type: 'info',
        deviceId: this.msun.config.deviceId,
        today,
        now,
        message
      };

      if (await this.msun.utils.isOffline())
        throw new Error(
          chalk.yellow('You are offline. Failed to publish log.')
        );

      const { status } = await this.msun.utils.request.post(
        '/api/msun/log',
        body
      );

      if (status === 200) {
        if (!this.msun.config.display) return;
        logs(chalk.blue('Log[info]:', message), chalk.cyan(`sent!`));
      } else {
        throw new Error();
      }
    } catch (error) {
      var shouldBeQueued = this.msun.config.offlineQueueing;

      if (shouldBeQueued) return this.msun.utils.pushMessageToQueue(body);

      this.errorMessage(message, error);
    }
  }

  errorMessage(message, error) {
    logs(chalk.inverse(`Failed to publish message: ${message}`), error);
  }
}

module.exports = Logs;
