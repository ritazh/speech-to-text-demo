var canvas;

var cellSize = 75;
var cellGutter = 5;
var lblIndex = 1;
var cellData = []
var totalCells = 25;
var lastIndex = 12;

var defaultGrey = "#aeaeae";

var integerValues = {"one":1,"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8,"nine":9,"ten":10,
    "eleven":11,"twelve":12,"thirteen":13,"fourteen":14,"fifteen":15,"sixteen":16,"seventeen":17,"eighteen":18,"nineteen":19,"twenty":20,
    "twenty one":21,"twenty two":22,"twenty three":23,"twenty four":24, "twenty five":25};

var colours = {"aliceblue":"#f0f8ff","antiquewhite":"#faebd7","aqua":"#00ffff","aquamarine":"#7fffd4","azure":"#f0ffff",
    "beige":"#f5f5dc","bisque":"#ffe4c4","black":"#000000","blanchedalmond":"#ffebcd","blue":"#0000ff","blueviolet":"#8a2be2","brown":"#a52a2a","burlywood":"#deb887",
    "cadetblue":"#5f9ea0","chartreuse":"#7fff00","chocolate":"#d2691e","coral":"#ff7f50","cornflowerblue":"#6495ed","cornsilk":"#fff8dc","crimson":"#dc143c","cyan":"#00ffff",
    "darkblue":"#00008b","darkcyan":"#008b8b","darkgoldenrod":"#b8860b","darkgray":"#a9a9a9","darkgreen":"#006400","darkkhaki":"#bdb76b","darkmagenta":"#8b008b","darkolivegreen":"#556b2f",
    "darkorange":"#ff8c00","darkorchid":"#9932cc","darkred":"#8b0000","darksalmon":"#e9967a","darkseagreen":"#8fbc8f","darkslateblue":"#483d8b","darkslategray":"#2f4f4f","darkturquoise":"#00ced1",
    "darkviolet":"#9400d3","deeppink":"#ff1493","deepskyblue":"#00bfff","dimgray":"#696969","dodgerblue":"#1e90ff",
    "firebrick":"#b22222","floralwhite":"#fffaf0","forestgreen":"#228b22","fuchsia":"#ff00ff",
    "gainsboro":"#dcdcdc","ghostwhite":"#f8f8ff","gold":"#ffd700","goldenrod":"#daa520","grey":"#80808","gray":"#808080","green":"#008000","greenyellow":"#adff2f",
    "honeydew":"#f0fff0","hotpink":"#ff69b4",
    "indianred ":"#cd5c5c","indigo":"#4b0082","ivory":"#fffff0","khaki":"#f0e68c",
    "lavender":"#e6e6fa","lavenderblush":"#fff0f5","lawngreen":"#7cfc00","lemonchiffon":"#fffacd","lightblue":"#add8e6","lightcoral":"#f08080","lightcyan":"#e0ffff","lightgoldenrodyellow":"#fafad2",
    "lightgrey":"#d3d3d3","lightgreen":"#90ee90","lightpink":"#ffb6c1","lightsalmon":"#ffa07a","lightseagreen":"#20b2aa","lightskyblue":"#87cefa","lightslategray":"#778899","lightsteelblue":"#b0c4de",
    "lightyellow":"#ffffe0","lime":"#00ff00","limegreen":"#32cd32","linen":"#faf0e6",
    "magenta":"#ff00ff","maroon":"#800000","mediumaquamarine":"#66cdaa","mediumblue":"#0000cd","mediumorchid":"#ba55d3","mediumpurple":"#9370d8","mediumseagreen":"#3cb371","mediumslateblue":"#7b68ee",
    "mediumspringgreen":"#00fa9a","mediumturquoise":"#48d1cc","mediumvioletred":"#c71585","midnightblue":"#191970","mintcream":"#f5fffa","mistyrose":"#ffe4e1","moccasin":"#ffe4b5",
    "navajowhite":"#ffdead","navy":"#000080",
    "oldlace":"#fdf5e6","olive":"#808000","olivedrab":"#6b8e23","orange":"#ffa500","orangered":"#ff4500","orchid":"#da70d6",
    "palegoldenrod":"#eee8aa","palegreen":"#98fb98","paleturquoise":"#afeeee","palevioletred":"#d87093","papayawhip":"#ffefd5","peachpuff":"#ffdab9","peru":"#cd853f","pink":"#ffc0cb","plum":"#dda0dd","powderblue":"#b0e0e6","purple":"#800080",
    "red":"#ff0000","rosybrown":"#bc8f8f","royalblue":"#4169e1",
    "saddlebrown":"#8b4513","salmon":"#fa8072","sandybrown":"#f4a460","seagreen":"#2e8b57","seashell":"#fff5ee","sienna":"#a0522d","silver":"#c0c0c0","skyblue":"#87ceeb","slateblue":"#6a5acd","slategray":"#708090","snow":"#fffafa","springgreen":"#00ff7f","steelblue":"#4682b4",
    "tan":"#d2b48c","teal":"#008080","thistle":"#d8bfd8","tomato":"#ff6347","turquoise":"#40e0d0",
    "violet":"#ee82ee",
    "wheat":"#f5deb3","white":"#ffffff","whitesmoke":"#f5f5f5",
    "yellow":"#ffff00","yellowgreen":"#9acd32"};


