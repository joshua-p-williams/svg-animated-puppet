$(function () {

  let lastMessage = null;

  const sendSpeech = function () {
    var message = $.trim($('#message').val());
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

      $('#message').val('');
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

  $('#speak-button').click(function () {
    sendSpeech();
  });

  $('#reset-button').click(function () {
    sendCommand('reset');
  });

  $('#message').keypress(function(event) {
    if (event.keyCode == 13) {
      sendSpeech();
    }
  });  

  $('#activate-countdown-button').click(function () {
      var message = $.trim($('#message').val());
      $.ajax({
          url: '/activate_countdown',
          type: 'POST',
          dataType: 'json',
          success: function (response) {
            console.log(response);
          }
      });
  });
});