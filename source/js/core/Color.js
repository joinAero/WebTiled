
WT.Color = function(hex) {
	if (hex !== undefined) this.setHex(hex);
}

WT.Color.prototype = {

	r : 1, g : 1, b : 1,

	setHex : function(hex) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		return this;
	},

	setRGB : function(r, g, b) { // [0.0, 1.0]
		this.r = r;
		this.g = g;
		this.b = b;

		return this;
	},

	setHSV :  function(h, s, v) { // [0.0, 1.0]
		var i, f, p, q, t;
		if (v === 0) {
			this.r = this.g = this.b = 0;
		} else {
			i = Math.floor(h * 6);
			f = (h * 6 ) - i;
			p = v * (1 - s);
			q = v * (1 - (s * f));
			t = v * (1 - (s * (1 - f)));

			switch (i) {
				case 1: this.r = q; this.g = v; this.b = p; break;
				case 2: this.r = p; this.g = v; this.b = t; break;
				case 3: this.r = p; this.g = q; this.b = v; break;
				case 4: this.r = t; this.g = p; this.b = v; break;
				case 5: this.r = v; this.g = p; this.b = q; break;
				case 6: // fall through
				case 0: this.r = v; this.g = t; this.b = p; break;
			}
		}

		return this;
	},

	toStyle : function() {
		return 'rgb(' + Math.floor(this.r * 255) + ','
			+ Math.floor(this.g * 255) + ',' +
			Math.floor(this.b * 255) + ')';
	},

	toRGBAStyle : function(alpha) {
		return 'rgba(' + Math.floor(this.r * 255) + ','
			+ Math.floor(this.g * 255) + ','
			+ Math.floor(this.b * 255) + ','
			+ alpha + ')';
	}

}
