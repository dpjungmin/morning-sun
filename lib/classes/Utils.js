'use strict';

const chalk = require('chalk');
const version = require('../../package.json').version;

const log = message => console.log(message);

class Utils {
  constructor(morningSun) {
    this.morningSun = morningSun;
  }

  getVersion() {
    return version;
  }

  throwErrorMessage(start, underline, end) {
    log(chalk.red(start, chalk.underline.yellow(underline), end));
  }
}

module.exports = Utils;
