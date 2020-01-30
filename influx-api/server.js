'use strict';

var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('/etc/ssl/influxdb-selfsigned.key', 'utf8');
var certificate = fs.readFileSync('/etc/ssl/influxdb-selfsigned.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

var Influx = require('influxdb-nodejs');
                              //admin:password@IP:port/database
var client = new Influx('http://admin:password@localhost:8086/test');
// client.schema('test_msrt', {
//   time: 'string',
//   device: 'string',
//   value: 'float',
// });

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/testdata/:number', (req, res) => {
  const {
    number,
  } = req.params;
  client.queryRaw('SELECT time, device, value FROM test_msrt \
                   ORDER BY time DESC LIMIT ' + number)
  .then(result => {
    res.json(result)
    console.log(res)
  }).catch(err => {
    res.send(err.stack)
    console.log(res)
  })
});

var httpsServer = https.createServer(credentials, app);
var server = httpsServer.listen('8085', function() {
  console.log('Express server listening on port ' + '8085');
});
module.exports = httpsServer;
