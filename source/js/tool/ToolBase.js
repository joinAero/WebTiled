/**
 * 工具栏项基类，
 * 
 * @param {Object} map          地图类，用于事件内计算区域
 * @param {Object} meshCanvas   框线画布，用于注册事件
 * 
 * @param {Function} currentLayer 获得当前层
 * @param {Function} currentPiece 获得当前小块
 */
WT.ToolBase = function(id, map, meshCanvas, currentLayer, currentPiece) {
	this.id = id;

	this.map = map;
	this.meshCanvas = meshCanvas;

	this.currentLayer = currentLayer;
	this.currentPiece = currentPiece;
}

WT.ToolBase.prototype = {

	reset : function(map, meshCanvas) {
		this.map = map;
		this.meshCanvas = meshCanvas;
	},

	register : function() {
		this.come();

		var events = this.getEvents();
		var e, i = -1;
		while(e = events[++i]) {
			this.meshCanvas.addEventListener(e.type, e.listener, false);
		}
	},

	unregister : function() {
		this.leave();

		var events = this.getEvents();
		var e, i = -1;
		while(e = events[++i]) {
			this.meshCanvas.removeEventListener(e.type, e.listener, false);
		}
	},

	come : function() {
	},

	leave : function() {
	},

	getEvents : function() {
		return [];
		/*return [{
			type : String,
			listener : Function
		}, ...]*/
	}

}
