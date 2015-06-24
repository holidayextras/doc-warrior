# Doc Warrior

### What is it?
Document retrieval with rules!

### How do I use it?
#### Setup
```javascript
var DocWarrior = require('doc-warrior');
var docs = new DocWarrior({
  connector: {
    type: 'database',
    host: 'localhost',
    port: 3306,
    connectionLimit: 10,
    user: 'root',
    pass: '',
    database: 'somedb',
    table: 'somedocs'
  }
});
```

The database connector also allows you to pass in your own query function which will be used in place of DocWarrior's own mysql pool and query function.

```javascript
var DocWarrior = require('doc-warrior');
var docs = new DocWarrior({
  connector: {
    type: 'database',
    table: 'somedocs',
    customQuery: db.query
  }
});
```

#### Request

*Note: not passing in a 'date' parameter will return the latest version of the requested document. Pass in the date parameter to get a specific version*

```javascript
var docOpts = {
  docs: ['terms-and-conditions', 'security-policy'], // These get concatenated
  params: {
    somekey: 'somevalue' // These get run against the rules against the document
  }
};

docs.get(docOpts, function(err, response){
  console.log(response); // Your document!
});
```


### Rules
These are stored in lib/rules and are generic rule sets with no business logic. This enables them to be used everywhere for anything!

#### Equals Example
##### Document Rule
```json
"equals" : {
  "foo": "bar"
}
```
* Document will not return if foo isn't passed into request
* Document will not return if foo does not equal bar in request
* Document will return if foo does equal bar in request

#### NotEqual Example
##### Document Rule
```json
"notEqual" : {
  "foo": "bar"
}
```
* Document will not return if foo isn't passed into request
* Document will not return if foo does equal bar in request
* Document will return if foo does not equal bar in request


### Connectors
We built doc-warrior with other connectors in mind, at present there is only a database connector but we'd love to see more added (S3 for instance).

Any connector can be added and just needs to expose a `getDocument` function which returns the requested document and associated rules.
