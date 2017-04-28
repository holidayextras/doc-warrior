var mysql = require('mysql');
var VError = require('verror');
var pool = null;

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

database.prototype.getDocument = function(doc, date, callback){
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
    if (rows.length > 1)  rows.splice(0, 1);

    var finalResults = rows.map(function(row) {
      if(!row.rules) row.rules = {};

      try{
        row.rules = JSON.parse(row.rules);
      } catch(e) {
        row.rules = {};
      }
      return row
    });
    return callback(null, finalResults);
  });

};

module.exports = database;
