var mysql = require('mysql');
var VError = require('verror');
var pool = null;
var util = require('util');


var database = function(opts){
  if(!opts) {
    opts = {};
  };
  this.config = opts;

  if(!this.config.table) this.config.table = 'versions';
  if(!opts.customQuery) pool = mysql.createPool(opts);
};

database.prototype._queryWithValues = function(opts, callback){
  if(this.config.customQuery) return this.config.customQuery(opts, callback);
  return pool.query(opts.sql, opts.values, callback);
};

database.prototype.checkForParagraphs = function(doc, date, callback) {
  if(!doc) return callback(new VError('doc parameter not passed to checkForParagraphs.'));
  if(date && isNaN(Date.parse(date))) return callback(new VError('date parameter passed to _getVersion in an incorrect format.'));
  if(!date) date = 'NOW()'; // If theres no date passed in, get latest document with NOW()
  var docsWithSubdirectories = doc + '%';
  console.log('Booking Date', date);
  var query = 'SELECT type, content FROM ?? \
    WHERE `type` LIKE ? AND `date` <= ? \
    GROUP BY type;';
  var options = {
    sql: query,
    values: [this.config.table, docsWithSubdirectories, date]
  };
  this._queryWithValues(options, function(err, rows){
    console.log(err);
    if(err) return callback(err);
    if(!rows || !rows[0]) return callback(null, [{ type: doc }]);
    if(rows && rows.type) rows.type = JSON.parse(rows.type);
    console.log('DOC_CHECKING', util.inspect(doc));
    console.log('DB ROWS', util.inspect(rows));
    return callback(null, rows);
  });
};

database.prototype.getDocument = function(doc, date, callback){
  console.log('DOC to fetch', doc);
  if(!doc) return callback(new VError('doc parameter not passed to getDocument.'));
  if(date && isNaN(Date.parse(date))) return callback(new VError('date parameter passed to _getVersion in an incorrect format.'));
  if(!date) date = 'NOW()'; // If theres no date passed in, get latest document with NOW()

  var query = 'SELECT type, MAX(date) AS date, \
    (SELECT rules FROM ' + this.config.table + ' v2 WHERE v2.type = v.type AND v2.date = max(v.date)) AS rules, \
    (SELECT content FROM ' + this.config.table + ' v2 WHERE v2.type = v.type AND v2.date = max(v.date)) AS content \
    FROM ' + this.config.table + ' v \
    WHERE type LIKE ? \
    AND date <= ? \
    GROUP BY type;'
  var options = {
    sql: query,
    values: [doc + '%', date]
  };

  this._queryWithValues(options, function(err, rows){
    if(err) return callback(err);
    if(!rows || !rows[0]) return callback();
    var results = [];
    if (rows.length === 1) {
      results.push(rows[0]);
    } else {
      rows.splice(0, 1);
      results = rows;
    }
    console.log('RESULTS', rows);
    var finalResults = results.map(function(result) {
      if(!result.rules) result.rules = {};

      try{
        result.rules = JSON.parse(result.rules);
      } catch(e) {
        result.rules = {};
      }
      return result
    });
    return callback(null, finalResults);
  });

};

module.exports = database;
