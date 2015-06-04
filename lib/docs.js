var async = require('async');
var path = require('path');
var rules = require('require-all')({
  dirname: __dirname + '/rules',
  filter:  /^(?!\.|paths)(.+)\.js$/
});
var connector = null;

var docWarrior = function(opts){
  if(!opts) throw new Error('No options passed to DocWarrior');
  if(!opts.connector || !opts.connector.type) throw new Error('No connector passed to DocWarrior');
  this._loadConnector(opts.connector);
};

docWarrior.prototype._loadConnector = function(opts){
  var filePath = path.join(__dirname, 'connectors', opts.type);
  var docConnection = require(filePath);
  connector = new docConnection(opts);
};

docWarrior.prototype.get = function(opts, callback){
  var self = this;
  if(!opts) return callback('Missing options');
  if(!opts.docs) return callback('No documents passed in');

  var date = opts.params.date ? opts.params.date : null;
  var docs = [];

  async.each(opts.docs, function(docType, callback) {
    self._processDocument(docType, date, function(err, content){
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

docWarrior.prototype._processDocument = function(docType, date, callback){
  var self = this;
  if(!docType) return callback('Missing docName param');

  this._getDocument(docType, date, function(err, doc){
    if(err) return callback(err);
    if(!doc) return callback(null, doc);

    if(self._runDocumentRules(doc)) return callback(null, doc.content);
    return callback(null, '');
  });
};

docWarrior.prototype._getDocument = function(docName, date, callback){
  if(!docName) return callback('No document was passed.');
  return connector.getDocument(docName, date, callback);
};

docWarrior.prototype._runDocumentRules = function(doc, callback){
  return true;
};

docWarrior.prototype._returnInOrder = function(requested, docs){
  if(!requested || !docs) return '';
  var finalContent = '';

  requested.forEach(function(docType){
    finalContent += docs[docType] + '\n\n';
  });
  return finalContent;
};

module.exports = docWarrior;
