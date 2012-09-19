
WT.Tile = function(ctx, id, name, image, imagewidth, imageheight, tilewidth, tileheight, margin, spacing) {

	this._ctx = ctx;
	this.image = image !== undefined ? image : null;

	this.id = id;

	this.name = name !== undefined ? name : 'unnamed';
	this.imagewidth = imagewidth !== undefined ? imagewidth : 0;
	this.imageheight = imageheight !== undefined ? image.height : 0;
	this.tilewidth = tilewidth !== undefined ? tilewidth : WT.file.tilewidth;
	this.tileheight = tileheight !== undefined ? tileheight : WT.file.tileheight;
	this.margin = margin !== undefined ? margin : 0;
	this.spacing = spacing !== undefined ? spacing : 0;

	this._mesh = new WT.MeshTile();
	this._piece = null;
}


WT.Tile.prototype = {
	draw : function(meshCtx, meshshow) {
		this._ctx.drawImage(this.image, 0, 0, this.imagewidth, this.imageheight);
		if (this._piece !== null) {
			this._piece.cover(this._ctx);
		}
		if (meshshow) {
			this._mesh.draw(meshCtx, this);
		}
	},

	onMouseDown : function(e) {
		var val = this._mesh.onPiece(this, e.offsetX, e.offsetY);
		if (val) {
			var ctx = this._ctx;
			if (this._piece === null) {
				var data = ctx.getImageData(val.left, val.top, this.tilewidth, this.tileheight);
				this._piece = new WT.Piece(this.id, data, val.left, val.top);
				this._piece.cover(ctx);
			} else if (val.left !== this._piece.left || val.top !== this._piece.top) {
				var data = ctx.getImageData(val.left, val.top, this.tilewidth, this.tileheight);
				this._piece.restore(ctx);
				this._piece.reset(data, val.left, val.top);
				this._piece.cover(ctx);
			}
		}
	},

	currentPiece : function() {
		return this._piece;
	},

	clipImageData : function(left, top) {
		var canvas = document.createElement('canvas');
		canvas.width = this.tilewidth;
		canvas.height = this.tileheight;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(this.image, left, top, this.tilewidth, this.tileheight, 0, 0, this.tilewidth, this.tileheight);
		var data = ctx.getImageData(0, 0, this.tilewidth, this.tileheight);
		canvas = null;
		return data;
	}

}