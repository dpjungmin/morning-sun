if (process.env.STATUS === 'dev') {
  module.exports = 'http://localhost:5000';
} else {
  module.exports = 'https://msun-hawkins.com';
}
