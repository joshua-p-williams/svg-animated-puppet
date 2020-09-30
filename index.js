var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8080;

let speak = function (message) {
  const { exec } = require("child_process");

  exec('espeak -v mb-en1+f3 -s 100 "' + message + '"', (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
};

let sound = function (file) {
  const { exec } = require("child_process");

  exec('aplay public/sound/' + file, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
  });
};

// Start the Server
http.listen(port, function () {
  console.log('Server Started. Listening on *:' + port);
});

// Express Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Render Main HTML file
app.get('/', function (req, res) {
  res.sendFile('views/index.html', {
    root: __dirname
  });
});

app.get('/bot', function (req, res) {
  res.sendFile('views/bot.html', {
    root: __dirname
  });
});


// API
app.post('/send_command', function (req, res) {
  var command = req.body.command;
  console.log(command);
  res.send({
    'status': 'OK'
  });

  io.emit('command', command);
});

app.post('/send_speech', function (req, res) {
  var message = req.body.message;
  console.log(message);
  res.send({
    'status': 'OK'
  });

  io.emit('speak', message);
  speak(message);
});

app.post('/time_machine', function (req, res) {
  sound('time_machine.wav');
  console.log('Time travel initiated');
  res.send({
    'status': 'OK'
  });
  io.emit('time-machine');
});


// Socket Connection
// UI Stuff
io.on('connection', function (socket) {

  console.log('Connection to socket established');

  // Fire 'send' event for updating Message list in UI
  socket.on('message', function (data) {
    console.log('Received a socket message');
    console.log(data);
  });
});