var notEqual = function(matchArray, match){
  if(!matchArray || !matchArray instanceof Array) return true;
  if(!match || typeof match !== 'string') return true;

  var matches = matchArray.map(function(matchItem) {
    matchItem + '';
    return matchItem.toUpperCase();
  }).filter(function(matchItem) {
    return match.toUpperCase() === matchItem;
  });
  return matches.length === 0;
};

module.exports = notEqual;
