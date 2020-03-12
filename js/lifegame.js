let canvas;
let ctx;
let cellSize = 8;   // セル1マスの暫定サイズ
let cols;
let rows;
let cells = new Array();
let cellsN1 = new Array(); //1世代前
let cellsN2 = new Array(); //2世代前
let buttonStart;
let buttonReset;
let timer1;
let running = false;
let base; //キャンバスサイズの基底サイズ
let xy = 100; //一辺の大きさ
let gen = 0; //世代数
let elGen; //世代数表示要素
let endlessFlg = false; //安定→random→onStart

// 配置：ランダム
let randomCells = () => {
  logger("dom","app-lg-random start");
  for(col=0;col<cols;col++){
    cells[col] = new Array();
    for(row=0;row<rows;row++){
      let r = Math.random();
      if (r < 0.2) {
        cells[col][row] = 1;
      } else {
        cells[col][row] = 0;
      }
    }
  }
  redraw();
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

  redraw();
};
 
// 設定：サイズ変更
let sizeChange = () => {
  let strSize = document.getElementById('app-lg-size-sel').value;
  logger("dom","sizeChange start:" + strSize);
  console.log(getYMDHMSM() + "|dom|sizeChange start:" + strSize);
  document.getElementById('app-lg-size-sel-disp').innerText = strSize;
  xy = parseInt(strSize);
  alert("forceReset");
  initCells();
};

// 設定：エンドレスon/off
let onEndless = () => {
  logger("dom","app-lg-endless start:" + endlessFlg);
  console.log(getYMDHMSM() + "|dom|app-lg-endless start:" + endlessFlg);
  if(endlessFlg){
    buttonEndless.innerText = "AutoEnd";
    endlessFlg = false;
  } else {
    buttonEndless.innerText = "EndLess";
    endlessFlg = true;
  }
};
 
// セルを描画
let drawCell = (x, y) => {
  let value = cells[x][y];
  //let style = value ? "rgb(156, 255,0)" : "rgb(40,40,40)"; 
  let style;
  if (value == 1) {
    style = "rgb(0,0,0)";
  } else {
    let col = 255 * (1 - value);
    style = "rgb(" + col + "," + col + "," + col + ")";
  }
  ctx.fillStyle = style;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  //ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
};
 
// 全体を再描画
let redraw = () => {
  for(col=0;col<cols;col++){
    for(row=0;row<rows;row++){
      drawCell(col, row);
    }
  }
  ctx.strokeStyle = "rgb(128,128,128)";
  ctx.strokeRect(0,0, canvas.width, canvas.height);
};
 
// 周囲の生存セルを数える - 有限版(Finite) - 徐々に死ぬ実装はしていない
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
      if (i != 0 || j != 0) {
        if (cells[provX][provY] == 1) {
          count += cells[provX][provY];
        }
      }
    }
  }
  return count;
};
 
// セル死滅
let deadCell = (dcell) => {
  let res = dcell - 0.4; //徐々に死んでいくように見せる
  if (res < 0) res = 0;
  return res;
};

// 世代を進行させる
let nextGeneration = () => {
  let tmpCells = new Array();
  for(col=0;col<cols;col++){
    tmpCells[col] = new Array();
    for(row=0;row<rows;row++){
      var count = countAround(col, row);
      if(cells[col][row] == 1){
        if(count == 2 || count == 3){
          tmpCells[col][row] = 1;
        } else {
          tmpCells[col][row] = deadCell(cells[col][row]);
        }
      } else {
        if(count == 3){
          tmpCells[col][row] = 1;
        } else {
          tmpCells[col][row] = deadCell(cells[col][row]);
        }
      }
    }
  }

  //2世代前まで保管
  cellsN2 = cellsN1; //2世代前保管
  cellsN1 = cells; //1世代前保管
  cells = tmpCells;

  //2世代前と同一
  if (cells.toString() == cellsN2.toString()) {
    elGen.innerText = insComma(gen - 2 < 0 ? 0 : gen - 2);  //世代数を-2して表示

    //エンドレスモードならランダム配置して次世代へ
    if(endlessFlg) {
      randomCells();
      redraw();

    //自動停止モードなら停止処理へ
    } else {
      stopFunc();
    };

  //上記条件を満たさないのであれば次世代へ
  } else {
    elGen.innerText = insComma(++gen); //世代数を前置インクリメントして表示
    redraw();
  }
};

