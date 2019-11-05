if (process.env.STATUS === 'dev') {
  module.exports = 'http://localhost:5000';
} else {
  module.exports = 'https://hawkins19.appspot.com';
}
