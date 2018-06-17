'use strict';

var recBtn, stopBtn, recorder, dataElement; 
var pantalla_normal, pantalla_guardado, pantalla_numero3, pantalla_numero2, pantalla_numero1;
var chunks = [];
var video; 
var count = 0;
var lapso_numbers=1250;
var countDownDate;
var tiempo_transcurrido;
var x;


window.onload = function () {
  //se conecta elementos html con javascript
	video =document.getElementById('videos');
	recBtn = document.getElementById('rec');
	recBtn.onclick=startRecording;
	stopBtn = document.getElementById('stop');
	stopBtn.onclick=stopRecording;
	stopBtn.style.display="none";
	dataElement = document.querySelector('#data');
	pantalla_normal=document.querySelector("div#pantalla_normal")
	pantalla_guardado=document.querySelector("div#pantalla_guardado");
	pantalla_numero3=document.querySelector("div#pantalla_numero3");
	pantalla_numero2=document.querySelector("div#pantalla_numero2");
	pantalla_numero1=document.querySelector("div#pantalla_numero1");
	tiempo_transcurrido=document.querySelector("#demo");
	tiempo_transcurrido.style.display="none";
  	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

  if(getBrowser() == "Chrome"){
    var constraints = {"audio": true, "video": {  "mandatory": {  "minWidth": 640,  "maxWidth": 640, "minHeight": 480,"maxHeight": 480 }, "optional": [] } };//Chrome did not support the new constraints spec until 59 for video and 60 for audio
  }else if(getBrowser() == "Firefox"){
    var constraints = {audio: true,video: {  width: { min: 640, ideal: 640, max: 640 },  height: { min: 480, ideal: 480, max: 480 }}}; //Firefox
  }  
  function handleSuccess(stream) {
    recBtn.disabled = false;
    //video = document.createElement('video');
    window.stream = stream;
	video.srcObject = stream;
    video.addEventListener('loadedmetadata', function () {initCanvas(video);});
    // we need to play the video to trigger the loadedmetadata event
  }
  function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  } 

    // get video stream from user's webcam
	navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
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
	///mirror
	ctx.save(); 
	ctx.translate(width, 0);
	ctx.scale(-1, 1);
	ctx.drawImage(video, 0, 0, width, height);
	ctx.setTransform(1, 0, 0, 1, 0, 0); //importante para mirror
	ctx.restore();
  };
  draw();
  initRecorderWithCanvas(video);
}

function initRecorderWithCanvas(video) {

  if (typeof MediaRecorder.isTypeSupported == 'function'){
		if(MediaRecorder.isTypeSupported('video/mp4')){
			var options = {mimeType: 'video/mp4'};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
		  var options = {mimeType: 'video/webm;codecs=vp9'};
		} else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
		  var options = {mimeType: 'video/webm;codecs=h264'};
		} else  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
		  var options = {mimeType: 'video/webm;codecs=vp8'};
    }
    
		recorder = new MediaRecorder(window.stream, options);
	}else{
		log('isTypeSupported is not supported, using default codecs for browser');
		recorder = new MediaRecorder(window.stream);
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
						recorder.start();
						stopBtn.style.display="block";
						countDownDate = new Date().getTime();
						x = setInterval(mostrar_tiempo, 500);
						tiempo_transcurrido.style.display="block";
					}, lapso_numbers); 
				}, lapso_numbers); 
			}, lapso_numbers);
 
}

function stopRecording() {
	clearInterval(x);	//detiene timmer
	stopBtn.style.display="none";
	tiempo_transcurrido.style.display="none";
	encerar();
	pantalla_guardado.style.display="block";
	recorder.stop();
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

function mostrar_tiempo (){
	// Get todays date and time
	var now = new Date().getTime();
  
	// Find the distance between now an the count down date
	var distance = now-countDownDate;
//	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	//tiempo máximo de grabación 45 minutos
	if(minutes>=20){
		stopBtn.click();
		tiempo_transcurrido.innerHTML = "MAX";
	}
	 
	if(seconds<10&&minutes<10) tiempo_transcurrido.innerHTML = "0"+minutes + ":" + "0"+seconds ;
	else if(seconds<10&&minutes>=10) tiempo_transcurrido.innerHTML = minutes + ":" + "0"+seconds ;
	else if(seconds>=10&&minutes<10) tiempo_transcurrido.innerHTML = "0"+minutes + ":" +seconds ;
	else tiempo_transcurrido.innerHTML = minutes + ":" + seconds ;
	
}