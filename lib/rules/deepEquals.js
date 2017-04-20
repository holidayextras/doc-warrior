// {
//   "deepEquals": {
//     "brand": ["AP", "LH"],
//     "productCode": ["LHR1", "LHR2", "LHR3"]
//   }
// }

//This rule needs to return true if both lines of the above validate an equals check
//So if we are on brand AP and product code LHR1, return true
//If we are on brand AP and on BHU6, return false. Every line must have a truthy value

var deepEquals = function(matchArray, match){
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
