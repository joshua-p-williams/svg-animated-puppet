$(function () {
  $('#speak-button').click(function () {
      var message = $.trim($('#message').val());
      $.ajax({
          url: '/send_message',
          type: 'POST',
          dataType: 'json',
          data: {
              'message': message
          },
          success: function (response) {
            console.log(response);
          }
      });
  });

  $('#time-machine-button').click(function () {
      var message = $.trim($('#message').val());
      $.ajax({
          url: '/time_machine',
          type: 'POST',
          dataType: 'json',
          data: {
              'count': 5
          },
          success: function (response) {
            console.log(response);
          }
      });
  });
});