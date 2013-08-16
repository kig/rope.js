var Rope = function(segs) {
	if (typeof segs === 'string') {
		segs = [segs];
	}
	this.segs = [];
	this.length = 0;
	if (segs) {
		for (var i=0; i<segs.length; i++) {
			this.push(segs[i]);
		}
	}
};

Rope.prototype.segMaxLength = 5000;

Rope.prototype._segment = function(i, j, str) {
	var a = [i,j], c=0;
	var splitLen = Math.floor(this.segMaxLength / 2) || 1;
	while (c<str.length) {
		var s = str.slice(c, c+splitLen);
		c += s.length;
		a.push(s);
	}
	return a;
};

Rope.prototype.toString = function() {
	return this.segs.join("");
};

Rope.prototype.push = function(str) {
	if (str.length === 0) {
		return;
	}
	var l = this.segs.length-1;
	if (l >= 0 && this.segs[l].length+str.length < this.segMaxLength*0.75) {
		this.segs[l] += str;
	} else {
		this.segs.push(str);
	}
	this.length += str.length;
};

Rope.prototype.slice = function(start, end) {
	start = start || 0;
	end = end != null ? end : this.length;
	if (start < 0) start += this.length;
	if (end < 0) end += this.length;
	if (end > this.length) {
		end = this.length;
	} else if (end < 0) {
		end = 0;
	}
	if (start < 0) {
		start = 0;
	}
	if (start >= this.length || start >= end) {
		return new Rope();
	}
	var segs = this.segs;
	var c = 0, ret = new Rope(), len = end-start;
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i];
		start -= seg.length;
		if (start < 0) {
			var slice = seg.slice(seg.length+start, seg.length+start+len);
			ret.push(slice);
			len -= slice.length;
			while (len > 0) {
				i++;
				seg = segs[i];
				len -= seg.length;
				if (len < 0) {
					ret.push(seg.slice(0, len));
				} else {
					ret.push(seg);
				}
			}
			break;
		}
	}
	return ret;
};

Rope.prototype.splice = function(start, length, replacement) {
	if (start < 0) {
		throw Error("Invalid start index");
	}
	if (length < 0) {
		throw Error("Invalid length");
	}
	if (start > this.length) {
		start = this.length;
	}
	if (length - start > this.length) {
		length = this.length - start;
	}
	if (this.segs.length === 0 && replacement) {
		return this.push(replacement);
	}
	replacement = (replacement || "");
	var segs = this.segs, plen;
	for (var i=0; i<segs.length; i++) {
		var seg = segs[i];
		start -= seg.length;
		if (start <= 0) {
			var idx = seg.length + start;
			if (idx === seg.length) {
				segs[i] = seg + replacement;
				this.length += replacement.length;
			} else {
				plen = seg.length;
				segs[i] = seg.slice(0, idx) + replacement + seg.slice(idx+length);
				this.length += (segs[i].length - plen);
				length -= (seg.length - idx);
			}
			var j = i+1;
			while (length > 0 && j < segs.length) {
				var neg = segs[j];
				if (neg.length > length) {
					plen = neg.length;
					segs[j] = neg.slice(length);
					this.length += (segs[j].length - plen);
					break;
				} else {
					length -= neg.length;
					this.length -= neg.length;
					j++;
				}
			}
			var limitBreak = segs[i].length > this.segMaxLength;
			if (j > i+1 || limitBreak) {
				if (limitBreak) {
					segs.splice.apply(segs, this._segment(i, j-i, segs[i]));
				} else {
					segs.splice(i+1, j-i-1);
				}
			}
			break;
		}
	}
	return null;
};

Rope.prototype.charAt = function(pos) {
	var segs = this.segs;
	for (var i=0; i<segs.length; i++) {
		pos -= segs[i].length;
		if (pos < 0) {
			return segs[i].charAt(segs[i].length+pos);
		}
	}
	return '';
};

Rope.prototype.charCodeAt = function(pos) {
	var segs = this.segs;
	for (var i=0; i<segs.length; i++) {
		pos -= segs[i].length;
		if (pos < 0) {
			return segs[i].charCodeAt(segs[i].length+pos);
		}
	}
	return NaN;
};

Rope.prototype.toUpperCase = function() {
	return new Rope(this.segs.map(function(s) { return s.toUpperCase(); }));
};

Rope.prototype.toLowerCase = function() {
	return new Rope(this.segs.map(function(s) { return s.toLowerCase(); }));
};

Rope.prototype.replace = function() {
	return new Rope(String.prototype.replace.apply(this.toString(), arguments));
};

Rope.prototype.match = function() {
	return String.prototype.match.apply(this.toString(), arguments);
};




