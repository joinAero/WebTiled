
WT.RectLayer = function() {
	WT.Layer.apply(this, arguments);

	this.rects = [];

	this._start = null;
	this._rect = null;
}

WT.RectLayer.prototype = (function() {

	var mPrototype = WT.clone(WT.Layer);

	mPrototype._color = new WT.Color();
	mPrototype._h = 0;

	function drawRect(rect, ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(rect.left, rect.top, rect.width, rect.height);
		ctx.fillStyle = rect.style;
		ctx.fill();
		ctx.restore();
	}

	/* 绘制框线区域 */
	function drawRects(rects, ctx) {
		ctx.save();
		rects.forEach(function(rect, index) {
			ctx.beginPath();
			ctx.rect(rect.left, rect.top, rect.width, rect.height);
			ctx.fillStyle = rect.style;
			ctx.fill();
		});
		ctx.restore();
	}

	/* 组和两小块区域范围。注：其一样大小 */
	function mergeRect(ra, rb) {
		var rect = new WT.Rect();

		var left, top, right, bottom;
		if (ra.left <= rb.left) {
			left = ra.left;
			right = rb.left + rb.width;
		} else {
			left = rb.left;
			right = ra.left + ra.width;
		}
		if (ra.top <= rb.top) {
			top = ra.top;
			bottom = rb.top + rb.height;
		} else {
			top = rb.top;
			bottom = ra.top + ra.height;
		}
		rect.left = left;
		rect.top = top;
		rect.width = right - left;
		rect.height = bottom - top;
		return rect;
	}

	mPrototype.begin = function(rect) {
		rect.style = this._color.setHSV(this._h, 0.8, 0.8).toRGBAStyle(0.5);
		this._h += 0.1; // _h会赋到对象上，原型链上作为初始值
		if (this._h > 1) this._h -= 1;
		drawRect(rect, this._ctx);

		this._start = rect;
		this._rect = rect;
	}

	mPrototype.move = function(rect) {
		if (this._start === null || rect === null) {
			return;
		}
		this._canvas.width = this._canvas.width;
		drawRects(this.rects, this._ctx);
		this._rect = mergeRect(this._start, rect);
		this._rect.style = this._start.style;
		drawRect(this._rect, this._ctx);
	}

	mPrototype.over = function() {
		if (this._start === null) {
			return;
		}
		this._canvas.width = this._canvas.width;
		this.rects.push(this._rect);
		drawRects(this.rects, this._ctx);

		this._start = null;
	}

	mPrototype.revoke = function() {
		if (this.rects.length >= 1) {
			this.rects.splice(this.rects.length - 1, 1);

			this._canvas.width = this._canvas.width;
			drawRects(this.rects, this._ctx);
			if (this._start) {
				drawRect(this._rect, this._ctx);
			}
			return true;
		}
		return false;
	}

	mPrototype.restoreRects = function() {
		drawRects(this.rects, this._ctx);
	}

	function beInFrame(rect, frame) {
		var va = beInSegment({left : rect.left, width : rect.width}, 
							{left : frame.left, width : frame.width});
		if (va) {
			var vb = beInSegment({left : rect.top, width : rect.height},
								{left : frame.top, width : frame.height});
			if (vb) {
				rect.left = va.left;
				rect.width = va.width;
				rect.top = vb.left;
				rect.height = vb.width;
				return true;
			}
		}
		return false;
	}

	/**
	 * 截取sa在sb的线段，并得sa在sb的相对left
	 * @param  {Segment} sa 被截线段
	 * @param  {Segment} sb 判断线段
	 * @return {Segment} 不在范围时false，否则返回{left, width}
	 */
	function beInSegment(sa, sb) {
		var offset;
		// 截掉头并偏移起点
		if (sa.left < sb.left) {
			offset = sb.left - sa.left;
			if (offset >= sa.width) {
				return false;
			} else {
				sa.left = 0;
				sa.width = sa.width - offset;
			}
		} else {
			sa.left -= sb.left;
			// 头超过最后了
			if (sa.left >= sb.width) {
				return false;
			}
		}
		// 截掉尾（超长部分）
		if (sa.left + sa.width > sb.width) {
			sa.width = sb.width - sa.left;
		}
		return sa;
	}

	mPrototype.resize = function(w, h, r, d) {
		var frame = new WT.Rect(r * WT.file.tilewidth,
			d * WT.file.tileheight,
			this._canvas.width, // WT.file.width * WT.file.tilewidth
			this._canvas.height); // WT.file.height * WT.file.tileheight

		var rect, i = -1;
		var discard = [];

		while (rect = this.rects[++i]) {
			if (!beInFrame(rect, frame)) {
				this.rects.splice(i, 1);
				i--; // 记得i减1
			}
		}
		this.restoreRects();
	}

	return mPrototype;
})();