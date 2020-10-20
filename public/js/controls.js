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

  $('#speak-button').click(function () {
    sendSpeech();
  });

  $('#sound-effect-button').click(function () {
    playSoundEffect();
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
});