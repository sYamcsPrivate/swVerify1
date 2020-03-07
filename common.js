
//稼働環境
//var getAppPath = () => "/" + getAppName(); //本番用
var getAppPath = () => ""; //開発用

//アプリ名＋データベース名
var getAppName = () => "swVerify1";

//オブジェクトストア名
var osName = () => "objStore";

//オブジェクトストア内のオブジェクト名
var osObjName = () => "obj";

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

//キャッシュ内容取得
//主な利用目的：sw.js側に記述しているversionをキャッシュ経由で受け取る
var getCache = (req) => {
  let reqPath = "./" + req;
  return new Promise( async (resolve, reject) => {
    fetch(reqPath)
    .then(res => res.text())
    .then(res => resolve(res))
    .catch(err => reject(err));
  });
}

//db取得(indexedDBから固定オブジェクトストア名＋固定key(id=1)で情報取得)
let getDb = () => {
  console.log(getYMDHMSM() + " : getDb start");
  return new Promise( async (resolve, reject) => {
    let openReq  = indexedDB.open(getAppName());
    openReq.onsuccess = async (event) => {
      let db = event.target.result;
      let store = db.transaction(osName(), "readonly").objectStore(osName());
      let getReq = await store.get("1");
      getReq.onsuccess = (event) => {
        console.log(event.target.result);
        try {
          let res = event.target.result[osObjName()];
          console.log(getYMDHMSM() + " : getDb success");
          console.log(res);
          resolve(res)
        } catch {
          console.log(getYMDHMSM() + " : getDb data error");
          reject();
        }
      }
      getReq.onerror = (event) => {
        console.log(getYMDHMSM() + " : getDb error");
        reject();
      }
    }
  });
}

//db更新新設(indexedDBに固定オブジェクトストア名＋固定keyで情報格納)
let setDb = (obj) => {
  console.log(getYMDHMSM() + " : setDb start");
  return new Promise( async (resolve, reject) => {
    let openReq  = indexedDB.open(getAppName());
    openReq.onsuccess = async (event) => {
      let db = event.target.result;
      let store = db.transaction(osName(), "readwrite").objectStore(osName());
      let osData = {id:"1", obj: obj};
      console.log(getYMDHMSM() + " : put直前のosDataの内容↓");
      console.log(osData);
      let putReq = await store.put(osData);
      putReq.onsuccess = (event) => {
        console.log(getYMDHMSM() + " : setDb success");
        resolve();
      }
      putReq.onerror = (event) => {
        console.log(getYMDHMSM() + " : setDb error");
        reject();
      }
    }
  });
}

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

