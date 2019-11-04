'use strict';

const chalk = require('chalk');

const log = message => console.log(message);

class Logs {
  constructor(morningSun) {
    this.morningSun = morningSun;
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
