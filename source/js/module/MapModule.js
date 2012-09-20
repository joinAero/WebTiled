WT.MapModule = function(currentPiece, toggleLayer) {

	var $mapCanvasDiv = $('#mapCanvasDiv');
	var $layerContainer = $('#layerContainer');

	var meshCanvas, meshCanvasCtx;
	var map, mLayer;

	var index = 0;
	var tool, rectTool;

	function updateMapCanvas() {
		$mapCanvasDiv.empty();
		$layerContainer.empty();
		WT.file.layers = [];
		mLayer = null;
		index = 0;

		createMeshCanvas();

		map = new WT.Map(meshCanvasCtx);
		map.draw(WT.mesh);
		
		tool = new WT.ToolStamp('stamp', map, meshCanvas, currentLayer, currentPiece); // 图块层默认绘制方式
		rectTool = new WT.ToolRect('rect', map, meshCanvas, currentLayer, currentPiece); // 框线层默认绘制方式

		createLayerCanvas();
	}

	function updateMapMeshCanvas() {
		meshCanvas.width = meshCanvas.width;
		map.draw(WT.mesh);
		// meshCanvas.style.display = WT.mesh ? 'inline' : 'none';
	}

	function createMeshCanvas() {
		meshCanvas = document.createElement('canvas');
		meshCanvasCtx = meshCanvas.getContext('2d');

		meshCanvas.width = WT.file.width * WT.file.tilewidth;
		meshCanvas.height = WT.file.height * WT.file.tileheight;
		// meshCanvas.className = 'layer';
		meshCanvas.id = 'meshCanvas';
		meshCanvas.innerHTML = '浏览器不支持Canvas:(';

		setMeshCanvasLocation();

		$mapCanvasDiv.append(meshCanvas);
	}

	function setMeshCanvasLocation() {
		// 长宽较小时居中
		if (meshCanvas.width < mapCanvasDiv.clientWidth) {
			meshCanvas.style.left = (mapCanvasDiv.clientWidth - meshCanvas.width) / 2 + 'px';
		} else {
			meshCanvas.style.left = '0px';
		}

		if (meshCanvas.height < mapCanvasDiv.clientHeight) {
			meshCanvas.style.top = (mapCanvasDiv.clientHeight - meshCanvas.height) / 2 + 'px';
		} else {
			meshCanvas.style.top = '0px';
		}
		meshCanvas.style.zIndex = '1000'; // 使得在Layers上层
	}

	function createLayerCanvas(name, type) {

		var canvas = document.createElement('canvas');
		canvas.width = meshCanvas.width;
		canvas.height = meshCanvas.height;
		// canvas.className = 'layer';
		canvas.style.left = meshCanvas.style.left;
		canvas.style.top = meshCanvas.style.top;

		canvas.id = 'layerCanvas' + index;
		canvas.style.zIndex = index;

		$mapCanvasDiv.append(canvas);

		var layer;
		if (type === WT.RECT_LAYER) {
			layer = new WT.RectLayer(canvas, name, type, true, index, index);
		} else { // WT.TILE_LAYER
			layer = new WT.TileLayer(canvas, name, type, true, index, index);
		}
		WT.pushLayer(layer);
		appendLayer(layer);

		toggleLayerSelect(layer);

		index++;
	}

	function appendLayer(layer) {
		var checked = layer.visible ? ' checked' : '';
		var name = layer.name;
		var type = '未知';
		if (layer.type === WT.TILE_LAYER) {
			type = '图块层';
		} else if (layer.type === WT.RECT_LAYER) {
			type = '框线层';
		}

		var html = [];
		html.push('<td><input type="checkbox" id="lcb');
		html.push(layer.index);
		html.push('"');
		html.push(checked);
		html.push('></td>');
		html.push('<td id="ln');
		html.push(layer.index);
		html.push('">');
		html.push(name);
		html.push('</td>');
		html.push('<td id="lt');
		html.push(layer.index);
		html.push('">');
		html.push(type);
		html.push('</td>');
		html.push('<td><div class="btn-group">');
		html.push('<button class="btn-link"><i class="icon-arrow-up" id="lbup');
		html.push(layer.index);
		html.push('"></i></a>');
		html.push('<button class="btn-link"><i class="icon-arrow-down" id="lbdown');
		html.push(layer.index);
		html.push('"></i></a>');
		html.push('</div></td>');
		var tr = document.createElement('tr');
		tr.id = 'layer' + layer.index;
		tr.innerHTML = html.join('');
		$layerContainer.append(tr);
	}

	$layerContainer.click(function(e) {
		var id = e.target.id;
		var val = checkId(id, ['lcb', 'ln', 'lbup', 'lbdown']);
		if (val) {
			// console.log(val.index, val.type);
			switch (val.type) {
				case 'lcb' : 
					toggleLayerVisible(WT.getLayer(val.index));
					break;
				case 'ln' : 
					toggleLayerSelect(WT.getLayer(val.index));
					break;
				case 'lbup' : 
					toggleLayerSequence(val.index, true);
					break;
				case 'lbdown' : 
					toggleLayerSequence(val.index, false);
					break;
			}
		}
	});

	function checkId(id, types) {
		for (var i = 0, len = types.length; i < len; i++) {
			var m = id.indexOf(types[i]);
			if (m == 0) {
				return {
					index : parseInt(id.slice(types[i].length)),
					type : types[i]
				}
			}
		}
		return null;
	}

	function toggleLayerVisible(layer) {
		layer.visible = !layer.visible;
		if(layer.visible) {
			layer._canvas.style.display = 'inline';
		} else {
			layer._canvas.style.display = 'none';
		}
	}

	function toggleLayerSelect(layer) {
		if (!mLayer) {
			mLayer = layer;
			if (mLayer.type === WT.RECT_LAYER) {
				rectTool.register();
			} else { // WT.TILE_LAYER
				tool.register();
			}
			updateLayerSelect(null, layer.index);
			return;
		}

		if (mLayer.index !== layer.index) {
			var oldLayer = mLayer;
			mLayer = layer; // 先设mLayer，是由于之后注册事件时有些会需要获得当前层

			// 切换两种层间的响应方式
			if (oldLayer.type === WT.RECT_LAYER && mLayer.type === WT.TILE_LAYER) {
				rectTool.unregister();
				tool.register();
			} else if (oldLayer.type === WT.TILE_LAYER && mLayer.type === WT.RECT_LAYER) {
				tool.unregister();
				rectTool.register();
			}
			updateLayerSelect(oldLayer.index, layer.index);
			updateToolSettings();
		}
	}

	// 某些工具项的添加、删除、切换等时的操作
	function updateToolSettings() {
		if (mLayer.type === WT.TILE_LAYER) {
			switch(tool.id) {
				case 'fill' :
					tool.mergeOperations();
					break;
			}
		}
	}

	function updateLayerSelect(oldIndex, newIndex) {
		if (oldIndex !== null) {
			$('#layer' + oldIndex).css({backgroundColor : "transparent"});
		}
		$('#layer' + newIndex).css({backgroundColor : "#add8e6"});
		
		toggleLayer(mLayer); // 回调
	}

	function toggleLayerSequence(i, isUp) {
		var index = WT.getIndex(i);
		if (isUp) {
			if (index === 0) {
				return false;
			}
			swapLayer(index, index - 1);
		} else {
			if (index === WT.file.layers.length - 1) {
				return false;
			}
			swapLayer(index, index + 1);
		}
		return true;
	}

	function swapLayer(oldIndex, newIndex) {

		var a = WT.file.layers[oldIndex],
			b = WT.file.layers[newIndex];

		/* 交换Canvas显示次序，z-index */
		var temp = a.zIndex;
		a.zIndex = b.zIndex;
		b.zIndex = temp;
		var ca = $('#mapCanvasDiv #layerCanvas' + a.index);
		var cb = $('#mapCanvasDiv #layerCanvas' + b.index);
		ca.css({zIndex : a.zIndex});
		cb.css({zIndex : b.zIndex});

		/* 交换Layer显示次序 */
		var tra = $('#layer' + a.index);
		var trb = $('#layer' + b.index);
		// id属性
		temp = tra.attr('id');
		tra.attr({id : trb.attr('id')});
		trb.attr({id : temp});
		// bgColor属性
		temp = tra.css('backgroundColor');
		tra.css({backgroundColor : trb.css('backgroundColor')});
		trb.css({backgroundColor : temp});

		// layer内容
		temp = tra.html();
		tra.html(trb.html());
		trb.html(temp);

		/* 交换Layer对象次序 */
		temp = a;
		WT.file.layers[oldIndex] = b;
		WT.file.layers[newIndex] = temp;

		// 确保交换后的选中状态正确
		$('#lcb' + a.index).attr({checked : a.visible});
		$('#lcb' + b.index).attr({checked : b.visible});
	}

	function toggleState(id) {
		/*if (mLayer.type === WT.RECT_LAYER) {
			return;
		}*/
		if (tool && tool.id !== id) {
			tool.unregister();
			switch(id) {
				case 'stamp' :
					tool = new WT.ToolStamp('stamp', map, meshCanvas, currentLayer, currentPiece);
					break;
				case 'fill' :
					tool = new WT.ToolFill('fill', map, meshCanvas, currentLayer, currentPiece);
					break;
				case 'link' :
					tool = new WT.ToolLink('link', map, meshCanvas, currentLayer, currentPiece);
					break;
			}
			tool.register();
		}
	}

	function isMapReady() {
		return map ? true : false; 
	}

	function currentLayer() {
		return mLayer;
	}

	function deleteCurrentLayer() {
		if (WT.file.layers.length > 1) { // 仅有一个时删除不了，免得又要加判断
			// 删除当前选中的Layer
			var index = mLayer.index;
			WT.deleteLayer(index);
			$('#layer' + index).remove();
			$('#mapCanvasDiv #layerCanvas' + index).remove(); // 删除canvas
			// 重置选中第一个Layer
			if (mLayer.type === WT.RECT_LAYER) {
				rectTool.unregister();
			} else { // WT.TILE_LAYER
				tool.unregister();
			}
			mLayer = null; // 需要把之前事件unregister
			toggleLayerSelect(WT.file.layers[0]);
		}
	}

	function currentIndex() {
		return index;
	}

	function revoke() {
		var result = mLayer.revoke();
		updateToolSettings();
		return result;
	}

	function clearLayers() {
		$mapCanvasDiv.empty();
		$layerContainer.empty();
		WT.file.layers = [];

		createMeshCanvas();

		map = new WT.Map(meshCanvasCtx);
		map.draw(WT.mesh);

		tool = new WT.ToolStamp('stamp', map, meshCanvas, currentLayer, currentPiece); // 图块层默认绘制方式
		rectTool = new WT.ToolRect('rect', map, meshCanvas, currentLayer, currentPiece); // 框线层默认绘制方式

		mLayer = null; // 由于canvas重建了，不需要把之前事件unregister
		index = 0;
	}

	function restoreLayers(layers) {
		var layer, i = -1;
		var newLayer;
		while(layer = layers[++i]) {

			var canvas = document.createElement('canvas');
			canvas.width = meshCanvas.width;
			canvas.height = meshCanvas.height;
			canvas.className = 'layer';
			canvas.style.left = meshCanvas.style.left;
			canvas.style.top = meshCanvas.style.top;

			canvas.id = 'layerCanvas' + layer.index;
			canvas.style.zIndex = layer.zIndex;
			canvas.style.display = layer.visible ? 'inline' : 'none';

			$mapCanvasDiv.append(canvas);
			if (layer.type === WT.RECT_LAYER) {
				newLayer = new WT.RectLayer(canvas, layer.name, layer.type, layer.visible, layer.index, layer.zIndex);
				newLayer.rects = layer.rects;
				newLayer.restoreRects();
			} else { // WT.TILE_LAYER
				newLayer = new WT.TileLayer(canvas, layer.name, layer.type, layer.visible, layer.index, layer.zIndex);
				newLayer.operations = layer.operations;
				newLayer.restoreOperations();
			}
			WT.pushLayer(newLayer);

			appendLayer(newLayer);

			if (layer.index > index) {
				index = layer.index;
			}
		}

		toggleLayerSelect(WT.file.layers[0]);

		index++;
	}

	/**
	 * 调整地图大小
	 * @param  {Number} w 新宽度块数
	 * @param  {Number} h 新高度块数
	 * @param  {Number} r 右移块树
	 * @param  {Number} d 下移块数
	 */
	function resize(w, h, r, d) {
		WT.file.width = w;
		WT.file.height = h;
		// mesh
		meshCanvas.width = w * WT.file.tilewidth;
		meshCanvas.height = h * WT.file.tileheight;
		map.resize(w, h);
		map.draw(WT.mesh); // redraw
		setMeshCanvasLocation(); // update location
		// layers
		var layer, i = -1;
		while(layer = WT.file.layers[++i]) {
			layer._canvas.width = meshCanvas.width;
			layer._canvas.height = meshCanvas.height;
			layer.resize(w, h, r, d); // update data & redraw
			layer._canvas.style.left = meshCanvas.style.left;
			layer._canvas.style.top = meshCanvas.style.top;
		}
		updateToolSettings();
	}

	return {
		updateMapCanvas : updateMapCanvas,
		updateMapMeshCanvas : updateMapMeshCanvas,
		createLayerCanvas : createLayerCanvas,
		isMapReady : isMapReady,
		currentLayer : currentLayer,
		deleteCurrentLayer : deleteCurrentLayer,
		currentIndex : currentIndex,
		revoke : revoke,

		clearLayers : clearLayers,
		restoreLayers : restoreLayers,

		resize : resize,

		toggleState : toggleState
	}

}