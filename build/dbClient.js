var mysql = require('mysql');
var config = require('../config/config');
var pool = mysql.createPool(config.db);

var dbClient = {};
module.exports = dbClient;

dbClient._query = function(sql, callback) {
  pool.query(sql, callback);
};

dbClient._queryWithValues = function(options, callback) {
  pool.query(options.sql, options.values, callback);
};

dbClient.getLatestVersion = function(type, callback){
  if(!type) return callback('Missing type parameter', null);
  var query = 'SELECT markdown, rules, date FROM versions \
    WHERE `type` = "' + type + '" ORDER BY date DESC LIMIT 1;'

  var options = {
    query: query
  };

  dbClient._query(query, function(err, row){
    if(!row || !row[0] || err) return callback(err);

    var result = row[0];
    try{
      result.rules = JSON.parse(result.rules);
    } catch(e) {
      result.rules = {};
    }
    console.log(result);
    callback(null, result);
  });

}
