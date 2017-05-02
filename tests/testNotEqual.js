var assert = require('assert');
var notEqual = require('../lib/rules/notEqual.js');

describe('notEqual', function() {
  var arrayToCompare, value;
  it('returns true if nothing is passed', function() {
    assert.equal(notEqual(), true);
  });

  it('returns true if there is nothing to compare with', function() {
    arrayToCompare = ['LG', 'LW', 'LN'];
    assert.equal(notEqual(arrayToCompare), true);
  });

  it('returns false if there is a single match in the array', function() {
    arrayToCompare = ['LG', 'LW', 'LN'];
    value = 'LG';
    assert.equal(notEqual(arrayToCompare, value), false);
  });

  it('returns true if there is no match array', function() {
    arrayToCompare = ['LG', 'LW', 'LN'];
    value = 'stuff';
    assert.equal(notEqual(arrayToCompare, value), true);
  });
});
