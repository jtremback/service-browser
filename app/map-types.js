'use strict';
// var item = {
//   hoity: [2,3],
//   dingbat: {
//     walrus: 'toity',
//     iam: [3,2,2,2,2],
//     theyare: [
//       {
//         whoodog: [4,4,4,4,4,4,4,4,4,4]
//       }
//     ]
//   }
// };

// var map = {
//   hoity: 'buffer',
//   dingbat: {
//     walrus: 'string',
//     iam: 'buffer',
//     theyare: [
//       {
//         whoodog: 'buffer'
//       }
//     ]
//   }
// };

// mapTypes(item, map);

// returns {
//   hoity: <Buffer 02 03>,
//   dingbat: {
//     walrus: 'toity',
//     iam: <Buffer 03 02 02 02 02>,
//     theyare: [
//       {
//         whoodog: <Buffer 04 04 04 04 04 04 04 04 04 04>
//       }
//     ]
//   }
// };

module.exports = mapTypes;

function mapTypes (input, map) {
  var copy;

  if (input.forEach) {
    copy = [];
    input.forEach(function (item, key) {
      copy[key] = process(item, map[key]);
    });
  } else {
    copy = {};
    Object.keys(input).forEach(function (key) {
      copy[key] = process(input[key], map[key]);
    });
  }

  function process (item, type) {
    if (type === 'buffer') {
      // If it is a buffer, convert (will add other types later)
      return new Buffer(item);
    } else if (type === 'string') {
      // If it is a string we coerce it to make sure
      return item + '';
    } else if (typeof type === 'string') {
      // If the entry in the map is a string, and does not satisfy
      // the above conditions, then we assume it requires no processing
      return item;
    } else {
      // Keep going down
      return mapTypes(item, type);
    }
  }

  return copy;
}