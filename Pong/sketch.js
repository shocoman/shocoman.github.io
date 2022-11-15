const paddleWidth = 4;
const paddleHeight = 16;

const ballWidth = 2;
const ballHeight = 4;

const gameGridStartX = 0;
const gameGridEndX = 160;

const gameGridStartY = 35;
const gameGridEndY = 195;

const scoreBarHeight = 24;
const player1ScoreX = 41;
const player2ScoreX = 122;

let paddle1_x = 16;
let paddle1_y = 210 / 2;
let paddle1Dy = 0;

let paddle2_x = 140;
let paddle2_y = 210 / 2;
let paddle2Dy = 0;

let ballX = 160 / 2;
let ballY = 210 / 2;
let ballDx = 1;
let ballDy = 2;

let player1Score = 0;
let player2Score = 0;

let scoreFont;

let lastWonPlayer = -1;

const networkGridSize = 80;
let currentScreen = [];
let prevScreen = [];
const networkScreenSize = 80;

function preload() {
  scoreFont = loadFont('FFFFORWA.TTF');
}

function setup() {
  createCanvas(320 , 210);

  let sz = networkScreenSize * networkScreenSize;
  currentScreen = new Array(sz).fill(0);
  prevScreen = new Array(sz).fill(0);
}

function convertScreen(screen) {
  // clear the screen
  for (let i = 0; i < networkScreenSize**2; i++) {
    screen[i] = 0;
  }

  // fill the paddle pixels
  for (let i = 0; i < (paddleWidth >> 1); i++) {
    for (let j = 0; j < (paddleHeight >> 1); j++) {
      let x1 = (paddle1_x >> 1) + i;
      let y1 = ((paddle1_y - gameGridStartY) >> 1) + j;
      let x2 = (paddle2_x >> 1) + i;
      let y2 = ((paddle2_y - gameGridStartY) >> 1) + j;

      screen[y1 * networkScreenSize + x1] = 1;
      screen[y2 * networkScreenSize + x2] = 1;
    } 
  }

  // fill the ball pixels
  for (let i = 0; i < (ballWidth >> 1); i++) {
    for (let j = 0; j < (ballHeight >> 1); j++) {
      let x = (ballX >> 1) + i;
      let y = ((ballY - gameGridStartY) >> 1) + j;
      screen[y * networkScreenSize + x] = 1;
    } 
  }
}

function printScreen(screen) {
  for (let i = 0; i < networkScreenSize; i++) {
    let row = '';
    for (let j = 0; j < networkScreenSize; j++) {
      let val = screen[i * networkScreenSize + j];
      row += val;
    } 
    console.log(row);
  }
}

function drawScreen(screen) {
  let startPositionX = 160; 
  let startPositionY = gameGridStartY; 
  for (let i = 0; i < networkScreenSize; i++) {
    for (let j = 0; j < networkScreenSize; j++) {
      let val = screen[i * networkScreenSize + j];

      fill(val > 0  ? 0 : 140); 
      rect(startPositionX + (j<<1),startPositionY + (i<<1),2,2); 
    } 
  }
}

function drawScreenDifference(screen, prevScreen) {
  let startPositionX = 160; 
  let startPositionY = gameGridStartY; 
  for (let i = 0; i < networkScreenSize; i++) {
    for (let j = 0; j < networkScreenSize; j++) {
      let val = screen[i * networkScreenSize + j];
      let prevVal = prevScreen[i * networkScreenSize + j];

      let diff = (val - prevVal);
      let absDiff = abs(val - prevVal);
      fill(val == 1 ? 0 : 140); 
      if (diff < 0) {
        fill(128,0,0); 
      } else if (diff > 0) {
        fill(0,128,0); 
      }

      rect(startPositionX + (j<<1),startPositionY + (i<<1),2,2); 
    } 
  }
}

