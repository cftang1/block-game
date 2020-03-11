var canvas = document.getElementById('tetris');
var context = canvas.getContext('2d');

context.scale(20, 20);

var previewBox = document.getElementById('preview');
var context2 = previewBox.getContext('2d');

context2.scale(10, 10);

var holdBox = document.getElementById('hold');
var context3 = holdBox.getContext('2d');

context3.scale(10, 10);

var hammer = new Hammer(document.getElementById('playArea'));

Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
}

//shuffle tempBag
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function arenaSweep() {
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    //player.score += rowCount * 10;
    player.rowCount++;
  }
  console.log('cleared ' + player.rowCount);
}
//collision detection
//if arena tile != 0 for the player matrix then collision = true
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}


//Rotation, handles offsets of the pieces when rotated
function playerRotate(dir) {
  initialPos = player.pos; // format { x: 5, y: 0 }

  player.oldRotationIndex = player.rotationIndex;
  player.rotationIndex += dir ? 1 : -1;
  player.rotationIndex = player.rotationIndex.mod(4);
  rotate(player.matrix, dir);

  //console.log('translation: ' + translation)
  translation = findOffset(player.oldRotationIndex, player.rotationIndex, 1);
  playerTranslate(translation[0], translation[1]);
  if (collide(arena, player)) {
    playerTranslate(-translation[0], -translation[1]);
    player.pos = initialPos;
    translation = findOffset(player.oldRotationIndex, player.rotationIndex, 2);
    playerTranslate(translation[0], translation[1]);
    if (collide(arena, player)) {
      playerTranslate(-translation[0], -translation[1]);
      player.pos = initialPos;
      translation = findOffset(player.oldRotationIndex, player.rotationIndex, 3);
      playerTranslate(translation[0], translation[1]);
      if (collide(arena, player)) {
        playerTranslate(-translation[0], -translation[1]);
        player.pos = initialPos;
        translation = findOffset(player.oldRotationIndex, player.rotationIndex, 3);
        playerTranslate(translation[0], translation[1]);
        if (collide(arena, player)) {
          playerTranslate(-translation[0], -translation[1]);
          player.pos = initialPos;
          translation = findOffset(player.oldRotationIndex, player.rotationIndex, 4);
          playerTranslate(translation[0], translation[1]);
          if (collide(arena, player)) {
            playerTranslate(-translation[0], -translation[1]);
            player.pos = initialPos;
            translation = findOffset(player.oldRotationIndex, player.rotationIndex, 5);
            playerTranslate(translation[0], translation[1]);
            if (collide(arena, player)) {
              playerTranslate(-translation[0], -translation[1]);
              player.rotationIndex = player.oldRotationIndex;
              player.pos = initialPos;
              rotate(player.matrix, -dir);
              console.log('rotation impossible');
              return;
            }
          }
        }
      }
    }
  }
}

function findOffset(oldRotIndex, newRotIndex, offset) {
  //debugger
  let vecA;
  let vecB;
  let endOffset = [];
  vecA = offsetData(oldRotIndex, offset);
  vecB = offsetData(newRotIndex, offset);
  endOffset[0] = vecA[0] - vecB[0];
  endOffset[1] = vecA[1] - vecB[1];
  //console.log('end offset: ' + endOffset);
  return endOffset;
}



function drawMatrix(matrix, offset) {
  //matrix.forEach((row , y) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colours[value];
        context.fillRect(
          x + offset.x,
          y + offset.y, 1, 1);
      }
    });
  });
}
function drawMatrix2(matrix, offset) {
  //matrix.forEach((row , y) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colours[value];
        context.fillRect(
          x + offset.x,
          y + offset.y - 3, 1, 1);
      }
    });
  });
}
function drawMatrix3(matrix, offset) {
  //matrix.forEach((row , y) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context2.fillStyle = colours[value];
        context2.fillRect(
          x + offset.x,
          y + offset.y - 3, 1, 1);
      }
    });
  });
}
function drawMatrix4(matrix, offset) {
  //matrix.forEach((row , y) => {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context3.fillStyle = colours[value];
        context3.fillRect(
          x + offset.x,
          y + offset.y - 3, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        value += 10; //changes colour of set pieces to darker pieces
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  player.piecesDropped++;
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
        ];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  dropCounter = 0;
  player.score += 1;
  updateStats();
  if (collide(arena, player)) {
    player.pos.y--;
    lockPiece();
  }
}

function playerAutoDrop() {
  player.pos.y++;
  dropCounter = 0;
  if (collide(arena, player)) {
    player.pos.y--;
    // lockCounter = 0;
    lockPiece();
  }
}

