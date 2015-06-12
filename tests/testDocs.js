var assert = require('assert');
var sinon = require('sinon');
var async = require('async');

var docOpts = {
  connector: {type: 'database'}
};

var docConnection = require('../lib/connectors/database');
var connector = new docConnection(docOpts.connector);
var DocWarrior = require('../lib/docs');
var docs = new DocWarrior(docOpts);

describe('Unit - docs', function(){
  describe('get', function(){
    var callback = null;
    var opts = null;

    beforeEach(function(){
      callback = sinon.spy();
      opts = {
        docs: ['freeif', 'bpg', 'anotherTermType'],
        params: {
          date: '2015-01-01 00:00:00',
          agent: 'WEB1',
          brand: 'HX',
          channel: 'D'
        }
      }
    });

    afterEach(function(){
      callback = null;
      opts = null;
    });

    it('should return an error if no opts are passed to get', function(){
      docs.get(null, callback);
      assert.equal(callback.firstCall.args[0], 'opts not passed to get');
    });

    it('should return an error if no opts.docs are passed to get', function(){
      docs.get({}, callback);
      assert.equal(callback.firstCall.args[0], 'docs not passed within opts to get');
    });

    it('async.each has been called', function(){
      sinon.stub(async, 'each');
      docs.get(opts, callback);
      assert.ok(async.each.calledOnce);
      async.each.restore();
    });

    it('should call _processDocument once for each doc in opts', function(){
      sinon.stub(docs, '_processDocument');
      docs.get(opts, callback);
      assert.ok(docs._processDocument.calledThrice);
      docs._processDocument.restore();
    });

    it('should callback with error if _processDocument callsback with error', function(){
      sinon.stub(docs, '_processDocument').callsArgWith(3, 'An Error');
      docs.get(opts, callback);
      assert.ok(callback.firstCall.args[0], 'An Error');
      docs._processDocument.restore();
    });

    it('should call _returnInOrder if no errors', function(){
      sinon.stub(docs, '_processDocument').callsArgWith(3, null, 'Some Content');
      sinon.stub(docs, '_returnInOrder');
      docs.get(opts, callback);
      assert.ok(docs._returnInOrder.calledOnce);
      docs._processDocument.restore();
      docs._returnInOrder.restore();
    });

  });

  describe('_processDocument', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should callback an err if no docType parameter', function(){
      docs._processDocument(null, '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[0], 'No docType passed to _processDocument');
    });

    it('should callback err if no rows in database table', function(){
      sinon.stub(docs, '_getDocument');
      docs._processDocument('freeif', callback);
      assert.ok(docs._getDocument.calledOnce);
      docs._getDocument.restore();
    });

    it('should callback result if err returned from connector._getDocument', function(){
      sinon.stub(docs, '_getDocument').callsArgWith(2, 'An Error');
      docs._processDocument('freeif', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[0], 'An Error');
      docs._getDocument.restore();
    });

    it('should callback content if empty rules object', function(){
      sinon.stub(docs, '_getDocument').callsArgWith(2, null, {
        content: "My content!",
        rules: {}
      });
      docs._processDocument('freeif', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
      docs._getDocument.restore();
    });

    it('should callback content if empty rules object', function(){
      sinon.stub(docs, '_getDocument').callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      sinon.stub(docs, '_runDocumentRules')
      docs._processDocument('freeif', '2015-01-01 00:00:00', {}, callback);
      assert.ok(docs._runDocumentRules.calledOnce);
      docs._getDocument.restore();
      docs._runDocumentRules.restore();
    });

    it('should callback content if _runDocumentRules returns true', function(){
      sinon.stub(docs, '_getDocument').callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      sinon.stub(docs, '_runDocumentRules').returns(true);
      docs._processDocument('freeif', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
      docs._getDocument.restore();
      docs._runDocumentRules.restore();
    });

    it('should callback empty string if _runDocumentRules returns false', function(){
      sinon.stub(docs, '_getDocument').callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      sinon.stub(docs, '_runDocumentRules').returns(false);
      docs._processDocument('freeif', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], '');
      docs._getDocument.restore();
      docs._runDocumentRules.restore();
    });
  });

  describe('_getDocument', function(){
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    it('should callback an err if no docType parameter', function(){
      docs._getDocument(null, '2015-01-01 00:00:00', callback);
      assert.equal(callback.firstCall.args[0], 'No docType passed to _getDocument');
    });
  });

  describe('_runDocumentRules', function(){
    it('should return an err if no docType parameter', function(){
      assert.ok(!(docs._runDocumentRules()));
    });

    it('should return an err if no params parameter', function(){
      assert.ok(!(docs._runDocumentRules('freeif')));
    });

    it('should call async each', function(){
      sinon.stub(async, 'each');
      docs._runDocumentRules({}, {});
      assert.ok(async.each.calledOnce);
      async.each.restore();
    });
  });

  describe('_returnInOrder', function(){
    it('should return an empty string if no requested parameter', function(){
      assert.equal(docs._returnInOrder(), '');
    });

    it('should return an empty string if no docs parameter', function(){
      assert.equal(docs._returnInOrder('freeif'), '');
    });

    describe('should return in the correct requested order', function(){
      it('if already in the correct order', function(){
        var mockDocs = {freeif: 'freeif content', bpg: 'bpg content'};
        assert.equal(docs._returnInOrder([ 'freeif', 'bpg' ], mockDocs), 'freeif content\n\nbpg content\n\n');
      });

      it('if not already in the correct order', function(){
        var mockDocs = {bpg: 'bpg content', freeif: 'freeif content'};
        assert.equal(docs._returnInOrder([ 'freeif', 'bpg' ], mockDocs), 'freeif content\n\nbpg content\n\n');
      });
    });
  });

});