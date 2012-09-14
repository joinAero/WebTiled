
WT.TileLayer = function() {
	WT.Layer.apply(this, arguments);

	this._piece = new WT.Piece();

	// [[tileId, tileLeft, tileTop, [coverLeft, coverTop, coverLeft, coverTop, ...]],[...],...]
	this.operations = [];
}

WT.TileLayer.prototype = WT.clone(WT.Layer);

WT.TileLayer.prototype.cover = function(rect, piece) {
	var ctx = this._ctx;
	
	var prevData = ctx.getImageData(rect.left, rect.top, piece.width, piece.height);
	this._piece.reset(prevData, rect.left, rect.top, piece.width, piece.height, piece.tileId);

	// ctx.save();
	ctx.putImageData(piece.data, rect.left, rect.top,
		0.0, 0.0, piece.width, piece.height);
	// ctx.restore();
};

WT.TileLayer.prototype.restore = function() {
	if (this._piece.left === undefined) {
		return;
	}
	var ctx = this._ctx;
	var p = this._piece;
	// ctx.save();
	ctx.putImageData(p.data, p.left, p.top, 0.0, 0.0, p.width, p.height);
	// ctx.restore();
};

WT.TileLayer.prototype.record = function(coverLocations, piece) {
	var operation = [piece.tileId, piece.left, piece.top];
	operation.push(coverLocations);
	this.operations.push(operation);
}

WT.TileLayer.prototype.revoke = function() {
	if (this.operations.length >= 1) {
		var operation = this.operations.pop();

		var tile = WT.getTile(operation[0]);
		var coverLocations = operation[3];
		var length = coverLocations.length;

		for (var i = 0; i < length; i += 2) {
			this._ctx.clearRect(coverLocations[i], coverLocations[i + 1], tile.tilewidth, tile.tileheight);

			// 依次遍历剩余的，判断有相交域时恢复。可能会有多块相交，所以需依次遍历。
			// 该方法，相比全部重绘，在大量重叠时，效率应该会低。
			(function(left, top) {
				var o, j = -1;
				while (o = this.operations[++j]) {
					var cover = o[3];
					var len = cover.length;
					var tile, data;
					for (var i = 0; i < len; i += 2) {
						if (cover[i] == left && cover[i + 1] == top) {
							tile = tile ? tile : WT.getTile(o[0]);
							data = data ? data : tile.clipImageData(o[1], o[2]);
							this._ctx.putImageData(data, left, top, 0.0, 0.0, tile.tilewidth, tile.tileheight);
						}
					}
				}
			}).call(this, coverLocations[i], coverLocations[i + 1]);
		}
		return true;
	}
	return false;
}

WT.TileLayer.prototype.restoreOperations = function() {
	// [tileId, tileLeft, tileTop, [coverLeft, coverTop, coverLeft, coverTop, ...]]
	var ctx = this._ctx;
	ctx.save();
	var operation, j = -1;
	while (operation = this.operations[++j]) {
		var tile = WT.getTile(operation[0]);
		var data = tile.clipImageData(operation[1], operation[2]);

		var coverLocations = operation[3];
		var length = coverLocations.length;
		for (var i = 0; i < length; i += 2) {
			this._ctx.putImageData(data, coverLocations[i], coverLocations[i + 1], 0.0, 0.0, tile.tilewidth, tile.tileheight);
		}
	}
	ctx.restore();
}

WT.TileLayer.prototype.resize = function(w, h, r, d) {
	var left = r * WT.file.tilewidth,
		top = d * WT.file.tileheight;
	var right = left + this._canvas.width,
		bottom = top + this._canvas.height;

	var o, i = -1;
	while (o = this.operations[++i]) {
		var cover = o[3];
		var len = cover.length;
		for (var j = 0; j < len; j += 2) {
			var l = cover[j], t = cover[j + 1];
			if (l < left || l >= right || t < top || t >= bottom) {
				cover.splice(j, 2); // 抛弃操作的该点
				j -= 2;
				len -= 2;
			} else {
				cover[j] = l - left;
				cover[j + 1] = t - top;
			}
		}
		if (cover.length <= 0) {
			this.operations.splice(i, 1); // 抛弃改操作
			i--;
		}
	}
	this.restoreOperations();
}
