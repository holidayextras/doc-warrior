var notEqual = function(matchArray, match){
  console.log('NOT EQUALS OPERATOR', matchArray, match);
  if(!matchArray || !matchArray instanceof Array) return false;
  if(!match || typeof match !== 'string') return false;

  match = match.toUpperCase();

  var arrayLength = matchArray.length;
  var matches = false;
  for (var i = 0; i < arrayLength; i++) {
    var compare = matchArray[i];
    if(!typeof compare == 'string') return false;
    compare = compare.toUpperCase();
    if(compare !== match) {
      console.log('SHOULD BE HERE', compare, match);
      matches =  true;
    }
  }

  console.log('NOT EQUALS MATCHES', matches);
  return matches;
};

module.exports = notEqual;
//this never worked. It would return true as soon as it found something that didn't match. If we had an array to check this
//[ 'LHU3', 'LHU4', 'LHU5', 'LHH0', 'LHH1', 'LHH2', 'LHH3' ] to see if it contains LGV4
// It would only ever compare it against the first item in the array
