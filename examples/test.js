var DocWarrior = require('../index.js');

/*
  Setup to connect to local DB
  Import the SQL table export included in the examples folder first!
*/

var docs = new DocWarrior({
  connector: {
    type: 'database',
    host: 'localhost',
    port: 3306,
    connectionLimit: 10,
    user: 'root',
    pass: '',
    database: 'test',
    table: 'somedocs'
  }
});

/*
  Go get 4 document types
  rules document type should not return due to the params / rules.
*/

var docOpts = {
  docs: ['readme', 'rules', 'thanks', 'credits'],
  params: {
    foo: 'bar'
  }
};

docs.get(docOpts, function(err, response){
  console.log(response);
  process.exit(0);
});

