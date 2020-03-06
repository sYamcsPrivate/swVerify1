
//稼働環境
//var getAppPath = () => "/" + getAppName(); //本番用
var getAppPath = () => ""; //開発用

//アプリ名
var getAppName = () => "swVerify1";

//キャッシュアイテムズ ... sw.js自前で「./version」を組み込んでいる
var getCacheItems = () => [
  "./icon-512x512.png",
  "./common.js",
  "./favicon.ico",
  "./manifest.json",
  "./sw.js",
  "./?app",
  "./",
  ".",
];

//日時取得
var getYMDHMSM = () => {
  let toDoubleDigits = (i) => {
    let res = "" + i;
    if (res < 10) {
      res = "0" + i;
    }
    return res;
  }
  let DD = new Date();
  let Year = DD.getFullYear();
  let Month = toDoubleDigits(DD.getMonth() + 1);
  let Day = toDoubleDigits(DD.getDate());
  let Hours = toDoubleDigits(DD.getHours());
  let Minutes = toDoubleDigits(DD.getMinutes());
  let Seconds = toDoubleDigits(DD.getSeconds());
  let mSeconds = DD.getMilliseconds();
  let res = Year + "/" + Month + "/" + Day + "-" + Hours + ":" + Minutes + ":" + Seconds + ":" + mSeconds;
  return res;
}

