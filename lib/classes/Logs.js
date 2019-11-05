'use strict';

const chalk = require('chalk');

const log = message => console.log(message);

class Logs {
  constructor(msun) {
    this.msun = msun;
  }

  critical() {
    log(chalk.red('critical'));
  }

  error() {
    log(chalk.keyword('orange')('error'));
  }

  warning() {
    log(chalk.yellow('warning'));
  }

  info() {
    log(chalk.blue('info'));
  }
}

module.exports = Logs;