var postSetup = false;

function setup() {

  canvas = createCanvas(400, 400);
  canvas.parent('primer');
  canvas.position(40, 0);

  strokeWeight(1);
  stroke(255);

  textAlign(CENTER);

  postSetup = true;

  renderGrid();
}

function renderGrid() {

  if (!postSetup) return;
  
  clear();

  for ( var i = 0; i < totalCells; i++ ) {
    var _x = i%5;
    var _y = Math.floor(i/5);
    var xPos = _x*(cellSize+cellGutter);
    var yPos = _y*(cellSize+cellGutter);

    var c = color(cellData[i]);
    fill(c);
    rect(xPos, yPos, cellSize, cellSize);

    textSize(18);
    fill(255);
    text(i+1, xPos + .5*cellSize, yPos + .6*cellSize );
  }

}

function getPositionAsIndex(position) {
  var _pos = NaN;

  if (typeof integerValues[position] != 'undefined')
      _pos = integerValues[position];
  
  if ( isNaN(_pos) ) {
      console.log("couldn't recognize " + position + " as a number...");
      return -1;
  }

  _pos = Math.floor(_pos);
  if ( _pos >= 210 && _pos < 225 ) {
      _pos -= 200;
  }

  _pos -= 1;
  if ( _pos < 0 || _pos > 24 ) {
      console.log("Please speak a position between 1 and 25.");
      return -2;
  }

  return _pos;
};

function getColorHex(color) {
  var _colname = color.replace(/\s+/g, '');

  if (typeof colours[_colname.toLowerCase()] != 'undefined')
          return colours[_colname.toLowerCase()];

  return defaultGrey;
};

function moveLastInDirection(direction) {
  var newPos = lastIndex;
  var error = false;

  if ( direction == "up") {
      newPos -= 5;
      if ( newPos < 0 ) error = true;
  }
  if ( direction == "down") {
      newPos += 5;
      if ( newPos > 24 ) return;
  }
  if ( direction == "left" ) {
      if ( (lastIndex % 5) == 0)  error = true;
      newPos--;
  }
  if ( direction == "right" ) {
      if ( (lastIndex+1)%5 == 0 )  error = true;
      newPos++;
  }
  if ( newPos < 0 || newPos > 24 )  error = true;

  if ( error == true ) {
      console.log("couldn't move the cell in that direction");
      return;
  }
  var newCol = cellData[lastIndex];
  cellData[lastIndex] = defaultGrey;
  cellData[newPos] = newCol;
  lastIndex = newPos;
  updateGrid();
};

function moveLastToCell(newPosition)
{
  var pos = getPositionAsIndex(newPosition);
  if ( pos < 0 ) return;
  var moveColor = cellData[lastIndex];
  cellData[lastIndex] = defaultGrey;
  cellData[pos] = moveColor;
  lastIndex = pos;
  updateGrid();
};

function addCell(position, color) {
  var pos = getPositionAsIndex(position);
  if ( pos < 0 ) return;
  var hexcol = getColorHex(color);
  cellData[pos] = hexcol; 
  lastIndex = pos;
  updateGrid();
};

function delCell(position) {
  var pos = getPositionAsIndex(position);
  if ( pos < 0 ) return;
  cellData[pos] = defaultGrey; 
  lastIndex = pos;
  updateGrid();
};

function setupGridData() {
  cellData = [];
  for ( var i = 0; i < totalCells; i++ ) {
      cellData[i] = defaultGrey;
  }
  cellData[12] = "#7fff00";
  lastIndex = 12;
  updateGrid();
};

function updateGrid() {
  renderGrid();
};
