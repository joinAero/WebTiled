
WT.Rect = function(left, top, width, height, style) {

	this.left = left !== undefined ? left : 0;
	this.top = top !== undefined ? top : 0;
	this.width = width !== undefined ? width : 0;
	this.height = height !== undefined ? height : 0;

	this.style = style !== undefined ? style : '#ff0000';
}

WT.Rect.prototype = {

	clone : function() {
		return new WT.Rect(this.left, this.top, this.width, this.height, this.style);
	}

}