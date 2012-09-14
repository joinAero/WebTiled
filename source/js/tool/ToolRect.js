/**
 * 框线层绘制方式。
 * 框线层绘制矩形区域用。
 */
WT.ToolRect = function(id, map, meshCanvas) {

	if (typeof WT.ToolRect.instance === 'object') {
		WT.ToolRect.instance.reset(map, meshCanvas);
		return WT.ToolRect.instance;
	}

	WT.ToolBase.apply(this, arguments);
	WT.ToolRect.instance = this;
}

WT.ToolRect.prototype = (function() {

	var map, meshCanvas;
	var currentLayer, currentPiece;

	var isMouseDown = false;

	function onMouseDown(e) {
		var start = map.onMouseDown(e);
		if (start) {
			currentLayer().begin(start.clone());
		}

		isMouseDown = true;
		meshCanvas.addEventListener('mouseup', onMouseUp, false);
		meshCanvas.addEventListener('mouseout', onMouseUp, false);
	}

	function onMouseMove(e) {
		if (isMouseDown) {
			var end = map.onMouseMove(e);
			if (end) {
				currentLayer().move(end);
			}
		}
		e.preventDefault();
	}

	function onMouseUp(e) {
		meshCanvas.removeEventListener('mouseup', onMouseUp, false);
		meshCanvas.removeEventListener('mouseout', onMouseUp, false);
		currentLayer().over();
		isMouseDown = false;
	}

	var mPrototype = WT.clone(WT.ToolBase);

	mPrototype.come = function() {
		map = this.map;
		meshCanvas = this.meshCanvas;
		currentLayer = this.currentLayer;
		currentPiece = this.currentPiece;
	}

	mPrototype.leave = function() {
	}

	mPrototype.getEvents = function() {
		return [
			{type : 'mousedown', listener : onMouseDown},
			{type : 'mousemove', listener : onMouseMove}
		]
	}

	return mPrototype;
})();