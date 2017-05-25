var assert = require('assert');
var sinon = require('sinon');
var async = require('async');
var VError = require('verror');
var ruleTypes = require('../lib/rules');

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
      getDocStub.callsArgWith(2, null, [{
        content: "My content!",
        rules: {}
      }]);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
    });

    it('Merges all the content that apply', function(){
      getDocStub.callsArgWith(2, null, [{
        content: "My content!",
        rules: {}
      }, {
        content: 'My content2!',
        rules: {}
      }
    ]);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!\nMy content2!');
    });

    it('should callback content if empty rules object', function(){
      getDocStub.callsArgWith(2, null, [{
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      }]);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.ok(docs._runDocumentRules.calledOnce);
    });

    it('should callback content if _runDocumentRules returns true', function(){
      getDocStub.callsArgWith(2, null, [{
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      }]);
      docRulesStub.returns(true);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], 'My content!');
    });

    it('should callback empty string if _runDocumentRules returns false', function(){
      getDocStub.callsArgWith(2, null, [{
        content: "My content!",
        rules: {
          rule1: 'a',
          rule2: 'b'
        }
      }]);
      docRulesStub.returns(false);
      docs._processDocument('somedoc', '2015-01-01 00:00:00', {}, callback);
      assert.equal(callback.firstCall.args[1], '');
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
    var rules, opts;

    beforeEach(function(){
      opts = {
        docs: ['a', 'b', 'c'],
        params: {
          date: '2015-01-01 00:00:00',
          agent: 'WEB1',
          brand: 'HX',
          channel: 'D',
          productCode: 'Code123'
        }
      };
    });

    it('should return an err if no docType parameter', function(){
      assert.ok(!(docs._runDocumentRules()));
    });

    it('should return an err if no params parameter', function(){
      assert.ok(!(docs._runDocumentRules('somedoc')));
    });

    context('When there is only one rule and rule type', function() {
      var equalsStub;
      beforeEach(function() {
        rules = { equals: { brand: ['HX'] } }
        equalsStub = sinon.stub(ruleTypes, 'equals')
      });

      afterEach(function() {
        equalsStub.restore();
      });

      it('returns true if the rule passes', function() {
        equalsStub.returns(true);
        assert.equal(docs._runDocumentRules(rules, opts.params), true)
      });

      it('returns false if the rule does not pass', function() {
        equalsStub.returns(false);
        assert.equal(docs._runDocumentRules(rules, opts.params), false)
      });
    });

    context('When there is more than one rule of the same type', function() {
      var equalsStub;
      beforeEach(function() {
        rules = { equals: { brand: ['HX'], productCode: [ 'LHU3'] } };
        equalsStub = sinon.stub(ruleTypes, 'equals');
      });

      afterEach(function() {
        equalsStub.restore();
      });

      it('returns true if all rules pass', function() {
        equalsStub.onFirstCall().returns(true).onSecondCall().returns(true);
        assert.equal(docs._runDocumentRules(rules, opts.params), true);
      });

      it('returns false if the rule does not pass', function() {
        equalsStub.returns(false);
        assert.equal(docs._runDocumentRules(rules, opts.params), false);
      });

      it('returns false if the any rule does not pass', function() {
        equalsStub.onFirstCall().returns(false).onSecondCall().returns(true);
        assert.equal(docs._runDocumentRules(rules, opts.params), false);
      });
    });

    context('When passed an invalid rule', function() {
      context('When the ruleType does not exist', function() {
        beforeEach(function () {
          rules = {
            notArule: { brand: ['HX'], productCode: [ 'LHU3'] }
          };
        })

        it('ignores the rule by returning true', function() {
          assert.equal(docs._runDocumentRules(rules, opts.params), true);
        });

        context('When a mix of invalid rule type and an actual rule', function() {
          var equalsStub;
          beforeEach(function() {
            rules.equals = { brand: ['HX'], productCode: [ 'LHU3'] };
            equalsStub = sinon.stub(ruleTypes, 'equals');
            equalsStub.returns(false);
          });

          afterEach(function() {
            equalsStub.restore();
          });

          it('evaluates the second rule and ignores the first', function() {
            assert.equal(docs._runDocumentRules(rules, opts.params), false);
          });
        });
      });

      context('When the rule params is invalid', function() {
        var equalsStub;
        beforeEach(function() {
          equalsStub = sinon.stub(ruleTypes, 'equals');
        });

        afterEach(function() {
          equalsStub.restore();
        });

        context('When the only param is invalid', function() {
          beforeEach(function() {
            rules = { equals: { brandy: ['HX'] } };
          });

          it('evaluates as false', function() {
            assert.equal(docs._runDocumentRules(rules, opts.params), false);
          });
        });

        context('When there is one valid and one invalid param', function() {
          beforeEach(function() {
            rules = { equals: { brandy: ['HX'], productCode: [ 'LHU3'] } };
            equalsStub.returns(true);
          });

          it('evaluates as false even if the other one is valid', function() {
            assert.equal(docs._runDocumentRules(rules, opts.params), false);
          });

          it('only calls the comparator on the valid params', function() {
            docs._runDocumentRules(rules, opts.params);
            assert(equalsStub.calledOnce);
          });
        });
      });
    })
    context('When there is more than one rule of different type', function() {
      var equalsStub, notEqualStub;
      beforeEach(function() {
        rules = {
          equals: { brand: ['HX'], productCode: [ 'LHU3'] },
          notEqual: { brand: ['CC'], channel: ['D'] }
        }
        equalsStub = sinon.stub(ruleTypes, 'equals');
        notEqualStub = sinon.stub(ruleTypes, 'notEqual');
      });

      afterEach(function() {
        equalsStub.restore();
        notEqualStub.restore();
      });

      it('returns true if all rules pass', function() {
        equalsStub.returns(true);
        notEqualStub.returns(true);
        assert.equal(docs._runDocumentRules(rules, opts.params), true)
      });

      it('returns false if all the rules do not pass', function() {
        equalsStub.returns(false);
        notEqualStub.returns(false);
        assert.equal(docs._runDocumentRules(rules, opts.params), false)
      });

      it('returns false if any of the the rules do not pass', function() {
        equalsStub.onFirstCall().returns(true).onSecondCall().returns(true);
        equalsStub.onFirstCall().returns(true).onSecondCall().returns(false);
        assert.equal(docs._runDocumentRules(rules, opts.params), false)
      });

      it('returns false if any rules do not pass even cross type', function() {
        equalsStub.onFirstCall().returns(false).onSecondCall().returns(true);
        equalsStub.onFirstCall().returns(true).onSecondCall().returns(true);
        assert.equal(docs._runDocumentRules(rules, opts.params), false)
      });
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
