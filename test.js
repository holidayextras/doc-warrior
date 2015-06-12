var DocWarrior = require('./index.js');
var docs = new DocWarrior({
  connector: {
    type: 'database',
    host: 'localhost',
    port: 3306,
    connectionLimit: 10,
    user: 'root',
    pass: '',
    database: 'terms',
    table: 'terms.versions'
  }
});

var docOpts = {
  docs: ['freeif', 'bpg'],
  params: {
    brand: 'HX'
  }
};

docs.get(docOpts, function(err, response){
  console.log(response);
  process.exit(0);
});