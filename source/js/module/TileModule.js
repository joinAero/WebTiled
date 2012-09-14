WT.TileModule = function() {

	var tileIndex = -1;
	var tileCount = 0;

	var tileCanvasDiv = document.getElementById('tileCanvasDiv');
	var tileCanvas = document.getElementById('tileCanvas'),
		tileCanvasCtx = tileCanvas.getContext('2d');
	var tileMeshCanvas = document.getElementById('tileMeshCanvas'),
		tileMeshCanvasCtx = tileMeshCanvas.getContext('2d');

	/** tileSelect数据&事件 */
	var $tileList = $('#tileList');
	var $tileResult = $('#tileResult');
	function updateTileSelect(tilesets, selectIndex) {
		var list = [];
		tilesets.forEach(function (tile, index) {
			list.push('<li><a href="#" id="');
			list.push(index);
			list.push('">');
			list.push(tile.name);
			list.push('</a></li>');
		});
		$tileList.html(list.join(''));
		$('#tileList li a').unbind('click');
		$('#tileList li a').click(function(e) {
			tileIndex = e.target.id * 1;
			updateTileCanvas(tilesets[e.target.id]);
		});
		if (selectIndex !== undefined && selectIndex >=0 && selectIndex < tilesets.length) {
			$tileResult.html(tilesets[selectIndex].name);
			updateTileCanvas(tilesets[selectIndex]);
			tileIndex = selectIndex;
		} else {
			$tileResult.html('&nbsp;');
			updateTileCanvas(null);
			tileIndex = -1;
		}
	}
	updateTileSelect(WT.file.tilesets);

	function updateTileCanvas(tile) {
		if (null == tile) {
			tileCanvas.width = 250;
			tileCanvas.height = 250;
			tileMeshCanvas.width = 250;
			tileMeshCanvas.height = 250;
		} else {
			tileCanvas.width = tile.imagewidth;
			tileCanvas.height = tile.imageheight;
			tileMeshCanvas.width = tileCanvas.width;
			tileMeshCanvas.height = tileCanvas.height;
			tile.draw(tileMeshCanvasCtx, WT.mesh);

			$tileResult.html(tile.name);
			$('#tileList li a[id="' + tileIndex + '"]').html(tile.name);
		}
	}

	function updateTileMeshCanvas(tile) {
		tileMeshCanvas.width = tile.imagewidth;
		tileMeshCanvas.height = tile.imageheight;
		tile.draw(tileMeshCanvasCtx, WT.mesh);
		// tileMeshCanvas.style.display = WT.mesh ? 'inline' : 'none';
	}

	/** tileCanvasDiv图片拖入事件 */
	tileCanvasDiv.ondrop = function(e) {
		/*if(typeof FileReader == 'undefined') {
			alert('浏览器不支持FileReader()，可以换用Chrome再试试^^');
			return;
		}*/
		var files = e.dataTransfer.files;
		var f, fLen = files.length;
		var i = -1;
		var count = files.length;
		while(f = files[++i]) {
			if (f.type.indexOf('image') == 0) {
				(function(f) {
					var name = f.name;

					var reader = new FileReader();
					reader.onload = function(e) {
						var dataURL = e.target.result;

						var img = new Image();
						img.onload = function(e) {
							WT.pushTile(new WT.Tile(tileCanvasCtx, tileCount++, name, this, this.width, this.height));
							if (--count == 0) {
								updateTileSelect(WT.file.tilesets, tileIndex == -1 ? 0 : tileIndex);
							}
						}
						img.src = dataURL;
					};
					reader.readAsDataURL(f);
				})(f);
			} // else {}
		}
		e.stopPropagation();
		e.preventDefault();
	}

	var selectFile = null;

	var $tileFile = $('#tileFile');
	function handleFileSelect(e) {
		var files = e.target.files;
		if (files && files.length >= 1) {
			selectFile = files[0];
			$('#tileName').val(selectFile.name);
			$('#tileImage').val($tileFile.attr('value'));
		}
	}
	$tileFile.change(handleFileSelect);

	function addTile(name, tilewidth, tileheight, margin, spacing) {
		if (!selectFile) {
			return;
		}
		var reader = new FileReader();
		reader.onload = function(e) {
			var dataURL = e.target.result;
			var img = new Image();
			img.onload = function(e) {
				WT.pushTile(new WT.Tile(tileCanvasCtx, tileCount++, name, this, this.width, this.height, tilewidth, tileheight, margin, spacing));
				updateTileSelect(WT.file.tilesets, tileIndex == -1 ? 0 : tileIndex);
				selectFile = null;
				$tileFile.attr({value : null});
			}
			img.src = dataURL;
		};
		reader.readAsDataURL(selectFile);
	}

	/** tileCanvass鼠标点击事件 */
	function onTileCanvasMouseDown(e) {
		if (tileIndex == -1) {
			return;
		}
		WT.file.tilesets[tileIndex].onMouseDown(e);
	}
	tileMeshCanvas.addEventListener('mousedown', onTileCanvasMouseDown, false);

	function currentTileIndex() {
		return tileIndex;
	}

	function currentPiece() {
		if (tileIndex == -1) {
			return null;
		}
		return WT.file.tilesets[tileIndex].currentPiece();
	}

	function clearTiles() {
		$tileResult.html('&nbsp;');
		$tileList.empty();
		WT.file.tilesets = [];

		tileIndex = -1;
		tileCount = 0;

		updateTileCanvas();
	}

	function restoreTiles(tilesets, callback) {
		var tile, i = -1;
		var count = tilesets.length;
		while(tile = tilesets[++i])  {
			var img = new Image();
			img.onload = function(e) {
				var tile = this.tile;
				WT.pushTile(new WT.Tile(
					tileCanvasCtx,
					tile.id,
					tile.name,
					this,
					tile.imagewidth,
					tile.imageheight,
					tile.tilewidth,
					tile.tileheight,
					tile.margin,
					tile.spacing
				));
				if (--count == 0) {
					updateTileSelect(WT.file.tilesets, 0);
					callback();
				}
			}
			img.tile = tile;
			img.src = tile.image;
		}
		tileCount = tilesets.length;
	}

	return {
		currentTileIndex : currentTileIndex,
		updateTileSelect : updateTileSelect,
		updateTileCanvas : updateTileCanvas,
		updateTileMeshCanvas : updateTileMeshCanvas,
		currentPiece : currentPiece,
		addTile : addTile,

		clearTiles : clearTiles,
		restoreTiles : restoreTiles
	}

};