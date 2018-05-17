/*
 * noir is an extra filter for an exercise
 */
function bwcartoon(pos, r, g, b, outputData) {
	var offset =  pos * 4;
	if( outputData[offset] < 120 ) {
		outputData[offset] = 80;
		outputData[++offset] = 80;
		outputData[++offset] = 80;
	} else {
		outputData[offset] = 255;
		outputData[++offset] = 255;
		outputData[++offset] = 255;
	}
	outputData[++offset] = 255;
	++offset;
}

function noir(pos, r, g, b, data) {
	var brightness = (3*r + 4*g + b) >>> 3;
	if (brightness < 0) brightness = 0;
	data[pos * 4 + 0] = brightness;
	data[pos * 4 + 1] = brightness;
	data[pos * 4 + 2] = brightness;
}

function western(pos, r, g, b, data) {
	var brightness = (3*r + 4*g + b) >>> 3;
	data[pos * 4 + 0] = brightness+40;
	data[pos * 4 + 1] = brightness+20;
	data[pos * 4 + 2] = brightness-20;
	data[pos * 4 + 3] = 255; //220;
}

function scifi(pos, r, g, b, data) {
	var offset = pos * 4;
	data[offset] = Math.round(255 - r) ;
	data[offset+1] = Math.round(255 - g) ;
	data[offset+2] = Math.round(255 - b) ;
}
