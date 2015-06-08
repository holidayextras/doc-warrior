var assert = require('assert');
var sinon = require('sinon');

var conOpts = {
  type: 'database',
  host: 'localhost',
  port: 3306,
  connectionLimit: 10,
  user: 'root',
  pass: '',
  database: 'terms'
};

var Connector = require('../lib/connectors/database.js');
var connector = new Connector(conOpts);

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

    it('should call _getLatest if no date present', function(){
      sinon.stub(connector, '_getLatest');
      connector.getDocument('freeif', null, callback);
      assert.ok(connector._getLatest.calledOnce);
      connector._getLatest.restore();
    });

    it('should call _getVersion if date present', function(){
      sinon.stub(connector, '_getVersion');
      connector.getDocument('bpg', '2015-01-01 10:10:10', callback);
      assert.ok(connector._getVersion.calledOnce);
      connector._getVersion.restore();
    });

  });

  describe('_getLatest', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should callback an err if no doc parameter', function(){
      connector._getLatest(null, callback);
      assert.equal(callback.firstCall.args[0], 'doc parameter not passed to _getLatest.');
    });

    it('should callback err if no rows in database table', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, 'SQL error', []);
      connector._getLatest('freeif', callback);
      assert.equal(callback.firstCall.args[0], 'SQL error');
      connector._queryWithValues.restore();
    });

    it('should callback result if rows in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, ['data']);
      connector._getLatest('freeif', callback);
      assert.equal(callback.firstCall.args[1], 'data');
      connector._queryWithValues.restore();
    });

  });

  describe('_getVersion', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should callback an err if no doc parameter', function(){
      connector._getVersion(null, '2015-01-01 10:10:10', callback);
      assert.equal(callback.firstCall.args[0], 'doc parameter not passed to _getVersion.');
    });

    it('should callback an err if no date parameter', function(){
      connector._getVersion('freeif', null, callback);
      assert.equal(callback.firstCall.args[0], 'date parameter not passed to _getVersion.');
    });

    it('should callback an err if no date parameter', function(){
      connector._getVersion('freeif', '2015-01-0110:10:10' , callback);
      assert.equal(callback.firstCall.args[0], 'date parameter passed to _getVersion in an incorrect format.');
    });

    it('should callback err if no rows in database table', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, 'SQL error', []);
      connector._getVersion('freeif', '2015-01-01 10:10:10', callback);
      assert.equal(callback.firstCall.args[0], 'SQL error');
      connector._queryWithValues.restore();
    });

    it('should callback result if rows in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, ['data']);
      connector._getVersion('freeif', '2015-01-01 10:10:10', callback);
      assert.equal(callback.firstCall.args[1], 'data');
      connector._queryWithValues.restore();
    });

  });

});