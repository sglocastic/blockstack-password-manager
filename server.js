const Bundler = require('parcel-bundler');
const cors = require('cors')
const app = require('express')();

async function start() {
  const file = 'index.html';
  const options = {};

  const bundler = new Bundler(file, options);

  app.use(cors())
  app.use(bundler.middleware());

  app.listen(8080);
}

start();