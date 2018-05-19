'use strict';

/* globals MediaRecorder */

// Spec is at http://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/RecordingProposal.html

var mediaRecorder;
var chunks = [];
var count = 0;
var lapso_numbers=1250;

var recBtn = document.querySelector('button#rec');
recBtn.onclick=onBtnRecordClicked;
var stopBtn = document.querySelector('button#stop');
stopBtn.onclick=onBtnStopClicked;
stopBtn.style.display="none";
var videoElement = document.querySelector('video');
videoElement.controls = false;
var dataElement = document.querySelector('#data');
var pantalla_normal=document.querySelector("div#pantalla_normal")
var pantalla_guardado=document.querySelector("div#pantalla_guardado");
var pantalla_numero3=document.querySelector("div#pantalla_numero3");
var pantalla_numero2=document.querySelector("div#pantalla_numero2");
var pantalla_numero1=document.querySelector("div#pantalla_numero1");
var tiempo_transcurrido=document.querySelector("#demo");
tiempo_transcurrido.style.display="none";
var countDownDate;
var x;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

if(getBrowser() == "Chrome"){
	var constraints = {"audio": true, "video": {  "mandatory": {  "minWidth": 640,  "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } };//Chrome did not support the new constraints spec until 59 for video and 60 for audio
}else if(getBrowser() == "Firefox"){
	var constraints = {audio: true,video: {  width: { min: 640, ideal: 640, max: 640 },  height: { min: 480, ideal: 480, max: 480 }}}; //Firefox
}
//Se conecta con la cámara y muestra en la ventana
navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

//////////////////////////////////////////

//Declaración de funciones
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
		//var options = {mimeType: 'video/webm;codecs=H264'};

		/*
		log('video/invalid='+MediaRecorder.isTypeSupported("video/invalid"));
		log('video/mpeg4='+MediaRecorder.isTypeSupported("video/mpeg4"));
		log('video/mp4='+MediaRecorder.isTypeSupported("video/mp4"));
		log('video/webm;codecs=daala='+MediaRecorder.isTypeSupported("video/webm;codecs=daala"));
		log("video/webm;codecs=vp8="+MediaRecorder.isTypeSupported("video/webm;codecs=vp8"));
		log("video/webm;codecs=vp9="+MediaRecorder.isTypeSupported("video/webm;codecs=vp9"));
		log("video/webm;codecs=h264="+MediaRecorder.isTypeSupported("video/webm;codecs=h264"));
		log("video/webm;codecs=H264="+MediaRecorder.isTypeSupported("video/webm;codecs=H264"))
		log("video/webm;codecs=avc1="+MediaRecorder.isTypeSupported("video/webm;codecs=avc1"))	*/
		

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
		stopBtn.style.display="block";
		recBtn.style.display="none";
		pantalla_normal.style.display="none";
		pantalla_guardado.style.display="none";

		//delay que muestra cada una de  las pantalla
		setTimeout(function(){ 
			pantalla_numero3.style.display="none";
			setTimeout(function(){ 
				pantalla_numero2.style.display="none";
				setTimeout(function(){
					pantalla_numero1.style.display="none"; 
					startRecording(window.stream);
					countDownDate = new Date().getTime();
					x = setInterval(mostrar_tiempo, 500);
					tiempo_transcurrido.style.display="block";
				}, lapso_numbers); 
			}, lapso_numbers); 
		}, lapso_numbers);
	}
}

function onBtnStopClicked(){
	clearInterval(x);	//detiene timmer
	stopBtn.style.display="none";
	tiempo_transcurrido.style.display="none";
	encerar();
	pantalla_guardado.style.display="block";
	mediaRecorder.stop();
	setTimeout(mostrar_normal, 3000);
}

function mostrar_normal(){
	pantalla_normal.style.display="block";
	recBtn.style.display="block";
	//se vuelven visible de nuevo
	pantalla_numero3.style.display="block";
	pantalla_numero2.style.display="block";
	pantalla_numero1.style.display="block";
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

function encerar()
{
	tiempo_transcurrido.innerHTML = "00:00" ;
}

/*
// Update the count down every 1 second
var x = setInterval(function() {
	segundos++;
	if(segundos>59){
		segundos=0;
		minutos++;
	}
	document.getElementById("demo").innerHTM = minutes + ":" + seconds;
	// If the count down is finished, write some text 
	if (minutos==60) {
		tiempo_transcurrido.innerHTML="Excedió el límite";
	}
  }, 1000);
*/
function mostrar_tiempo (){
	// Get todays date and time
	var now = new Date().getTime();
  
	// Find the distance between now an the count down date
	var distance = now-countDownDate;
//	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	//tiempo máximo de grabación 45 minutos
	if(minutes>=30){
		stopBtn.click();
		tiempo_transcurrido.innerHTML = "MAX";
	}
	 
	if(seconds<10&&minutes<10) tiempo_transcurrido.innerHTML = "0"+minutes + ":" + "0"+seconds ;
	else if(seconds<10&&minutes>=10) tiempo_transcurrido.innerHTML = minutes + ":" + "0"+seconds ;
	else if(seconds>=10&&minutes<10) tiempo_transcurrido.innerHTML = "0"+minutes + ":" +seconds ;
	else tiempo_transcurrido.innerHTML = minutes + ":" + seconds ;
	
}



