
WT.Map = function(ctx, width, height, tilewidth, tileheight) {

	this.ctx = ctx;

	this.width = width !== undefined ? width : WT.file.width;
	this.height = height !== undefined ? height : WT.file.height;
	this.tilewidth = tilewidth !== undefined ? tilewidth : WT.file.tilewidth;
	this.tileheight = tileheight !== undefined ? tileheight : WT.file.tileheight;

	this.mesh = new WT.MeshMap();
	this.rect = new WT.Rect(null, null, this.tilewidth, this.tileheight);
}

WT.Map.prototype = {

	draw : function(meshshow) {
		this.mesh.draw(this, meshshow);
	},

	onMouseDown : function(e) {
		var left = Math.floor(e.offsetX / this.tilewidth) * this.tilewidth;
		var top = Math.floor(e.offsetY / this.tileheight) * this.tileheight;
		this.rect.left = left;
		this.rect.top = top;
		return this.rect;
	},

	onMouseMove : function(e) {
		var left = Math.floor(e.offsetX / this.tilewidth) * this.tilewidth;
		var top = Math.floor(e.offsetY / this.tileheight) * this.tileheight;
		if (left !== this.rect.left || top !== this.rect.top) {
			this.rect.left = left;
			this.rect.top = top;
			return this.rect;
		}
		return null;
	},

	resetRect : function() {
		this.rect.left = null;
		this.rect.top = null;
	},

	resize : function(w, h) {
		this.width = w;
		this.height = h;
	}

}