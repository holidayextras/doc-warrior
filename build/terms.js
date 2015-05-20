var dbClient = require('./dbClient');
var async = require('async');


var terms = {};
module.exports = terms;

terms.getTerms = function(opts){
	// if(!opts || !opts.docs || !opts.doc[0]) return console.log('error');
	console.log(opts.docs)
	async.eachLimit(opts.docs, 5, dbClient.getLatestVersion, function(err){
    if(err) {
      console.log(err);
      return process.exit(1);
    }
    return process.exit(0);
  });
}

var opts = {
  docs: ['bpg', 'kk', 'll', 'pp'],
  agent: 'WEB1',
  agentGroup: 'HX',
  channel: 'D',
  brand: 'HX',
  date: '01/01/2015',
};

terms.getTerms(opts);

