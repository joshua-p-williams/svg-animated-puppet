require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Gpio = require('onoff').Gpio;

const port = process.env.PORT || 8080;
const shutdownCommand = process.env.SHUTDOWN_COMMAND || null;
const speakCommand = process.env.SPEAK_COMMAND || 'espeak -v mb-en1+f3 -s 100';
const soundCommand = process.env.SOUND_COMMAND || 'aplay';
const relayPin = process.env.RELAY_PIN || null;

const allowShutdown = !!shutdownCommand;

// Establish a relay
let relay = null;
if (relayPin) {
  let pinNum = Number(relayPin);
  if (pinNum != NaN && pinNum) {
    relay = Gpio(pinNum, 'out');
  }
}

// Start the Server
http.listen(port, function () {
  console.log('Server Started. Listening on *:' + port);
});

// Express Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Render the controls
app.get('/', function (req, res) {
  res.render('controls', {
    root: __dirname,
    allowShutdown: allowShutdown,
  });
});

// Render the bot face
app.get('/bot', function (req, res) {
  res.render('bot', {
    root: __dirname
  });
});


// Functions
let executeCommand = function (cmd) {
  const { exec } = require("child_process");

  exec(cmd, (error, stdout, stderr) => {
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

let speak = function (message) {
  executeCommand(speakCommand + ' "' + message + '"');
};

let sound = function (file) {
  executeCommand(soundCommand + ' public/sound/' + file);
};


// API's
app.post('/send_command', function (req, res) {
  let command = req.body.command;
  console.log(command);
  res.send({
    'status': 'OK'
  });

  io.emit('command', command);
});

app.post('/send_speech', function (req, res) {
  let message = req.body.message;
  console.log(message);
  res.send({
    'status': 'OK'
  });

  io.emit('speak', message);
  speak(message);
});

app.post('/activate_countdown', function (req, res) {
  relay.writeSync(1);

  sound('activate_countdown.wav');

  console.log('Countdown Initiated');

  io.emit('activate-countdown');

  // Wait 10 seconds and disable the relay
  setTimeout(function () {
    relay.writeSync(0);
  }, 10000);

  res.send({
    'status': 'OK'
  });
});

app.post('/shutdown', function (req, res) {
  if (allowShutdown == '1') {
    console.log('Shutting down...');
    executeCommand(shutdownCommand);
    res.send({
      'status': 'OK'
    });
  }
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