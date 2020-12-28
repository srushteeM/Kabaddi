var database;
var player1, player2, playerAnimation1, playerAnimation2;
var posPlayer1, posPlayer2;
var gameState;
var scorePlayer1 = 0;
var scorePlayer2 = 0;


function preload() {
  playerAnimation2 = loadAnimation(
    "assets/player001.png",
    "assets/player002.png"
  );
  playerAnimation1 = loadAnimation(
    "assets/player003.png",
    "assets/player004.png"
  );
}

function setup() {
  createCanvas(600, 600);
  database = firebase.database();

  //resetting database
  reset = createButton("Reset");
  reset.position(20, 20);
  reset.mousePressed(() => {
    database.ref("/").update({
      gameState: 0,
      player1Score: 0,
      player2Score: 0,
      player1: null,
      player2: null,
    });
  });

  //reading gameState from database
  var gameStateRef = database.ref("gameState");
  gameStateRef.on("value", (data) => {
    gameState = data.val();
  });

  //reading player1Score from database
  var player1ScoreRef = database.ref("player1Score");
  player1ScoreRef.on("value", (data) => {
    scorePlayer1 = data.val();
  });

  //reading player2Score from database
  var player2ScoreRef = database.ref("player2Score");
  player2ScoreRef.on("value", (data) => {
    scorePlayer2 = data.val();
  });

  //creating sprite for player1
  player1 = createSprite(400, 300);
  player1.addAnimation("player1 moving", playerAnimation1);
  player1.setCollider("circle", 0, 0, 40);
  player1.debug = true;
  playerAnimation1.frameDelay = 200;
  player1.scale = -0.5;

  //reading player1 position from database
  var playerPositionRef1 = database.ref("player1/position");
  playerPositionRef1.on("value", (data) => {
    posPlayer1 = data.val();
    player1.x = posPlayer1.x;
    player1.y = posPlayer1.y;
  });

  //creating sprite for player2
  player2 = createSprite(200, 300);
  player2.addAnimation("player2 moving", playerAnimation2);
  player2.setCollider("circle", 0, 0, 40);
  player2.debug = true;
  playerAnimation2.frameDelay = 200;
  player2.scale = 0.5;

  //reading player2 position from database
  var playerPositionRef2 = database.ref("player2/position");
  playerPositionRef2.on("value", (data) => {
    posPlayer2 = data.val();
    player2.x = posPlayer2.x;
    player2.y = posPlayer2.y;
  });
}

function draw() {
  background("white");

  //displaying score
  textSize(20);
  fill("red");
  text("RED: " + scorePlayer2, 170, 20);
  fill("yellow");
  text("YELLOW: " + scorePlayer1, 350, 20);

  //drawing center line
  for (var num = 0; num <= 600; num = num + 20) line(300, num, 300, num + 10);

  //drawing left boundary line
  for (var num = 0; num <= 600; num = num + 20) {
    strokeWeight(3);
    stroke("yellow");
    line(100, num, 100, num + 10);
  }

  //drawing right boundary line
  for (var num = 0; num <= 600; num = num + 20) {
    strokeWeight(3);
    stroke("red");
    line(500, num, 500, num + 10);
  }

  //display toss message
  if (gameState === 0) {
    textSize(20);
    stroke("black");
    text("Press 'Space' to toss", 220, 100);
  }

  //deciding ride after toss
  if (keyDown("space") && gameState === 0) {
    resetPosition1();
    resetPosition2();
    toss = Math.round(random(1, 2));
    if (toss === 1) {
      updateState(1);
      alert("YELLOW RIDE");
    } else {
      updateState(2);
      alert("RED RIDE");
    }
  }

  //movement of player1(yellow).....left and right arrow key can be used if ride is for player1
  if (keyWentDown(LEFT_ARROW) && gameState === 1) {
    console.log("l")
    writePosition1(-5, 0);
  }
  if (keyWentDown(RIGHT_ARROW) && gameState === 1) {
    writePosition1(+5, 0);
  }
  if (keyWentDown(UP_ARROW)) {
    writePosition1(0, -5);
  }
  if (keyWentDown(DOWN_ARROW)) {
    writePosition1(0, +5);
  }

   //movement of player2(red).....a and d arrow key can be used if ride is for player2
  if (keyWentDown("a") && gameState === 2) {
    writePosition2(-5, 0);
    console.log("a")
  }
  if (keyWentDown("d") && gameState === 2) {
    writePosition2(+5, 0);
    console.log("d")
  }
  if (keyWentDown("w")) {
    writePosition2(0, -5);
  }
  if (keyWentDown("s")) {
    writePosition2(0, +5);
  }

  //if player2 ride and touches right boundary, player2 win else if touches player1 loose
  if (gameState === 2) {
    if (player2.x > 500) {
      writeScore(-5, 5);
      alert("RED WON");
      updateState(0);
    }

    if (player1.isTouching(player2)) {
      writeScore(5, -5);
      alert("RED LOST");
      updateState(0);
    }
  }

   //if player1 ride and touches left boundary, player1 win else if touches player2 loose
  if (gameState === 1) {
    if (player1.x < 100) {
      writeScore(5, -5);
      alert("YELLOW WON");
      updateState(0);
    }

    if (player1.isTouching(player2)) {
      writeScore(-5, 5);
      alert("YELLOW LOST");
      updateState(0);
    }
  }

  drawSprites();
}

//update position of player1(yellow) in database
function writePosition1(x, y) {
  database.ref("player1/position").update({
    x: posPlayer1.x + x,
    y: posPlayer1.y + y,
  });
}

//update position of player2(red) in database
function writePosition2(x, y) {
  database.ref("player2/position").update({
    x: posPlayer2.x + x,
    y: posPlayer2.y + y,
  });
 
}

//update gameState in database
function updateState(s) {
  database.ref("/").update({
    gameState: s,
  });
}

//update scores in database
function writeScore(s1, s2) {
  database.ref("/").update({
    player1Score: scorePlayer1 + s1,
    player2Score: scorePlayer2 + s2,
  });
}

//update position of player1(yellow) in database when reset is clicked
function resetPosition1() {
  database.ref("player1/position").set({
    x: 400,
    y: 300,
  });
}

//update position of player2(red) in database when reset is clicked
function resetPosition2() {
  database.ref("player2/position").set({
    x: 200,
    y: 300,
  });
}

