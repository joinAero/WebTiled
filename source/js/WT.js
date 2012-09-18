
var WT = WT || {
	revision : 0.1,
	file : {
		name : 'untitled.wt',
		width : 50,
		height : 50,
		tilewidth : 16,
		tileheight : 16,

		tilesets : [],
		layers : []
	},
	mesh : true
};

WT.clone = function(father) {
	var f = function() {};
	f.prototype = father.prototype;
	return new f();
}

WT.pushTile = function(tile) {
	WT.file.tilesets.push(tile);
}

WT.deleteTile = function(indexOrName) {
	if (typeof indexOrName == 'number') {
		return WT.file.tilesets.splice(indexOrName, 1);
	} else {
		var i, len = WT.file.tilesets.length;
		for (var i = 0; i < len; i++) {
			if (WT.file.tilesets[i].name == indexOrName) {
				return WT.file.tilesets.splice(i, 1);
			}
		}
	}
}

WT.getTile = function(tileId) {
	var i, len = WT.file.tilesets.length;
	for (var i = 0; i < len; i++) {
		if (WT.file.tilesets[i].id == tileId) {
			return WT.file.tilesets[i];
		}
	}
}

WT.pushLayer = function(layer) {
	WT.file.layers.push(layer);
}

WT.deleteLayer = function(layerIndex) {
	var i, len = WT.file.layers.length;
	for (var i = 0; i < len; i++) {
		if (WT.file.layers[i].index == layerIndex) {
			return WT.file.layers.splice(i, 1);
		}
	}
}

WT.getLayer = function(layerIndex) {
	var i, len = WT.file.layers.length;
	for (var i = 0; i < len; i++) {
		if (WT.file.layers[i].index == layerIndex) {
			return WT.file.layers[i];
		}
	}
}

WT.getIndex = function(layerIndex) {
	var i, len = WT.file.layers.length;
	for (var i = 0; i < len; i++) {
		if (WT.file.layers[i].index == layerIndex) {
			return i;
		}
	}
}

