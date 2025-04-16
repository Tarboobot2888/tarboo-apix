
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.set('json spaces', 2);

const routesDir = path.join(__dirname, '../routes');
const apiList = [];
global.t = 'https://takamura-api.joanimi-world.site';

fs.readdirSync(routesDir).forEach((file) => {
  const route = require(path.join(routesDir, file));
  if (route.path && route.router) {
    app.use(route.path, route.router);
    apiList.push({
      name: route.name || file.replace('.js', '').toUpperCase(),
      type: route.type || 'default',
      endpoint: route.path,
      url: route.url || null,
      logo: route.logo || null,
      status: 'Active',
    });
  }
});

app.get('/api/list', (req, res) => {
  res.json(apiList);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const serverless = require('serverless-http');
module.exports.handler = serverless(app);
