var notEqual = function(matchArray, match){
  if(!matchArray || !matchArray instanceof Array) return false;
  if(!match || typeof match !== 'string') return false;

  match = match.toUpperCase();

  var arrayLength = matchArray.length;
  var matches = [];
  for (var i = 0; i < arrayLength; i++) {
    var compare = matchArray[i];
    if(!typeof compare == 'string') return false;
    compare = compare.toUpperCase();
    if(compare !== match) {
      matches.push(true);
    } else {
      matches.push(false);
    }
  }

  if(matches.includes(false)) return false;

  return true;
};

module.exports = notEqual;
