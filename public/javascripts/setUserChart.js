var time = ['0'];
var emo = ['2'];

var randomColorFactor = function() {
    return Math.round(Math.random() * 255);
};
var randomColor = function(opacity) {
    return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
};

var config = {
    type: 'line',
    data: {
        labels: time,
        datasets: [{
            label: 'Emotion',
            data: emo,
            fill: true,
            borderDash: [5, 5]
        }]
    },
    options: {
        responsive: true,
        title:{
            display:true,
            text:'Emotion History'
        },
        tooltips: {
            mode: 'label',
        },
        hover: {
            mode: 'dataset'
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Emotion'
                },
                ticks: {
                    // Create scientific notation labels
                    callback: function(value, index, values) {
                        if(value===0)
                            return 'Not Found';
                        if(value===1)
                            return 'Sad';
                        if(value===2)
                            return 'Confused';
                        if(value===3)
                            return 'Angry';
                        if(value===4)
                            return 'Happy';
                    },
                    beginAtZero:true
                },
                animationStep: 15
            }]
        }
    }
};

$.each(config.data.datasets, function(i, dataset) {
    dataset.borderColor = randomColor(0.4);
    dataset.backgroundColor = randomColor(0.5);
    dataset.pointBorderColor = randomColor(0.7);
    dataset.pointBackgroundColor = randomColor(0.5);
    dataset.pointBorderWidth = 1;
});

function runEmoChart() {
    "use strict";
    var ctx = document.getElementById('emo_display').getContext("2d");
    var myLine = new Chart(ctx, config);
    return myLine;
    /*setTimeout(function(){
        myLine.data.datasets[0].data[3] = 3;
        myLine.data.labels[3] = 1.45;
        myLine.update();
        console.log('Fire');
    }, 5000);*/
}

function updateChart(x, y) {
    "use strict";
    let dataCount = myLine.data.datasets[0].data.length;
    let labelCount = myLine.data.labels.length;
    myLine.data.datasets[0].data[dataCount] = x;
    myLine.data.labels[labelCount] = y;
    myLine.update();
    console.log('Update Chart')
}


/* var chartData = {
 labels: ["January", "February", "March", "April", "May", "June", "July"],
 datasets: [
 {
 label: "My First dataset",
 fillColor: "rgba(220,220,220,0.2)",
 strokeColor: "rgba(220,220,220,1)",
 pointColor: "rgba(220,220,220,1)",
 pointStrokeColor: "#fff",
 pointHighlightFill: "#fff",
 pointHighlightStroke: "rgba(220,220,220,1)",
 data: [0, 0, 1, 2, 3, 4, 5]
 },
 {
 label: "My Second dataset",
 fillColor: "rgba(151,187,205,0.2)",
 strokeColor: "rgba(151,187,205,1)",
 pointColor: "rgba(151,187,205,1)",
 pointStrokeColor: "#fff",
 pointHighlightFill: "#fff",
 pointHighlightStroke: "rgba(151,187,205,1)",
 data: [0, 1, 1, 1, 2, 2, 2]
 }
 ]
 };
 var chartOptions = {
 scaleLabel:
 function (valuePayload) {
 if(Number(valuePayload.value)===0)
 return ' ';
 if(Number(valuePayload.value)===1)
 return 'request added';
 if(Number(valuePayload.value)===2)
 return 'request viewed';
 if(Number(valuePayload.value)===3)
 return 'request accepted';
 if(Number(valuePayload.value)===4)
 return 'request solved';
 if(Number(valuePayload.value)===5)
 return 'solving confirmed';
 },
 showTooltip: true,
 scaleOverride: true,
 scaleSteps: 5,
 scaleStepWidth: 1,
 scaleStartValue: 0
 };

 var ctx = document.getElementById('emo_canvas').getContext("2d");
 window.myLine = new Chart(ctx, {
 type: 'line',
 data: chartData,
 options: chartOptions
 });*/