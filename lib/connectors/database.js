var mysql = require('mysql');
var pool = null;

var database = function(opts){
  console.log(opts);
  pool = mysql.createPool(opts);
};

database.prototype._queryWithValues = function(opts, callback) {
  pool.query(opts.sql, opts.values, callback);
};

database.prototype._getDocument = function(opts, date, callback){
  if(date){
    this.getVersion(opts, date, callback);
  } else {
    this.getLatest(opts, callback);
  }

}

database.prototype.getLatest = function(doc, callback){
  if(!doc) return callback('Missing type parameter');
  var query = 'SELECT content, rules FROM versions \
    WHERE `type` = ? ORDER BY date DESC LIMIT 1;'

  var options = {
    sql: query,
    values: [doc]
  };

  this._queryWithValues(options, function(err, row){
    if(!row || !row[0] || err) return callback(err);

    var result = row[0];
    try{
      result.rules = JSON.parse(result.rules);
    } catch(e) {
      result.rules = {};
    }

    return callback(null, result);
  });

};

database.prototype.getVersion = function(doc, date, callback){
  if(!doc) return callback('Missing type parameter');
  var query = 'SELECT content, rules FROM versions \
    WHERE `type` = ? AND `date` <= ? ORDER BY date DESC LIMIT 1;'
  var options = {
    sql: query,
    values: [doc, date]
  };

  this._queryWithValues(options, function(err, row){
    if(!row || !row[0] || err) return callback(err);

    var result = row[0];
    try{
      result.rules = JSON.parse(result.rules);
    } catch(e) {
      result.rules = {};
    }

    return callback(null, result);
  });
};

module.exports = database;