// 停止
let stopFunc = () => {
  logger("dom","stopFunc start gen:" + gen);
  clearInterval(timer1);
  buttonStart.innerText = "Start";
  running = false;
};

// 開始・停止
let onStart = () => {
  logger("dom","app-lg-start start");
  if(running){
    stopFunc();
  } else {
    nextGeneration();
    timer1 = setInterval("nextGeneration()", 100);
    buttonStart.innerText = "Stop";
    running = true;
  };
};

// Canvasクリック
let canvasClick = (e) => {
  //上位で縮小表示しているためクリックした位置を縮小倍率で仮想算出
  let x = (e.clientX / 0.7) - canvas.offsetLeft;
  let y = (e.clientY / 0.7) - canvas.offsetTop;
  let col = Math.floor(x / cellSize);
  let row = Math.floor(y / cellSize);
  if (cells[col][row] == 1) {
    cells[col][row] = 0;
  } else {
    cells[col][row] = 1;
  }
  drawCell(col, row);
};

// 世代数桁区切り
let insComma = (i) => String(i).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

// セル初期化
let initCells = () => {
  logger("dom","app-lg-reset start");
  console.log(getYMDHMSM() + "|dom|app-lg-reset start");

  //変数初期化（停止状態＆自動停止モード）
  stopFunc();
  endlessFlg = true; //暫定でエンドレスモードにして次の関数でfalse(自動停止モード)にする
  onEndless();

  //キャンバス親要素から最大値見直し
  let appWidth = document.getElementById('app-body').clientWidth;
  let appHeight = document.getElementById('app-body').clientHeight - 60; //ボタン部分を除く

  logger("dom","appWidth:" + appWidth + ",appHeight:" + appHeight);
  console.log(getYMDHMSM() + "|dom|appWidth:" + appWidth + ",appHeight:" + appHeight);

  if (appWidth < appHeight) {
    base = parseInt( appWidth );
  } else {
    base = parseInt( appHeight );
  }

  //キャンバス、セルサイズ見直し
  //cellSize = parseInt(base / xy);
  cellSize = base / xy;
  if (cellSize < 1) cellSize = 1;
  base = cellSize * xy;

  //キャンバス、セルサイズ再設定
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //canvas.setAttribute("width", base.toString(10));
  //canvas.setAttribute("height", base.toString(10));
  canvas.width = base;
  canvas.height = base;

  //行列数見直し(xyと同数になる想定)
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);

  //キャンバス色初期化
  //ctx.fillStyle = 'rgb(60, 60, 60)';
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgb(128,128,128)";
  ctx.strokeRect(0,0, canvas.width, canvas.height);
  for(col=0;col<cols;col++){
    cells[col] = new Array();
    for(row=0;row<rows;row++){
      cells[col][row] = 0;
    }
  }

  //メイン画面世代数
  elGen = document.getElementById('app-lg-gen');

  //世代数初期化
  gen = 0;
  elGen.innerText = insComma(gen);
  redraw();
};

// アプリ初期処理
lifeGameInit = () => {
  logger("dom","lifeGameInit start");
  console.log(getYMDHMSM() + "|dom|lifeGameInit start");

  //キャンバス取得
  canvas = document.getElementById('lifegame');

  //メイン画面ボタンイベント
  buttonStart = document.getElementById('app-lg-start');
  buttonReset = document.getElementById('app-lg-reset');
  buttonStart.addEventListener("click", () => {
    onStart();
  }, false);
  buttonReset.addEventListener("click", () => {
    initCells();
  }, false);

  //キャンバスクリックイベント
  canvas.addEventListener("click", (e) => {
    canvasClick(e);
  }, false);

  //メニューボタンイベント：設定
  buttonEndless = document.getElementById('app-lg-endless');
  buttonEndless.addEventListener("click", () => {
    onEndless();
  }, false);
  document.getElementById('app-lg-size-sel').onchange = () => {
    sizeChange();
  };

  //メニューボタンイベント：配置
  document.getElementById('app-lg-random').addEventListener("click", () => {
    randomCells();
    modalArea.classList.toggle('is-show');
  }, false);
  document.getElementById('app-lg-glider').addEventListener("click", () => {
    gliderCells();
    modalArea.classList.toggle('is-show');
  }, false);
  document.getElementById('app-lg-breeder').addEventListener("click", () => {
    breederCells();
    modalArea.classList.toggle('is-show');
  }, false);

  //キャンバス初期化
  initCells();

};