$(document).ready(function() {

	var tileModule = WT.TileModule();
	var storeModule = WT.StoreModule();
	var mapModule = WT.MapModule(tileModule.currentPiece, toggleLayer);
	var toolbarModule = WT.ToolbarModule(toggleMesh, mapModule.toggleState);

	function toggleLayer(layer) {
		// 由当前选择图层类型，更新工具栏可用性
		if (layer.type === WT.RECT_LAYER) {
			toolbarModule.disable(true);
		} else { // WT.TILE_LAYER
			toolbarModule.disable(false);
		}
	}

	var dialogId;

	function showDialog(id, header, body) {
		dialogId = id;
		$('#dialogHeader').html(header);
		$('#dialogBody').html(body);
		$('#dialogModal').modal('show');
	}

	/**
	 * 显示图块对话框
	 * @param  {WT.Tile} tile null时，增加图块；有值时重设图块
	 */
	function showTileDialog(tile) {
		if (tile) {
			$('#tileHeader').html('重设图块');
			$('#tileName').val(tile.name);
			$('#imageCtrl').hide();
			$('#tileWidth').val(tile.tilewidth);
			$('#tileHeight').val(tile.tileheight);
			$('#margin').val(tile.margin);
			$('#spacing').val(tile.spacing);
			dialogId = 'tileAdjust';
		} else {
			$('#tileHeader').html('新图块');
			$('#tileName').val('');
			$('#imageCtrl').show();
			$('#tileImage').val('');
			$('#tileWidth').val(WT.file.tilewidth);
			$('#tileHeight').val(WT.file.tileheight);
			$('#margin').val('0');
			$('#spacing').val('0');
			dialogId = 'tilePlus';
		}
		$('#tileModal').modal('show');
	}

	// toolTab标签切换
	$('#toolTab a[data-toggle="tab"]').click(function(e) {
		e.preventDefault();
		$(this).tab('show');
	});

	/* 文件 */
	$('#file').click(function(e) {
		switch(e.target.id) {
			case 'new' : // 新建
				$('#fileModal').modal('show');
				break;
			/*case 'open' : // 打开
				break;*/
			case 'export' : // 导出
				showExportDialog();
				break;
			case 'save' : // 保存
				alert('保存');
				break;
			case 'saveAs' : // 另存图片
				showSaveAsDialog(e);
				break;
		}
	});
	/** open文件打开事件 */
	$('#open').change(function(e) {
		var files = e.target.files;
		if (files && files.length >= 1) {
			storeModule.restore(files[0], tileModule, mapModule);
		}
	});
	/** mapCanvasDiv文件拖入事件 */
	var mapCanvasDiv = document.getElementById('mapCanvasDiv');
	mapCanvasDiv.ondrop = function(e) {
		var files = e.dataTransfer.files;
		if (files && files.length >= 1) {
			storeModule.restore(files[files.length - 1], tileModule, mapModule);
			$('#view #toolbar').attr({disabled : false}); // 启用该按钮
			toolbarModule.toggle(true);
			toolbarModule.select('stamp'); // 重建了默认是stamp方式
		}
		e.stopPropagation();
		e.preventDefault();
	}

	/* 图块 */
	$('#tile').click(function(e) {
		switch(e.target.id) {
			case 'addTile' : // 添加
				showTileDialog();
				break;
			case 'delTile' : // 删除
				showDelTileDialog();
				break;
			case 'adjTile' : // 调整
				showAdjTileDialog();
				break;
		}
	});

	/* 图层 */
	$('#layer').click(function(e) {
		switch(e.target.id) {
			case 'add' : // 添加
				showLayerDialog();
				break;
			case 'delete' : // 删除
				showDelLayerDialog();
				break;
			case 'rename' : // 重命名
				showLayerDialog(mapModule.currentLayer());
				break;
			case 'adjMap' : // 调整
				showAdjMapDialog();
				break;
		}
	});

	/* 视图 */
	$('#view').click(function(e) {
		switch(e.target.id) {
			case 'mesh' : // 网格
				toggleMesh();
				break;
			case 'toolbar' : // 工具栏
				toolbarModule.toggle();
				break;
		}
	});

	function toggleMesh() {
		WT.mesh = !WT.mesh;
		$('#view #mesh').html(WT.mesh ? '隐藏网格' : '显示网格');
		var tileIndex = tileModule.currentTileIndex();
		if (tileIndex != -1) {
			tileModule.updateTileMeshCanvas(WT.file.tilesets[tileIndex]);
		}
		if (mapModule.isMapReady()) {
			mapModule.updateMapMeshCanvas();
		}
	}

	/* 右侧图块界面按钮事件 */
	$('#tileCtrl').click(function(e) {
		var id = e.target.id;
		switch(id) {
			case 'tilePlus' :
				showTileDialog();
				break;
			case 'tileTrash' :
				showDelTileDialog();
				break;
			case 'tileAdjust' :
				showAdjTileDialog();
				break;
		}
	});

	/* 右侧图层界面按钮事件 */
	$('#layerCtrl').click(function(e) {
		var id = e.target.id;
		switch(id) {
			case 'layerPlus' :
				showLayerDialog();
				break;
			case 'layerTrash' :
				showDelLayerDialog();
				break;
			case 'layerRevoke' :
				if (!mapModule.revoke()) {
					showDialog(null, '撤消动作', '没有动作可供撤消！');
				}
		}
	});

	function showAdjMapDialog() {
		if (mapModule.isMapReady()) {
			$('#newWidth').val(WT.file.width);
			$('#newHeight').val(WT.file.height);
			$('#adjMapModal').modal('show');
		} else {
			showDialog(null, '调整地图', '请先新建或导入文件！');
		}
	}

	function showDelTileDialog() {
		var tileIndex = tileModule.currentTileIndex();
		if (tileIndex != -1) {
			var currentTile = WT.file.tilesets[tileIndex];
			showDialog('tileTrash', '删除图块', '确认删除当前图块【' + currentTile.name + '】？');
		} else {
			showDialog(null, '删除图块', '请先选择某一图块！');
		}
	}

	function showAdjTileDialog() {
		var tileIndex = tileModule.currentTileIndex();
		if (tileIndex != -1) {
			var currentTile = WT.file.tilesets[tileIndex];
			showTileDialog(currentTile);
		} else {
			showDialog(null, '重设图块', '请先选择某一图块！');
		}
	}

	/**
	 * 显示图层对话框
	 * @param  {WT.Layer} layer null时，增加图层；有值时重命名图层
	 */
	function showLayerDialog(layer) {
		if (layer) {
			if (mapModule.isMapReady()) {
				$('#lname').val(layer.name);
				$('#layerType').hide();
				$('#layerModal').modal('show');
				dialogId = 'layerRename';
			} else {
				showDialog(null, '重命名图层', '请先新建或导入文件！');
			}
		} else {
			if (mapModule.isMapReady()) {
				$('#lname').val('图层' + mapModule.currentIndex());
				$('#layerType').show();
				$('#layerModal').modal('show');
				dialogId = 'layerPlus';
			} else {
				showDialog(null, '添加图层', '请先新建或导入文件！');
			}
		}
	}

	function showDelLayerDialog() {
		if (mapModule.isMapReady()) {
			if (WT.file.layers.length > 1) {
				showDialog('layerTrash', '删除图块', '确认删除当前图层【' + mapModule.currentLayer().name + '】？');
			} else {
				showDialog(null, '删除图层', '请至少保留一个图层！');
			}
		} else {
			showDialog(null, '删除图层', '请先新建或导入文件！');
		}
	}

	function showExportDialog() {
		if (mapModule.isMapReady()) {
			$('#filename').val(WT.file.name);
			$('#exportModal').modal('show');
		} else {
			showDialog(null, '导出文件', '请先新建或导入文件！');
		}
	}

	function showSaveAsDialog(e) {
		if (mapModule.isMapReady()) {
			$('#saveAsModal').modal('show');
		} else {
			showDialog(null, '另存图片', '请先新建或导入文件！');
			e.preventDefault();
		}
	}

	$('#dialogGroup').click(function(e) {
		var tileIndex = tileModule.currentTileIndex();
		switch(e.target.id) {
			case 'tileConfirm':
				switch(dialogId) {
					case 'tilePlus' :
						var tileName = $('#tileName').val(),
							tilewidth = $('#tileWidth').val() * 1,
							tileheight = $('#tileHeight').val() * 1,
							margin = $('#margin').val() * 1,
							spacing = $('#spacing').val() * 1;
						tileModule.addTile(tileName, tilewidth, tileheight, margin, spacing);
						break;
					case 'tileAdjust' :
						var currentTile = WT.file.tilesets[tileIndex];
						currentTile.name = $('#tileName').val();
						currentTile.tilewidth = $('#tileWidth').val() * 1;
						currentTile.tileheight = $('#tileHeight').val() * 1;
						currentTile.margin = $('#margin').val() * 1;
						currentTile.spacing = $('#spacing').val() * 1;
						tileModule.updateTileCanvas(currentTile);
						break;
				}
				$('#tileModal').modal('hide');
				dialogId = null;
				break;
			case 'dialogConfirm': {
				switch(dialogId) {
					case 'tileTrash' :
						WT.deleteTile(tileIndex);
						var selectIndex = WT.file.tilesets.length <= 0 ? -1 : 0;
						tileModule.updateTileSelect(WT.file.tilesets, selectIndex);
						break;
					case 'layerTrash' :
						mapModule.deleteCurrentLayer();
						break;
				}
				$('#dialogModal').modal('hide');
				dialogId = null;
				break;
			}
			case 'fileConfirm' :
				WT.file.width = $('#fwidth').val() * 1;
				WT.file.height = $('#fheight').val() * 1;
				WT.file.tilewidth = $('#ftileWidth').val() * 1;
				WT.file.tileheight = $('#ftileHeight').val() * 1;
				mapModule.updateMapCanvas();
				$('#fileModal').modal('hide');
				$('#view #toolbar').attr({disabled : false}); // 启用该按钮
				toolbarModule.toggle(true);
				toolbarModule.select('stamp');
				break;
			case 'layerConfirm' :
				switch(dialogId) {
					case 'layerPlus' :
						var name = $('#lname').val();
						var type = $('input:radio[name="layerRadios"]:checked').val();
						mapModule.createLayerCanvas(name, type);
						break;
					case 'layerRename' :
						var name = $('#lname').val();
						if (name !== '') {
							var currentLayer = mapModule.currentLayer();
							currentLayer.name = name;
							$('#ln' + currentLayer.index).html(name);
						}
						break;
				}
				$('#layerModal').modal('hide');
				dialogId = null;
				break;
			case 'exportConfirm' :
				var fname = $('#filename').val();
				if (fname !== '') {
					WT.file.name = fname;
				}
				$('#exportModal').modal('hide');
				try {
					storeModule.save();
				} catch(ex) {
					console.log(ex);
					e.preventDefault();
				}
				break;
			case 'saveAsConfirm' :
				var imgName = $('#imageName').val();
				if (imgName === '') {
					imgName = 'unnamed';
				}
				$('#saveAsModal').modal('hide');
				storeModule.exportImage(imgName);
				break;
			case 'adjMapConfirm' :
				var width = $('#newWidth').val() * 1;
				var height = $('#newHeight').val() * 1;
				var right = $('#rightOffset').val() * 1;
				var down = $('#downOffset').val() * 1;
				mapModule.resize(width, height, right, down);
				$('#adjMapModal').modal('hide');
				break;
		}
	});

});
