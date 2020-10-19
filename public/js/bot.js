const socket = io();

// Mouth animation variables
let mouthSyllableDuration = animationSyllableDuration || 100;
let mouthSyllableRamp = animationSyllableRamp || 5;
let mouthSyllableDelay = animationSyllableDelay || 45;
let mouthWordDelay = animationWordDelay || 55;
let mouthSentanceDelay = animationSentanceDelay || 580;

// Colors
const grey = '#475166';
const greyLight = '#a6aeba';

const blue = '#2184b8';
const blueLight = '#5b9db5';

const blueGreen = '#24a7b5';
const blueGreenLight = '#7dbec0';

const green = '#9dba5e';
const greenLight = '#d0dcae';

const white = '#f6fbf9'

// Bot Parts
let mouth = null;
let bot = null;
let rightEar = null;
let leftEarTop = null;
let leftEarBottom = null;
let satelliteDish = null;
let botBody = null;
let eyeMask = null;
let rightEye = null;
let leftEye = null;
let rightIris = null;
let leftIris = null;
let rightCheek = null;
let leftCheeck = null;

// Animation points
const mouthClosed = 'm313.5,287.204936l6.500015,0l0,0c3.589859,0 6.500015,32.907077 6.500015,73.500015c0,40.592944 -2.910155,73.500015 -6.500015,73.500015l-6.500015,0l0,-147.00003z';
const mouthPartiallyOpened = 'm289.500001,311.204936l30.500013,0l0,0c16.844694,0 30.500013,32.907077 30.500013,73.500015c0,40.592944 -13.655318,73.500015 -30.500013,73.500015l-30.500013,0l0,-147.00003z';
const mouthOpened = 'm273.000001,327.704936l47.000008,0l0,0c25.957392,0 47.000008,32.907077 47.000008,73.500015c0,40.592944 -21.042617,73.500015 -47.000008,73.500015l-47.000008,0l0,-147.00003z';

const rightIrisPositions = [
  { cx: 230, cy: 236, r: 19.79899 }, // Right
  { cx: 246, cy: 236, r: 19.79899 }, // Center
  { cx: 262, cy: 236, r: 19.79899 }, // Left
];

const leftIrisPositions = [
  { cx: 382, cy: 236, r: 19.79899 }, // Right
  { cx: 398, cy: 236, r: 19.79899 }, // Center
  { cx: 414, cy: 236, r: 19.79899 }, // Left
];

const syllableCount = function (word) {
  word = word.toLowerCase(); //word.downcase!
  if (word.length <= 3) { return 1; } //return 1 if word.length <= 3
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, ''); //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, ''); //word.sub!(/^y/, '')
  return word.match(/[aeiouy]{1,2}/g).length; //word.scan(/[aeiouy]{1,2}/).size
};

const talk = function (sentance) {
  if (mouth && sentance) {
    const words = sentance.split(' ');
    let nextDelay = 0;
    if (words.length) {

      // Always start with the mouth closed, and make sure to finish an existing animation timelines
      mouth.animate().plot(mouthClosed).timeline().finish();

      for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
        let word = words[wordIndex];
        let syllables = syllableCount(word);

        for (let syllableIndex = 0; syllableIndex < syllables; syllableIndex++) {
          // How long should it take to say the syllable
          let duration = mouthSyllableDuration - (mouthSyllableRamp * syllableIndex);

          mouth
          .animate(duration, nextDelay, 'after').plot(mouthOpened)
          .animate(duration, 0, 'after').plot(mouthClosed)
          .after(function () {
            console.log(word + ' - syllable ' + (syllableIndex + 1));
          });

          nextDelay = 0;
          if (syllableIndex >= syllables -1) {
            nextDelay = mouthSyllableDelay;
          }
        }

        // How long to pause before the next word
        if (word.includes(".") || word.includes(":") || word.includes(",")) {
          nextDelay = mouthSentanceDelay;
        }
        else {
          nextDelay = mouthWordDelay;
        }
      }
    }
  }
};

