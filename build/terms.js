var dbClient = require('./dbClient');
var async = require('async');
var _ = require('lodash');

var terms = {};
var dataToReturn = [];
module.exports = terms;

terms.getTerms = function(opts, callback){
  var results = [];
  async.each(opts.docs, function(type, callback){
    terms._getLatestVersion(type, opts, function(err, version){
      if(err) return callback(err);
      if(!version) return callback('Invalid document type requested: ' + type);

      results.push(version);
      return callback();
    });
  }, function(err){
    results = results.filter(function(type){
      if(type == undefined) return false;
      if(!terms._matchRules(type.rules, opts)) return false;
      return true;
    });
    terms._makeReturnString(results, callback);
  });
}

terms._getLatestVersion = function(type, opts, callback){
  dbClient.getLatestVersion(type, function(err, version){
    return callback(err, version);
  });
}

terms._matchRules = function(rules, opts){
  if(!_.contains(rules.agentCode, opts.agentCode) && opts.agentCode) return false;
  if(!_.contains(rules.channel, opts.channel) && opts.channel) return false;
  if(!_.contains(rules.brand, opts.brand) && opts.brand) return false;
  if(!_.contains(rules.agentGroup, opts.agentGroup) && opts.agentGroup) return false;
  return true;
}

terms._makeReturnString = function(terms, callback){
  var markdownFile = "";
  terms.forEach(function(term){
    markdownFile = markdownFile + term.markdown;
  });
  callback(null, markdownFile);
}

var opts = {
  "docs": ['freeif', 'bpg', 'll', 'pp'],
  "date": '01/01/2015',
  "channel": 'D',
  "agentCode": 'WEB4'
}

terms.getTerms(opts, function(err, terms){
  if(err) console.log('error')
  console.log(terms);
  process.exit(1);
});
