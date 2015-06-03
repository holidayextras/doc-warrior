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

  opts.docs.forEach(function(doc){
    self._processDocument(doc, opts.params.date, callback);
  });

  // var documents = //Array of document types --> _returnInOrder(docs, callback);
  // var finalDocument = returnInORder(documents);
  // return finalDocument;

};

docWarrior.prototype._processDocument = function(docName, date, cb){
  console.log(docName, date);
  var doc = this._getDocument(docName, date, cb);
  if(this._runDocumentRules){
    return doc;
  }
  return '';
};

docWarrior.prototype._getDocument = function(docName, date, callback){
  if(!docName) return callback('No document was passed.');
  return connector._getDocument(docName, date, callback);
};

docWarrior.prototype._runDocumentRules = function(doc, callback){
  return true;
};

docWarrior.prototype._returnInOrder = function(documents, callback){
  // Return

  // REQUESTED ['terms', 'a', 'b', 'freeif']
  // PARALELL ['a', 'b', 'terms', 'freeif']
  // RETURN ['terms', 'a', 'b', 'freeif']
  // var string = '';
  // foreach REQUESTED {
  //   string += documents.REQUESTED.document;
  // }
};

module.exports = docWarrior;