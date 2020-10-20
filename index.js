require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Gpio = require('onoff').Gpio;

const port = process.env.PORT || 8080;
const shutdownCommand = process.env.SHUTDOWN_COMMAND || null;
const speakCommand = process.env.SPEAK_COMMAND || 'espeak -v mb-en1+f3 -s 50 -p 20 ';
const soundCommand = process.env.SOUND_COMMAND || 'aplay';
const relayPin = process.env.RELAY_PIN || null;
const animationSyllableDuration = process.env.ANIMATION_SYLLABLE_DURATION || 100;
const animationSyllableRamp = process.env.ANIMATION_SYLLABLE_RAMP || 5;
const animationSyllableDelay = process.env.ANIMATION_SYLLABLE_DELAY || 45;
const animationWordDelay = process.env.ANIMATION_WORD_DELAY || 55;
const animationSentanceDelay = process.env.ANIMATION_SENTANCE_DELAY || 580;


const allowShutdown = !!shutdownCommand;

// Establish a relay
let relay = null;
if (relayPin) {
  let pinNum = Number(relayPin);
  if (pinNum != NaN && pinNum) {
    relay = new Gpio(pinNum, 'out');
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
    root: __dirname,
    animationSyllableDuration: animationSyllableDuration,
    animationSyllableRamp: animationSyllableRamp,
    animationSyllableDelay: animationSyllableDelay,
    animationWordDelay: animationWordDelay,
    animationSentanceDelay: animationSentanceDelay
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

let setRelayState = function (state) {
  if (relay) {
    console.log('Relay state set to ' + state);
    relay.writeSync(state);
  }
};

let enableRelayFor = function (delay) {
  if (relay) {
    setRelayState(1);

    setTimeout(function () {
      relay.writeSync(0);
    }, delay);
  }
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

  enableRelayFor(10000);

  sound('activate_countdown.wav');

  console.log('Countdown Initiated');

  io.emit('activate-countdown');

  res.send({
    'status': 'OK'
  });
});

app.post('/sound_effect', function (req, res) {
  let effect = req.body.effect;
  console.log(effect);
  sound(effect + '.wav');
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