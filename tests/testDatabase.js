var assert = require('assert');
var sinon = require('sinon');
var VError = require('verror');

var Connector = require('../lib/connectors/database.js');
var connector = new Connector();

describe('Unit - database', function(){
  describe('get', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should return err if no doc parameter', function(){
      connector.getDocument(null, '2015-01-01 10:10:10', callback);
      assert.deepEqual(callback.firstCall.args[0], new VError('doc parameter not passed to getDocument.'));
    });

    it('should callback an err if no date parameter', function(){
      connector.getDocument('freeif', '2015-01-0110:10:10' , callback);
      assert.deepEqual(callback.firstCall.args[0], new VError('date parameter passed to _getVersion in an incorrect format.'));
    });

    it('should callback with err if err is thrown in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, 'SQL error', []);
      connector.getDocument('somedoc', null, callback);
      assert.equal(callback.firstCall.args[0], 'SQL error');
      connector._queryWithValues.restore();
    });

    it('should callback if no rows are found', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, []);
      connector.getDocument('somedoc', null, callback);
      assert.equal(callback.firstCall.args[0], null);
      assert.equal(callback.firstCall.args[1], null);
      connector._queryWithValues.restore();
    });

    it('should remove the old format rules when there are multiple results', function() {
      var rowData = [
        { type: 'data1' }, { type: 'data/2'}, { type: 'data/3'}
      ];
      var returnsWith = [
          {
             "rules": {},
             "type": "data/2"
           },
           {
              "rules": {},
              "type": "data/3"
            }
      ]
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, rowData);
      connector.getDocument('somedoc', null, callback);
      assert.deepEqual(callback.firstCall.args[1], returnsWith);
      connector._queryWithValues.restore();
    });

    it('should callback only one row if one row is found', function() {
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, ['data']);
      connector.getDocument('somedoc', null, callback);
      assert.deepEqual(callback.firstCall.args[1], ['data']);
      connector._queryWithValues.restore();
    });
  });
});
