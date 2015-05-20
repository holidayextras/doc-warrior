var fs = require('fs');
var _ = require('lodash');

if(!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
console.log('Loading ' + process.env.NODE_ENV + ' config!');

var config = {
  db: {
    connectionLimit: 10,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'terms'
  }
};

var configPath = __dirname+'/'+process.env.NODE_ENV+'.js';
if (fs.existsSync(configPath)) {
  var envConfig = require(configPath);
  _.merge(config, envConfig);
}

module.exports = config;
