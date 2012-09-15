/**
 * 图块层连接方式
 */
WT.ToolLink = function(id, map, meshCanvas) {

	if (typeof WT.ToolLink.instance === 'object') {
		WT.ToolLink.instance.reset(map, meshCanvas);
		return WT.ToolLink.instance;
	}

	WT.ToolBase.apply(this, arguments);
	WT.ToolLink.instance = this;
}

WT.ToolLink.prototype = (function() {

	var map, meshCanvas;
	var currentLayer, currentPiece;
	
	/**
	 * 获得连接(rowA, colA)与(rowB, colB)的中间坐标集
	 * 注：不包括两端点。
	 */
	function getChainCoords(rowA, colA, rowB, colB) {
		var coords = [];
		var inc, row, col;
		var rowDis = Math.abs(rowA - rowB),
			colDis = Math.abs(colA - colB);
		if (rowDis > colDis) {
			inc = rowA > rowB ? -1 : 1 ;
			row = rowA + inc;
			for (;Math.abs(rowA - row) < rowDis; row += inc) {
				col = colA + (colB - colA) * (row - rowA) / (rowB - rowA);
				coords.push([row, Math.round(col)]);
			}
		} else {
			inc = colA > colB ? -1 : 1 ;
			col = colA + inc;
			for (;Math.abs(colA - col) < colDis; col += inc) {
				row = rowA + (rowB - rowA) * (col - colA) / (colB - colA);
				coords.push([Math.round(row), col]);
			}
		}
		return coords;
	}

	var chainCoords, totalCoords;

	var prevRow, prevCol; // 前次点击位置
	var nowRow, nowCol; // 当前位置

	var isMouseDown = false;
	var isStart = false;

	function onMouseDown(e) {
		if (!currentPiece()) {
			return;
		}
		var column = Math.floor(e.offsetX / map.tilewidth),
			row = Math.floor(e.offsetY / map.tileheight);

		if (!isStart) {
			totalCoords = [[row, column]]; // 起点小块

			// 绘制起点小块
			var left = column * map.tilewidth,
				top = row * map.tileheight;
			var ctx = currentLayer()._ctx,
				piece = currentPiece();
			ctx.putImageData(piece.data, left, top, 0.0, 0.0, piece.width, piece.height);

			nowRow = row, nowRow = column;
			prevRow = row, prevCol = column;
			isStart = true;
			isMouseDown = true;
			return;
		}

		var coord, i = -1;
		while(coord = chainCoords[++i]) {
			totalCoords.push(coord);
		}
		// totalCoords.concat(chainCoords);

		// 判断是否在绘制过的链上
		if (isOnChain(row, column)) {
			totalCoords.pop(); // 把最后点击到链上触发结束的一点去掉^^
			record(); // 记录操作
			isStart = false;
			isMouseDown = false;
		} else {
			nowRow = row, nowRow = column;
			prevRow = row, prevCol = column;
			isMouseDown = true;
		}
	}

	function isOnChain(row, column) {
		// 最后一个终点块不检查
		var coord, len = totalCoords.length - 2;
		for (var i = 0; i <= len; i++) {
			coord = totalCoords[i];
			if (coord[0] === row && coord[1] === column) {
				return true;
			}
		}
		return false;
	}

	function onMouseMove(e) {
		if (!isStart || !currentPiece()) {
			return;
		}

		var column = Math.floor(e.offsetX / map.tilewidth),
			row = Math.floor(e.offsetY / map.tileheight);
		if (row == nowRow && column == nowCol) {
			return;
		}
		nowRow = row, nowCol = column;
		
		if (isMouseDown) {
			isMouseDown = false;
		} else {
			restore();
		}

		chainCoords = getChainCoords(prevRow, prevCol, row, column);
		chainCoords.push([row, column]); // 终点小块

		cover();
	}

	function onMouseOut(e) {
		if (!isStart || !currentPiece()) {
			return;
		}

		restore();

		// 现移出直接记录，避免切换Layer的影响
		// 这样leave里也不需处理什么。
		chainCoords = [];
		isStart = false;
		record(); // 记录操作
	}

	var datas = []; // chainCoords出小块的data集合

	function cover() {
		datas = [];

		var ctx = currentLayer()._ctx,
			piece = currentPiece();

		var coord, i = -1;
		while(coord = chainCoords[++i]) {
			var left = coord[1] * map.tilewidth,
				top = coord[0] * map.tileheight;
			datas.push(ctx.getImageData(left, top, piece.width, piece.height));
			ctx.putImageData(piece.data, left, top, 0.0, 0.0, piece.width, piece.height);
		}
	}

	function restore() {
		var ctx = currentLayer()._ctx;
		var coord, i = -1;
		while(coord = chainCoords[++i]) {
			var left = coord[1] * map.tilewidth,
				top = coord[0] * map.tileheight;
			ctx.putImageData(datas[i], left, top, 0.0, 0.0, map.tilewidth, map.tileheight);
		}
	}

	function record() {
		var locations = [];
		var coord, i = -1;
		while (coord = totalCoords[++i]) {
			locations.push(coord[1] * map.tilewidth, coord[0] * map.tileheight);
		}
		currentLayer().record(locations, currentPiece()); // 记录操作
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