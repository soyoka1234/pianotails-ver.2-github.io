let lanes = 5;
let laneWidth;
let notes = [];
let score = 0;
let speed = 5;
let keys = ['A', 'S', 'D', 'F', 'G'];

// ゲームの状態管理: "START", "PLAY", "GAMEOVER"
let gameState = "START"; 
let misses = 0;
let maxMisses = 5;

function setup() {
  createCanvas(400, 600);
  laneWidth = width / lanes;
}

function draw() {
  background(20); // 黒っぽい背景

  if (gameState === "START") {
    drawStartScreen();
  } else if (gameState === "PLAY") {
    drawPlayScreen();
  } else if (gameState === "GAMEOVER") {
    drawGameOverScreen();
  }
}

// --- 画面描画の関数切り分け ---

// 1. スタート画面
function drawStartScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("PIANO TILES", width / 2, height / 2 - 50);
  
  textSize(16);
  text("Press [A] [S] [D] [F] [G] Keys", width / 2, height / 2 + 10);
  text("Allowed Misses: " + maxMisses, width / 2, height / 2 + 40);
  
  // スタートボタンの描画
  fill(255);
  rectMode(CENTER);
  rect(width / 2, height / 2 + 100, 150, 40, 5);
  
  fill(0);
  textSize(18);
  text("START", width / 2, height / 2 + 100);
  rectMode(CORNER); // 元に戻す
}

// 2. プレイ画面
function drawPlayScreen() {
  // レーンの境界線を描画
  stroke(60);
  for (let i = 1; i < lanes; i++) {
    line(i * laneWidth, 0, i * laneWidth, height);
  }

  // タイル（ノーツ）の更新と描画
  for (let i = notes.length - 1; i >= 0; i--) {
    let note = notes[i];
    note.y += speed; // 下に落ちる

    // タイルの描画
    fill(0);
    stroke(200);
    strokeWeight(2);
    rect(note.lane * laneWidth, note.y, laneWidth, note.h);

    // 画面外に出たら削除（見逃し判定＝ミス！）
    if (note.y > height) {
      notes.splice(i, 1);
      misses++;
      checkGameOver();
    }
  }

  // 鍵盤（判定エリア）の描画
  let judgeZoneY = height - 80;
  for (let i = 0; i < lanes; i++) {
    if (keyIsPressed && key.toUpperCase() === keys[i]) {
      fill(150);
    } else {
      fill(255);
    }
    noStroke();
    rect(i * laneWidth, judgeZoneY, laneWidth, 80);

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text(keys[i], i * laneWidth + laneWidth / 2, judgeZoneY + 40);
  }

  // 一定の確率でノーツを生成
  if (frameCount % 40 === 0) {
    let randomLane = floor(random(lanes));
    notes.push({
      lane: randomLane,
      y: -100,
      h: 100
    });
  }

  // UI表示（スコアと残りのライフ）
  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  
  // ミス数の表示（×マークで表現）
  textAlign(RIGHT, TOP);
  let lifeText = "";
  for(let i = 0; i < maxMisses; i++) {
    if (i < maxMisses - misses) {
      lifeText += "● "; // 残りライフ
    } else {
      lifeText += "× "; // ミスした分
    }
  }
  text(lifeText, width - 20, 20);
}

// 3. ゲームオーバー画面
function drawGameOverScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(36);
  fill(255, 100, 100);
  text("GAME OVER", width / 2, height / 2 - 50);
  
  fill(255);
  textSize(24);
  text("Final Score: " + score, width / 2, height / 2 + 10);
  
  textSize(16);
  text("Click anywhere to Restart", width / 2, height / 2 + 70);
}

// --- 判定・入力の処理 ---

function checkGameOver() {
  if (misses >= maxMisses) {
    gameState = "GAMEOVER";
  }
}

// マウスクリック時の処理（ボタン判定）
function mousePressed() {
  if (gameState === "START") {
    // スタートボタンの範囲内がクリックされたか判定
    if (mouseX > width/2 - 75 && mouseX < width/2 + 75 && mouseY > height/2 + 80 && mouseY < height/2 + 120) {
      startGame();
    }
  } else if (gameState === "GAMEOVER") {
    // ゲームオーバー時は画面クリックでいつでも再スタート
    gameState = "START";
  }
}

// キーが押された瞬間の判定
function keyPressed() {
  if (gameState !== "PLAY") return;

  let judgeZoneY = height - 80;
  let currentKey = key.toUpperCase();
  let hit = false;

  // 押されたキーに対応するレーンがあるか
  for (let i = 0; i < lanes; i++) {
    if (currentKey === keys[i]) {
      // そのレーンにある一番下のタイルを探す
      for (let j = 0; j < notes.length; j++) {
        let note = notes[j];
        if (note.lane === i) {
          // タイルの下部が判定エリアに重なっているかチェック
          if (note.y + note.h > judgeZoneY && note.y < height) {
            score += 10;
            notes.splice(j, 1);
            hit = true;
            break;
          }
        }
      }
      
      // 何も無いところでキーを押してしまったら空振りミス
      if (!hit) {
        misses++;
        checkGameOver();
      }
    }
  }
}

// ゲームの初期化
function startGame() {
  notes = [];
  score = 0;
  misses = 0;
  gameState = "PLAY";
}
