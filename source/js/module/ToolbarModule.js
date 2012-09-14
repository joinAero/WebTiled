WT.ToolbarModule = function(toggleMesh, toggleState) {

	var $toolGroup = $('#toolGroup');

	var isShow = true;
	var disabled = false;

	var index = 1;

	/** 图标来自：http://www.defaulticon.com */
	var tools = [
		{id : 'move', tip : '移动'},
		{id : 'stamp', tip : '印刻'},
		{id : 'fill', tip : '填充'},
		{id : 'triangle', tip : '三角'},
		{id : 'square', tip : '矩形'},
		{id : 'cut', tip : '剪切'},
		{id : 'copy', tip : '复制'},
		{id : 'paste', tip : '粘贴'},
		{id : 'grid', tip : '网格'},
		{id : 'direction', tip : '方向'}
	];

	var toolBtns = [];
	var isVertical = true;

	function initToolBtns(vertical) {
		isVertical = vertical;

		$toolGroup.empty();
		toolBtns = [];

		var tool, i = -1;
		while(tool = tools[++i]) {
			var btn = document.createElement('button');
			btn.id = tool.id;
			btn.title = tool.tip;
			btn.style.backgroundImage = 'url("./img/' + tool.id + '.png")';
			$toolGroup.append(btn);
			if (vertical) {
				$toolGroup.append('<br/>');
			}
			toolBtns.push(btn);
		}
		toolBtns[0].style.cursor = 'move';
		toolBtns[index].style.backgroundColor = 'skyBlue';
	};

	(function() {
		initToolBtns(true);
		// var pos = $('#mapCanvasDiv').position();
		// console.log(pos.left, pos.top);
		$toolGroup.css({
			left : 120,
			top : 118
		});
		toggle(false); // 初始隐藏
	})();

	$toolGroup.mousedown(function(e) {
		var id = e.target.id;
		// console.log(id);
		switch(id) {
			case 'move' : 
				$toolGroup.toggleClass('on');
				$toolGroup.toggleClass('off');
				document.addEventListener('mousemove', onDocumentMouseMove, false);
				document.addEventListener('mouseup', onDocumentMouseUp, false);
				break;
			case 'grid' : 
				toggleMesh();
				break;
			case 'direction' : 
				initToolBtns(!isVertical);
				break;
			default :
				select(id);
				break;
		}
	});

	function getToolIndex(id) {
		var i = -1, tool;
		while(tool = tools[++i]) {
			if (tool.id === id) {
				return i;
			}
		}
	}

	function onDocumentMouseMove(e) {
		var left = e.clientX - 10,
			top = e.clientY - 10;
		if (left < 0) {
			left = 0;
		} else if (left > window.innerWidth - $toolGroup.width() - 2) {
			left = window.innerWidth - $toolGroup.width() - 2;
		}
		if (top < 0) {
			top = 0;
		} else if (top > window.innerHeight - $toolGroup.height() - 2) {
			top = window.innerHeight - $toolGroup.height() - 2;
		}

		window.innerWidth, window.innerHeight
		$toolGroup.css({
			left : left,
			top : top
		});
		e.stopPropagation();
		e.preventDefault();
	}

	function onDocumentMouseUp(e) {
		$toolGroup.toggleClass('on');
		$toolGroup.toggleClass('off');
		document.removeEventListener('mousemove', onDocumentMouseMove, false);
		document.removeEventListener('mouseup', onDocumentMouseUp, false);
	}

	function select(id) {
		if (disabled) {
			return;
		}
		toolBtns[index].style.backgroundColor = 'white';
		index = getToolIndex(id);
		toolBtns[index].style.backgroundColor = 'skyBlue';
		toggleState(id);
	}

	function toggle(showOrHide) {
		isShow = showOrHide !== undefined ? showOrHide : !isShow;
		$toolGroup.toggle(isShow);
		$('#view #toolbar').html(isShow ? '隐藏工具栏' : '显示工具栏');
	}

	/**
	 * 这里就直接stamp到paste几个按钮了，即[1,7]。
	 * 这些工具仅是图块层用的，需要在图块层时限制使用。
	 */
	function disable(disabledOrNot) {
		disabled = disabledOrNot;
		var i = 1;
		var bgColor = disabled ? 'gray' : 'white';
		for (; i <= 7; i++) {
			toolBtns[i].disabled = disabled;
			toolBtns[i].style.backgroundColor = bgColor;
		}
		// 启用时，要将之前按钮背景色恢复
		if (!disabled) {
			toolBtns[index].style.backgroundColor = 'skyBlue';
		}
	}

	return {
		select : select,
		toggle : toggle,
		disable : disable
	}
 
}