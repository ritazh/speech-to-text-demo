(function (window) {

    var isRecording = false;
    var btnRecord;

    // AUDIO FUNCTIONS
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    var audioContext = new window.AudioContext();

    var audioInput = null,
        realAudioInput = null,
        inputPoint = null,
        audioRecorder = null;
    var analyserContext = null;

    function submit(blob){
        console.log(blob);

        var fd = new FormData();
        fd.append('fname', 'test.wav');
        fd.append('data', blob);

        $.ajax({
            type: 'POST',
            url: '/recognize',
            data: fd,
            processData: false,
            contentType: false,
            success: function(result){
                console.log('output updating to: ' + result);
                $('#spinPhrase').css('visibility', 'hidden');
                showPhrase(result);
            }
        });
    }

    function gotBuffers(buffers) {
        audioRecorder.exportWAV(doneEncoding);
    }

    function doneEncoding(blob) {
        submit(blob);
    }

    function intentReceived(jsonresponse)
    {
        var resp = JSON.parse(jsonresponse);

        var buildString = "You want me to : ";

        var entities = resp["entities"];

        // PROCESS THE JSON FOR INTENT AND ENTITIES
        if ( resp["intents"][0]["intent"] == "AddCell") {
            // WE WANT TO ADD A CELL, SO LOOK FOR POSITION AND COLOR

            buildString += " [ADD A CELL ]";
            
            var addColor = "";
            var addPosition = "";

            for ( var i = 0; i < entities.length; i++ ) {
                if ( entities[i]["type"] == "CellColor") {
                    addColor = entities[i]["entity"];
                    buildString += " [ Color: " + entities[i]["entity"] + "] ";
                }
                if ( entities[i]["type"] == "builtin.number") {
                    addPosition = entities[i]["entity"];
                    buildString += " [ Position: " + entities[i]["entity"] + "] ";
                }
            }

            if ( addColor != "" && addPosition != "") {
                addCell(addPosition, addColor);
            }

        }
        
        if (resp["intents"][0]["intent"] == "MoveCell" )
        {
            buildString += " [MOVE A CELL ] ";

            var movePos = "";
            var moveDirection = "";

            for ( var i = 0; i < entities.length; i++ ) {
                if ( entities[i]["type"] == "builtin.number" || (entities[i]["type"] == "position") ) {
                    buildString += " [ Position: " + entities[i]["entity"] + "] ";
                    movePos = entities[i]["entity"];
                }
                if ( entities[i]["type"] == "direction") {
                    buildString += " [ Direction: " + entities[i]["entity"] + "] ";
                    moveDirection = entities[i]["entity"];
                }
            }

            if ( moveDirection != "" ) {
                console.log('before moveLastInDirection' + moveDirection);
                moveLastInDirection(moveDirection);
            }
            if ( movePos != "" ) {
                moveLastToCell(movePos);
            }
        }

        if (resp["intents"][0]["intent"] == "delete" )
        {
            buildString += " [DELETE A CELL ] ";
            var deletePosition = "";

            for ( var i = 0; i < entities.length; i++ ) {
                if ( entities[i]["type"] == "builtin.number") {
                    deletePosition = entities[i]["entity"];
                    buildString += " [ Position: " + entities[i]["entity"] + "] ";
                }
            }

            if ( deletePosition != "") {
                delCell(deletePosition);
            }
        }


        $("#txtIntent").val(buildString);

    };

    function sendPhraseToLUIS(phrase2intent)
    {
        $('#spinIntent').css('visibility', 'visible');
        $.ajax({
            url: '/luis?q=' + phrase2intent,
            type: "GET",
            data: null,
        })
        .done(function(data) {
            $('#spinIntent').css('visibility', 'hidden');
            $('#spinPhrase').css('visibility', 'hidden');
            var stringy = JSON.stringify(data, null, 4);
            intentReceived(stringy);
        })
        .fail(function() {
            $('#spinIntent').css('visibility', 'hidden');
            $('#spinPhrase').css('visibility', 'hidden');
            $("#txtIntent").val("I'm sorry, I encountered an error while deducing your intent :(");
        });
    }

    function showPhrase(output) {
        if ( output == "" || output == undefined || output == "undefined" ) {
            $("#txtPhrase").val("I couldn't understand. Please try again...");
            $('#spinIntent').css('visibility', 'hidden');
            $('#spinPhrase').css('visibility', 'hidden');
        } else {
            $("#txtPhrase").val(output);
            sendPhraseToLUIS(output);
        }
    }

    window.btnRecordDown = function (e) {

        $('#btnRecord').removeClass('btnup').addClass('btndown');
        $('#spinIntent').css('visibility', 'hidden');
        $('#spinPhrase').css('visibility', 'hidden');
        $("#txtPhrase").val("");
        $("#txtIntent").val("");

        // START CLIENT SIDE AUDIO RECORDING PROCESS
        if (!audioRecorder) return;
        audioRecorder.clear();
        audioRecorder.record();

        isRecording = true;
    };

    window.btnRecordOut = function (e) {
        if (isRecording)
            btnRecordUp(e);
    }

    window.btnRecordUp = function (e) {
        isRecording = false;
        $('#btnRecord').removeClass('btndown').addClass('btnup');

        $('#spinPhrase').css('visibility', 'visible');
        audioRecorder.stop();
        audioRecorder.getBuffers(gotBuffers);

        // EVENTUALY, WE WILL DO THIS AT THE END:
        // updateGrid();
    };

    function callbackReceivedAudioStream(stream) {

        inputPoint = audioContext.createGain();

        realAudioInput = audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        audioInput.connect(inputPoint);

        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        inputPoint.connect( analyserNode );

        audioRecorder = new Recorder( inputPoint );

        zeroGain = audioContext.createGain();
        zeroGain.gain.value = 0.0;
        inputPoint.connect( zeroGain );
        zeroGain.connect( audioContext.destination );
    };

    function initAudio() {

        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

        navigator.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }, callbackReceivedAudioStream, function (e) {
                alert('Error getting audio');
                console.log(e);
            });
    };


    function main() {
        setupGridData();
        initAudio();
    };

    window.addEventListener('load', main);

})(this);
