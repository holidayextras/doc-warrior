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

database.prototype.checkForParagraphs = function(doc, callback) {
  if(!doc) return callback(new VError('doc parameter not passed to checkForParagraphs.'));
  if(doc === '') return callback(new VError('Empty doc parameter not passed to checkForParagraphs.'));

  var wildcardDoc = '%' + doc + '%';

  var query = 'SELECT type FROM ?? \
    WHERE `type` LIKE ? ORDER BY type ASC;';
  var options = {
    sql: query,
    values: [this.config.table, wildcardDoc]
  };

  this._queryWithValues(options, function(err, rows){
    if(err) return callback(err);
    if(!rows || !rows[0]) return callback();

    var result = rows;
    if(!result.type) result.type = {};

    try{
      result.type = JSON.parse(result.type);
    } catch(e) {
      result.type = {};
    }

    return callback(null, result);
  });
};

database.prototype.getDocument = function(doc, date, callback){
  if(!doc) return callback(new VError('doc parameter not passed to getDocument.'));
  if(date && isNaN(Date.parse(date))) return callback(new VError('date parameter passed to _getVersion in an incorrect format.'));
  if(!date) date = 'NOW()'; // If theres no date passed in, get latest document with NOW()

  console.log('database.js > getDocument ', doc);

  // database.js > getDocument  terms_and_conditions_en
  // database.js > getDocument  terms_and_conditions_mag_en
  // database.js > getDocument  freeif_en
  // database.js > getDocument  bpg_en

  var query = 'SELECT content, rules FROM ?? \
    WHERE `type` = ? AND `date` <= ? ORDER BY date DESC LIMIT 1;'
  var options = {
    sql: query,
    values: [this.config.table, doc, date]
  };

  this._queryWithValues(options, function(err, row){
    if(err) return callback(err);
    if(!row || !row[0]) return callback();

    var result = row[0];
    if(!result.rules) result.rules = {};

    try{
      result.rules = JSON.parse(result.rules);
    } catch(e) {
      result.rules = {};
    }
    console.log('GETDOCASEY: ', result);
    return callback(null, result);
  });

};

module.exports = database;
