(function(){
	"use strict";

	//Module-Global variables

	//Sets default puzzle size and default selected puzzle size option
	//To change puzzle size, only change here, everything else is relative.
	var puzzleSize = 4;
	var emptyRow = puzzleSize -1;
	var emptyCol = puzzleSize -1;
	var tileSize = parseInt(400 / puzzleSize);
	

	//Creates a puzzle size control, attaches event handler to shuffle button and calls functions that create the initial board on load.
	window.onload = function() {

		//Assign event handlers and initialize
		var shuffleBtn = document.getElementById("shufflebutton");
		shuffleBtn.onclick = shuffle;

		var size = document.getElementById("size");
		size.onchange = changeSize;

		makeTiles();
		enableImageChange();
		numberControl();
	};
	
	//Assigns IDs to the tiles based on their positions
	function assignIds() {
		var tiles = document.querySelectorAll(".tile");
		for(var i = 0; i < tiles.length; i++) {
			var row = parseInt(tiles[i].style.top) / tileSize;
			var col = parseInt(tiles[i].style.left) / tileSize;
			tiles[i].id = "tile_" + row + "_" + col;
		}
	}


	//Changes the size of the puzzle
	function changeSize() {
		puzzleSize = this.value;
		tileSize = parseInt(400 / puzzleSize);
		makeTiles();		
	}

	//Checks win condition by checking if current position equal to initial position
	function checkWin() {
		var tiles = document.querySelectorAll(".tile");
		for(var i = 0; i < tiles.length; i++) {
			if(tiles[i].id != tiles[i].dataset.initial) {
				return false;
			}
		}
		return true;
	}	
	
	//Assigns event handler for alternate puzzle images
	function enableImageChange() {
		
		var alts = document.querySelectorAll('.alt-img');
		for(var i = 0; i < alts.length; i++) {
			alts[i].onclick = function() {
				document.querySelector('.current').classList.remove('current');
				this.classList.add('current');
				getPuzzleImage();
			};
		}
	}

	//Scales font size for smaller tiles, for readability
	function fontSize() {
		if(puzzleSize < 6) {
			return "normal";
		} else {
			return "small";
		}		
	}

	//Returns an array of tiles that neighbor the empty space, clearing out old neighbors each time.
	function getNeighbors() {
		assignIds();

		//Clears out old neighbors
		var oldNeighbors = document.querySelectorAll(".neighbor");
		for(var i = 0; i < oldNeighbors.length; i++) {
			oldNeighbors[i].classList.remove("neighbor");
			oldNeighbors[i].onclick = null;
		}
		
		//Creates array of current neighbors
		var neighbors = [];
		
		//list of possible neighbor ids
		var west = "tile_" + emptyRow + "_" + (emptyCol - 1);
		var north = "tile_" + (emptyRow - 1) + "_" + emptyCol;
		var east = "tile_" + emptyRow + "_" + (emptyCol + 1);
		var south = "tile_" + (emptyRow + 1) + "_" + emptyCol;

		var possibleNeighbors = [west, north, east, south];
		
		//check that possible neighbors are actually existing tiles
		for(var i = 0; i < possibleNeighbors.length; i++) {
			if(document.getElementById(possibleNeighbors[i])) {
				neighbors.push(document.getElementById(possibleNeighbors[i]));
			}
		}
		
		return neighbors;		
	}

	//Sets puzzle background image to the currently selected puzzle image
	function getPuzzleImage() {
		var img = document.querySelector('.current').getElementsByTagName('img')[0];
		var tiles = document.querySelectorAll('.tile');

		for(var i = 0; i < tiles.length; i++) {					
			tiles[i].style.backgroundImage = "url('"+ img.src + "')";
		}
	}

	//Creates the initial board
	function makeTiles() {
		emptyRow = emptyCol = puzzleSize -1;
		var row = 0;
		var col = 0;
		var fontClass = fontSize();

		//Fits image to custom puzzle board size.
		//Board size can change by a few pixels due to rounding tileSize.
		var imageSize = tileSize * puzzleSize;

		var area = document.getElementById("puzzlearea");
		area.innerHTML = "";

		//Creates the puzzle tiles
		for(var i = 0; i < (puzzleSize * puzzleSize) -1; i++) {
			
			//Increases row and resets column based on puzzle size.
			if(i > 0 && i % puzzleSize == 0) {
				row++;
				col = 0;
			}

			//Styles and positions each tile, depending on puzzle size
			var tile = document.createElement("div");
			tile.classList.add("tile");
			tile.classList.add(fontClass);

			//Account for border(x2 for each side) - set in fifteen.css
			tile.style.width = tile.style.height = tileSize - 6 + "px";
			tile.style.backgroundSize = imageSize + "px " + imageSize + "px";
			tilePosition(tile, row, col);

			//Give tiles a class detailing their initial position, in order to check win
			var initialPos = "tile_" + row + "_" + col;
			tile.dataset.initial = initialPos;

			//Give numbers to tiles
			var num = document.createElement("p");
			num.innerHTML = i + 1;
			tile.appendChild(num);
			area.appendChild(tile);
			
			col++;
		}
		styleNeighbors(getNeighbors());
		
		numbersDisplay(numberCheck());

		getPuzzleImage();


	}

	//Moves a neighboring tile to the empty space
	function move(neighbor) {		
		var left = emptyCol * tileSize + "px";
		var top = emptyRow * tileSize + "px";
		
		emptyRow = parseInt(neighbor.style.top) / tileSize;
		emptyCol = parseInt(neighbor.style.left) / tileSize;
		neighbor.style.top = top;
		neighbor.style.left = left;	
	}


	//Assigns click event to number on/off radio buttons
	function numberControl() {		
		var numbersBtn = document.getElementsByName('numbers');
		for(var i = 0; i < numbersBtn.length; i++) {
			numbersBtn[i].onchange = function() {
				numbersDisplay(numberCheck());
			};
		}
	}

	//Returns the value of the checked numbers on/off radio button.  Returns either 'block' or 'none'
	function numberCheck() {
		var numbersBtn = document.getElementsByName('numbers');
		for(var i = 0; i < numbersBtn.length; i ++) {
			if(numbersBtn[i].checked) {
				return numbersBtn[i].value;
			}
		}
	}

	//Displays tile numbes based on value of checked numbers on/off radio
	function numbersDisplay(val) {
		var numbers = document.querySelectorAll('.tile p');
		for(var i = 0; i < numbers.length; i++) {
			numbers[i].style.display = val;
		}
	}

	//Shuffles the board by finding neighboring tiles and randomly selecting one to move.  Once finished, finds and styles neighboring tiles.
	function shuffle() {
		winShow(false);
		for(var i = 0; i < 1000; i++) { 
			var neighbors = getNeighbors();				
			var rand = parseInt(Math.random() * neighbors.length);
			var neighbor = neighbors[rand];
			move(neighbor);			
		}
		styleNeighbors(getNeighbors());
	}
	
	//Gives class of .neighbor to neighboring tiles and attaches an onclick event.  When clicked, the tile moves and the neighbors are refreshed.
	function styleNeighbors(neighbors) {
		for(var i = 0; i < neighbors.length; i++) {
			neighbors[i].classList.add("neighbor");
			
			//assign handlers
			neighbors[i].onclick = function() {
				move(this);
				styleNeighbors(getNeighbors());
				if(checkWin()) {
					winShow(true);
				}
			};
		}
	}
	
	//Gives initial tiles positions and background sections to display
	function tilePosition(tile, row, col) {
		var xCoord = col * tileSize;
		var yCoord = row * tileSize;
		tile.style.top = yCoord + "px";
		tile.style.left = xCoord + "px";
		tile.style.backgroundPosition = (xCoord * -1) + "px " + (yCoord * -1) + "px";
	}

	//Shows/hides win notice
	function winShow(bool) {
		var win = document.getElementById("win");
		if(bool) {
			win.style.display = "block";
		} else {
			win.style.display = "none";
		}
	}	

})();