function lockPiece() {
  //dropCounter = 0;
  //dropCounter += deltaTime;
  //console.log(dropCounter);
  console.log(lockCounter);
  //if (dropCounter > lockInterval) {
  merge(arena, player); //disable for debugging

  playerNextPiece();        //disable for debugging
  arenaSweep();         //disable for debugging
  updateStats();

  // }
}

let lockInterval = 500;

function playerHardDrop() {
  //player.pos.y++;
  let tileCount = 0;
  dropCounter = 0;
  while (collide(arena, player) === false) {
    player.pos.y++;
    tileCount++;
  }
  if (collide(arena, player)) {
    player.pos.y--;
    player.score += tileCount * 2;
    merge(arena, player);
    playerNextPiece();
    arenaSweep();
    updateStats();
  }
}

function ghostPos() {
  while (collide(arena, ghost) === false) {
    ghost.pos.y++;
  }
  if (collide(arena, player)) {
    player.pos.y--;
  }
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerTranslate(dirX, dirY) {
  player.pos.x += dirX;
  player.pos.y += dirY;
}



function randomBag() {
  if (bag.length <= 7) {
    tempBag = shuffle(tempBag);
    bag = bag.concat(tempBag);
  }
  if (player.piecesDropped != 0) {
    bag.shift()
  }
  console.log(bag);
}

function highscore() {
  if (player.score > player.highscore) {
    player.highscore = player.score;
  }
}

function updateStats() {
  player.score += lineClearScore(player.rowCount, 1);
  player.rowCount = 0;
  setDropSpeed(player.linesCleared);
  document.getElementById('stats').innerText =
    `Highscore ${player.highscore}
    Score: ${player.score}
    Level: ${player.level}
    Lines Cleared: ${player.linesCleared}
  `;
}

function updateTimer() {
  document.getElementById('timer').innerText =
    `Time: ${msToTime(lastTime - fullTimeLost)}`;
}

let ms;
let secs;
let mins;

function msToTime(s) {
  ms = s % 1000;
  s = (s - ms) / 1000;
  secs = s % 60;
  s = (s - secs) / 60;
  mins = s % 60;
  z = (mins < 10) ? '0' : '';
  z2 = (secs < 10) ? '0' : '';
  z3 = (ms < 10) ? '0' : '';
  z4 = (ms < 100) ? '0' : '';
  return z + mins + ':' + z2 + secs + '.' + z3 + z4 + parseInt(ms);
}

function lineClearScore(rows, level) {
  player.linesCleared += rows;
  if (rows === 0) {
    return 0;
  } else if (rows === 1) {
    return 100 * level;
  } else if (rows === 2) {
    return 300 * level;
  } else if (rows === 3) {
    return 500 * level;
  } else if (rows === 4) {
    return 800 * level;
  }
}

let timeAtPause, timeAfterPause, timeLost, fullTimeLost = 0;

function togglePause() {
  if (!paused) {
    paused = true;
    console.log('Paused: ' + paused);
    timeAtPause = lastTime;
    onPause();
  } else if (paused) {
    paused = false;
    console.log('Paused: ' + paused);
    timeAfterPause = lastTime;
    timeLost = timeAfterPause - timeAtPause;
    fullTimeLost += timeLost;
    console.log('time lost ' + timeLost);
    console.log('full lost ' + fullTimeLost);

    offPause();
  }
}
let elapsedFull = 0;
function playerNextPiece() {
  randomBag();
  playerReset();
  //game over
  if (collide(arena, player)) {
    console.log('game over');
    highscore();
    startGame();
  }
}

function playerReset() {
  holdPossible = true;
  player.rotationIndex = 0;
  player.matrix = createPiece(bag[0]);
  player.curPiece = bag[0];
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);

}

function holdPiece() {
  if (!holdPossible) {
    //cant hold
    return;
  } else if (holdPossible) {
    //check to see if there is an item in the hold box
    //set holdItem = bag[0]
    //shift() bag
    //set holdPossible to false
    if (player.holdItem != null) {
      let temphold = player.holdItem;
      //swap item
      player.holdItem = bag[0];
      bag.shift();
      bag.unshift(temphold, temphold);
      playerNextPiece();
      holdPossible = false;
      console.log('swap: ' + temphold + ' with ' + player.holdItem);
    } else {
      //no current hold item, first hold
      player.holdItem = bag[0];
      bag.shift();
      playerNextPiece();
      holdPossible = false;
      console.log('hold item: ' + player.holdItem);
    }
  }
}

/////////////////// Controls

