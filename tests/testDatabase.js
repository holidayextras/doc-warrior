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

    it('should callback result if rows in database', function(){
      sinon.stub(connector, '_queryWithValues').callsArgWith(1, null, ['data']);
      connector.getDocument('somedoc', null, callback);
      assert.equal(callback.firstCall.args[1], 'data');
      connector._queryWithValues.restore();
    });

  });

  describe('checkForParagraphs', function() {
    var callback = null;

    beforeEach(function(){
      callback = sinon.spy();
    });

    afterEach(function(){
      callback = null;
    });

    context('when no doc, or an empty string is passed', function() {
      it('should return an error with null passed in', function(){
        connector.checkForParagraphs(null, callback);
        assert.deepEqual(callback.firstCall.args[0], new VError('doc parameter not passed to checkForParagraphs.'));
      });
    });

    context('when a document string is passed', function() {
      var doc;
      var queryWithValues = null;

      beforeEach(function() {
        doc = 'terms_and_conditions';
        queryWithValues = sinon.stub(connector, '_queryWithValues');
      });

      it('should call _queryWithValues with the correctly formatted options', function() {
        var expectedOptions = {
          sql: 'SELECT type FROM ??     WHERE `type` LIKE ? ORDER BY type ASC;',
          values: ['versions', '%terms_and_conditions%']
        }
        connector.checkForParagraphs(doc, callback);
        assert.ok(connector._queryWithValues.calledWith(expectedOptions));
        queryWithValues = null;
      });
    });
  });

});
