var Random = {

	byte: function() { return (Math.random()*256) | 0; },

	uint: function(max) {
		return ((Math.random()*(max || (1<<31))) | 0);
	},

	int: function(max) {
		max = max || (1<<31);
		return (Math.random()*max - max/2) | 0;
	},

	length: function(maxLen) {
		maxLen = maxLen || 100;
		var r = Math.random();
		if (r < 0.05) {
			return 0;
		} else if (r > 0.95) {
			return maxLen;
		}
		return (maxLen * Math.random()) | 0;
	},

	char: function() {
		var idx = (Math.random()*40) | 0;
		if (idx >= 26) {
			return 32;
		} else {
			return 65 + idx;
		}
	},

	string: function(maxLen) { 
		var len = Random.length(maxLen);
		var str = '';
		for (var i=0; i<len; i++) {
			str += String.fromCharCode(Random.char());
		}
		return str;
	},

	array: function(gen, maxLen) {
		var len = Random.length(maxLen);
		var a = [];
		for (var i=0; i<len; i++) {
			a.push(gen());
		}
		return a;
	}
};

var eq = function(a,b) {
	if (a != b && !(typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b))) {
		if (typeof a === typeof b && typeof a === 'object') {
			if (JSON.stringify(a) !== JSON.stringify(b)) {
				var msg = Array.prototype.slice.call(arguments, 2).join(" ");
				throw(Error(msg + " : " + JSON.stringify(a) + " != " + JSON.stringify(b)));
			}
		} else {
			var msg = Array.prototype.slice.call(arguments, 2).join(" ");
			throw(Error(msg + " : " +a + " != " + b));
		}
	}
};

if (typeof module !== 'undefined') {
	module.exports.Random = Random;
	module.exports.eq = eq;
}