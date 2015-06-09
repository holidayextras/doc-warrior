var mysql = require('mysql');
var pool = null;

var database = function(opts){
  this.config = opts;
  if(!this.config.table) this.config.table = 'versions';
  if(!opts.customFunction) pool = mysql.createPool(opts);
};

database.prototype._queryWithValues = function(opts, callback){
  if(this.config.customFunction) return this.config.customFunction(opts, callback);
  return pool.query(opts.sql, opts.values, callback);
};

database.prototype.getDocument = function(doc, date, callback){
  if(!doc) return callback('doc parameter not passed to getDocument.');
  if(date) return this._getVersion(doc, date, callback);
  return this._getLatest(doc, callback);
};

database.prototype._getLatest = function(doc, callback){
  if(!doc) return callback('doc parameter not passed to _getLatest.');
  var query = 'SELECT content, rules FROM ?? \
    WHERE `type` = ? ORDER BY date DESC LIMIT 1;'

  var options = {
    sql: query,
    values: [this.config.table, doc]
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

database.prototype._getVersion = function(doc, date, callback){
  if(!doc) return callback('doc parameter not passed to _getVersion.');
  if(!date) return callback('date parameter not passed to _getVersion.');
  if(isNaN(Date.parse(date))) return callback('date parameter passed to _getVersion in an incorrect format.');

  var query = 'SELECT content, rules FROM ?? \
    WHERE `type` = ? AND `date` <= ? ORDER BY date DESC LIMIT 1;'
  var options = {
    sql: query,
    values: [this.config.table, doc, date]
  };

  this._queryWithValues(options, function(err, row){
    if(!row || !row[0] || err) return callback(err);

    var result = row[0];
    if(result.rules == '') result.rules = {};

    try{
      result.rules = JSON.parse(result.rules);
    } catch(e) {
      result.rules = {};
    }

    return callback(null, result);
  });
};

module.exports = database;