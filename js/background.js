var startStopFlag = 0; // スタート・ストップのフラグ
var startTime; // スタート時間
var interval;

var elapsedTime = () => {
  // スタート時間と経過時間の差分を取得し、時・分・秒・ミリ秒・を抜き出していく
  var stopTime = new Date(); // 経過時間を退避
  var elapsed = stopTime.getTime() - startTime.getTime(); // 経過時間の差分を取得
  var H = Math.floor(elapsed / (60 * 60 * 1000)); // 時間取得
  elapsed = elapsed - (H * 60 * 60 * 1000);
  var M = Math.floor(elapsed / (60 * 1000)); // 分取得
  elapsed = elapsed - (M * 60 * 1000);
  var S = Math.floor(elapsed / 1000); // 秒取得
  var MS = elapsed % 1000; // ミリ秒取得
  var str = H + ":" + M + ":" + S + ":" + MS;
  logger("sw","経過時間:" + str);
  console.log(getYMDHMSM() + " |sw|経過時間:" + str);
};

var bgProc = () => {
  logger("sw","bgProc start");
  console.log(getYMDHMSM() + " |sw|bgProc start");
  if (startStopFlag == 0){ // リクエストがあったとき未スタート状態だった
    startTime = new Date(); // スタート時間を退避
    startStopFlag = 1;
    interval = setInterval("elapsedTime()", 10000); //10秒毎に実施
  } else { // // リクエストがあったとき既にスタート状態だった
    elapsedTime();
    StartStopFlag = 0;
    clearInterval( interval ); //setInterval解除
  }
};