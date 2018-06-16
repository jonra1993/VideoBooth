function filtro1(data){
	for (var i = 0; i < data.length; i+=4) {
    var average = (data[i] + data[i + 1]  + data[i + 2]) / 3;
    data[i + 0] = average >= 128 ? 255 : 0; // red
    data[i + 1] = average >= 128 ? 255 : 0; // green
    data[i + 2] = average >= 128 ? 255 : 0; // blue
    // note: i+3 is the alpha channel, we are skipping that one
  }
}
function filtro_noir(data) {
	for (var i = 0; i < data.length; i+=4) {
		var brightness = (3*data[i + 0]  + 4*data[i + 1] + data[i + 2]) >>> 3;
		if (brightness < 0) brightness = 0;
		data[i + 0] = brightness;
		data[i + 1] = brightness;
		data[i + 2] = brightness;
	}
}

function filtro_western(data) {
	for (var i = 0; i < data.length; i+=4) {
		var brightness = (3*data[i + 0] + 4*data[i + 1] + data[i + 2]) >>> 3;
		data[i + 0] = brightness+40;
		data[i + 1] = brightness+20;
		data[i + 2] = brightness-20;
		data[i + 3] = 255; //220;
	}
}

function filtro_scifi(data) {
	for (var i = 0; i < data.length; i+=4) {
		data[i + 0] = Math.round(255 - data[i + 0]) ;
		data[i + 1] = Math.round(255 - data[i + 1]) ;
		data[i + 2] = Math.round(255 - data[i + 2]) ;
	}
}

function bwcartoon(data) {
	for (var i = 0; i < data.length; i+=4) {
	if( data[i + 0] < 120 ) {
		data[i + 0] = 80;
		data[i + 1] = 80;
		data[i + 2] = 80;
	} else {
		data[i + 0] = 255;
		data[i + 1] = 255;
		data[i + 2] = 255;
	}
	data[i + 3] = 255;
	}
}

function processDiff(data,pixelDiffThreshold) {
	for (var i = 0; i < data.length; i += 4) {
		var pixelDiff = data[i + 0] * 0.3 + data[i + 1] * 0.6 + data[i + 2] * 0.1;
		var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
		data[i + 0] = 0;
		data[i + 1] = normalized;
		data[i + 2] = 0;
		data[i + 3] = normalized;
	}
}