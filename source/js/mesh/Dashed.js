(function(){
    var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (CP && CP.lineTo) {    
        CP.dashedLine = function (x, y, x2, y2, dashArray) {        
            if (!dashArray) dashArray = [10, 2];        
            var dashCount = dashArray.length;        
            this.moveTo(x, y);        
            var dx = (x2 - x), dy = (y2 - y);        
            var slope = dy/dx;
            var distRemaining = Math.sqrt(dx * dx + dy * dy);        
            var dashIndex = 0, draw = true;        
            while (distRemaining >= 0.1) {            
                var dashLength = dashArray[dashIndex++ % dashCount];            
                if (dashLength > distRemaining) dashLength = distRemaining;
                if(dx == 0){
                    var signal = (y2 > y ? 1 : -1);
                    y += dashLength * signal;
                }else{
                    var xStep = Math.sqrt(dashLength * dashLength / (1 + slope * slope));             
                    var signal = (x2 > x ? 1 : -1);             
                    x += xStep * signal;            
                    y += slope * xStep * signal;       
                }
                this[draw ? 'lineTo' : 'moveTo'](x, y);            
                distRemaining -= dashLength;            
                draw = !draw;       
            }    
        },
        CP.dashedRect = function(x, y, w, h, dashArray){
            if (!dashArray) dashArray = [10, 2];
            this.beginPath();
            this.dashedLine(x,y,x+w,y,dashArray);
            this.dashedLine(x,y,x,y+h,dashArray);
            this.dashedLine(x+w,y,x+w,y+h,dashArray);
            this.dashedLine(x,y+h,x+w,y+h,dashArray);
            this.closePath();
            this.stroke();
        }
    }
})();