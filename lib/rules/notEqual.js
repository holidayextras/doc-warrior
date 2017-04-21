var notEqual = function(matchArray, match){
  console.log('NOT EQUALS OPERATOR', matchArray, match);
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
      console.log('SHOULD BE HERE', compare, match);
      matches.push(true);
    } else {
      matches.push(false);
    }
  }

  console.log('NOT EQUALS MATCHES', matches);
  if(matches.includes(false)) return false;
  
  return true;
};

//in here build up an array to return false if there is a match if any match
//currently returns true because one of them doesn't match. Need to go through each and if any of them match, return true

module.exports = notEqual;
//this never worked. It would return true as soon as it found something that didn't match. If we had an array to check this
//[ 'LHU3', 'LHU4', 'LHU5', 'LHH0', 'LHH1', 'LHH2', 'LHH3' ] to see if it contains LGV4
// It would only ever compare it against the first item in the array
