
WT.Piece = function(tileId, data, left, top, width, height) {

	this.tileId = tileId;

	this.data = data;
	this.left = left;
	this.top = top;
	this.width = width !== undefined ? width : (data ? data.width : 0);
	this.height = height !== undefined ? height : (data ? data.height : 0);

}

WT.Piece.prototype = {

	cover : function(ctx, style) {
		// ctx.save();
		ctx.putImageData(this.data, this.left, this.top, 0.0, 0.0, this.width, this.height);

		ctx.beginPath();
		ctx.rect(this.left, this.top, this.width, this.height);
		ctx.fillStyle = style || 'rgba(255, 20, 147, 0.6)';
		ctx.fill();

		// ctx.restore();
	},

	restore : function(ctx) {
		// ctx.save();
		ctx.putImageData(this.data, this.left, this.top, 0.0, 0.0, this.width, this.height);
		// ctx.restore();
	},

	reset : function(data, left, top, width, height, tileId) {
		this.data = data;
		this.left = left;
		this.top = top;
		this.width = width !== undefined ? width : data.width;
		this.height = height !== undefined ? height : data.height;
		if (tileId !== undefined) {
			this.tileId = tileId;
		}
	}

}

