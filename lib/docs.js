var path = require('path');
var rules = require('require-all')({
  dirname: __dirname + '/rules',
  filter:  /^(?!\.|paths)(.+)\.js$/
});

var docWarrior = function(opts){
  if(!opts) throw new Error('No options passed to DocWarrior');
  if(!opts.connector) throw new Error('No connector passed to DocWarrior');
  var connector = null;
  this._loadConnector(opts.connector);
};

docWarrior.prototype._loadConnector = function(opts){
  if(!opts.type) throw new Error('No connector passed to DocWarrior');
  var filePath = path.join(__dirname, 'connectors', opts.type);
  var connector = require(filePath);
  this.connector = new connector(opts);
};

docWarrior.prototype.get = function(opts, callback){
  if(!opts) return callback('Missing options');
  return callback(null, 'Yay this will eventually be a document');

  // Foreach document, _processDocument

  //Array of document types --> _returnInOrder(docs, callback);

};

docWarrior.prototype._processDocument = function(docName, date, callback){
  //Async waterfall
  // _getDocument
  // _runDocumentRules
  // return '' or document content
};

docWarrior.prototype._getDocument = function(docName, date, callback){
  // If date, call connector.getLatest(doc);
  // else call connector.getAll(doc);
};

docWarrior.prototype._runDocumentRules = function(doc, callback){
  // Run the rules! arghh
};

docWarrior.prototype._returnInOrder = function(documents, callback){
  // Return
};

module.exports = docWarrior;