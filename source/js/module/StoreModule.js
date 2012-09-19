WT.StoreModule = function() {

	function save() {

		var json = JSON.stringify(WT.file, function(key, val) {
			if (key.charAt(0) == '_') {
				return null;
			} else if (key == 'image') {
				return val.src;
			} else {
				return val;
			}
		}, 0); // '\t'
		var blob = new Blob([json]); // , {type : 'text/json;charset=UTF-8'}
			window.URL = window.webkitURL || window.URL;
		$('#exportConfirm').attr({
			download : WT.file.name,
			href : window.URL.createObjectURL(blob)
		});
	}

	function restore(file, tileModule, mapModule) {
		var reader = new FileReader();
		reader.onload = function(e) {

			var json = JSON.parse(e.target.result);
			WT.file.name = json.name;
			WT.file.width = json.width;
			WT.file.height = json.height;
			WT.file.tilewidth = json.tilewidth;
			WT.file.tileheight = json.tileheight;

			// 清除显示&数据
			tileModule.clearTiles();
			mapModule.clearLayers();

			if (json.tilesets.length >= 1) {
				// 需要等图块图像异步载入后，再绘图层
				tileModule.restoreTiles(json.tilesets, function() {
					mapModule.restoreLayers(json.layers);
				});
			} else {
				mapModule.restoreLayers(json.layers);
			}
		}
		reader.readAsText(file);
	}

	function exportJson(jsonName, hasTiles, hasLayers) {
		var obj = {};
		if (hasTiles) {
			var tiles = [];

			var tile, i = -1;
			var oldTiles = WT.file.tilesets;
			while (tile = oldTiles[++i]) {
				tiles.push({
					id : tile.id,
					name : tile.name,
					tilewidth : tile.tilewidth,
					tileheight : tile.tileheight,
					imagewidth : tile.imagewidth,
					imageheight : tile.imageheight,
					imagesrc : tile.image.src
				});
			}
			obj.tiles = tiles;
		}
		if (hasLayers) {
			var layers = [];

			var layer, j = -1;
			var oldLayers = WT.file.layers;
			while (layer = oldLayers[++j]) {
				layers.push(beNewLayer(layer));
			}
			obj.layers = layers;

			obj.width = WT.file.width;
			obj.height = WT.file.height;
			obj.tilewidth = WT.file.tilewidth;
			obj.tileheight = WT.file.tileheight;
		}

		var json = JSON.stringify(obj, null, 0);
		var blob = new Blob([json]);
			window.URL = window.webkitURL || window.URL;
		$('#saveConfirm').attr({
			download : jsonName + '.json',
			href : window.URL.createObjectURL(blob)
		});
	}

	function beNewLayer(layer) {
		var newlayer = {
			// zIndex即是索引顺序
			name : layer.name,
			type : layer.type
		};
		if (layer.type === WT.TILE_LAYER) {
			var tiles = []; // 存放小块信息
			var map = []; // 上述小块索引的地图
			for (var i = 0; i < WT.file.height; i++) {
				map.push([]);
			}
			var op, m = -1;
			while (op = layer.operations[++m]) {
				var index = pushTile(tiles, op[0], op[1], op[2]);

				var cover = op[3];
				var len = cover.length;
				for (var n = 0; n < len; n += 2) {
					var column = Math.floor(cover[n] / WT.file.tilewidth);
					var row = Math.floor(cover[n + 1] / WT.file.tileheight);
					map[row][column] = index;
				}
			}
			newlayer.tiles = tiles;
			newlayer.map = map;
		} else { // WT.RECT_LAYER
			var rects = [];
			var rect, k = -1;
			while (rect = layer.rects[++k]) {
				rects.push([rect.left, rect.top, rect.width, rect.height]);
			}
			newlayer.rects = rects;
		}
		return newlayer;
	}

	function pushTile(tiles, tileId, tileLeft, tileTop) {
		var tile, i = -1;
		while(tile = tiles[++i]) {
			if (tile[0] == tileId && tile[1] == tileLeft && tile[2] == tileTop) {
				return i;
			}
		}
		tiles.push([tileId, tileLeft, tileTop]);
		return i;
	}

	function exportImage(imgName) {
		var file = WT.file;

		// 新创建一个canvas
		var canvas = document.createElement('canvas');
		canvas.width = file.width * file.tilewidth;
		canvas.height = file.height * file.tileheight;
		var ctx = canvas.getContext('2d');
		// 将当前可见的图块层整在一起
		var layer , i = -1;
		while (layer = file.layers[++i]) {
			if (layer.type == WT.TILE_LAYER && layer.visible) {
				var op, j = -1;
				while (op = layer.operations[++j]) {
					var tile = WT.getTile(op[0]);
					var data = tile.clipImageData(op[1], op[2]);
					var cover = op[3];
					var len = cover.length;
					for (var k = 0; k < len; k += 2) {
						ctx.putImageData(data, cover[k], cover[k + 1], 0.0, 0.0, tile.tilewidth, tile.tileheight);
					}
				}
			}
		}

		var data = canvas.toDataURL('image/png');
		// var blob = new Blob([data], {type : "image/png"});
		// window.URL = window.webkitURL || window.URL;
		$('#saveAsConfirm').attr({
			download : imgName + '.png',
			href : data.replace('image/png', 'image/octet-stream') // to download mime
		});

		canvas = null;
	}

	return {
		save : save,
		restore : restore,
		exportJson : exportJson,
		exportImage : exportImage
	}

}