const activateCountdown = function () {

  // Make sure to finish all existing animation timelines
  satelliteDish.animate().transform({rotate: 360}).timeline().finish();
  leftCheek.animate().timeline().finish();
  rightCheek.animate().timeline().finish();
  botBody.animate().timeline().finish();

  for(var i = 0; i < 5; i++) {
    satelliteDish
    .animate(1000, 0, 'after').transform({rotate: -110})
    .animate(1000, 0, 'after').transform({rotate: 360});
  }

  for(var i = 0; i < 10; i++) {
    leftCheek
    .animate(500, 0, 'after').transform({ rotate: 180 })
    .animate(500, 0, 'after').transform({ rotate: 360 });
  }

  for(var i = 0; i < 10; i++) {
    rightCheek
    .animate(500, 0, 'after').transform({ rotate: 180 })
    .animate(500, 0, 'after').transform({ rotate: 360 });
  }

  for(var i = 0; i < 10; i++) {
    botBody
    .animate(500, 0, 'after').fill(green)
    .animate(500, 0, 'after').fill(blueGreen);
  }
};

SVG.on(document, 'DOMContentLoaded', function() {

  const svg = SVG().addTo('body').attr({ viewBox: '0 0 640 480', id: 'bot-svg'});
  bot = svg.group();

  rightEar = bot.path('m95.667169,257.000446l45.832331,0c0.000129,0 0.000247,0.000048 0.000327,0.000145c0.00009,0.000097 0.00014,0.000217 0.00014,0.000362l-0.000467,49.998579c0,5.522874 -4.104066,10.00005 -9.166681,10.00005l-45.832335,0l0,0c-0.000255,0 -0.000458,-0.000228 -0.000458,-0.000503l0.000458,-49.998579l0,0c0,-5.522876 4.104064,-10.000052 9.166685,-10.000052l0,-0.000002z').fill(green).stroke({ color: greenLight, width: 3 });
  leftEarTop = bot.path('m507.387201,205.515002l45.832331,0c0.000129,0 0.000247,0.000048 0.000327,0.000145c0.00009,0.000097 0.00014,0.000217 0.00014,0.000362l-0.000467,49.998579c0,5.522874 -4.104066,10.00005 -9.166681,10.00005l-45.832335,0l0,0c-0.000255,0 -0.000458,-0.000228 -0.000458,-0.000503l0.000458,-49.998579l0,0c0,-5.522876 4.104064,-10.000052 9.166685,-10.000052l0,-0.000002z').fill(blue).stroke({ color: blueLight, width: 3 });
  leftEarBottom = bot.path('m506.667184,295.000438l45.832331,0c0.000129,0 0.000247,0.000048 0.000327,0.000145c0.00009,0.000097 0.00014,0.000217 0.00014,0.000362l-0.000467,49.998579c0,5.522874 -4.104066,10.00005 -9.166681,10.00005l-45.832335,0l0,0c-0.000255,0 -0.000458,-0.000228 -0.000458,-0.000503l0.000458,-49.998579l0,0c0,-5.522876 4.104064,-10.000052 9.166685,-10.000052l0,-0.000002z').fill(green).stroke({ color: greenLight, width: 3 });
  
  const satellite = bot.group();
  const satBase = satellite.rect({ height: 51, width: 15, x: 312, y: 87}).fill(grey).stroke({ color: greyLight, width: 3 });
  
  satelliteDish = satellite.group();      
  const satDish = satelliteDish.path('m350.972248,97.825039c-15.361947,15.361947 -39.125936,18.490392 -57.940313,7.628389c-18.814376,-10.862693 -27.987216,-33.007402 -22.364237,-53.992137c5.623001,-20.984593 24.639264,-35.576292 46.363974,-35.576292l33.940576,81.940043l0,-0.000003z').fill(grey).stroke({ color: greyLight, width: 3 });
  const satStem = satelliteDish.path('m338.248484,63.304706l3.749997,-27.007346l12.499992,0l3.749996,27.007346l-19.999986,0z').fill(grey).stroke({ color: greyLight, width: 3 });
  satStem.transform({
    rotate: 67.1501
  });

  const satBall = satelliteDish.circle({
    cx: 367,
    cy: 41,
    r: 11.439087
  }).fill(green).stroke({ color: greyLight, width: 3 });


  botBody = bot.path('m179.004293,126.99985l281.994948,0l0,0c18.698058,0 36.630192,6.128321 49.851657,17.036822c13.221465,10.908501 20.64923,25.703604 20.64923,41.130546l0,290.829884c0,0.001569 -0.001647,0.002893 -0.003549,0.002893l-422.99316,-0.002893l0,0c-0.00193,0 -0.003549,-0.001288 -0.003549,-0.002928l0.003549,-290.826944l0,0c0,-32.124955 31.564276,-58.167368 70.500873,-58.167368l0,-0.000012z').fill(blueGreen).stroke({ color: blueGreenLight, width: 3 });
  eyeMask = bot.path('m135.000006,207.065675l108.955707,-36.025674l154.088559,0l108.955707,36.025674l0,50.948641l-108.955707,36.025678l-154.088559,0l-108.955707,-36.025678l0,-50.948641z').fill(blue).stroke({ color: blueLight, width: 3 });

  rightEye = bot.group()
  const rightEyeBall = rightEye.ellipse({
    cx: 245, 
    cy: 231.999997,
    rx: 39,
    ry: 54.999998
  }).fill(white).stroke({ color: grey, width: 3 });

  rightIris = rightEye.circle(rightIrisPositions[1]).stroke({ color: greyLight, width: 3 });
  
  leftEye = bot.group();
  const leftEyeBall = leftEye.ellipse({
    cx: 397, 
    cy: 232.999997,
    rx: 39,
    ry: 54.999998
  }).fill(white).stroke({ color: grey, width: 3 });

  leftIris = leftEye.circle(leftIrisPositions[1]).stroke({ color: greyLight, width: 3 });

  rightCheek = bot.path('m146.799159,370.99482l30.654826,-30.654843l30.659888,30.654843l-30.659888,30.654896l-30.654826,-30.654896zm-34.519141,34.718616l30.659897,-30.654835l30.654839,30.654835l-30.654839,30.659972l-30.659897,-30.659972zm69.690239,0.626117l30.65995,-30.649861l30.649803,30.649861l-30.649803,30.659875l-30.65995,-30.659875zm-34.509175,34.72366l30.649821,-30.654883l30.659998,30.654883l-30.659998,30.655073l-30.649821,-30.655073z').fill(blue).stroke({ color: blueLight, width: 3 });
  leftCheek = bot.path('m431.019145,371.465691l30.654826,-30.654843l30.659888,30.654843l-30.659888,30.654896l-30.654826,-30.654896zm-34.519141,34.718616l30.659897,-30.654835l30.654839,30.654835l-30.654839,30.659972l-30.659897,-30.659972zm69.690239,0.626117l30.65995,-30.649861l30.649803,30.649861l-30.649803,30.659875l-30.65995,-30.659875zm-34.509175,34.72366l30.649821,-30.654883l30.659998,30.654883l-30.659998,30.655073l-30.649821,-30.655073z').fill(blue).stroke({ color: blueLight, width: 3 });

  mouth = bot.path(mouthClosed).stroke({ color: grey, width: 3 });
  mouth.rotate(90);

  // Make the ball blink and the ears
  satBall.animate(1000, '<>').attr({ fill: blue }).loop(true, true);
  rightEar.animate(2000, '<>').attr({ fill: blue, stroke: blueLight }).loop(true, true);
  leftEarTop.animate(2000, '<>').attr({ fill: green, stroke: greenLight }).loop(true, true);
  leftEarBottom.animate(2000, '<>').attr({ fill: blue, stroke: blueLight }).loop(true, true);

  // Blink
  setInterval(function () {
    leftEye.animate(200, '<>').attr({ opacity: 0 }).after(
      function () {
        leftEye.animate(100, '<>').attr({ opacity: 1 })
      }
    )

    rightEye.animate(200, '<>').attr({ opacity: 0 }).after(
      function () {
        rightEye.animate(100, '<>').attr({ opacity: 1 })
      }
    )
  }, 4000);

  // Eye Movement
  setInterval(function () {
    const irisPosition = Math.floor(Math.random() * 3);
    rightIris.animate(100, '<>').attr(rightIrisPositions[irisPosition])
    leftIris.animate(100, '<>').attr(leftIrisPositions[irisPosition])
  }, 2000);
});

socket.on('command', function (command) {
  if (command === 'reset') {
    location.reload(true);
  }
});  

socket.on('speak', function (message) {
  talk(message);
});  

socket.on('activate-countdown', function () {
  activateCountdown();
});  
