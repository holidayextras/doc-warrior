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
  if(!opts) return callback('Missing options');

  connector.getLatest('freeif', callback);
  connector.getVersion('freeif', '2015-05-21 16:00:00', callback);


                  // Foreach document, _processDocument
  // var documents = //Array of document types --> _returnInOrder(docs, callback);
  // var finalDocument = returnInORder(documents);
  // return finalDocument;

};

docWarrior.prototype._processDocument = function(docName, date, callback){
  //Async waterfall
  // _getDocument
  // _runDocumentRules
  // return '' or document content depending on pass/fail for rules
};

docWarrior.prototype._getDocument = function(docName, date, callback){
  // If date, call connector.getLatest(doc);
  // else call connector.getAll(doc);

  return {freeif: [rules: 'blah', document: 'hey i am a free if doc']};
};

docWarrior.prototype._runDocumentRules = function(doc, callback){
  // Run the rules! arghh
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