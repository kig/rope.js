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



if (typeof module !== 'undefined') {
	module.exports = Rope;
}