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

database.prototype._removeMixedFormats = function(rows) {
  if (rows.length === 1) return rows;
  return rows.filter(function(row) {
    return /\//.test(row.type);
  });
};

database.prototype.getDocument = function(doc, date, callback){
  var self = this;
  if(!doc) return callback(new VError('doc parameter not passed to getDocument.'));
  if(date && isNaN(Date.parse(date))) return callback(new VError('date parameter passed to _getVersion in an incorrect format.'));
  if(!date) date = 'NOW()'; // If theres no date passed in, get latest document with NOW()
  /*
    This query search for the most recent of each set of terms before the date passed in
    This is in order to allow it to support the structure of older terms and conditions
  */
  var tabelName = this.config.table;
  var query = 'SELECT type, MAX(date) AS date, \
    (SELECT DISTINCT rules FROM ' + tabelName + ' \
      v2 WHERE v2.type = v.type AND v2.date = max(v.date)) AS rules, \
    (SELECT DISTINCT content FROM ' + tabelName + ' \
      v2 WHERE v2.type = v.type AND v2.date = max(v.date)) AS content \
    FROM ' + tabelName + ' v \
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
    rows = self._removeMixedFormats(rows);

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
