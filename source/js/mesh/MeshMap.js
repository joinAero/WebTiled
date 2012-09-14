
WT.MeshMap = function() {
}

WT.MeshMap.prototype = {
	
	draw : function(map, meshshow) {

		var w = map.tilewidth,
			h = map.tileheight,
			r = map.height,
			c = map.width;
		/*
		if (w <= 0 || h <=0 || r <= 0 || c <= 0) {
			return;
		}
		*/
		var totalW = w * c;
		var totalH = h * r;
		var val;

		var ctx = map.ctx;
		/*
		ctx.save();
		ctx.rect(0, 0, totalW, totalH);
		ctx.fillStyle = '#808080';
		ctx.fill();
		ctx.restore();
		*/

		if (!meshshow) {
			return;
		}

		ctx.save();
		ctx.beginPath();
		for (var i = 0; i <= r; i++) {
			val = i * h;
			ctx.dashedLine(0, val, totalW, val, [5, 5]);
			// ctx.moveTo(0, val);
			// ctx.lineTo(totalW, val);
		}
		for (var j = 0; j <= c; j++) {
			val = j * w;
			ctx.dashedLine(val, 0, val, totalH, [5, 5]);
			// ctx.moveTo(val, 0);
			// ctx.lineTo(val, totalH);
		}
		ctx.lineWidth = 1.0;
		ctx.strokeStyle = '#000';
		ctx.stroke();
		ctx.restore();
	}

}
