/**
 * 图块层填充方式
 */
WT.ToolFill = function(id, map, meshCanvas) {

	if (typeof WT.ToolFill.instance === 'object') {
		WT.ToolFill.instance.reset(map, meshCanvas);
		return WT.ToolFill.instance;
	}

	// console.log('initialize this instance: WT.ToolFill.');

	WT.ToolBase.apply(this, arguments);
	WT.ToolFill.instance = this;
}

WT.ToolFill.prototype = (function() {

	var map, meshCanvas;
	var currentLayer, currentPiece;

	var tileMap, // 小块的KV映射，[[tileId, tileLeft, tileTop], ...]，这样key就直接index了
		mergeResultMap; // 二维数组地图，undefined表示空白，0及往上即是tile了

	/**
	 * 整合图块层操作集结果，用以填充判断。
	 * 1）相同小块的整在一起；2）相交的只保留最上层的。
	 * 注：1）切换层（包括添加、删除引起）；2）撤销绘制；3）调整地图。都需要重置该结果。
	 */
	function mergeOperations() {
		tileMap = [];
		mergeResultMap = [];
		for (var i = 0; i < map.height; i++) {
			mergeResultMap.push([]);
		}

		var layer = currentLayer();
		var operations = layer.operations;
		var op, m = -1;
		while (op = operations[++m]) {
			var tileKey = pushTile(op[0], op[1], op[2]);

			var cover = op[3];
			var len = cover.length;
			for (var n = 0; n < len; n += 2) {
				var column = Math.floor(cover[n] / map.tilewidth);
				var row = Math.floor(cover[n + 1] / map.tileheight);
				mergeResultMap[row][column] = tileKey;
			}
		}

		fillResult = null; // 消除之前填充结果
	}

	function pushTile(tileId, tileLeft, tileTop) {
		var tile, i = -1;
		while(tile = tileMap[++i]) {
			if (tile[0] == tileId && tile[1] == tileLeft && tile[2] == tileTop) {
				return i;
			}
		}
		tileMap.push([tileId, tileLeft, tileTop]);
		return i;
	}

	// 获得周围一样小块的坐标集合
	function getFillCoords(row, column) {

		// 复制一份地图
		var copyMap = [];
		var rows = mergeResultMap.length;
		for (var i = 0; i < rows; i++) {
			copyMap.push(mergeResultMap[i].slice(0));
		}

		var result = [];
		var baseVal = copyMap[row][column];
		around(result, baseVal, copyMap, row, column);

		return {
			coords : result,
			resultMap : copyMap
		}
	}

	function around(result, baseVal, copyMap, row, column) {
		var val = copyMap[row][column];
		if (val != baseVal) {
			return;
		}
		result.push([row, column]);
		copyMap[row][column] = -1; // 置-1

		if (row - 1 >= 0) {
			around(result, baseVal, copyMap, row - 1, column);
		}
		if (row + 1 < map.height) {
			around(result, baseVal, copyMap, row + 1, column);
		}
		if (column - 1 >= 0) {
			around(result, baseVal, copyMap, row, column - 1);
		}
		if (column + 1 < map.width) {
			around(result, baseVal, copyMap, row, column + 1);
		}
	}

	var isMouseDown = false;
	var isMouseOut = false;
	var tileIndex, fillResult;

	var nowRow, nowColumn;

	function onMouseDown(e) {
		/*
		 * 记录填充位置，需要计算其真实左上点集合。
		 * 并在原mergeResultMap基础上将现在的填充层加进去。
		 */
		var piece = currentPiece();
		if (!piece) {
			return;
		}
		var tileKey = pushTile(piece.tileId, piece.left, piece.top);
		
		var locations = [];
		var coord, i = -1;
		while (coord = fillResult.coords[++i]) {
			mergeResultMap[coord[0]][coord[1]] = tileKey;
			locations.push(coord[1] * map.tilewidth, coord[0] * map.tileheight);
		}
		currentLayer().record(locations, piece);

		isMouseDown = true; // 标记dowm了，以使move内不恢复
	}

	function onMouseMove(e) {
		var rect = map.onMouseMove(e);
		var piece = currentPiece();
		if (rect && piece) {
			// 又计算回来了==
			var column = Math.floor(rect.left / map.tilewidth),
				row = Math.floor(rect.top / map.tileheight);
			// 如已有填充结果，且当前坐标仍就在原填充结果内时
			if (fillResult && fillResult.resultMap[row][column] == -1) {
				if (isMouseOut) {
					cover(); // 再填充
					isMouseOut = false;
				}
				return;
			}
			if (isMouseDown) {
				isMouseDown = false;
			} else {
				restore();
			}
			tileIndex = mergeResultMap[row][column];
			fillResult = getFillCoords(row, column);
			cover();
		}
	}

	function onMouseOut(e) {
		if (!isMouseDown) {
			restore();
			map.resetRect(); // 避免回来后仍在出去时小块，mousemove rect为假的不继续下去
			isMouseOut = true; // 标记恢复操作。使得回来仍在之前填充结果时，需要再填充。
		}
	}

	function cover() {
		var ctx = currentLayer()._ctx,
			piece = currentPiece();

		var coord, i = -1;
		while (coord = fillResult.coords[++i]) {
			var left = coord[1] * map.tilewidth,
				top = coord[0] * map.tileheight;
			ctx.putImageData(piece.data, left, top, 0.0, 0.0, piece.width, piece.height);
		}
	}

	function restore() {
		if (!fillResult) {
			return;
		}
		var ctx = currentLayer()._ctx;

		if (tileIndex === undefined) { // 空白区域时
			var coord, i = -1;
			while (coord = fillResult.coords[++i]) {
				var left = coord[1] * map.tilewidth,
					top = coord[0] * map.tileheight;
				ctx.clearRect(left, top, map.tilewidth, map.tileheight);
			}
			return;
		}

		var tile = WT.getTile(tileMap[tileIndex][0]);
		var data = tile.clipImageData(tileMap[tileIndex][1], tileMap[tileIndex][2]);

		var coord, i = -1;
		while (coord = fillResult.coords[++i]) {
			var left = coord[1] * map.tilewidth,
				top = coord[0] * map.tileheight;
			ctx.putImageData(data, left, top, 0.0, 0.0, tile.tilewidth, tile.tileheight);
		}
	}

	var mPrototype = WT.clone(WT.ToolBase);

	mPrototype.come = function() {
		map = this.map;
		meshCanvas = this.meshCanvas;
		currentLayer = this.currentLayer;
		currentPiece = this.currentPiece;

		mergeOperations();
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

	mPrototype.mergeOperations = mergeOperations;

	return mPrototype;
})();