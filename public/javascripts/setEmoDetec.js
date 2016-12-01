var videoAnchor = document.querySelector("#emo_video");

// check for getUserMedia support
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

if (navigator.getUserMedia) {
    // set up stream

    var videoSelector = {video : true};
    if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
        let chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    };

    navigator.getUserMedia(videoSelector, function( stream ) {
        if (videoAnchor.mozCaptureStream) {
            videoAnchor.mozSrcObject = stream;
        } else {
            videoAnchor.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }
        videoAnchor.play();
    }, function() {
        //insertAltVideo(vid);
        alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
    });
}

function getDT() {
    let dt = new Date();
    let d = dt.getDate() +'-'+ dt.getMonth() +'-'+ dt.getFullYear() ;
    let t = dt.getHours() +':'+ dt.getMinutes() +':'+ dt.getSeconds();
    return d +' ' +t;
}

function getDTMain() {
    let dt = new Date();
    let t = dt.getHours() +'.'+ dt.getMinutes();
    return t;
}


function initClmVid() {
    let emoresult;

    let video = document.getElementById('emo_video');
    let videoOverlay = document.getElementById('emo_video_overlay');
    let videoOverlayCC = videoOverlay.getContext('2d');

    let ctrackVid = new clm.tracker({useWebGL : true});
    ctrackVid.init(pModel);

    let drawRequestVid;

    function drawLoop() {
        drawRequestVid = requestAnimFrame(drawLoop);
        videoOverlayCC.clearRect(0,0,300,250);
        if (ctrackVid.getCurrentPosition()) {
            ctrackVid.draw(videoOverlay);
        }
    }

    function animateVideoClean() {
        ctrackVid.start(video);
        drawLoop();
    }

    // detect if tracker fails to find a face
    document.addEventListener("clmtrackrNotFound", function(event) {
        //ctrackVid.stop();
        $('#emo_video_status').html('Failed to find face image!');
    }, false);

    // detect if tracker loses tracking of face
    document.addEventListener("clmtrackrLost", function(event) {
        //ctrackVid.stop();
        $('#emo_video_status').html('Failed to converge with face!');
    }, false);

    // detect if tracker has converged
    document.addEventListener("clmtrackrConverged", function(event) {
        $('#emo_video_status').html('Converged!');
        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
            cancelAnimationFrame(drawRequestVid);
        }
        else {
            cancelRequestAnimFrame(drawRequestVid);
        }

    }, false);

    animateVideoClean();
}

function takeSnapshot() {
    //http://localhost:3000/users/58357a44430a56744bddfcd6/5835833f1045834bf9e8a51a
    let divCount = $('#emo_camera_result').children().length;
    if (divCount > 3) {
        $('#emo_camera_result').children().last().remove();
    }
    $('#emo_camera_result').prepend('<div class="col-md-3">' +
        '<h4 id="capture_time"></h4>' +
        '<div class="emo_image_container">' +
        '<canvas id="emo_image" width="300" height="220"></canvas>' +
        '<canvas id="emo_overlay" width="300" height="220"></canvas>' +
        '</div>' +
        '<div id="emo_image_status"></div>' +
        '</div>');

    let v = document.getElementById('emo_video');
    let canvas = document.getElementById('emo_image');
    let context = canvas.getContext('2d');
    let w = canvas.width;
    let h = canvas.height;

    function draw(v,c,w,h) {
        if(v.paused || v.ended) return false; // if no video, exit here
        context.drawImage(v,0,0,w,h); // draw video feed to canvas
        var uri = canvas.toDataURL("image/png"); // convert canvas to data URI
        // console.log(uri); // uncomment line to log URI for testing
    }

    draw(v,context,w,h); // when save button is clicked, draw video feed to canvas
}

function initClmImg() {
    let emoresult = '';
    let image = document.getElementById('emo_image');
    let overlay = document.getElementById('emo_overlay');
    let overlayCC = overlay.getContext('2d');

    /*var img = new Image();
     //Below is hook
     img.onload = function() {
     cc.scale(0.75, 0.75);
     cc.drawImage(img,0,0);

     };
     img.src = document.getElementById('emo_image');*/

    let ctrackImg = new clm.tracker({stopOnConvergence : true});
    ctrackImg.init(pModel);

    let drawRequestImg;

    let ec = new emotionClassifier();
    ec.init(emotionModel);
    let emotionData = ec.getBlank();
    let drawImgCounter = 0;

    function drawLoop() {
        drawRequestImg = requestAnimFrame(drawLoop);
        overlayCC.clearRect(0,0,300,250);
        if (ctrackImg.getCurrentPosition()) {
            ctrackImg.draw(overlay);
        }

        var cp = ctrackImg.getCurrentParameters();
        var er = ec.meanPredict(cp);

        if (er && drawImgCounter == 0) {
            for (let i = 0; i < er.length; i++) {
                if (emoresult == '') {
                    if (er[i].value > 0.3) {
                        emoresult = er;
                        console.log(er);
                        $('#capture_time').html(getDT());
                        $('#emo_image_status').html(
                            '<h6>angry : '+er[0].value+'</h6>' +
                            '<h6>sad : '+er[1].value+'</h6>' +
                            '<h6>surprised : '+er[2].value+'</h6>' +
                            '<h6>happy : '+er[3].value+'</h6>'
                        );
                        let x = er[i].value + i + 1;
                        let y = getDTMain();
                        console.log(x, y);
                        updateChart(x, y, getDT());
                        drawImgCounter++;
                    }
                }
            }
                /*else {
                    $('#capture_time').html(getDT());
                    //$('#emo_image_status').html('<h6>Processing...</h6>');
                }*/
        }
    }

    function animateImgClean() {
        ctrackImg.start(image);
        drawLoop();
    }

    /*// detect if tracker fails to find a face
    document.addEventListener("clmtrackrNotFound", function(event) {
        ctrackImg.stop();
        console.log('Failed to find face image!');
    }, false);

    // detect if tracker loses tracking of face
    document.addEventListener("clmtrackrLost", function(event) {
        ctrackImg.stop();
        console.log('Failed to converge with face!');
    }, false);

    // detect if tracker has converged
    document.addEventListener("clmtrackrConverged", function(event) {
        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
            cancelAnimationFrame(drawRequestImg);
        }
        else {
            cancelRequestAnimFrame(drawRequestImg);
        }

    }, false);*/

    animateImgClean();
}

initClmVid();
let myLine = runEmoChart();

$('#emo_start').click(function() {
    setInterval(function() {
        "use strict";
        takeSnapshot();
        initClmImg();
        // let x = Math.random() + 3 || Math.random() + 2.5;
        // let y = getDTMain();
        // updateChart(x, y);
    }, 30000);
});

setTimeout(function(){
    "use strict";
    $('#emo_start').trigger('click');
}, 1000);
