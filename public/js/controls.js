$(function () {

  let lastMessage = null;

  const sendSpeech = function (message) {
    var speak = message || lastMessage;
    if (speak) {
      lastMessage = speak;
      $.ajax({
          url: '/send_speech',
          type: 'POST',
          dataType: 'json',
          data: {
              'message': speak
          },
          success: function (response) {
            console.log(response);
          }
      });
    }
  };

  const playSoundEffect = function () {
    var effect = $.trim($('#sound-effect').val()).toLowerCase();
    if (effect) {
      $.ajax({
          url: '/sound_effect',
          type: 'POST',
          dataType: 'json',
          data: {
              'effect': effect
          },
          success: function (response) {
            console.log(response);
          }
      });
    }
  };

  const sendCommand = function (command) {
    if (command) {
      $.ajax({
          url: '/send_command',
          type: 'POST',
          dataType: 'json',
          data: {
              'command': command
          },
          success: function (response) {
            console.log(response);
          }
      });
    }
  };

  const handleSpeakButton = function () {
    const message = $.trim($('#message').val());
    sendSpeech(message);
    $('#message').val('');
  };

  const loadScriptFile = function (file) {
    const scriptRunner = $('#script-runner');
    scriptRunner.show();

    const scriptLine = $('#script-line');
    scriptLine.empty();

    const reader = new FileReader();
    reader.onload = (event) => {
        const file = event.target.result;
        const allLines = file.split(/\r\n|\n/);
        // Reading line by line
        allLines.forEach((line) => {
          scriptLine.append($("<option />").val(line).text(line));
        });
    };

    reader.onerror = (event) => {
        alert(event.target.error.name);
    };

    reader.readAsText(file);
  };

  $('#script-file').on('change', function() {
    const scriptFile = $('#script-file');
    if (scriptFile.val()) {
      const file = scriptFile.prop('files')[0];
      loadScriptFile(file);
    }
  });

  $('#script-line-button').click(function () {
    const scriptLine = $('#script-line');
    const message = $.trim(scriptLine.val());
    if (message) {
      sendSpeech(message);
      var currentlySelected = $('#script-line option:selected');
      $("#script-line > option").each(function() {
        $(this).removeAttr('selected');
      });      
      currentlySelected.next().attr('selected', 'selected');      
    }
  });

  $('#speak-button').click(function () {
    handleSpeakButton();
  });

  $('#message').keypress(function(event) {
    if (event.keyCode == 13) {
      handleSpeakButton();
    }
  });  

  $('#sound-effect-button').click(function () {
    playSoundEffect();
  });

  $('#reset-button').click(function () {
    sendCommand('reset');
  });

  $('#activate-countdown-button').click(function () {
      $.ajax({
          url: '/activate_countdown',
          type: 'POST',
          dataType: 'json',
          success: function (response) {
            console.log(response);
          }
      });
  });

  $('#shutdown-button').click(function () {
    if (confirm('Are you sure you want to shutdown the bot?')) {
      $.ajax({
          url: '/shutdown',
          type: 'POST',
          dataType: 'json',
          success: function (response) {
            console.log(response);
          }
      });
    }    
  });

  $('#image-file').on('change', function() {
    const imageFile = $('#image-file');
    if (imageFile.val()) {
      const file = imageFile.prop('files')[0];
      loadImageFile(file);
    }
  });

  const loadImageFile = function (file) {
    const imageLoader = $('#image-loader');
    imageLoader.show();

    const imgToLoad = $('#image-to-load');
    imgToLoad.empty();

    const imgList = $('#image-list');

    const imgReader = new FileReader();
    imgReader.onload = (event) => {
      var img = $("<img width='111' src='#'>");
      img.attr('src', event.target.result);
      imgList.append(img);
    };

    imgReader.onerror = (event) => {
        alert(event.target.error.name);
    };

    imgReader.readAsDataURL(file);
  };

});