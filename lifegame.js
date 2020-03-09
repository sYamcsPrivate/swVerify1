var canvas;
var ctx;
var cellSize = 8;   // セル1マスのサイズ
var cols;
var rows;
var cells = new Array();
var buttonStart;
var buttonRandom;
var buttonReset;
var timer1;
var running = false;
var xy = 100; //100*100固定

lifeGameInit = () => {
    logger("dom","lifeGameInit start");
    console.log(getYMDHMSM() + "|dom|lifeGameInit start");

    //改造部分
    canvas = document.getElementById('lifegame');
    let base;
    let appWidth = document.getElementById('app-body').clientWidth;
    let appHeight = document.getElementById('app-body').clientHeight - 47; //ボタン部分を除く

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
    initCells();
    buttonStart = document.getElementById('buttonStart');
    buttonRandom = document.getElementById('buttonRandom');
    buttonReset = document.getElementById('buttonReset');
    buttonStart.addEventListener('click', onStart, false);
    buttonRandom.addEventListener('click', randomCells, false);
    buttonReset.addEventListener('click', initCells, false);
    canvas.addEventListener('click', canvasClick, false);
};
 
// 開始
function onStart(){
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
}
 
// 初期化
function initCells(){
    ctx.fillStyle = 'rgb(60, 60, 60)';
    ctx.fillRect(0,0, canvas.width, canvas.height);
    for(col=0;col<cols;col++){
        cells[col] = new Array();
        for(row=0;row<rows;row++){
            cells[col][row] = 0;
        }
    }
    redraw();
}
 
// ランダムに埋める
function randomCells(){
    for(col=0;col<cols;col++){
        cells[col] = new Array();
        for(row=0;row<rows;row++){
            cells[col][row] = Math.round( Math.random());
        }
    }
    redraw();
}
 
// 全体を再描画
function redraw(){
    for(col=0;col<cols;col++){
        for(row=0;row<rows;row++){
            drawCell(col, row);
        }
    }
}
 
// セルを描画
function drawCell(x, y){
    var value = cells[x][y];
    var style = value ? "rgb(156, 255,0)" : "rgb(40,40,40)"; 
    ctx.fillStyle = style;
    ctx.fillRect(x * cellSize, y * cellSize,
        cellSize - 1, cellSize - 1);
}
 
// 世代を進行させる
function nextGeneration(){
    var tmpCells = new Array();
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
}
 
// 周囲の生存セルを数える
function countAround(x, y){
    var count = 0;
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
}
 
// Canvasクリック
function canvasClick(e){
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;
    var col = Math.floor(x / cellSize);
    var row = Math.floor(y / cellSize);
    cells[col][row] = !cells[col][row];
    drawCell(col, row);
}