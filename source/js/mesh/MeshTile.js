
WT.MeshTile = function() {
}

WT.MeshTile.prototype = {

	draw : function(meshCtx, tile, lineWidth, style) {
		var w = tile.imagewidth - tile.margin,
			h = tile.imageheight - tile.margin,
			tw = tile.tilewidth,
			th = tile.tileheight;

		var ctx = meshCtx;
		ctx.save();
		ctx.lineWidth = lineWidth || 1.0;
		ctx.beginPath();

		var tag = 1;
		var x = tile.margin, y = tile.margin;
		while (x <= w) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, tile.imageheight);
			if (tag) {
				x += tw;
				tag = 0;
			} else {
				x += tile.spacing;
				tag = 1;
			}
		}
		tag = 1;
		while (y <= h) {
			ctx.moveTo(0, y);
			ctx.lineTo(tile.imagewidth, y);
			if (tag) {
				y += th;
				tag = 0;
			} else {
				y += tile.spacing;
				tag = 1;
			}
		}

		ctx.strokeStyle = style || '#97ffff';
		ctx.stroke();
		ctx.restore();
	},

	onPiece : function(tile, x, y) {
		var	tw = tile.tilewidth,
			th = tile.tileheight,
			w = tw + tile.spacing,
			h = th + tile.spacing;

		x = x - tile.margin;
		y = y - tile.margin;

		var m = x % w,
			n = y % h;

		if (m > 0 && m < tw && n > 0 && n < th) {
			m = Math.floor(x / w),
			n = Math.floor(y / h);
			// console.log(m, n);
			return {
				left : m * w,
				top : n * h
			};
		}
		return null;
	}

}