document.addEventListener('keydown', event => {
  if (event.which === 37) { //left arrow
    if (!paused) {
      playerMove(-1);
      event.preventDefault();
    }
  }
  else if (event.which === 38 || event.which === 88) { //up arrow or x
    if (!paused) {
      playerRotate(1);
      event.preventDefault();
    }
  }
  else if (event.which === 90) { //z 
    if (!paused) {
      playerRotate(0);
      event.preventDefault();
    }
  }
  else if (event.which === 39) { //right arrow
    if (!paused) {
      playerMove(1);
      event.preventDefault(); //bootleg way to stop the scroll
    }
  }
  else if (event.which === 40) { //down arrow
    if (!paused) {
      playerDrop();
      event.preventDefault();
    }
  }
  else if (event.which === 32) { //space hard drop
    if (!paused) {
      playerHardDrop();
      event.preventDefault();
    }
  }
  else if (event.which === 80) { //P key
    togglePause();
  }
  else if (event.which === 67) { //C key
    holdPiece();
  }
});

//touch controls
hammer.on("panleft panright tap press pandown panup", function(ev) {
  //myElement.textContent = ev.type +" gesture detected.";
  console.log(ev.type);
  if (ev.type === 'panleft') {
    playerMove(-1);
  } else if (ev.type === 'panright') {
    playerMove(1);
  } else if (ev.type === 'tap') {
    playerRotate(1);
  } else if (ev.type === 'press') {
    holdPiece();
  } else if (ev.type === 'pandown') {
    playerDrop();
  } else if (ev.type === 'panup') {
    playerHardDrop();
  }
});

/////////////////// Constants

let paused = false;
let initialPos;

// init bag
let tempBag = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];
let bag = [];

let dropCounter = 0;
let lockCounter = 0;
let dropInterval = 1000;
let holdPossible = true;

let lastTime = 0;

function onPause() {
  document.getElementById("overlay").style.display = "block";
}

function offPause() {
  document.getElementById("overlay").style.display = "none";
}

//offset data
function offsetData(rotationIndex, offset) {
  if (player.curPiece === 'O') {
    if (rotationIndex === 0) {
      return [0, 0];
    } else if (rotationIndex === 1) {
      return [0, 1];
    } else if (rotationIndex === 2) {
      return [-1, 1];
    } else if (rotationIndex === 3) {
      return [-1, 0];
    }
  } else if (player.curPiece === 'I') {
    if (rotationIndex === 0) {
      switch (offset) {
        case 1: return [0, 0];
        case 2: return [-1, 0];
        case 3: return [2, 0];
        case 4: return [-1, 0];
        case 5: return [2, 0];
      }
    } else if (rotationIndex === 1) {
      switch (offset) {
        case 1: return [-1, 0];
        case 2: return [0, 0];
        case 3: return [0, 0];
        case 4: return [0, -1];
        case 5: return [0, 2];
      }
    } else if (rotationIndex === 2) {
      switch (offset) {
        case 1: return [-1, -1];
        case 2: return [1, -1];
        case 3: return [-2, -1];
        case 4: return [1, 0];
        case 5: return [-2, 0];
      }
    } else if (rotationIndex === 3) {
      switch (offset) {
        case 1: return [0, -1];
        case 2: return [0, -1];
        case 3: return [0, -1];
        case 4: return [0, 1];
        case 5: return [0, -2];
      }
    }
  } else { //assume J, L, S, T, J
    if (rotationIndex === 0 || rotationIndex === 2) {
      return [0, 0];
    } else if (rotationIndex === 1) {
      switch (offset) {
        case 1: return [0, 0];
        case 2: return [1, 0];
        case 3: return [1, 1];
        case 4: return [0, -2];
        case 5: return [1, -2];
      }
    } else if (rotationIndex === 3) {
      switch (offset) {
        case 1: return [0, 0];
        case 2: return [-1, 0];
        case 3: return [-1, 1];
        case 4: return [0, -2];
        case 5: return [-1, -2];
      }
    }
  }
}

