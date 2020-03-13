let canvas = "";
let ctx;
let cellSize = 8;   // セル1マスの暫定サイズ
let cols;
let rows;
//let cells = new Array();
//let cellsN1 = new Array(); //1世代前
//let cellsN2 = new Array(); //2世代前
let cells = [];
let cellsN1 = []; //1世代前
let cellsN2 = []; //2世代前

//セル属性集合(生セル＋徐々死セルのみで、死セルは保有しない)
//第1要素:col(x)、第2要素:row(y)、第3要素:alive:100(生)～0以上(徐々死)→表示時に100で割って小数点2位までの少数で扱う
//セパレータは"x,y,:alive"で表現
let cellProps = [];
let cellPropsN1 = []; //1世代前
let cellPropsN2 = []; //2世代前
let tmpCellProps = []; //次世代テンポラリ

let timer1;
let running = false;
let base; //キャンバスサイズの基底サイズ
let xy = 100; //一辺の大きさ
let gen = 0; //世代数
let elGen; //世代数表示要素
let endlessFlg = false; //安定→random→onStart
let endlessType = "random"; //エンドレスモードの種類の初期値「ランダム」

// 配置：ブリーダー1(横線タイプ)
let breeder1Cells = () => {
  logger("dom","app-lg-breeder1 start");

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
 
// 配置：ランダム
let randomCells = () => {
  logger("dom","app-lg-random start");
  for(col=0;col<cols;col++){
    for(row=0;row<rows;row++){
      let r = Math.random();
      if (r < 0.2) {
        let cellProp = col + "," + row + ",:100";
        cellProps.push(cellProp);
      }
    }
  }
  redraw();
};
 
// 設定：エンドレス種類変更
let endlessTypeChange = () => {
  endlessType = document.getElementById('app-lg-endlesstype-sel').value;
  logger("dom","endlessTypeChange start:" + endlessType);
  console.log(getYMDHMSM() + "|dom|endlessTypeChange start:" + endlessType);
  document.getElementById('app-lg-endlesstype-sel-disp').innerText = endlessType;
};

// 設定：エンドレスon/off
let onEndless = () => {
  logger("dom","app-lg-endless start:" + endlessFlg);
  console.log(getYMDHMSM() + "|dom|app-lg-endless start:" + endlessFlg);
  if(endlessFlg){
    document.getElementById('app-lg-endless').innerText = "AutoEnd";
    document.getElementById('app-lg-endlesstype-sel-body').style.display = "none";
    endlessFlg = false;
  } else {
    document.getElementById('app-lg-endless').innerText = "EndLess";
    document.getElementById('app-lg-endlesstype-sel-body').style.display = "flex";
    endlessFlg = true;
  }
};

// 設定：サイズ変更
let sizeChange = () => {
  let strSize = document.getElementById('app-lg-size-sel').value;
  logger("dom","sizeChange start:" + strSize);
  console.log(getYMDHMSM() + "|dom|sizeChange start:" + strSize);
  document.getElementById('app-lg-size-sel-disp').innerText = strSize;
  xy = parseInt(strSize);
  alert("forceReset");
  lifeGameInit();
};

// セルを描画
let drawCell = (cellProp) => {
  //console.log("cellProp");
  //console.log(cellProp);
  //console.log("cellProps");
  //console.log(cellProps);
  let x = parseInt(cellProp.split(",")[0]);
  let y = parseInt(cellProp.split(",")[1]);
  let alive = parseInt(cellProp.split(":")[1]) / 100;
  let col = 255 * (1 - alive);
  let style = "rgb(" + col + "," + col + "," + col + ")";
  ctx.fillStyle = style;
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
};
 
// 全体を再描画
let redraw = () => {
  cellProps.forEach(cellProp => drawCell(cellProp));
  ctx.strokeStyle = "rgb(128,128,128)";
  ctx.strokeRect(0,0, canvas.width, canvas.height);
};

// 次世代テンポラリ追加：生存力が強いものを採用
let nextCellPropsPush = (cellProp) => {
  let x = parseInt(cellProp.split(",")[0]);
  let y = parseInt(cellProp.split(",")[1]);
  let alive = parseInt(cellProp.split(":")[1]) / 100;
  let tmpCellProp = x + "," + y;
  cellPropIdx = tmpCellProps.findIndex(el => el.indexOf(tmpCellProp) >= 0);
  if (cellPropIdx < 0) {
    tmpCellProps.push(cellProp);
  } else {
    let tmpAlive = parseInt(tmpCellProps[cellPropIdx].split(":")[1]) / 100;
    if (alive > tmpAlive) {
      tmpCellProps.splice(cellPropIdx,1);
      tmpCellProps.push(cellProp);
    }
  }
};

// 周囲の生存セルを数える - 無限版(Infinite)
let countAround = (cellProp) => {
  let x = parseInt(cellProp.split(",")[0]);
  let y = parseInt(cellProp.split(",")[1]);
  let count = 0;
  let provX = 0;
  let provY = 0;
  for(let i=-1;i<=1;i++){
    provX = x + i;
    if (provX < 0) provX = cols - 1;
    if (provX >= cols) provX = 0;
    for(let j=-1;j<=1;j++){
      provY = y + j;
      if (provY < 0) provY = rows - 1;
      if (provY >= rows) provY = 0;
      if (i != 0 || j != 0) {
        let cellProp = provX + "," + provY + ",:100";
        let cellPropIdx = cellProps.findIndex(el => el.indexOf(cellProp) >= 0);
        if (cellPropIdx >= 0) {
          count++;
        }
      }
    }
  }
  return count;
};

// 次世代生成
let birthCell = (cellProp) => {
  let x = parseInt(cellProp.split(",")[0]);
  let y = parseInt(cellProp.split(",")[1]);
  let provX = 0;
  let provY = 0;
  for(let i=-1;i<=1;i++){
    provX = x + i;
    if (provX < 0) provX = cols - 1;
    if (provX >= cols) provX = 0;
    for(let j=-1;j<=1;j++){
      provY = y + j;
      if (provY < 0) provY = rows - 1;
      if (provY >= rows) provY = 0;
      if (i != 0 || j != 0) {
        let birthCellProp = provX + "," + provY + ",:100";
        let count = countAround(birthCellProp);
        if (count == 3) {
          nextCellPropsPush(birthCellProp);
        }
      }
    }
  }
};

// セル死滅
let deadCell = (alive) => {
  let res = alive - 0.4; //徐々に死んでいくように見せる
  if (res < 0) res = 0;
  return res;
};

// 世代を進行させる
let nextGeneration = () => {
  //console.log("nextGeneration:cellProps");
  //console.log(cellProps);
  tmpCellProps = [];
  cellProps.forEach(cellProp => {
    let x = parseInt(cellProp.split(",")[0]);
    let y = parseInt(cellProp.split(",")[1]);
    let alive = parseInt(cellProp.split(":")[1]) / 100;
    let nextCellProp;
    let cellPropIdx;
    if (alive == 1) {
      //自己生存判定
      let count = countAround(cellProp);
      if (count == 2 || count == 3) {
        nextCellProp = cellProp;
      } else {
        alive = parseInt(deadCell(alive) * 100);
        nextCellProp = x + "," + y + ",:" + alive;
      }
      nextCellPropsPush(nextCellProp);
      //次世代生成
      birthCell(cellProp);
    } else {
      alive = parseInt(deadCell(alive) * 100);
      nextCellProp = x + "," + y + ",:" + alive;
      nextCellPropsPush(nextCellProp);
    }
  });

  //2世代前まで保管
  cellPropsN2 = cellPropsN1; //2世代前保管
  cellPropsN1 = cellProps; //1世代前保管
  cellProps = tmpCellProps;

  //2世代前と同一
  if (cellProps.toString() == cellPropsN2.toString()) {
    elGen.innerText = insComma(gen - 2 < 0 ? 0 : gen - 2);  //世代数を-2して表示

    //エンドレスモードならエンドレス種類に応じて配置して次世代へ
    //エラーハンドリング：想定外値の場合はランダム配置で実施
    if(endlessFlg) {
      if (endlessType == "breeder1") {
        breeder1Cells();
      } else {
        randomCells();
      }
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
  document.getElementById('app-lg-start').innerText = "Start";
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
    document.getElementById('app-lg-start').innerText = "Stop";
    running = true;
  };
};

// Canvasクリック
let canvasClick = (e) => {
  //上位で縮小表示しているためクリックした位置を縮小倍率で仮想算出
  let x = (e.clientX / 0.7) - canvas.offsetLeft;
  let y = (e.clientY / 0.7) - canvas.offsetTop;
  let col = Math.floor(x / cellSize - 0.5);
  if (col < 0) col = 0;
  let row = Math.floor(y / cellSize - 0.5);
  if (row < 0) row = 0;
  let cellProp = col + "," + row;
  let cellPropIdx = cellProps.findIndex(el => el.indexOf(cellProp) >= 0);
  console.log("cellProp");
  console.log(cellProp);
  console.log(cellPropIdx);
  if (cellPropIdx < 0) {
    cellProp = cellProp + ",:100";
    cellProps.push(cellProp);
    drawCell(cellProp);
  } else {
    cellProp = cellProp + ",:0";
    cellProps.splice(cellPropIdx,1);
    drawCell(cellProp);
  }
  console.log("cellProps");
  console.log(cellProps);
};

// 世代数桁区切り
let insComma = (i) => String(i).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');

// アプリ初期処理
lifeGameInit = () => {
  logger("dom","lifeGameInit start");
  console.log(getYMDHMSM() + "|dom|lifeGameInit start");

  //変数初期化（停止状態＆自動停止モード）
  stopFunc();
  endlessFlg = true; //暫定でエンドレスモードにして次の関数でfalse(自動停止モード)にする
  onEndless();

  //セレクトボックス初期化（初期表示＆ランダムモード）
  endlessType = "random"; //エンドレスモードの種類の初期値「ランダム」
  document.getElementById('app-lg-endlesstype-sel-disp').innerText = "Mode"; //エンドレスモードの初期表示
  document.getElementById('app-lg-endlesstype-sel').selectedIndex = 0; //random選択状態に設定

  //キャンバス取得
  if (!canvas) canvas = document.getElementById('lifegame');

  //キャンバス親要素から最大値見直し
  let appWidth = document.getElementById('app-body').clientWidth;
  let appHeight = document.getElementById('app-body').clientHeight - 60; //ボタン部分を除く

  logger("dom","appWidth:" + appWidth + ",appHeight:" + appHeight);
  console.log(getYMDHMSM() + "|dom|appWidth:" + appWidth + ",appHeight:" + appHeight);

  if (appWidth < appHeight) {
    base = appWidth;
  } else {
    base = appHeight;
  }

  //セルサイズ見直し
  cellSize = base / xy;

  //キャンバス再設定
  canvas.width = base;
  canvas.height = base;
  ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //行列数見直し
  cols = xy;
  rows = xy;

  //キャンバス色初期化
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgb(128,128,128)";
  ctx.strokeRect(0,0, canvas.width, canvas.height);

  //セル属性集合初期化
  cellProps = [];

/*
  for(col=0;col<cols;col++){
    cells[col] = new Array();
    for(row=0;row<rows;row++){
      cells[col][row] = 0;
    }
  }
*/

  //メイン画面世代数
  elGen = document.getElementById('app-lg-gen');

  //世代数初期化
  gen = 0;
  elGen.innerText = insComma(gen);
  redraw();
};
