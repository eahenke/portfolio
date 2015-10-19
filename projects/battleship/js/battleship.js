(function(window) {
	"use strict";

	//SHIP CLASS
	function Ship(shipType, shipLength) {
		this.shipType = shipType;
		this.shipLength = shipLength;
		this.ID;
		this.row;
		this.col;
		this.coord;
		this.direction = 'south';
		this.positions = [];
		this.hitPoints = this.shipLength;
	};

	window.Ship = Ship;

	Ship.prototype = {
		constructor: Ship
	};

	Ship.prototype.getCoord = function() {
		return this.row + '-' + this.col;		
	};

	Ship.prototype.setCoord = function(coord) {
		this.coord = coord;
		this.row = coord.split('-')[0];		
		this.col = parseInt(coord.split('-')[1]);
	}

	//Add tile coordinate or array of coordinates to ship's position property
	Ship.prototype.addPosition = function(coords) {
		if(coords.constructor === String) {
			this.positions.push(coords);					
		} else if (coords.constructor === Array) {
			this.positions = this.positions.concat(coords);			
		} else {
			//Error
			console.log('Error: value is neither string nor array');
		}
	};

	//Decrease hit points in case of hit
	Ship.prototype.hit = function() {
		this.hitPoints--;
	};

	Ship.prototype.hitMessage = function() {
		var hitPlur;

		//Correct plurals
		if(this.hitPoints == 1) {
			hitPlur = 'hit';
		} else {
			hitPlur = 'hits';
		}

		//Don't output hit points if sunk, sinking message will display instead.
		if(this.hitPoints > 0) {
			return("Hit " + this.shipType + "! " + this.hitPoints + " " + hitPlur + " remaining.");			
		} else {
			return("Hit " + this.shipType + "! " + this.shipType + " has sunk!");
		}		
	}


	//SHIP SUBCLASSES
	//Instances of Ship, with differing names and lengths.
	
	function Carrier(){
		Ship.call(this, 'Carrier', 5);
	};
	Carrier.prototype = Object.create(Ship.prototype);
	Carrier.prototype.constructor = Carrier;
	window.Carrier = Carrier;


	function Battleship(){
		Ship.call(this, 'Battleship', 4);		
	};
	Battleship.prototype = Object.create(Ship.prototype);
	Battleship.prototype.constructor = Battleship;
	window.Battleship = Battleship;

	function Cruiser(){
		Ship.call(this, 'Cruiser', 3);
	};
	Cruiser.prototype = Object.create(Ship.prototype);
	Cruiser.prototype.constructor = Cruiser;
	window.Cruiser = Cruiser;

	function Submarine(){
		Ship.call(this, 'Submarine', 3);
		
	};
	Submarine.prototype = Object.create(Ship.prototype);
	Submarine.prototype.constructor = Submarine;
	window.Submarine = Submarine;

	function Destroyer(){
		Ship.call(this, 'Destroyer', 2);
	};
	Destroyer.prototype = Object.create(Ship.prototype);
	Destroyer.prototype.constructor = Destroyer;
	window.Destroyer = Destroyer;


	//FLEET CLASS
	function Fleet() {

			this.shipsInFleet = {
				'Carrier' : 0,
				'Battleship' : 0, 
				'Submarine' : 0,
				'Cruiser' : 0,
				'Destroyer' : 0 
			};
		
		this.activeShips = [];
		this.totalShips = [];
	}

	window.Fleet = Fleet;

	Fleet.prototype = {
		constructor: Fleet
	};

	Fleet.prototype.addShips = function() {
		var shipCount = 0;
		for(var ship in this.shipsInFleet) {
			var typeOfShip = window[ship];
			
			for(var i = 0; i < this.shipsInFleet[ship]; i++) {
				
				var newShip = new typeOfShip();
				newShip.ID = shipCount;
				shipCount++;

				this.activeShips.push(newShip);
				this.totalShips.push(newShip);
			}
		}
	}


	//Remove a ship from activeShips, but keep in totalShips
	Fleet.prototype.removeShip = function(ship) {
		var index = this.activeShips.indexOf(ship);
		if(index > -1) {
			this.activeShips.splice(index, 1);
		}
	}

	//Checks if ship is sunk and removes if so
	Fleet.prototype.checkSink = function(ship) {
		if(ship.hitPoints <= 0) {
			this.removeShip(ship);
			return true;
		}	
	}

	//Checks if active ships still in fleet
	Fleet.prototype.checkFleet = function() {
		if(this.activeShips.length === 0) {
			return false;
		} else {			
			return true;
		}
	}

	//Builds standard fleet of 1 ship per type
	Fleet.prototype.standardFleet = function() {
		var self = this;

		for(var ship in self.shipsInFleet) {
			self.shipsInFleet[ship] = 1;
		}		
		self.addShips();
	}


	//Board Class
	function Board(player) {
		this.rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
		this.cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		this.directions = ['north', 'east', 'south', 'west'];
		this.availableSpaces = [];
		this.guessableSpaces = [];
		this.owner = player;
		this.selector = '.' + this.owner + '-board';

		//Setup
		this.initialize(player);
	}
	window.Board = Board;

	Board.prototype = {
		constructor: Board
	};


	//Sets up new board	
	Board.prototype.initialize = function(player) {
		var tiles = '';
		var rowLabel = '';
		var colLabel = '';

		//build row labels
		for(var i = 0; i < this.rows.length; i++) {
			rowLabel += '<div class="tile label">' + this.rows[i] + '</div>';
		}
		$(this.selector + ' .row-label').append(rowLabel);

		//build column labels
		for(var i = 0; i < this.cols.length; i++) {
			colLabel += '<div class="tile label">' + this.cols[i] + '</div>';
		}
		$(this.selector + ' .column-label').append(colLabel);

		//build tiles
		for(var i = 0; i < this.rows.length; i++) {
			for(var j = 0; j < this.cols.length; j++) {
				var coord = (this.rows[i] + '-' + this.cols[j]);
				this.availableSpaces.push(coord);
				this.guessableSpaces.push(coord);

				if(i == 0 && j == 0) {
					tiles += '<div class="tile clear" data-coord="' + coord + '"></div>';
				} else {
					tiles += '<div class="tile" data-coord="' + coord + '"></div>'; 
				}
			}
		}
		$(this.selector + ' .playable-area').append(tiles);
	}

	//Gets potential positions based on location and length

	//TO DO: make it return an object with all positions, and a true/false - to show positions in
	//different color, instead of just return false for preview
	Board.prototype.getPossibleShipPosition = function(ship) {
		
		var direction = ship.direction;		
		var row = ship.row;
		var col = ship.col;
		var rowNum = letterToNum(row);

		var result = {
			possible: true,
			shipTiles: [],
		};

		switch(direction) {
			case('north'):
				for(var i = 0; i < ship.shipLength; i++) {
					var possibleCoord = numToLetter(rowNum - i) + '-' + col;
					
					if( this.availableSpaces.indexOf(possibleCoord) === -1 ) {
						result.possible = false;
						
						//don't include things before 'A' because jQuery won't be able to find them
						if(rowNum - i > 0) {
							result.shipTiles.push(possibleCoord);							
						}
					} else {
						result.shipTiles.push(possibleCoord);
					}
				}
			break;

			case('east'):
				for(var i = 0; i < ship.shipLength; i++) {
					
					var possibleCoord = row + '-' + (col + i);
					
					if( this.availableSpaces.indexOf(possibleCoord) === -1 ) {
						result.possible = false;
						result.shipTiles.push(possibleCoord);
						// return false;
					} else {
						result.shipTiles.push(possibleCoord);
					}	
				}				
			break;

			case('south'):
				for(var i = 0; i < ship.shipLength; i++) {
					
					var possibleCoord = numToLetter(rowNum + i) + '-' + col;
				
					if( this.availableSpaces.indexOf(possibleCoord) === -1 ) {
						result.possible = false;
						result.shipTiles.push(possibleCoord);
					} else {
						result.shipTiles.push(possibleCoord);
					}
				}
			break;

			case('west'):
				for(var i = 0; i < ship.shipLength; i++) {
					var possibleCoord = row + '-' + (col - i);
					
					if( this.availableSpaces.indexOf(possibleCoord) === -1 ) {
						result.possible = false;
						result.shipTiles.push(possibleCoord);
					} else {
						result.shipTiles.push(possibleCoord);
					}	
				}
			break;
		}
		return result;			
	
	}

	//Updates guess tile with hit/miss result
	Board.prototype.updateBoard = function(tile, outcome) {
		tile.addClass(outcome);
	}

	//Removes a space or an array of spaces from the set of available spaces
	Board.prototype.removeSpace = function(list, coord) {
		if(list == 'available') {
			var spacesList = 'availableSpaces';
		} else if (list == 'guessable') {
			var spacesList = 'guessableSpaces';
		}

		if(coord.constructor === String) {
			var index = this[spacesList].indexOf(coord);
			if(index > -1) {
				this[spacesList].splice(index, 1);
			}

		} else if(coord.constructor === Array) {
			for(var i = 0; i < coord.length; i++) {
				var index = this[spacesList].indexOf(coord[i]);
				if(index > -1) {
					this[spacesList].splice(index, 1);
				}
			}
		}
	}

	
	//Give ships in fleet random positions
	Board.prototype.addRandomShips = function(fleet) {
		for(var i = 0; i < fleet.totalShips.length; i++) {		
			var ship = fleet.totalShips[i];
			var row = getRandom(this.rows);
			var col = getRandom(this.cols);
			var dir = getRandom(this.directions);

			var coord = row + '-' + col;

			ship.setCoord(coord);
			ship.direction = dir;
			
			var positions = this.getPossibleShipPosition(ship);

			//if false, rerun until true
			while(! positions.possible) {
				row = getRandom(this.rows);
				col = getRandom(this.cols);
				dir = getRandom(this.directions);
				ship.direction = dir;
				ship.setCoord(row + '-' + col);				
				positions = this.getPossibleShipPosition(ship);
			}

			ship.addPosition(positions.shipTiles);
			this.drawShip(positions.shipTiles, 'ship ' + ship.shipType);
			this.removeSpace('available', positions.shipTiles);
		}
	}

	//Draw all ships in fleet
	Board.prototype.drawAllShips = function(fleet) {
		for(var i = 0; i < fleet.totalShips.length; i++) {
			var ship = fleet.totalShips[i];
			this.drawShip(ship.positions, 'ship ' + ship.shipType);
		}
	}

	//Add ship to a board with given positions
	Board.prototype.drawShip = function(positions, className) {
		for(var i = 0; i < positions.length; i++) {
			var tile = positions[i];
			$(this.selector + ' .tile[data-coord=' + tile + ']').addClass(className);
		}

		//remove spaces from player boards, but not placer board
		if(this.owner != 'placer' ) {
			this.removeSpace('available', positions);
		}		
	}

	//Check hit vs miss.
	//Must pass a DOM object
	//At some point change to not rely on the html, check based on ship.positions
	Board.prototype.checkHit = function(tileObj) {			
		if(tileObj.hasClass('ship')) {
			return true;
		} else {
			return false;
		}
	}

	//In case of hit, returns which ship object was hit
	Board.prototype.determineShip = function(tile, fleet) {
		var tileID;

		if(tile.constructor === String) {
			tileID = tile;	
		} else {
			tileID = tileID.attr('data-coord');
		}

		var whichShip;
		for(var i = 0; i < fleet.activeShips.length; i++) {
			var ship = fleet.activeShips[i];
	
			if(ship.positions.indexOf(tileID) > -1) {
				whichShip = ship;
			}
		}
		return whichShip;
	}


	//PLAYER CLASS
	function Player(playerType) {
		this.playerType = playerType;
		this.enemy;

		//stats
		this.turns = 0;
		this.hits = 0;
		this. misses = 0;
		this.currentStreak = 0;
		this.bestStreak = 0;
		this.currentDrySpell = 0;
		this.longestDrySpell = 0;

		//turn info
		this.turnInfo = {
			'result' : null,
			'ship' : null,
			'message' : null,
		}

		this.board = new Board(this.playerType);
		this.fleet = new Fleet();

	}
	window.Player = Player;

	Player.prototype = {
		constructor: Player
	}

	//Resets turn info, call at start of each turn
	Player.prototype.resetTurnInfo = function() {
		for(var prop in this.turnInfo) {
			this.turnInfo[prop] = null;
		}
	}

	//turns tile string to jQuery tile object.
	Player.prototype.objectify = function(tile) {
		return $(this.enemy.board.selector + ' .tile[data-coord="' + tile + '"]');
	}

	Player.prototype.addHit = function() {
		this.hits++;
	}

	Player.prototype.addMiss = function() {
		this.misses++;
	}

	//Gets remaining hit points of all player's active ships
	Player.prototype.getTotalHitPoints = function() {
		var hitPoints = 0;
		var activeShips = this.fleet.activeShips;

		for(var i = 0; i < activeShips.length; i++) {
			hitPoints += activeShips[i].hitPoints;
		}
		return hitPoints;
	}

	//Gets a player's hit percentage
	Player.prototype.getHitPercent = function() {
		return Math.round(((this.hits / (this.hits + this.misses)) * 100) * 100) / 100;
	}

	//Increases hit streak
	Player.prototype.increaseStreak = function() {
		this.currentStreak++;
	}

	//If new streak breaks old record, update bestStreak property
	Player.prototype.updateStreak = function() {
		if(this.currentStreak > this.bestStreak) {
			this.bestStreak = this.currentStreak;
		}
	}

	//Increase miss streak
	Player.prototype.increaseDrySpell = function() {
		this.currentDrySpell++;
	}

	//If new miss streak breaks record, update longestDrySpell property
	Player.prototype.updateDrySpell = function() {
		if(this.currentDrySpell > this.longestDrySpell) {
			this.longestDrySpell = this.currentDrySpell;
		}
	}

	//Updates stats each turn
	Player.prototype.updateStats = function(outcome) {
		if(outcome == 'hit') {
			this.addHit();
			this.increaseStreak();
			this.updateStreak();
			this.currentDrySpell = 0;
		} else {
			this.addMiss();
			this.currentStreak = 0;
			this.increaseDrySpell();
			this.updateDrySpell();
		}
	}


	//Human Subclass
	function Human() {
		Player.call(this, 'human');
		this.turn = true;
	}
	window.Human = Human;
	Human.prototype = Object.create(Player.prototype);
	Human.prototype.constructor = Human;
	
	//Checks hit/miss status of human guess.
	Human.prototype.guess = function(tileObj) {
		var self = this;

		self.resetTurnInfo();

		var tile = tileObj.attr('data-coord');

		if(!tileObj.hasClass('hit') && !tileObj.hasClass('miss')) {
			
			var enemyBoard = self.enemy.board;
			

			//to-do refactor for same code if AI hits
			if(enemyBoard.checkHit(tileObj)) {
				
				enemyBoard.updateBoard(tileObj, 'hit');
				var ship = enemyBoard.determineShip(tile, self.enemy.fleet);
				ship.hit();

				//update turnInfo
				self.turnInfo.result = 'hit';
				self.turnInfo.ship = ship;
				self.turnInfo.message = ship.hitMessage();
				
				//Player stats
				self.updateStats('hit');

				self.enemy.fleet.checkSink(ship);
				
			} else {
				enemyBoard.updateBoard(tileObj, 'miss');
				
				self.turnInfo.result = 'miss';
				self.turnInfo.message = 'Miss!';				
				self.updateStats('miss');

			}
			enemyBoard.removeSpace('guessable', tile);
		}
		self.turns++;
	}

	//AI Subclass
	function AI() {
		Player.call(this, 'ai');
		
		this.guessInfo = {
			"firstTileHit" : null,
			"lastTileHit" : null,
			"lastTileGuessed" : null,
			"targetShip" : null,
			"lastShipOrientation" : null,

			"knownShips": []

		};
	}
	window.AI = AI;
	AI.prototype = Object.create(Player.prototype);
	AI.prototype.constructor = AI;

	//AI turn.  Guesses tiles based on known ship locations, if any, and checks hit/miss status.
	AI.prototype.guess = function() {
		var enemyBoard = this.enemy.board;
		var self = this;

		self.resetTurnInfo();

		//no target
		if(self.guessInfo['targetShip'] == null) {

			var tile = self.findATarget();

		} else { //has target
			
			var tile = self.getTile();
		}

		var tileObj = self.objectify(tile);
			
		if(enemyBoard.checkHit(tileObj)) { //hit
			

			enemyBoard.updateBoard(tileObj, 'hit');
			var ship = enemyBoard.determineShip(tile, self.enemy.fleet);
			ship.hit();

			//update turnInfo
			self.turnInfo.result = 'hit';
			self.turnInfo.ship = ship;
			self.turnInfo.message = ship.hitMessage();
			
			// Player stats
			self.updateStats('hit');

			self.checkTarget(tile, ship);

		} else { //miss
			enemyBoard.updateBoard(tileObj, 'miss');
			self.turnInfo.result = 'miss';
			self.turnInfo.message = 'Miss!';			
			self.updateStats('miss');
		}		
		self.guessInfo['lastTileGuessed'] = tile;
		enemyBoard.removeSpace('guessable', tile);
		
		//Allow human to guess again
		self.enemy.turn = true;

		self.turns++;
	}


	//Checks if hit ship was the target ship, or an accidental hit.
	//If so, save ship location for later use.
	AI.prototype.checkTarget = function(tile, ship) {
		//accidental hit
		if(this.guessInfo['targetShip'] && ship != this.guessInfo['targetShip'] ) {
			//remember for later
			this.guessInfo['knownShips'].push(tile);

			//check its sink status anyway
			if(this.enemy.fleet.checkSink(ship)) {
				this.removeSunkFromMemory(ship);				
			}

		} else { //hit target ship
			this.updateGuessInfo(tile, ship);

			if(this.enemy.fleet.checkSink(ship)) {
				this.removeSunkFromMemory(ship);
				this.clearGuessInfo();
			}
		}
	}

	//Updates the information the AI remembers about ship placement and hits
	AI.prototype.updateGuessInfo = function(tile, ship) {
		this.guessInfo['targetShip'] = this.guessInfo['targetShip'] || ship;					
		this.guessInfo['firstTileHit'] = this.guessInfo['firstTileHit'] || tile;
		this.guessInfo['lastTileHit'] = tile;

		//if there are two hits, find orient if one doesn't already exist
		if(this.guessInfo['firstTileHit'] != this.guessInfo['lastTileHit']) {
			this.guessInfo['lastShipOrientation'] = this.guessInfo['lastShipOrientation'] || this.findOrient();	
		}
	}

	//Get a tile based on educatedGuess.
	//If no possible tile (tile is out of bounds or already taken) guess again in the other direction,
	//based on first tile hit.
	AI.prototype.getTile = function() {
		var tile = this.educatedGuess();
		if(! tile) {
			tile = this.educatedGuess(this.guessInfo['firstTileHit']);
		}
		return tile;
	}

	//If there are knownShips, make first the target ship and update guessInfo and guess based on that ship.
	//Otherwise choose a random tile.
	AI.prototype.findATarget = function() {
		var enemyBoard = this.enemy.board;

		//find a new target
		if(this.guessInfo['knownShips'].length) {

			var targetTile = this.guessInfo['knownShips'][0];
			var ship = enemyBoard.determineShip(targetTile, this.enemy.fleet);

			this.guessInfo['knownShips'].splice(0, 1); //remove from known ships so no loop

			this.updateGuessInfo(targetTile, ship);

			var tile = this.educatedGuess();

		} else {
			var tile = this.randomGuess();
			
			var neighbors = this.getNeighbors(tile);

			//prevents from guessing singletons when random guessing.
			while( !this.cullNeighbors(neighbors).length ) {
				tile = this.randomGuess();
				neighbors = this.getNeighbors(tile);
			}				
		}
		return tile;
	}

	//Remove sunk ships from knownShips, in case one is sunk on accidental hits, the AI won't try and hit it again later.
	AI.prototype.removeSunkFromMemory = function(ship) {		
		for(var i = 0; i < ship.positions.length; i++) {
			var shipTile = ship.positions[i];
			if(this.guessInfo['knownShips'].indexOf(shipTile) > -1) {				
				var index = this.guessInfo['knownShips'].indexOf(shipTile);
				this.guessInfo['knownShips'].splice(index, 1);
			}
		}
	}

	//Clear all information except known ships
	AI.prototype.clearGuessInfo = function() {
		this.guessInfo["firstTileHit"] = null;
		this.guessInfo["lastTileHit"] = null;
		this.guessInfo["lastTileGuessed"] = null;
		this.guessInfo["targetShip"] = null;
		this.guessInfo["lastShipOrientation"] = null;
	}

	//Finds the orientation of the current target ship
	AI.prototype.findOrient = function() {
		var firstHit = this.guessInfo['firstTileHit'];
		var newHit = this.guessInfo['lastTileHit'];

		var row1 = firstHit.split("-")[0];
		var row2 = newHit.split("-")[0];
		var col1 = firstHit.split("-")[1];
		var col2 = newHit.split("-")[1];

		/* If the AI has already hit, it will guess neighbor tiles,
		  so one of the two must be true */
		if(row1 == row2) {
			return 'horizontal';
		} else if (col1 == col2) {
			return 'vertical'
		}
	}
	
	//Randomly selects an available tile to guess
	AI.prototype.randomGuess = function() {
		return getRandom(this.enemy.board.guessableSpaces);
	}


	//Selects next tile to guess based on knowledge of current target
	AI.prototype.educatedGuess = function(startFromTile) {
		var lastTile =  startFromTile || this.guessInfo['lastTileHit']; 

		var orient = this.guessInfo['lastShipOrientation'];
		var neighbors = this.getNeighbors(lastTile)
		var possibleTargets = [];
		var targetList = [];

		//Quick filter by direction, if known
		if(orient == null) {
			possibleTargets = neighbors;
		} else if (orient == 'vertical') {
			possibleTargets = [neighbors.north, neighbors.south];			
		} else if(orient == 'horizontal') {
			possibleTargets = [neighbors.east, neighbors.west];
		}

		targetList = this.cullNeighbors(possibleTargets);
		var target = getRandom(targetList);
		return target;
	}

	/*Gets the neighbors of a tile and
	  returns an object with associated directions and tiles */
	AI.prototype.getNeighbors = function(tile) {
		var row = tile.split('-')[0];
		var col = tile.split('-')[1];

		var neighbors = {
			north: numToLetter(letterToNum(row) - 1) + '-' + col,
			east: row + '-' + (parseInt(col) + 1),
			south: numToLetter(letterToNum(row) + 1) + '-' + col,
			west: row + '-' + (parseInt(col) - 1),
		}
		return neighbors;
	}

	/*Takes an array of neighboring tiles and returns the tiles that
	  are still guessable on the board*/	
	AI.prototype.cullNeighbors = function(possibleNeighbors) {
		var neighbors = [];

		//if passed a neighbor object, convert to array
		if(possibleNeighbors.constructor == Object) {
			var possibleNeighbors = [possibleNeighbors.north, possibleNeighbors.east,
			 possibleNeighbors.south, possibleNeighbors.west];
		}

		//loop and check if tiles are guessable		
		for(var i = 0; i < possibleNeighbors.length; i++) {
			var targ = possibleNeighbors[i];
			if(this.enemy.board.guessableSpaces.indexOf(targ) > -1) {		
				neighbors.push(targ);
			}
		}		
		return neighbors;	
	}

	//GAME CLASS
	function Game() {
		this.gameType;
		this.p1;
		this.p2;

		this.winner;
		this.loser;

		this.gamelog;
		this.scoreboard;

		this.shipPlacer = {
			'currentShip' : null,
		};
	}
	window.Game = Game;

	Game.prototype = {
		constructor: Game
	};

	
	//Sets up new game
	Game.prototype.initialize = function() {
		var self = this;

		this.p1 = new Human();
		this.p2 = new AI();
		this.players = [this.p1, this.p2];
		this.assignEnemy(this.p1, this.p2);

		//Game choice
		$('button.custom').click(function() {
			self.chooseShips();
		});

		$('button.standard').click(function() {
			self.standardGame();
		});
	}

	//Initializes scoreboard and gamelog
	Game.prototype.setUpInfoArea = function() {
		this.gamelog = new GameLog();
		this.scoreboard = new Scoreboard(this.p2.fleet);

		this.gamelog.initialize();
		this.scoreboard.initialize();		
	}

	//Assigns each player an enemy so they may see opponents board, check fleet status, etc
	Game.prototype.assignEnemy = function(p1, p2) {
		p1.enemy = p2;
		p2.enemy = p1;
	}

	//Checks both player's fleets.  If one is totally destroyed assigns winner and loser and returns true
	Game.prototype.isGameOver = function() {
		if(!this.p1.fleet.checkFleet() || !this.p2.fleet.checkFleet() ) {			

			if(!this.p1.fleet.checkFleet()) {
				this.winner = 'Player 2';
				this.loser = 'Player 1';
			} else {
				this.winner = 'Player 1';
				this.loser = 'Player 2';
			}
			return true;

		} else {
			return false;
		}
	}

	//Ends game and displays winner/loser message
	Game.prototype.endGame = function() {
		var self = this;

		//turn off all events on tiles
		$('.tile').off();

		$('.ai-board .ship').addClass('end');

		self.gameOverAnimation();

		//fire once on click and unbind
		$('.stats').fadeIn('slow').one('click', function() {			
			$('.single-board-wrap').empty();
			$('.end-anim').remove();
			self.gameStats();
			$('.stats').fadeOut('slow');
		});
	}

	//Displays stats after game
	Game.prototype.gameStats = function() {

		var statsArea = $('<div>').addClass('stats-area');

		var statTitle = '<h2>Stats</h2>';

		statsArea.append(statTitle);

		for(var i = 0; i < this.players.length; i++) {
			var player = this.players[i];
			var playerName = '<h3>' + player.playerType + '</h3>';
			var turns = '<p>Turns: ' + player.turns + '</p>';
			var hits = '<p>Hits: ' + player.hits + '</p>';
			var misses = '<p>Misses: ' + player.misses + '</p>';
			var hitPercent = '<p>Hit percentage: ' + player.getHitPercent() + '%</p>';
			var streak = '<p>Best hit streak: ' + player.bestStreak + '</p>';
			var drySpell = '<p>Longest dryspell: ' + player.longestDrySpell + '</p>';
			var hitsRemaining = '<p>Hit points remaining: ' + player.getTotalHitPoints() + '</p>';

			var stats = [playerName, turns, hits, misses, hitPercent, streak, drySpell, hitsRemaining];			

			var playerStats = $('<div>').addClass('player-stats');
			statsArea = statsArea.append(playerStats.append(stats.join('')));
			
			statsArea.insertAfter($('.board-wrap h1'));
		}
	}

	//Main game area.  Assigns click events, runs human and AI turns, checks for winners.
	Game.prototype.gameLoop = function() {
				  
		var self = this;
		
		self.setUpInfoArea();

		//Assign click event to all guessable spaces.
		for(var i = 0; i < this.p1.board.guessableSpaces.length; i++) {
			var coord = this.p1.board.guessableSpaces[i];
			var tileObj = this.p1.objectify(coord);
			tileObj.click(function() {
	  			
				//Only allow clicking on player's turn
				if(self.p1.turn) {					
					var tile = $(this);
					
					//turn off events on a clicked tile
					tile.off();

					//Check human's guess
					self.p1.guess(tile);
					self.gamelog.output('Human', self.p1.turnInfo.message);
					self.scoreboard.update(self.p1.turnInfo.ship);

					self.p1.turn = false;
		
					//After human's turn is done, check game status.

					if(self.isGameOver()) {
						setTimeout(function(){
							self.endGame();
						}, 1000);
					} else {
						
						//AI Guess (after pause) and check game
						setTimeout(function() {
							self.p2.guess();
							self.gamelog.output('AI', self.p2.turnInfo.message);

							if(self.isGameOver()) {
								setTimeout(function(){
									self.endGame();
								}, 1000);
							}

						}, 1200);
					}					
				}
			});	
		}	
	}
	
	//Game section that allows player to choose which ships to use in a custom game
	Game.prototype.chooseShips = function() {
		var self = this;
		var shipCount = 0;
		var ships = [];

		//Hide/display sections
		$('.game-types').hide();
		$('.ship-picker').show();


		//Add ships to ship list if space available
		$('.ship-choice').click(function() {
			if(shipCount < 5) {

				var choice = $(this).text();
				var li = $('.ship-list li').first();

				while(li.children('p').text() != '') {
					li = li.next();
					
				}

				li.children('p').text(choice);
				ships.push(choice);
				shipCount++;
				
				//activate/inactive buttons
				if(shipCount >= 5) {
					$('.ship-choice').toggleClass('inactive');
					$('.build-fleet').toggleClass('inactive');
				}		
			}
		});
	
		//Remove ships from list and shift list upwards
		$('.remove').click(function() {
			var text = $(this).siblings('p');
			if(text.text() != '') {
				var index = ships.indexOf(text.text());
				text.text('');
				shipCount--;

				ships.splice(index, 1);
				self.shiftShipList();

				if(shipCount < 5) {
					$('.ship-choice').removeClass('inactive');
					$('.build-fleet').addClass('inactive');
				}
			}				
		});

		//If 5 ships, build the players' fleets, and trigger the ship placement 
		$('.build-fleet').click(function() {
			if(shipCount == 5) {
				self.buildFleet(ships);
				self.placeShips();
				$('.ship-picker').hide();
			}
		});
	}

	//Shifts the ship list up
	Game.prototype.shiftShipList = function() {
		var shipsInList = $($('.ship-list li p').get());

		shipsInList.each(function(idx) {
			var current = $(this);
			if(current.text() == '') {
				for(var i = idx; i < shipsInList.length; i++) {
					//shift text upwards
					shipsInList.eq(i).text(shipsInList.eq(i + 1).text());
				}	
			}
		});
	}

	//Sets up standard fleets (1 per ship type), random boards
	Game.prototype.standardGame = function() {
		this.p1.fleet.standardFleet();
		this.p2.fleet.standardFleet();

		this.buildBoards(false); //not custom
		$('.game-types').hide();
	}

	//Constructs each player's fleet based on selected ships
	Game.prototype.buildFleet = function(ships) {
		for(var i = 0; i < ships.length; i++) {
			var shipType = ships[i];
			this.p1.fleet.shipsInFleet[shipType]++;
			this.p2.fleet.shipsInFleet[shipType]++;
		}
		this.p1.fleet.addShips();
		this.p2.fleet.addShips();
	}

	//Event handling allowing players to place their own ships
	Game.prototype.placeShips = function() {		
		var self = this;
		var ship = null;
		var placerBoard = new Board('placer');
		var count = 0;

		//Create ship choice buttons
		for(var i = 0; i < this.p1.fleet.activeShips.length; i++) {
			var shipChoice = this.p1.fleet.activeShips[i];

			$('<li>').text(shipChoice.shipType).attr('id', shipChoice.ID).appendTo($('.ships-to-place ul'));
		}

		// Display section
		$('.ship-placer').show();

		//Click button to pick a ship to place
		$('.ships-to-place ul li').click(function() {
			$('.ships-to-place .active').removeClass('active');
			$(this).addClass('active');
			var index = $(this).index();
			ship = self.p1.fleet.activeShips[index];
			self.shipPlacer.currentShip = self.p1.fleet.activeShips[index];
		});


		//Show preview of ship on hover
		$('.placer-board .playable-area .tile').hover(function(){
			
			if(self.canPlace()) {
				
				var coord = $(this).attr('data-coord');
				ship.setCoord(coord);				
				var possiblePosition = placerBoard.getPossibleShipPosition(ship);				
				
				//Paint potential spots
				if(possiblePosition.possible) {
					placerBoard.drawShip(possiblePosition.shipTiles, 'potential');					
				} else {
					placerBoard.drawShip(possiblePosition.shipTiles, 'impossible');					
				}

				//Place ship
				$(this).click(function(){

					if(self.canPlace()) {
						possiblePosition = placerBoard.getPossibleShipPosition(ship);						
					
						if(possiblePosition.possible) {
							ship.addPosition(possiblePosition.shipTiles);
							placerBoard.removeSpace('available', possiblePosition.shipTiles);
							
							//Paint placed ship
							placerBoard.drawShip(ship.positions, 'placed');

							//inactivate button
							$('.ships-to-place ul li').eq(ship.ID).removeClass('active').addClass('inactive');
							
							//all buttons inactive, all ships placed
							if( $('.ships-to-place ul li.inactive').length == 5) {
								$('.start').removeClass('inactive').addClass('active');

								//Setup player boards, start game
								$('button.start.active').click(function() {
									self.buildBoards(true);
									
								});
							}
							//reset ship
							ship = null;
						}
					}
				});



				// Rotate ships
				$(document).keydown(function(event) {
					
					if(ship && (event.which == 87 || event.which == 65 || 
						event.which == 83 || event.which == 68 )) {

						if(event.which == 87) {
							ship.direction = 'north';
							
						} else if(event.which == 65) {
							ship.direction = 'west';

						} else if(event.which == 83) {
							ship.direction = 'south';

						} else if(event.which == 68) {
							ship.direction = 'east';							
						}

						//Clear potential and get new potential positions w/ new direction
						$('.potential').removeClass('potential');
						$('.impossible').removeClass('impossible');
						possiblePosition = placerBoard.getPossibleShipPosition(ship);
						if(possiblePosition.possible) {
							placerBoard.drawShip(possiblePosition.shipTiles, 'potential');	
						} else {
							placerBoard.drawShip(possiblePosition.shipTiles, 'impossible');
						}
					}	
				});				
			}
		}, function() {
			$('.potential').removeClass('potential');
			$('.impossible').removeClass('impossible');
		});
	}

	//Check if there's a current ship that has not been placed
	Game.prototype.canPlace = function() {
		var self = this;
		var ship = self.shipPlacer.currentShip;

		if(ship && !ship.positions.length) {
			return true;
		} else {
			return false;
		}
	}

	//Build each player's board
	Game.prototype.buildBoards = function(custom) {
		var self = this;

		if(custom) {
			self.p1.board.drawAllShips(self.p1.fleet);
		} else {
			self.p1.board.addRandomShips(self.p1.fleet);
		}
		
		self.p2.board.addRandomShips(self.p2.fleet);

		$('.ship-placer').hide();
		$('.game-area, .game-area h1').show();
		$('body > h1').hide();

		//start playing game
		self.gameLoop();

	}

	//Display an animated message at end of game
	Game.prototype.gameOverAnimation = function() {
		var gameOverDiv = $('<div>').addClass('end-anim');
		var gameOver = $('<h3>').addClass('game-over').text('Game Over!');
		var msg = $('<p>').text(this.loser + ' has lost all ships. ' + this.winner + ' wins.');
		gameOverDiv.append(gameOver).append(msg).appendTo('body');
		gameOverDiv.fadeIn(1300);	
	}


	// GameLog Object
	function GameLog() {
		this.gameLog = $('<div>');
	}
	window.GameLog = GameLog;

	GameLog.prototype = {
		constructor: GameLog
	}

	GameLog.prototype.initialize = function() {		
		this.gameLog.addClass('gamelog');

		//attach gamelog
		$('.gamelog-container').append(this.gameLog);		
	}

	//Adds new messages to the gameLog
	GameLog.prototype.output = function(actor, message) {	
		var message = '<p>' + actor + ": " + message + '</p>';
		this.gameLog.append(message);

		//Scroll to bottom when adding new content
		//Access DOM object directly, not the jQuery wrapper
		this.gameLog[0].scrollTop = this.gameLog[0].scrollHeight;
	}

	// Scoreboard object
	function Scoreboard(fleet) {
		this.scoreboard = $('.scoreboard');
		this.fleet = fleet;
	}
	window.Scoreboard = Scoreboard;

	Scoreboard.prototype = {
		constructor: Scoreboard
	}

	Scoreboard.prototype.initialize = function() {
		var fleet = this.fleet.totalShips;
		
		var html = '';
		for(var i = 0; i < fleet.length; i++) {
			var ship = fleet[i];
			var shipID = ship.shipType + ship.coord;
			html += '<div class="' + shipID + '">' + ship.shipType + '<div class="hp-wrapper">';
			var HP = ship.hitPoints;

			for(var j = 0; j < HP; j++) {
				html += '<div class="hitpoint hit"></div>';
			}

			html += '</div></div>';
		}
		this.scoreboard.append(html);
	}

	//Update the hitpoints shown
	Scoreboard.prototype.update = function(ship) {
	
		if(ship != null) {
			var shipClass = ship.shipType + ship.coord;
			$('.' + shipClass + ' .hit').first().removeClass('hit');			
		}
	}


//Runs a new game
function newGame() {
	var game = new Game();

	game.initialize();

	//new game just refreshes the page to start all over
	$('button.new-game').click(function() {
		location.reload(true);
	});	
}

newGame();

})(window);