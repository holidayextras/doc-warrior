var DocWarrior = require('./index.js');
var docs = new DocWarrior({
  connector: {
    type: 'database',
    host: 'localhost',
    port: 3306,
    connectionLimit: 10,
    user: 'root',
    pass: '',
    database: 'terms'
  }
});

var docOpts = {
  docs: ['freeif', 'bpg'],
  params: {
    date: '2015-01-01 00:00:00',
    agent: 'WEB1',
    brand: 'HX',
    channel: 'D'
  }
};

docs.get(docOpts, function(err, response){
  console.log(err, response);
  process.exit(0);
});