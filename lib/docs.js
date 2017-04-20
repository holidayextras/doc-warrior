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

  self._processSubdirectories(opts.docs, function(err, subdirectories) {
    console.log('DcgetSubs::::', subdirectories);
  });

  //console.log('docs.js get', opts.docs);
  // [ 'terms_and_conditions_en',
  // 'terms_and_conditions_mag_en',
  // 'freeif_en',
  // 'bpg_en' ]

  //here in the each I need to tell it to get everything. I can do this by doing a lookup and getting all subdirectories
  //when we get passed the parent directory and then opts.docs which has the each, uses this new array instead.

  //final array will look like

  //[ 'terms_and_conditions_en/a_name',
  // 'terms_and_conditions_en/b_name'
  // 'terms_and_conditions_en/b_name2'
  // 'terms_and_conditions_en/c_name'
  // 'terms_and_conditions_mag_en',
  // 'freeif_en',
  // 'bpg_en' ]

  //and we can run the rules against each of them

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

  this._getDocument(docType, date, function(err, doc){
    if(err || !doc) return callback(err, '');

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

  parentDirectories.push('test_terms_and_conditions_EN');//remove when going live
  //loop through each item and check if there are subdirectories
  //if there are, add their `type` to the array and remove the parent
  // parentDirectories.forEach(function(directory) {
  //   console.log('Dc1: ', directory);
  //
  // });

  async.each(parentDirectories, function(directory, callback) {
    self.connector.checkForParagraphs(directory, function(err, paragraphs) {
      if(err) return callback(err);
      // console.log('DBRESULTS: ', paragraphs);
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
