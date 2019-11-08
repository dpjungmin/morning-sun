# Morning Sun [![npm version](https://img.shields.io/npm/v/morning-sun)](https://www.npmjs.com/package/morning-sun) [![license](https://img.shields.io/github/license/horimz/morning-sun)](https://www.npmjs.com/package/morning-sun)

> Real-time tracking for photovoltaic panels.

## Install

```
npm i --save morning-sun
```

## Usage

```javascript
const msunIot = require('morning-sun');

const config = {
  email: 'your-email',
  apiKey: 'your-api-key',
  deviceId: 'your-device-id'
};

const msun = msunIot(config);

async function run() {
  await msun.init();

  var data = yourFunctionToReadSensorValues();

  msun.publish(data);
}

run();
```

## Table of contents

- [Config Object](#config-object)
- [Features](#features)
- [API](#api)
- [Example](#example)

## Config Object

Your config object must contain your account email, Api key, and Device ID

```js
const config = {
  email: 'your-email',
  apiKey: 'your-api-key',
  deviceId: 'your-device-id'
};
```

### Options

| Name                     | Type    | Default  | Values             |
| ------------------------ | ------- | -------- | ------------------ |
| offLineQueueing          | Boolean | true     | true, false        |
| offlineQueueDropBehavior | String  | 'oldest' | 'oldest', 'newest' |

#### offLineQueueing

Queues the data/logs when they fail to be published.

#### offlineQueueDropBehavior

The drop behavior when the queue is full.

The `oldest` option will remove values that were first added to the queue, and the `newest` will remove values that were recently added to the queue.

---

The default config object would look like this

```js
const config = {
  email: 'your-email',
  apiKey: 'your-api-key',
  deviceId: 'your-device-id',
  offLineQueueing: true,
  offlineQueueDropBehavior: 'oldest'
};
```

[back to top](#table-of-contents)

## Features

1. Publish data

You can publish sensor values (voltage, current, power, and charge rate) from your devices.

2. Logging

You can log events with different levels (critical, error, warning, info)

[back to top](#table-of-contents)

## API

##### .init()

Requests a jsonwebtoken to the server and stores it in the config object. You must call this function before publishing any data.

```javascript
async function() {
  await msun.init();
}
```

##### .publish(data)

Publishes a data object.

The data object must be formatted correctly.

```js
var data = {
  voltage: 9.5,
  current: 0.41,
  power: 3.895,
  chargeRate: 43.8
};
```

The values will be converted into two digits before decimal point.

##### .sleep(ms)

The sleep method returns a `Promise` after `ms`

```javascript
async function () => {
  await msun.sleep(1000);
}
```

##### .getTime()

Returns an object with two keys.

```javascript
const { today, now } = msun.getTime();
```

```js
{
  today: 2019-11-09
  now: 03:52:35
}
```

##### .log.critical(message)

##### .log.error(message)

##### .log.warning(message)

##### .log.info(message)

Creates a log with the message provided.

```javascript
msun.log.critical('Somethings went wrong!');
msun.log.error('Your error message');
msun.log.critical('Your warning message');
msun.log.critical('Normal information');
```

[back to top](#table-of-contents)

## Example

```javascript
const msunIot = require('morning-sun');

const config = {
  email: 'your-email',
  apiKey: 'your-api-key',
  deviceId: 'your-device-id'
};

const msun = msunIot(config);

async function run() {
  await msun.init();

  msun.log.info(`Device(${deviceId}) is starting to send values.`);

  while (true) {
    var data = yourFunctionThatReturnsSensorValues();

    msun.publish(data);

    if (data.power > 50) {
      msun.log.warning(`Current: ${data.current}`);
    }

    await msun.sleep(5000);
  }
}

run();
```

[back to top](#table-of-contents)

[morning-sun]: https://www.hawkins19.appspot.com
