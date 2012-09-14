/**
 * 图块层三角方式
 */
WT.ToolTriangle = function(id, map, meshCanvas) {

	if (typeof WT.ToolTriangle.instance === 'object') {
		WT.ToolTriangle.instance.reset(map, meshCanvas);
		return WT.ToolTriangle.instance;
	}

	WT.ToolBase.apply(this, arguments);
	WT.ToolTriangle.instance = this;
}

WT.ToolTriangle.prototype = (function() {

	
	
})();