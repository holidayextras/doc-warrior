var equal = function(matchArray, match){
  if(!matchArray || !matchArray instanceof Array) return false;
  if(!match || typeof match !== 'string') return false;

  match = match.toUpperCase();

  var arrayLength = matchArray.length;
  for (var i = 0; i < arrayLength; i++) {
    var compare = matchArray[i];
    if(typeof compare !== 'string') return false;
    compare = compare.toUpperCase();
    if(compare === match) return true;
  }

  return false;
};

module.exports = equal;