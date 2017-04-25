var assert = require('assert');
var sinon = require('sinon');
var async = require('async');
var VError = require('verror');

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
        docs: ['a', 'b', 'c'],
        params: {
          date: '2015-01-01 00:00:00',
          agent: 'WEB1',
          brand: 'HX',
          channel: 'D',
          productCode: 'Code123'
        }
      }
    });

    afterEach(function(){
      callback = null;
      opts = null;
    });

    context('With bad input', function(){

      it('should return an error if no opts are passed to get', function(){
        docs.get(null, callback);
        assert.deepEqual(callback.firstCall.args[0], new VError('opts not passed to get'));
      });

      it('should return an error if no opts.docs are passed to get', function(){
        docs.get({ docs: null }, callback);
        assert.deepEqual(callback.firstCall.args[0], new VError('docs not passed within opts to get'));
      });

    });

    context('With good input and subdirectories', function(){
      var processDocStub = null;

      beforeEach(function() {
        sinon.stub(docs, '_processSubdirectories').yields(['a', 'b', 'c']);
      });

      afterEach(function(){
        docs._processSubdirectories.restore();
      });

      it('should call _processSubdirectories for with the provided array', function() {
        docs.get(opts, callback);
        assert.ok(docs._processSubdirectories.calledWith(['a', 'b', 'c']));
      });

      it('should call async.each', function(){
        sinon.stub(async, 'each');
        docs.get(opts, callback);
        assert.ok(async.each.calledOnce);
        async.each.restore();
      });
    });
  });

  describe('_processDocument', function(){
    var callback = null;
    var getDocStub = null;
    var docRulesStub = null;

    beforeEach(function(){
      callback = sinon.spy();
      getDocStub = sinon.stub(docs, '_getDocument');
      docRulesStub = sinon.stub(docs, '_runDocumentRules')
    });

    afterEach(function(){
      callback = null;
      docs._getDocument.restore();
      docs._runDocumentRules.restore();
    });

    it('should callback an err if no docType parameter', function(){
      docs._processDocument(null, '2015-01-01 00:00:00', {}, callback);
      assert.deepEqual(callback.firstCall.args[0], new VError('No docType passed to _processDocument'));
    });

    it('should callback err if no rows in database table', function(){
      docs._processDocument('somedoc', callback);
      assert.ok(docs._getDocument.calledOnce);
    });

    it('should callback result if err returned from connector._getDocument', function(){
      getDocStub.callsArgWith(2, 'An Error');
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[0], 'An Error');
    });

    it('should callback content if empty rules object', function(){
      getDocStub.callsArgWith(2, null, {
        content: "My content!",
        rules: {}
      });
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
    });

    it('should callback content if empty rules object', function(){
      getDocStub.callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.ok(docs._runDocumentRules.calledOnce);
    });

    it('should callback content if _runDocumentRules returns true', function(){
      getDocStub.callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      docRulesStub.returns(true);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
    });

    it('should callback empty string if _runDocumentRules returns false', function(){
      getDocStub.callsArgWith(2, null, {
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      });
      docRulesStub.returns(false);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], '');
    });
  });

  describe('_processSubdirectories', function() {
    var callback = null;
    var paragraphCheck = null;
    var parentDirectories;

    beforeEach(function() {
      callback = sinon.spy();
      paragraphCheck = sinon.stub(docs.connector, 'checkForParagraphs');
      parentDirectories = ['a'];
    });

    afterEach(function(){
      callback = null;
      docs.connector.checkForParagraphs.restore();
    });

    context('when no parent directories are provided', function() {
      it('should return an empty array', function(){
        var documents = docs._processSubdirectories(null);
        assert.deepEqual(documents, []);
      });
    });

    context('when we have parent directories', function() {
      it('should call async.each', function(){
        sinon.stub(async, 'each');
        docs._processSubdirectories(parentDirectories);
        assert.ok(async.each.calledOnce);
        async.each.restore();
      });

      it('should call connector.checkForParagraphs', function(){
        docs._processSubdirectories(parentDirectories);
        assert.ok(docs.connector.checkForParagraphs.calledOnce);
      });

      it('should return the just the sub directories for this parent if the database returns them', function(){
        paragraphCheck.yields(null, [ { type: 'a/a_sub_document_one' }]);
        var expected = [[ { type: 'a/a_sub_document_one' }]];
        docs._processSubdirectories(parentDirectories, callback);
        assert.deepEqual(callback.firstCall.args[1], expected);
      });
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
      assert.deepEqual(callback.firstCall.args[0], new VError('No docType passed to _getDocument'));
    });
  });

  describe('_runDocumentRules', function(){
    it('should return an err if no docType parameter', function(){
      assert.ok(!(docs._runDocumentRules()));
    });

    it('should return an err if no params parameter', function(){
      assert.ok(!(docs._runDocumentRules('somedoc')));
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
      assert.equal(docs._returnInOrder('somedoc'), '');
    });

    describe('should return in the correct requested order', function(){
      it('if already in the correct order', function(){
        var mockDocs = {somedoc: 'somedoc content', anotherdoc: 'anotherdoc content'};
        assert.equal(docs._returnInOrder([ 'somedoc', 'anotherdoc' ], mockDocs), 'somedoc content\n\nanotherdoc content\n\n');
      });

      it('if not already in the correct order', function(){
        var mockDocs = {anotherdoc: 'anotherdoc content', somedoc: 'somedoc content'};
        assert.equal(docs._returnInOrder([ 'somedoc', 'anotherdoc' ], mockDocs), 'somedoc content\n\nanotherdoc content\n\n');
      });
    });
  });

});
