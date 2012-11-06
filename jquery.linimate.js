CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
	var lt = function (a, b) { return a <= b; };
	var gt = function (a, b) { return a >= b; };
	var capmin = function (a, b) { return Math.min(a, b); };
	var capmax = function (a, b) { return Math.max(a, b); };
	
	var checkX = { thereYet: gt, cap: capmin };
	var checkY = { thereYet: gt, cap: capmin };
	
	if (fromY - toY > 0) {
		checkY.thereYet = lt;
		checkY.cap = capmax;
	}
	
	if (fromX - toX > 0) {
		checkX.thereYet = lt;
		checkX.cap = capmax;
	}
	
	this.moveTo(fromX, fromY);
	var offsetX = fromX;
	var offsetY = fromY;
	var idx = 0, dash = true;
	
	while (!(checkX.thereYet(offsetX, toX) && checkY.thereYet(offsetY, toY))) {
		var ang = Math.atan2(toY - fromY, toX - fromX);
		var len = pattern[idx];
		
		offsetX = checkX.cap(toX, offsetX + (Math.cos(ang) * len));
		offsetY = checkY.cap(toY, offsetY + (Math.sin(ang) * len));
		
		if (dash) {
			this.lineTo(offsetX, offsetY);
		} else {
			this.moveTo(offsetX, offsetY);
		}
		
		idx = (idx + 1) % pattern.length;
		dash = !dash;
	}
};

$.fn.linimate = function(options, callback) {
	var FPS = options.fps != undefined ? options.fps : 30;
	var framesElapsed = 0;
	var paintTimeout = 0;
	var canvas = $(this);
	var context = canvas[0].getContext('2d');
	var lines = options.lines != undefined ? options.lines : [];
	
	function prepareFrame() {
		var line, start, end, duration, contX, contY, cont;
		var incX, incY;
		
		cont = 0;
		paintTimeout = setTimeout(prepareFrame, FPS);
		
		for(var i = 0; i < lines.length; i ++) {
			line = lines[i];
			
			if(line.start != undefined) {
				if(line.start > framesElapsed) {
					cont ++;
					continue;
				}
			}
			
			if(line.polyPoint == undefined) {
				line.polyPoint = 0;
			}
			
			start = line.poly[line.polyPoint];
			if(line.polyPoint < line.poly.length - 1) {
				end = line.poly[line.polyPoint + 1];
			} else {
				continue;
			}
			
			if(line.pos == undefined) {
				line.pos = [start[0], start[1]];
				incX = 0;
				incY = 0;
			} else {
				duration = parseFloat(line.duration);
				incX = (parseFloat(end[0]) - parseFloat(start[0])) / duration;
				incY = (parseFloat(end[1]) - parseFloat(start[1])) / duration;
				
				line.pos[0] += incX;
				line.pos[1] += incY;
			}
			
			contX = false;
			contY = false;
			
			if(start[0] <= end[0] && line.pos[0] <= end[0]) {
				contX = true;
			} else if(start[0] >= end[0] && line.pos[0] >= end[0]) {
				contX = true;
			}
			
			if(start[1] <= end[1] && line.pos[1] <= end[1]) {
				contY = true;
			} else if(start[1] >= end[1] && line.pos[1] >= end[1]) {
				contY = true;
			}
			
			if(contX && contY) {
				cont ++;
			} else if(line.polyPoint < line.poly.length - 1) {
				line.polyPoint ++;
				line.pos = [
					line.poly[line.polyPoint][0],
					line.poly[line.polyPoint][1]
				]
				
				cont ++;
			}
		}
		
		framesElapsed ++;
		if(!cont) {
			clearTimeout(paintTimeout);
			paintTimeout = 0;
			
			if(callback != undefined) {
				callback(canvas);
			}
		}
	}
	
	function paintFrame() {
		var line, pattern, point, start, end;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < lines.length; i ++) {
			line = lines[i];
			
			if(line.pos == undefined) {
				continue;
			}
			
			if(line.pattern != undefined) {
				pattern = line.pattern;
			} else {
				pattern = [1];
			}
			
			for(var p = 1; p <= line.polyPoint; p ++) {
				start = line.poly[p - 1];
				end = line.poly[p];
				
				context.beginPath();
				context.dashedLineTo(start[0], start[1], end[0], end[1], pattern);
				
				if(line.colour != undefined) {
					context.strokeStyle = line.colour;
				}
				
				if(line.thickness != undefined) {
					context.lineWidth = line.thickness;
				}
				
				context.stroke();
			}
			
			point = line.poly[line.polyPoint];
			context.beginPath();
			context.dashedLineTo(point[0], point[1], line.pos[0], line.pos[1], pattern);
			
			if(line.colour != undefined) {
				context.strokeStyle = line.colour;
			}
			
			if(line.thickness != undefined) {
				context.lineWidth = line.thickness;
			}
			
			context.stroke();
		}
		
		requestAnimFrame(paintFrame);
	}
	
	requestAnimFrame = (
		function() {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(callback) {
					window.setTimeout(callback, FPS);
				};
		}
	)
	();
	
	paintTimeout = setTimeout(prepareFrame, FPS);
	requestAnimFrame(paintFrame);
}