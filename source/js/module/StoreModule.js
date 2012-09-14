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

	return {
		save : save,
		restore : restore
	}

}