function createPiece(type) {
  if (type === 'I') {
    return [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
  } else if (type === 'J') {
    return [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ];
  } else if (type === 'L') {
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  } else if (type === 'O') {
    return [
      [0, 4, 4],
      [0, 4, 4],
      [0, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ];
  } else if (type === 'T') {
    return [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}

function setDropSpeed(linesCleared) {
  switch (Math.floor(linesCleared / 5) + 1) {
    case 1:
      player.level = 1;
      dropInterval = 1000;
      break;
    case 2:
      player.level = 2;
      dropInterval = 900;
      break;
    case 3:
      player.level = 3;
      dropInterval = 800;
      break;
    case 4:
      player.level = 4;
      dropInterval = 700;
      break;
    case 5:
      player.level = 5;
      dropInterval = 600;
      break;
    case 6:
      player.level = 6;
      dropInterval = 500;
      break;
    case 7:
      player.level = 7;
      dropInterval = 400;
      break;
    case 8:
      player.level = 8;
      dropInterval = 300;
      break;
    case 9:
      player.level = 9;
      dropInterval = 200;
      break;
    case 10:
      player.level = 10;
      dropInterval = 100;
      break;
    case 11:
      player.level = 11;
      dropInterval = 80;
      break;
    case 12:
      player.level = 12;
      dropInterval = 60;
      break;
    case 13:
      player.level = 13;
      dropInterval = 50;
      break;
    case 14:
      player.level = 14;
      dropInterval = 25;
      break;
    case 15:
      player.level = 15;
      dropInterval = 10;
      break;
  }
}

const colours = [
  null,
  '#48C9B0', //aqua   1
  '#3498DB', //blue   2
  '#D35400', //orange 3
  '#F1C40F', //yellow 4
  '#27AE60', //green  5
  '#8E44AD', //purple 6
  '#C0392B', //red    7
  'white',   //white  8
  'black',          //9
  'null',          //10
  '#0E6251',       //11
  '#1B4F72',       //12
  '#6E2C00',       //13
  '#7D6608',       //14
  '#145A32',       //15
  '#4A235A',       //16
  '#641E16',       //17
  null,
]

const arena = createMatrix(12, 23);
//do i een need this
// const preview = createMatrix(10, 20);
// const hold = createMatrix(10, 10);

const ghost = {
  pos: { x: 5, y: 0 },
}

const player = {
  pos: { x: 5, y: 0 },
  curPiece: null,
  oldRotationIndex: 0,
  rotationIndex: 0,
  holdItem: null,
  matrix: null,
  rowCount: 0, //number of consecutive lines cleared
  comboCount: 0,
  level: 1,
  score: 0,
  highscore: 0,
  linesCleared: 0,
  piecesDropped: 0,
}

/////////////////// Draw
let deltaTime = 0;
function update(time = 0) {
  deltaTime = time - lastTime;
  lastTime = time;

  if (!paused) {
    dropCounter += deltaTime;
    lockCounter += deltaTime;

    if (dropCounter > dropInterval) {
      playerAutoDrop(); //disable for debugging
    }
    updateTimer();


    draw();
    draw2();
    draw3();
  }
  requestAnimationFrame(update);
  // draw();
  // requestAnimationFrame(update);
}

function startGame() {
  bag = [];
  arena.forEach(row => row.fill(0));
  player.score = 0;
  player.linesCleared = 0;
  player.holdItem = null;
  player.piecesDropped = 0;
  bag = shuffle(tempBag);

  player.matrix = createPiece(bag[0]);
  console.log(bag);
  fullTimeLost += lastTime - fullTimeLost;
  updateStats();
}

//main game
function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: -3 });
  drawMatrix2(player.matrix, player.pos);
  drawMatrix2(player.matrix, ghost.pos);
  // draw ghost pieces
  //drawMatrix2(player.matrix, player.pos);
}

//preview
function draw2() {
  context2.fillStyle = 'black';
  context2.fillRect(0, 0, previewBox.width, previewBox.height);
  drawMatrix3(createPiece(bag[1]), previewOffset(bag[1], 1));
  drawMatrix3(createPiece(bag[2]), previewOffset(bag[2], 2));
  drawMatrix3(createPiece(bag[3]), previewOffset(bag[3], 3));
  drawMatrix3(createPiece(bag[4]), previewOffset(bag[4], 4));
  drawMatrix3(createPiece(bag[5]), previewOffset(bag[5], 5));
  drawMatrix3(createPiece(bag[6]), previewOffset(bag[6], 6));

}

//hold
function draw3() {
  context3.fillStyle = 'black';
  context3.fillRect(0, 0, holdBox.width, holdBox.height);
  if (player.holdItem != null) {
    drawMatrix4(createPiece(player.holdItem), holdOffset(player.holdItem));
  }
}

function previewOffset(piece, i) {
  if (piece === 'I') {
    return { x: 0, y: (4 * i) - 1.5 }
  } else if (piece === 'O') {
    return { x: 1, y: (4 * i) }
  } else {
    return { x: 1.5, y: 4 * i }
  }
}

function holdOffset(piece) {
  if (piece === 'I') {
    return { x: 0, y: 3.5 }
  } else if (piece === 'O') {
    return { x: 1, y: 5 }
  } else {
    return { x: 1.5, y: 4.5 }
  }
}

// playerReset();
// update();

if (!paused) {

  playerNextPiece();

  update();
}





