if (typeof require !== 'undefined') {
	var Rope = require('../src/rope');

	var utils = require('./utils');
	var Random = utils.Random;
	var eq = utils.eq;
}

var test = function() {
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

test();