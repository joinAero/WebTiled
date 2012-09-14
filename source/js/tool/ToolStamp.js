/**
 * 图块层印刻方式
 */
WT.ToolStamp = function(id, map, meshCanvas) {

	// 判断是否存在
	if (typeof WT.ToolStamp.instance === 'object') {
		// 重置该两属性，新建后这两个会重新创建
		WT.ToolStamp.instance.reset(map, meshCanvas);
		return WT.ToolStamp.instance; // 返回单例
	}

	// console.log('initialize this instance: WT.ToolStamp.');

	WT.ToolBase.apply(this, arguments); // 采用父类构造
	WT.ToolStamp.instance = this; // 缓存用以单例
}

WT.ToolStamp.prototype = (function() {

	var map, meshCanvas;
	var currentLayer, currentPiece;

	var isMouseDown = false;
	var isMouseUp = false;

	function onMouseDown(e) {
		var rect = map.onMouseDown(e);
		var piece = currentPiece();

		if (rect && piece) {
			coverLocations.push(rect.left, rect.top);
			currentLayer().cover(rect, piece);
		}
		isMouseUp = false;
		isMouseDown = true;
		meshCanvas.addEventListener('mouseup', onMouseUp, false);
	}

	var coverLocations = [];

	function onMouseMove(e) {
		var rect = map.onMouseMove(e);
		var piece = currentPiece();
		if (rect && piece) {
			var layer = currentLayer();
			if (isMouseDown) {
				coverLocations.push(rect.left, rect.top);
			} else if (isMouseUp) {
				isMouseUp = false;
			} else {
				layer.restore();
			}
			layer.cover(rect, piece);
		}
		e.preventDefault();
	}

	function onMouseUp(e) {
		if (isMouseDown) {
			var piece = currentPiece();
			if (piece) {
				currentLayer().record(coverLocations, piece);
				coverLocations = [];
			}
		} else {
			currentLayer().restore(); // 恢复小块
			map.resetRect(); // 避免移出再移入在同一小块而没进继续mousemove后续事件
		}
		isMouseUp = true; // 避免mouseup时那个小块在mousemove时再restore
		isMouseDown = false;
		meshCanvas.removeEventListener('mouseup', onMouseUp, false);
	}

	function onMouseOut(e) {
		onMouseUp(e);
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
			{type : 'mousemove', listener : onMouseMove},
			{type : 'mouseout', listener : onMouseOut}
		];
	}

	return mPrototype;
})();