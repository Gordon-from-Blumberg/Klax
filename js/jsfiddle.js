(function() {

	var MARGIN = d3.select('#form-container').node().offsetWidth / 2;
	console.log(d3.select('#form-container'));
	console.log('MARGIN = ' + MARGIN);

	var BODY_WIDTH = document.body.clientWidth;
	if (BODY_WIDTH < 1024) BODY_WIDTH = 1024;
	d3.select('body').style('width', BODY_WIDTH + 'px');
	console.log('BODY_WIDTH = ' + BODY_WIDTH);
	var MAX_GRID_WIDTH = BODY_WIDTH - MARGIN;
	console.log('MAX_GRID_WIDTH = ' + MAX_GRID_WIDTH);
	var MIN_HEX_WIDTH = 25;
	var MAX_HEX_WIDTH = 100;

	var bfModule = require('battlefield');
	var grid = d3.select('#grid').style('margin-left', MARGIN);



	d3.select('input[name="gridSize"]').on('change', function() {d3.select('#hexCount').text(getHexCount(this.value))});
	d3.select('#generate-button').on('click', function() {drawGrid();})

	function drawGrid() {
		var opts = getFormData();
		
		var sizes = getSizes(opts.gridSize);
		console.log('sizes for gridSize ' + opts.gridSize + ' = ' + string(sizes));
		var baseHexCoords = getBaseHexCoords(opts.gridSize, sizes.gridHeight, sizes.hexWidth);
		console.log('coords of the base hex = ' + string(baseHexCoords));
		grid.selectAll('polygon').remove();
		grid.attr('width', sizes.gridWidth).attr('height', sizes.gridHeight);
		
		(new bfModule.Battlefield({
			template: 'rad-' + opts.gridSize,
			obstacles: opts
		}))
		.allHexes.each(function() {drawHex(baseHexCoords, sizes.hexWidth, sizes.hexHeight, this)});
	}

	function getGridWidth(gridSize, hexWidth) {	return (2 * gridSize + 1) * hexWidth }
	function getGridHeight(gridSize, hexWidth) { return (3 * gridSize + 2) * hexWidth / Math.sqrt(3) } 
	function getHexWidth(gridSize) { return MAX_GRID_WIDTH / (2 * gridSize + 1); }
	function getHexCount(gridSize) {return 3 * +gridSize * (+gridSize + 1) + 1}

	function getSizes(gridSize) {
		var hexWidth = MAX_HEX_WIDTH;
		var gridWidth = getGridWidth(gridSize, hexWidth);
		if (gridWidth > MAX_GRID_WIDTH) {
		hexWidth = getHexWidth(gridSize);
		if (hexWidth < MIN_HEX_WIDTH) hexWidth = MIN_HEX_WIDTH;
		gridWidth = getGridWidth(gridSize, hexWidth);
	  }
	  return {
		gridWidth: gridWidth,
		gridHeight: getGridHeight(gridSize, hexWidth),
		hexWidth: hexWidth,
		hexHeight: hexWidth * 2 / Math.sqrt(3)
	  }
	}

	function getBaseHexCoords(gridSize, gridHeight, hexWidth) {
		return {
		x: hexWidth / 2,
		y: gridHeight / 2
	  }
	}

	function getHexCoords(baseHexCoords, hexWidth, x, y) {
		return {
			x: baseHexCoords.x + x * hexWidth + y * hexWidth / 2,
			y: baseHexCoords.y - Math.sqrt(3) * y * hexWidth / 2
		}
	}

	function getPoints(hexWidth, hexHeight, x, y) {
		var b = hexWidth / 2;
		var a = hexHeight / 2;
		var result = '' + x + ', ' + (y - a);
		result += ' ' + (x + b) + ', ' + (y - a / 2);
		result += ' ' + (x + b) + ', ' + (y + a / 2);
		result += ' ' + (x) + ', ' + (y + a);
		result += ' ' + (x - b) + ', ' + (y + a / 2);
		result += ' ' + (x - b) + ', ' + (y - a / 2);
		return result;
	}

	function drawHex(baseHexCoords, hexWidth, hexHeight, hex) {
		var hexCoords = getHexCoords(baseHexCoords, hexWidth, hex.x, hex.y);
		var opacity = hex.isObstacle ? .4 + hex.height * .2 : 0
		var fillColor = 'rgba(50,50,50,%s)'.replace('%s', opacity);
		grid.append('polygon')
			.attr('stroke', '#000')
			.attr('fill', fillColor)
			.attr('points', getPoints(hexWidth, hexHeight, hexCoords.x, hexCoords.y));
	}

	function getFormData() {
		var data = {};
		d3.select('#form-container').selectAll('input').each(function() {
			if (this.type == 'radio' && !this.checked) return;
			data[this.name] = this.type == 'number' ? +this.value : this.value;
		});
		return data;
	}

	function string(obj) {return JSON.stringify(obj)}
}());