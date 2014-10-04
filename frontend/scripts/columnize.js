'use strict';

// This takes an array and sorts it into an array of columns,
// which can be arranged horizontally to create a nice packed
// sorting effect when items have differing heights.
//
// columns: 3, source: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
//
// turns to
//
// return [ [1, 4, 7], [2, 5, 8], [3, 6, 9] ]
//
// which is displayed as:
//
// 1 | 2 | 3
// 4 | 5 | 6
// 7 | 8 | 9

module.exports = function (source, columns) {
  var target = [];

  for (var i = 0; i < columns; i++) {
    target.push([]);
  }

  source.forEach(function (item, index) {
    target[index % columns][Math.floor(Math.floor(index / columns))] = item;
  });

  return target;
};