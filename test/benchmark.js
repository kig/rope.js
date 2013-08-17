if (typeof require !== 'undefined') {
	var Rope = require('../src/rope');

	var utils = require('./utils');
	var Random = utils.Random;
	var eq = utils.eq;
}

var benchmark = function() {

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

benchmark();