'use strict';

const chalk = require('chalk');

const log = message => console.log(message);

class Logs {
  constructor(msun) {
    this.msun = msun;
  }

  critical(message = null) {
    try {
      if (message === null) throw new Error();

      log(chalk.red('Log[critical]:', message));
    } catch (error) {
      this.errorMessage();
      process.exit(1);
    }
  }

  error(message = null) {
    try {
      if (message === null) throw new Error();

      log(chalk.keyword('orange')('Log[error]:', message));
    } catch (error) {
      this.errorMessage();
      process.exit(1);
    }
  }

  warning(message = null) {
    try {
      if (message === null) throw new Error();

      log(chalk.hex('#FFEB6E')('Log[warning]:', message));
    } catch (error) {
      this.errorMessage();
      process.exit(1);
    }
  }

  info(message = null) {
    try {
      if (message === null) throw new Error();

      log(chalk.blue('Log[info]:', message));
    } catch (error) {
      this.errorMessage();
      process.exit(1);
    }
  }

  errorMessage() {
    log(chalk.inverse('Log error: You must provide a message to send.'));
  }
}

module.exports = Logs;
