'use strict';

/* globals MediaRecorder */

// Spec is at http://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/RecordingProposal.html

var mediaRecorder;
var chunks = [];
var count = 0;

var recBtn = document.querySelector('button#rec');
recBtn.onclick=onBtnRecordClicked;
var stopBtn = document.querySelector('button#stop');
stopBtn.onclick=onBtnStopClicked;
stopBtn.style.display="none";
var videoElement = document.querySelector('video');
videoElement.controls = false;
var dataElement = document.querySelector('#data');
var pantalla_normal=document.querySelector("div#pantalla_normal")
var pantalla_guardado=document.querySelector("div#pantalla_guardado")


navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

if(getBrowser() == "Chrome"){
	var constraints = {"audio": true, "video": {  "mandatory": {  "minWidth": 640,  "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } };//Chrome did not support the new constraints spec until 59 for video and 60 for audio
}else if(getBrowser() == "Firefox"){
	var constraints = {audio: true,video: {  width: { min: 640, ideal: 640, max: 640 },  height: { min: 480, ideal: 480, max: 480 }}}; //Firefox
}
//Se conecta con la cámara y muestra en la ventana
navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

//////////////////////////////////////////

//Declaración de funciones

function errorCallback(error){
	console.log('navigator.getUserMedia error: ', error);	
}
function handleSuccess(stream) {
	//recordButton.disabled = false;
	//console.log('getUserMedia() got stream: ', stream);
	window.stream = stream;
	videoElement.srcObject = stream;
}
function handleError(error) {
	console.log('navigator.getUserMedia error: ', error);
}  
  
function startRecording(stream) {
	log('Start recording...');
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
		/*var opt = {
			audioBitsPerSecond : 128000,
			videoBitsPerSecond : 2500000,
			mimeType : 'video/mp4'
		}*/
		//log('Using '+opt.mimeType);
		//var options = {mimeType: 'video/webm;codecs=h264'};
		log('Using '+options.mimeType);	
		mediaRecorder = new MediaRecorder(stream, options);
	}else{
		log('isTypeSupported is not supported, using default codecs for browser');
		mediaRecorder = new MediaRecorder(stream);
	}
	//playButton.disabled = true;
	//downloadButton.disabled = true;
	//mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start(10);

	mediaRecorder.ondataavailable = function(event){
		if (event.data && event.data.size > 0) {
			chunks.push(event.data);
		}
	};

	mediaRecorder.onerror = function(e){
		log('Error: ' + e);
		console.log('Error: ', e);
	};

	mediaRecorder.onstart = function(){
		log('Started & state = ' + mediaRecorder.state);
	};

	mediaRecorder.onstop = function(){
		log('Stopped  & state = ' + mediaRecorder.state);

		var blob = new Blob(chunks, {type: "video/webm"});
		var videoURL = window.URL.createObjectURL(blob);
		chunks = [];
		download(videoURL)
	};

	mediaRecorder.onwarning = function(e){
		log('Warning: ' + e);
	};
}

function onBtnRecordClicked (){
	 if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia) {
		alert('MediaRecorder not supported on your browser, use Firefox 30 or Chrome 49 instead.');
	}else {
		startRecording(window.stream);
		stopBtn.style.display="block";
		recBtn.style.display="none";
		pantalla_normal.style.display="none";
		pantalla_guardado.style.display="none";
	}
}

function onBtnStopClicked(){
	mediaRecorder.stop();
	//videoElement.controls = true;
	stopBtn.style.display="none";
	pantalla_guardado.style.display="block";
	setTimeout(mostrar_normal, 2500);
}

function mostrar_normal(){
	pantalla_normal.style.display="block";
	recBtn.style.display="block";
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

