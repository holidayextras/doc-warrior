var async = require('async');
var path = require('path');
var VError = require('verror');
var rules = require('./rules');

var docWarrior = function(opts){
  if(!opts) throw new VError('No options passed to DocWarrior');
  if(!opts.connector || !opts.connector.type) throw new VError('No connector passed to DocWarrior');
  this._loadConnector(opts.connector);
};

docWarrior.prototype._loadConnector = function(opts){
  var filePath = path.join(__dirname, 'connectors', opts.type);
  var docConnection = require(filePath);
  this.connector = new docConnection(opts);
};

docWarrior.prototype.get = function(opts, callback){
  var self = this;
  if(!opts) return callback(new VError('opts not passed to get'));
  if(!opts.docs) return callback(new VError('docs not passed within opts to get'));

  var date = opts.params && opts.params.date ? opts.params.date : null;
  var docs = [];
  async.each(opts.docs, function(docType, callback) {
    self._processDocument(docType, date, opts.params, function(err, content){
      if(err) return callback(err);
      docs[docType] = content;
      return callback();
    });
  }, function(err){
    if(err) return callback(err);
    var finalContent = self._returnInOrder(opts.docs, docs);
    return callback(null, finalContent);
  });
};

docWarrior.prototype._processDocument = function(docType, date, params, callback){
  var self = this;
  if(!docType) return callback(new VError('No docType passed to _processDocument'));

  this._getDocument(docType, date, function(err, docs){
    if(err || !docs) return callback(err, '');
    var contentToReturn = docs.filter(function(doc) {
      return (!doc.rules || Object.keys(doc.rules).length === 0) || (self._runDocumentRules(doc.rules, params));
    }).map(function(doc) {
        return doc.content;
    }).join('\n');
    return callback(null, contentToReturn);
  });
};

docWarrior.prototype._getDocument = function(docType, date, callback){
  if(!docType) return callback(new VError('No docType passed to _getDocument'));
  this.connector.getDocument(docType, date, callback);
};

docWarrior.prototype._runDocumentRules = function(docRules, params){
  if(!docRules || !params) return false;

  var rulesPass = true;

  async.each(Object.keys(docRules), function(ruleType){
    var rule = rules[ruleType];

    if(!rule){
      rulesPass = false;
      return;
    }

    for (var matchParam in docRules[ruleType]){

      if(!matchParam in params) {
        rulesPass = false;
      }

      if(ruleType === 'notEqual' && (rule(docRules[ruleType][matchParam], params[matchParam]))) {
        rulesPass = true;
      } else {
        if(!rule(docRules[ruleType][matchParam], params[matchParam])) rulesPass = false;
      }
    };
  });

  return rulesPass;
};

docWarrior.prototype._returnInOrder = function(requested, docs){
  if(!requested || !docs) return '';
  var finalContent = '';

  requested.forEach(function(docType){
    if(docs[docType] != '') finalContent += docs[docType] + '\n\n';
  });

  return finalContent;
};


module.exports = docWarrior;
