$.fn.linimate = function(options, callback) {
	var FPS = options.fps != undefined ? options.fps : 30;
	var framesElapsed = 0;
	var paintTimeout = 0;
	var canvas = $(this);
	var context = canvas[0].getContext('2d');
	var lines = options.lines != undefined ? options.lines : [];
	
	function prepareFrame() {
		var line, start, end, duration, contX, contY, cont;
		
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
			} else {
				duration = line.duration;
				
				line.pos[0] += (end[0] - start[0]) / duration;
				line.pos[1] += (end[1] - start[1]) / duration;
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
		var line, point, start, end;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i < lines.length; i ++) {
			line = lines[i];
			
			if(line.pos == undefined) {
				continue;
			}
			
			for(var p = 1; p <= line.polyPoint; p ++) {
				start = line.poly[p - 1];
				end = line.poly[p];
				
				context.beginPath();
				context.moveTo(start[0], start[1]);
				context.lineTo(end[0], end[1]);
				
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
			context.moveTo(point[0], point[1]);
			context.lineTo(line.pos[0], line.pos[1]);
			
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