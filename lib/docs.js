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
  var docsWithSubdirectories = [];

  self._processSubdirectories(opts.docs, function(err, alldirectories) {
    console.log('DcgetSubs::::', alldirectories);
    //loop through each array item and check that it has a type, if so add to array
    var mergedDirectories = [].concat.apply([], alldirectories);
    mergedDirectories.forEach(function(directory) {
      docsWithSubdirectories.push(directory.type);
    });
    console.log('DAMIAN123444', docsWithSubdirectories);

    async.each(docsWithSubdirectories, function(docType, callback) {
      console.log('DCOPRS: ', docType);
      self._processDocument(docType, date, opts.params, function(err, content){
        if(err) return callback(err);
        docs[docType] = content;
        return callback();
      });
    }, function(err){
      if(err) return callback(err);
      var finalContent = self._returnInOrder(docsWithSubdirectories, docs);
      console.log('DCFINALCONTENT:', finalContent);
      return callback(null, finalContent);
    });

  });
};

docWarrior.prototype._processDocument = function(docType, date, params, callback){
  var self = this;
  if(!docType) return callback(new VError('No docType passed to _processDocument'));

  console.log('_processDocumentType', docType);
  console.log('_processDocumentDate', date);
  console.log('_processDocumentParams', params);

  this._getDocument(docType, date, function(err, doc){
    if(err || !doc) return callback(err, '');

    console.log('_processDocument _getDocument', doc);

    if(!doc.rules || Object.keys(doc.rules).length === 0) return callback(null, doc.content);
    if(self._runDocumentRules(doc.rules, params)) return callback(null, doc.content);
    return callback(null, '');
  });
};

docWarrior.prototype._getDocument = function(docType, date, callback){
  if(!docType) return callback(new VError('No docType passed to _getDocument'));
  this.connector.getDocument(docType, date, callback);
};

docWarrior.prototype._runDocumentRules = function(docRules, params){
  if(!docRules || !params) return false;

  //we do an each on the docRules, so this suggests we can have multiple Equals and notEquals operators
  console.log('docs.js _runDocumentRules rules', docRules);
  console.log('docs.js _runDocumentRules params', params);

  //{"equals":{"brand":["4U","AC","AQ","AT","BA","BF","BH","BN","CH","CO","ED","EI","EJ","EM","ET","FB","FL"],"agent":["WEB1"]},
  //"notEquals":{"productCode":"LGU2","agent":"WEB2"}}

  //looks like it goes through each one and if any evaluate to false it will not return the doc
  var rulesPass = true;
  async.each(Object.keys(docRules), function(ruleType){
    var rule = rules[ruleType];
    if(!rule){
      rulesPass = false;
      return;
    }

    for (var matchParam in docRules[ruleType]){
      if(!matchParam in params) rulesPass = false;
      if(!rule(docRules[ruleType][matchParam], params[matchParam])) rulesPass = false;
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

docWarrior.prototype._processSubdirectories = function(parentDirectories, callback) {
  var self = this;
  if(!parentDirectories) return [];

  console.log('_processSubdirectories', parentDirectories);
  var finalArray = [];

  parentDirectories = ['test_terms_and_conditions_EN', 'freeif_EN', 'bpg_EN']//remove when going live

  async.each(parentDirectories, function(directory, callback) {
    self.connector.checkForParagraphs(directory, function(err, paragraphs) {
      if(err) return callback(err);
      finalArray.push(paragraphs);
      return callback();
    });
  }, function(err) {
    if(err) return callback(err);

    console.log('dcFinalArray:', finalArray);
    return callback(null, finalArray);
  });

};

module.exports = docWarrior;
