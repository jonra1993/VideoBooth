'use strict';

var recordButton, stopButton, recorder, recordingLabel, dataElement;
var chunks = [];
var video ;
window.onload = function () {
  //se conecta elementos html con javascript
  recordButton = document.getElementById('record');
  stopButton = document.getElementById('stop');
  recordingLabel = document.getElementById('recording');
  dataElement = document.querySelector('#data');
  //se añade los listeners para cada botón
  recordButton.onclick=startRecording;
  stopButton.onclick=stopRecording;
 
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if(getBrowser() == "Chrome"){
    var constraints = {"audio": true, "video": {  "mandatory": {  "minWidth": 640,  "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } };//Chrome did not support the new constraints spec until 59 for video and 60 for audio
  }else if(getBrowser() == "Firefox"){
    var constraints = {audio: true,video: {  width: { min: 640, ideal: 640, max: 640 },  height: { min: 480, ideal: 480, max: 480 }}}; //Firefox
  }
  // get video stream from user's webcam
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
  
  function handleSuccess(stream) {
    recordButton.disabled = false;

    // We need to create a video element and pipe the stream into it so we
    // can know when we have data in the stream, and its width/height
    // (and adjust the canvas element accordingly).
    // Note that this video doesn't need to be attached to the DOM for this
    // to work.
    video = document.createElement('video');
    window.stream = stream;
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', function () {initCanvas(video);});
    // we need to play the video to trigger the loadedmetadata event
    video.muted();
    video.play();
  }
  function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  } 
};

function initCanvas(video) {
  var width = video.videoWidth;
  var height = video.videoHeight;

  var canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;

  // use requestAnimationFrame to render the video as often as possible
  var ctx = canvas.getContext('2d');
  var draw = function () {
    // create a renderAnimationFrame loop
    requestAnimationFrame(draw);
    // draw the video data into the canvas
    ctx.drawImage(video, 0, 0, width, height);
    // apply a custom filter to the image
    applyFilter(ctx, width, height);
  };
  draw();
  initRecorderWithCanvas(canvas);
}

function applyFilter(ctx, width, height) {
  // read pixels
  var imageData = ctx.getImageData(0, 0, width, height);
  var data = imageData.data; // data is an array of pixels in RGBA

  // modify pixels
  for (var i = 0; i < data.length; i+=4) {
    var average = (data[i] + data[i + 1]  + data[i + 2]) / 3;
    data[i] = average >= 128 ? 255 : 0; // red
    data[i + 1] = average >= 128 ? 255 : 0; // green
    data[i + 2] = average >= 128 ? 255 : 0; // blue
    // note: i+3 is the alpha channel, we are skipping that one
  }
  // render pixels back
  ctx.putImageData(imageData, 0, 0);
}

function initRecorderWithCanvas(canvas) {
  // create a new MediaRecorder and pipe the canvas stream to it
  var videostream = canvas.captureStream(24); // build a 24 fps stream
  var newStream = new MediaStream();
  newStream.addTrack(window.stream.getAudioTracks()[0]);
  newStream.addTrack(videostream.getVideoTracks()[0]);

  if (typeof MediaRecorder.isTypeSupported == 'function'){
		/*
			MediaRecorder.isTypeSupported is a function announced in https://developers.google.com/web/updates/2016/01/mediarecorder and later introduced in the MediaRecorder API spec http://www.w3.org/TR/mediastream-recording/
		*/
		if(MediaRecorder.isTypeSupported('video/mp4')){
			var options = {mimeType: 'video/mp4'};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
		  var options = {mimeType: 'video/webm;codecs=vp9'};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
		  var options = {mimeType: 'video/webm;codecs=h264'};
		} else  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
		  var options = {mimeType: 'video/webm;codecs=vp8'};
    }
    
		recorder = new MediaRecorder(newStream, options);
	}else{
		log('isTypeSupported is not supported, using default codecs for browser');
		recorder = new MediaRecorder(newStream);
  }
  recorder.ondataavailable = function(event){
		if (event.data && event.data.size > 0) {
			chunks.push(event.data);
		}
  };
  
  recorder.onerror = function(e){
		log('Error: ' + e);
		console.log('Error: ', e);
	};
  
  recorder.onstart = function(){
		log('Started & state = ' + recorder.state);
  };
  
  recorder.onstop = function(){
		log('Stopped  & state = ' + recorder.state);
		var blob = new Blob(chunks, {type: "video/webm"});
		var videoURL = window.URL.createObjectURL(blob);
		chunks = [];
		download(videoURL)
	};

	recorder.onwarning = function(e){
		log('Warning: ' + e);
	};
}

function startRecording() {
  recordButton.disabled = true;
  stopButton.disabled = false;
  recordingLabel.style = 'display:inline';
  recorder.start();
}

function stopRecording() {
  recordButton.disabled = false;
  stopButton.disabled = true;
  recordingLabel.style = 'display:none';
  // eventually this will trigger the dataavailable event
  recorder.stop();
}


function log(message){
	dataElement.innerHTML = dataElement.innerHTML+'<br>'+message ;
}

function download(url) {
	var hf              = document.createElement('a');
	var temporaryId     = new Date().toISOString();
	//Define link attributes
	hf.href             = url;
	hf.id               = temporaryId;
	hf.download         = temporaryId + '.webm';
	hf.innerHTML        = hf.download;
	hf.style.display    = 'none';
	hf.style.visibility = 'hidden';
	//Append the link inside html code
	document.body.appendChild(hf);
	//Simulate click on link to download file, and instantly delete link
	document.getElementById(hf.id).click();
	document.getElementById(hf.id).remove();

}

//browser ID
function getBrowser(){
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1)
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1)
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
		   (verOffset=nAgt.lastIndexOf('/')) )
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion);
	 majorVersion = parseInt(navigator.appVersion,10);
	}


	return browserName;
}