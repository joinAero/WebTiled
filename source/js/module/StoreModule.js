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

	function exportJson() {

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
			download : imgName + ".png",
			href : data.replace("image/png", "image/octet-stream") // to download mime
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