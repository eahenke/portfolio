function getRandom(items) {
		var item = items[Math.floor(Math.random() * items.length)];
		return item;
	}

function letterToNum(letter) {
	if(letter.length === 1 ) {			
		var num = letter.charCodeAt(0) - 64;			
		return num;
	} else {
		console.log("Not a single letter: " + letter);
		return letter;
	}
}

function numToLetter(num) {
	var letter = String.fromCharCode(64 + num);
	return letter;
}

Array.prototype.diff = function(a) {
		return this.filter(function(i) {return a.indexOf(i) < 0;});
	};