Rope.test = function() {
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
			var idx = (Math.random()*27) | 0;
			if (idx === 26) {
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

	var eq = function(a,b, msg) {
		if (a != b && !(typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b))) {
			throw(Error(msg + " : " +a + " != " + b));
		}
	};
	var r = new Rope();
	r.push("Hello");
	eq(r.length, 5);
	eq(r.toString(), "Hello");
	eq(r.length, 5);
	r.push("World!");
	r.splice(5, 0, ", ");
	eq(r.toString(), "Hello, World!");
	eq(r.length, 13);

	r.splice(13, 0, " I feel fine.");
	eq(r.toString(), "Hello, World! I feel fine.");
	eq(r.length, 26);

	r.splice(5, 7);
	eq(r.toString(), "Hello! I feel fine.");
	eq(r.length, 19);

	r.push(" But ");
	r.push("how ");
	r.push("r you?");
	r.splice(20, 9, "How about"); 

	eq(r.toString(), "Hello! I feel fine. How about you?");

	r = new Rope(["bob", "joe"]);
	eq(r.toString(), "bobjoe");
	eq(r.length, 6);

	r.splice(0,0, "john");
	eq(r.toString(), "johnbobjoe");

	r.splice(10,0, "jack");
	eq(r.toString(), "johnbobjoejack");

	r.splice(4,6, "roenock");
	eq(r.toString(), "johnroenockjack");

	r.splice(4, 100, "bob");
	eq(r.toString(), "johnbob");

	r.splice(14, 100, "james");
	eq(r.toString(), "johnbobjames");



	for (var i=0; i<100; i++) {
		var segs = Random.array(Random.string);
		var r = new Rope(segs);
		eq(r.toString(), segs.join(""));
		eq(r.length, segs.join("").length);
	}

	for (var i=0; i<100; i++) {
		var segs = Random.array(Random.string);
		var r = new Rope();
		r.segMaxLength = Random.byte()+1;
		for (var j=0; j<segs.length; j++) {
			r.push(segs[j]);
		}
		var str = segs.join("");
		eq(r.toString(), str);
		eq(r.length, str.length);
		for (var j=0; j<10; j++) {
			var start = Random.byte();
			var len = Random.byte();
			var replacement = (Math.random() > 0.5 ? Random.string() : null);
			r.splice(start, len, replacement);
			str = str.slice(0, start) + (replacement || "") + str.slice(start+len);
			eq(r.toString(), str, "splice equality");
			eq(r.length, str.length, "same length");
			eq(r.charAt(start), str.charAt(start), "charAt");
			eq(r.charCodeAt(start), str.charCodeAt(start), "charCodeAt");
			eq(r.toUpperCase().toString(), str.toUpperCase(), "toUpperCase");
			eq(r.toLowerCase().toString(), str.toLowerCase(), "toLowerCase");
			eq(r.replace(/[A-G]/g, '*').toString(), str.replace(/[A-G]/g, '*'), "replace");
			eq(JSON.stringify(r.match(/[A-G]/g)), JSON.stringify(str.match(/[A-G]/g)), "match");
		}
	}

	for (var i=0; i<100; i++) {
		var segs = Random.array(Random.string);
		var r = new Rope();
		r.segMaxLength = Random.byte()+1;
		for (var j=0; j<segs.length; j++) {
			r.push(segs[j]);
		}
		var str = segs.join("");
		eq(r.toString(), str);
		eq(r.length, str.length);
		for (var j=0; j<10; j++) {
			var start = Random.int(256);
			var end = Random.int(256);
			eq(r.slice(start, end).toString(), str.slice(start, end), JSON.stringify(str)+".slice.("+start+", "+end+")");
			eq(r.slice(start, end).length, str.slice(start, end).length);
		}
	}


	for (var i=0; i<20; i++) {

		var cmds = [];
		for (var j=0; j<100000; j++) {
			var start = Random.uint(100000);
			var rr = Math.random() > 0.2;
			var len = rr ? (Math.random() > 0.3 ? 0 : Random.length(6)) : Random.length(6);
			var replacement = (rr ? Random.string(6) : null);
			cmds.push({start: start, length: len, replacement: replacement});
		}
		var segs = Random.array(function() { return Random.string(4000); }, 100);

		console.log(segs.join("").length);

		var t0 = Date.now();
		var r = new Rope(segs);
		//r.segMaxLength = 2000+(i+1)*500;
		for (var j=0; j<cmds.length; j++) {
			var c = cmds[j];
			r.splice(c.start, c.length, c.replacement);
		}
		var rs = r.toString();
		var ropeTime = Date.now() - t0;

		t0 = Date.now();
		var str = segs.join("");
		for (var j=0; j<cmds.length; j++) {
			var c = cmds[j];
			str = str.slice(0, c.start) + (c.replacement || "") + str.slice(c.start+c.length);
		}
		var strTime = Date.now() - t0;
		console.log("StrLen", segs.join("").length+"->"+str.length, "MaxLen", r.segMaxLength, "Rope", ropeTime, "String", strTime, "ratio", Math.round(10*strTime / ropeTime)/10);

		eq(rs, str);
	}

	
};

if (typeof module !== 'undefined') {
	module.exports = Rope;
}