function draw() {
  update();

  noStroke();
  background(220);
 
  // Score board
  fill(color('#ececec')); 
  rect(0, 0, 160, gameGridStartY);
  fill(color('#984c0d')); 
  rect(0, 0, 160, scoreBarHeight);

  // score text
  textFont(scoreFont);
  textAlign(CENTER, TOP);
  fill(color('#d58749'));
  text(player1Score, player1ScoreX, 5);
  fill(color('#55ad57'));
  text(player2Score, player2ScoreX, 5);

  // bottom bar
  fill(color('#ececec')); 
  rect(0, gameGridEndY, 160, 210 - gameGridEndY);

  // background
  fill(color('#984c0d'))
  rect(0, gameGridStartY, 160, gameGridEndY-gameGridStartY);

  // left paddle
  fill(color('#d58749'));
  rect(paddle1_x, paddle1_y, paddleWidth, paddleHeight);

  // right paddle
  fill(color('#55ad57'));
  rect(paddle2_x, paddle2_y, paddleWidth, paddleHeight);

  // ball
  fill(color('#ffdb9f')); 
  rect(ballX, ballY, ballWidth, ballHeight);

  [currentScreen, prevScreen] = [prevScreen, currentScreen]; 
  convertScreen(currentScreen);
  // drawScreen(currentScreen);
  drawScreenDifference(currentScreen, prevScreen);
}

function update() {
  ballX += ballDx;
  ballY += ballDy;

  if (ballX < gameGridStartX) {
    ballX = 0;
    player2Score += 1;
    lastWonPlayer = 2;
    respawnBall();
    // ballDx *= -1; 
  } else if (ballX + ballWidth >= gameGridEndX) {
    ballX = gameGridEndX - ballWidth - 1
    lastWonPlayer = 1;
    player1Score += 1;
    respawnBall();
    // ballDx *= -1; 
  }

  if (ballY < gameGridStartY) {
    ballY = gameGridStartY
    ballDy *= -1;  
  } else if (ballY + ballHeight >= gameGridEndY) {
    ballY = gameGridEndY - ballHeight - 1
    ballDy *= -1; 
  }  

  let paddle1Collision = AABB(ballX, ballY, ballWidth, ballHeight, paddle1_x, paddle1_y, paddleWidth, paddleHeight);
  let paddle2Collision = AABB(ballX, ballY, ballWidth, ballHeight, paddle2_x, paddle2_y, paddleWidth, paddleHeight);
  if (paddle1Collision) {
    ballDx = 1;
    if (ballY < paddle1_y) {
      ballDy = -abs(ballDy); 
    } else if (ballY + ballHeight > paddle1_y + paddleHeight) {
      ballDy = abs(ballDy); 
    }
  } else if (paddle2Collision) {
    ballDx = -1;
    if (ballY < paddle2_y) {
      ballDy = -abs(ballDy); 
    } else if (ballY + ballHeight > paddle2_y + paddleHeight) {
      ballDy = abs(ballDy); 
    }
  }

  paddle1_y += paddle1Dy;
  paddle2_y += paddle2Dy;

  if (paddle1_y < gameGridStartY) {
    paddle1_y = gameGridStartY;
  }
  if (paddle2_y < gameGridStartY) {
    paddle2_y = gameGridStartY;
  }

  if (paddle1_y + paddleHeight >= 210) {
    paddle1_y = 210 - paddleHeight - 1;
  }
  if (paddle2_y + paddleHeight >= 210) {
    paddle2_y = 210 - paddleHeight - 1;
  }
}

function respawnBall() {
  ballX = 160 / 2 + ballWidth/2;
  ballY = 210 / 2 + ballHeight/2;

  ballDx *= -1;
  ballDy = Math.random() > 0.5 ? ballDy : -ballDy;
}


function keyPressed() {
  if (keyCode === UP_ARROW) {
    paddle1Dy = -2;
  } else if (keyCode === DOWN_ARROW) {
    paddle1Dy = +2;
  } 
  
  if (key === 'z') {
    convertScreen(currentScreen);
    printScreen(currentScreen);
    console.log(123);
  }

  if (key === 'w') {
    paddle2Dy = -2;
  } else if (key === 's') {
    paddle2Dy = +2;
  }
}

function keyReleased() {
  if (keyCode === UP_ARROW && paddle1Dy < 0 || keyCode === DOWN_ARROW && paddle1Dy > 0) {
    paddle1Dy = 0;
  }
  if (key === 'w' && paddle2Dy < 0 || key === 's' && paddle2Dy > 0) {
    paddle2Dy = 0;
  }
}


function AABB (a_x, a_y, a_w, a_h, b_x, b_y, b_w, b_h) {
  if (
    a_x < b_x + b_w &&
    a_x + a_w > b_x &&
    a_y < b_y + b_h &&
    a_h + a_y > b_y
  ) {
    return true;
  } else {
    return false;
  }
}