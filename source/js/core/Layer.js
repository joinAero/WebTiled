
WT.Layer = function(canvas, name, type, visible, index, zIndex) {

	this._canvas = canvas !== undefined ? canvas : null;
	this._ctx = this._canvas ? this._canvas.getContext('2d') : null;
	
	this.index = index !== undefined ? index : 0;
	this.zIndex = zIndex !== undefined ? zIndex : this.index;

	this.name = name !== undefined ? name : '图层' + index;
	this.type = type !== undefined ? type : WT.TILE_LAYER;

	this.visible = visible !== undefined ? visible : true;
}

WT.TILE_LAYER = 'tilelayer';
WT.RECT_LAYER = 'rectlayer';
