var assert = require('assert');
var sinon = require('sinon');

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
      assert.equal(callback.firstCall.args[0], 'doc parameter not passed to getDocument.');
    });

    it('should callback an err if no date parameter', function(){
      connector.getDocument('freeif', '2015-01-0110:10:10' , callback);
      assert.equal(callback.firstCall.args[0], 'date parameter passed to _getVersion in an incorrect format.');
    });

    it('should callback with err if err is thrown in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, 'SQL error', []);
      connector.getDocument('freeif', null, callback);
      assert.equal(callback.firstCall.args[0], 'SQL error');
      connector._queryWithValues.restore();
    });

    it('should callback if no rows are found', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, []);
      connector.getDocument('freeif', null, callback);
      assert.equal(callback.firstCall.args[0], null);
      assert.equal(callback.firstCall.args[1], null);
      connector._queryWithValues.restore();
    });

    it('should callback result if rows in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, ['data']);
      connector.getDocument('freeif', null, callback);
      assert.equal(callback.firstCall.args[1], 'data');
      connector._queryWithValues.restore();
    });

  });

});