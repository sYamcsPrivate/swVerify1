let canvas;
let ctx;
let cellSize = 8;   // セル1マスのサイズ
let cols;
let rows;
let cells = new Array();
let buttonStart;
let buttonReset;
let timer1;
let running = false;
let xy = 100; //100*100固定

// 配置：ランダム
let randomCells = () => {
  logger("dom","app-lg-random start");
  for(col=0;col<cols;col++){
    cells[col] = new Array();
    for(row=0;row<rows;row++){
      cells[col][row] = Math.round( Math.random());
    }
  }
  redraw();
  modalArea.classList.toggle('is-show');
};
 
// 配置：グライダー
let gliderCells = () => {
  logger("dom","app-lg-glider start");

  cells[1][1] = 1;
  cells[2][1] = 1;
  cells[3][1] = 1;
  cells[1][2] = 1;
  cells[2][2] = 0;
  cells[3][2] = 0;
  cells[1][3] = 0;
  cells[2][3] = 1;
  cells[3][3] = 0;

  modalArea.classList.toggle('is-show');
  redraw();
};
 
// 配置：ブリーダー
let breederCells = () => {
  logger("dom","app-lg-breeder start");

  cells[1][1] = 1;
  cells[2][1] = 1;
  cells[3][1] = 1;
  cells[4][1] = 1;
  cells[5][1] = 1;
  cells[6][1] = 1;
  cells[7][1] = 1;
  cells[8][1] = 1;
  cells[10][1] = 1;
  cells[11][1] = 1;
  cells[12][1] = 1;
  cells[13][1] = 1;
  cells[14][1] = 1;
  cells[18][1] = 1;
  cells[19][1] = 1;
  cells[20][1] = 1;
  cells[27][1] = 1;
  cells[28][1] = 1;
  cells[29][1] = 1;
  cells[30][1] = 1;
  cells[31][1] = 1;
  cells[32][1] = 1;
  cells[33][1] = 1;
  cells[35][1] = 1;
  cells[36][1] = 1;
  cells[37][1] = 1;
  cells[38][1] = 1;
  cells[39][1] = 1;

  modalArea.classList.toggle('is-show');
  redraw();
};
 
// セルを描画
let drawCell = (x, y) => {
  let value = cells[x][y];
  let style = value ? "rgb(156, 255,0)" : "rgb(40,40,40)"; 
  ctx.fillStyle = style;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
};
 
// 全体を再描画
let redraw = () => {
  for(col=0;col<cols;col++){
    for(row=0;row<rows;row++){
      drawCell(col, row);
    }
  }
};
 
// 周囲の生存セルを数える - 有限版(Finite)
let countAroundFinite = (x, y) => {
  let count = 0;
  for(i=-1;i<=1;i++){
    for(j=-1;j<=1;j++){
      if(
          (i != 0 || j != 0) &&
          x + i >= 0 && x + i < cols &&
          y + j >= 0 && y + j < rows
      ) {
        count += cells[x + i][y + j];
      }
    }
  }
  return count;
};

// 周囲の生存セルを数える - 無限版(Infinite)
let countAround = (x, y) => {
  let count = 0;
  let provX = 0;
  let provY = 0;
  for(i=-1;i<=1;i++){
    provX = x + i;
    if (provX < 0) provX = cols - 1;
    if (provX >= cols) provX = 0;
    for(j=-1;j<=1;j++){
      provY = y + j;
      if (provY < 0) provY = rows - 1;
      if (provY >= rows) provY = 0;
      if (i != 0 || j != 0) count += cells[provX][provY];
    }
  }
  return count;
};
 
// 世代を進行させる
let nextGeneration = () => {
  let tmpCells = new Array();
  for(col=0;col<cols;col++){
    tmpCells[col] = new Array();
    for(row=0;row<rows;row++){
      var count = countAround(col, row);
      if(cells[col][row]){
        if(count == 2 || count == 3){
          tmpCells[col][row] = 1;
        } else {
          tmpCells[col][row] = 0;
        }
      } else {
        if(count == 3){
          tmpCells[col][row] = 1;
        } else {
          tmpCells[col][row] = 0;
        }
      }
    }
  }
  cells = tmpCells;
  redraw();
};

// 開始
let onStart = () => {
  logger("dom","app-lg-start start");
  if(running){
    clearInterval(timer1);
    buttonStart.innerText = "Start";
    running = false;
  } else {
    nextGeneration();
    timer1 = setInterval("nextGeneration()", 100);
    buttonStart.innerText = "Stop";
    running = true;
  }
};
 
// Canvasクリック
let canvasClick = (e) => {
  //上位で縮小表示しているためクリックした位置を縮小倍率で仮想算出
  let x = (e.clientX / 0.7) - canvas.offsetLeft;
  let y = (e.clientY / 0.7) - canvas.offsetTop;
  let col = Math.floor(x / cellSize);
  let row = Math.floor(y / cellSize);
  cells[col][row] = !cells[col][row];
  drawCell(col, row);
};

// セル初期化
let initCells = () => {
  logger("dom","app-lg-reset start");
  ctx.fillStyle = 'rgb(60, 60, 60)';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  for(col=0;col<cols;col++){
    cells[col] = new Array();
    for(row=0;row<rows;row++){
      cells[col][row] = 0;
    }
  }
  redraw();
};
 
// アプリ初期処理
lifeGameInit = () => {
  logger("dom","lifeGameInit start");
  console.log(getYMDHMSM() + "|dom|lifeGameInit start");

  //キャンバス準備
  canvas = document.getElementById('lifegame');
  let base;
  let appWidth = document.getElementById('app-body').clientWidth;
  let appHeight = document.getElementById('app-body').clientHeight - 60; //ボタン部分を除く

  logger("dom","appWidth:" + appWidth + ",appHeight:" + appHeight);
  console.log(getYMDHMSM() + "|dom|appWidth:" + appWidth + ",appHeight:" + appHeight);

  if (appWidth < appHeight) {
    base = parseInt( appWidth );
  } else {
    base = parseInt( appHeight );
  }
  canvas.setAttribute("width", base.toString(10));
  canvas.setAttribute("height", base.toString(10));
  cellSize = parseInt(base / xy);

  ctx = canvas.getContext('2d');
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);

  //キャンバス初期化
  initCells();

  //キャンバスクリックイベント
  canvas.addEventListener('click', canvasClick, false);

  //メイン画面ボタンイベント
  buttonStart = document.getElementById('app-lg-start');
  buttonReset = document.getElementById('app-lg-reset');
  buttonStart.addEventListener('click', onStart, false);
  buttonReset.addEventListener('click', initCells, false);

  //メニューボタンイベント
  document.getElementById('app-lg-random').addEventListener("click", randomCells, false);
  document.getElementById('app-lg-glider').addEventListener('click', gliderCells, false);
  document.getElementById('app-lg-breeder').addEventListener('click', breederCells, false);

};
