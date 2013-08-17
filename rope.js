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

Rope.prototype.clear = function() {
	this.segs = [];
	this.length = 0;
	return this;
};

Rope.prototype.clone = function() {
	var r = new Rope();
	r.segs = this.segs.slice();
	r.segMaxLength = this.segMaxLength;
	r.length = this.length;
	return r;
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
		start = Math.max(0, start+this.length);
	}
	if (length < 0) {
		length = 0;
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
	if (!length && !replacement) {
		return null;
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

Rope.prototype.concat = function() {
	var r = new Rope(this.segs);
	for (var i=0; i<arguments.length; i++) {
		var a = arguments[i];
		if (a instanceof Rope) {
			for (var j=0; j<a.segs.length; j++) {
				r.push(a.segs[j]);
			}
		} else {
			r.push(a);
		}
	}
	return r;
};

Rope.prototype.indexOf = function(needle) {
	var off = 0;
	for (var i=0; i<this.segs.length; i++) {
		var idx = this.segs[i].indexOf(needle);
		if (idx !== -1) {
			return off+idx;
		}
		off += this.segs[i].length;
	}
	return -1;
};

Rope.prototype.lastIndexOf = function(needle) {
	var off = this.length;
	for (var i=this.segs.length-1; i>=0; i--) {
		var idx = this.segs[i].lastIndexOf(needle);
		off -= this.segs[i].length;
		if (idx !== -1) {
			return off+idx;
		}
	}
	return -1;
};

Rope.prototype.localeCompare = function(vs) {
	return this.toString().localeCompare(vs);
};

Rope.prototype.match = function() {
	return String.prototype.match.apply(this.toString(), arguments);
};

Rope.prototype.replace = function() {
	return new Rope(String.prototype.replace.apply(this.toString(), arguments));
};

Rope.prototype.search = function() {
	return String.prototype.search.apply(this.toString(), arguments);
};

Rope.prototype.split = function() {
	return String.prototype.split.apply(this.toString(), arguments).map(function(s) { return new Rope(s); });
};

Rope.prototype.substring = function(start, x) {
	if (start < 0) {
		start = 0;
	}
	if (x < 0) {
		x = start;
		start = 0;
	}
	if (x < start) {
		var tmp = x;
		x = start;
		start = tmp;
	}
	return this.slice(start, x);
};

Rope.prototype.substr = function(start, len) {
	if (start < 0) {
		start += this.length;
	}
	if (start < 0) {
		start = 0;
	}
	if (len < 0) {
		len = 0;
	}
	return this.slice(start, start+len);
};

Rope.prototype.toLocaleLowerCase = function() {
	return this.clone().toLocaleLowerCaseInPlace();
};

Rope.prototype.toLocaleLowerCaseInPlace = function() {
	for (var i=0; i<this.segs.length; i++) {
		this.segs[i] = this.segs[i].toLocaleLowerCase();
	}
	return this;
};

Rope.prototype.toLocaleUpperCase = function() {
	return this.clone().toLocaleUpperCaseInPlace();
};

Rope.prototype.toLocaleUpperCaseInPlace = function() {
	for (var i=0; i<this.segs.length; i++) {
		this.segs[i] = this.segs[i].toLocaleUpperCase();
	}
	return this;
};

Rope.prototype.toLowerCase = function() {
	return this.clone().toLowerCaseInPlace();
};

Rope.prototype.toLowerCaseInPlace = function() {
	for (var i=0; i<this.segs.length; i++) {
		this.segs[i] = this.segs[i].toLowerCase();
	}
	return this;
};

Rope.prototype.toUpperCase = function() {
	return this.clone().toUpperCaseInPlace();
};

Rope.prototype.toUpperCaseInPlace = function() {
	for (var i=0; i<this.segs.length; i++) {
		this.segs[i] = this.segs[i].toUpperCase();
	}
	return this;
};

Rope.prototype.trim = function() {
	return this.clone().trimInPlace();
};

Rope.prototype.trimInPlace = function() {
	return this.trimLeftInPlace().trimRightInPlace();
};

Rope.prototype.trimLeft = function() {
	return this.clone().trimLeftInPlace();
};

Rope.prototype.trimLeftInPlace = function() {
	for (var i=0; i<this.segs.length; i++) {
		var seg = this.segs[i];
		var nseg = seg.replace(/^\s+/, '');
		this.length += (nseg.length - seg.length);
		if (nseg.length > 0) {
			this.segs[i] = nseg;
			break;
		} else {
			this.segs.shift();
			i--;
		}
	}
	return this;
};

Rope.prototype.trimRight = function() {
	return this.clone().trimRightInPlace();
};

Rope.prototype.trimRightInPlace = function() {
	for (var i=this.segs.length-1; i>=0; i--) {
		var seg = this.segs[i];
		var nseg = seg.replace(/\s+$/, '');
		this.length += (nseg.length - seg.length);
		if (nseg.length > 0) {
			this.segs[i] = nseg;
			break;
		} else {
			this.segs.pop();
		}
	}
	return this;
};




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


Rope.test = function() {
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
			eq(r.search(/[A-G]/).toString(), str.search(/[A-G]/), "search");
			eq(r.search("FA").toString(), str.search("FA"), "search");
			eq(r.match(/[A-G]/g), str.match(/[A-G]/g), "match");
			eq(r.concat(r, str.substr(20,20)), str.concat(r, str.substr(20,20)), "concat");
			eq(r.indexOf("G"), str.indexOf("G"), "indexOf");
			eq(r.lastIndexOf("G"), str.lastIndexOf("G"), "lastIndexOf");
			eq(r.localeCompare(str.substr(20, 20)), str.localeCompare(str.substr(20, 20)), "localeCompare");
			eq(r.split("G",4).join(":::"), str.split("G",4).join(":::"), "split");
			eq(r.substring(start, len), str.substring(start, len), "substring "+start+" "+len);
			eq(r.substr(start, len), str.substr(start, len), "substr "+start+" "+len);
			eq(r.toLocaleLowerCase(), str.toLocaleLowerCase(), "toLocaleLowerCase");
			eq(r.toLocaleUpperCase(), str.toLocaleUpperCase(), "toLocaleUpperCase");
			eq(r.trim(), str.trim(), "trim");
			eq(r.trimLeft(), str.trimLeft(), "trimLeft");
			eq(r.trimRight(), str.trimRight(), "trimRight");
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

	console.log("Rope.test: Quick tests OK!");

	console.log("Rope.test: Exhaustive test 64x10x64x64, this'll take a while");

	var s = "";
	for (var i=0; i<64; i++) {
		console.log(i+1 + "/64");
		for (var len=1; len<=10; len++) {
			var rope = new Rope();
			rope.segMaxLength = len > 3 ? (len-3)*10 : len;
			rope.push(s);
			for (var j=0; j<64; j++) {
				for (var k=0; k<64; k++) {
					r = rope.clone();
					var str = s;
					eq(r.slice(j-32, k-32), str.slice(j-32, k-32), "slice", j-32, k-32, len);
					eq(r.substr(j-32, k-32), str.substr(j-32, k-32), "substr", j-32, k-32, len);
					eq(r.substring(j-32, k-32), str.substring(j-32, k-32), "substring", j-32, k-32, len);

					r = rope.clone();
					var spliced = str.split("");
					spliced.splice(j-32, k-32);
					r.splice(j-32, k-32);
					eq(r, spliced.join(""), "splice", j-32, k-32, len);

					r = rope.clone();
					spliced = str.split("");
					spliced.splice(j-32, k-32, "f", "o", "o");
					r.splice(j-32, k-32, "foo");
					eq(r, spliced.join(""), "splice", j-32, k-32, "foo", len);

				}
			}
		}
		s += "..";
	}

	console.log("Rope.test: OK!");

};

Rope.benchmark = function() {

	console.log("Rope.benchmark start");

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