
//稼働環境
//var getAppPath = () => "/" + getAppName(); //本番用
var getAppPath = () => ""; //開発用

//アプリ名＋データベース名
var getAppName = () => "swVerify1";

//オブジェクトストア名
var getOsName = () => "objStore";

//オブジェクトストア内のkeyPath名
var getKeyPathName = () => "key";

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

//db取得(indexedDBから固定オブジェクトストア名＋指定keyで情報取得)
var getDb = (key) => {
  //console.log(getYMDHMSM() + " : getDb start");
  return new Promise( async (resolve, reject) => {
    try {
      let openReq = indexedDB.open(getAppName());
      openReq.onsuccess = async (event) => {
        try {
          let db = event.target.result;
          let store = db.transaction(getOsName(), "readonly").objectStore(getOsName());
          let getReq = await store.get(key);
          getReq.onsuccess = (event) => {
            //console.log(event.target.result);
            try {
              let res = event.target.result[key];
              //console.log(getYMDHMSM() + " : getDb success");
              //console.log(res);
              resolve(res)
            } catch {
              //console.log(getYMDHMSM() + " : getDb data error");
              reject();
            }
          }
          getReq.onerror = (event) => {
            //console.log(getYMDHMSM() + " : getDb error");
            reject();
          }
        } catch {
          reject();
        }
      }
    } catch {
      reject();
    }
  });
}

//db更新新設(indexedDBに固定オブジェクトストア名＋指定keyで情報格納)
var setDb = (key, value) => {
  //console.log(getYMDHMSM() + " : setDb start");
  //console.log(key);
  //console.log(value);
  return new Promise( async (resolve, reject) => {
    try {
      let openReq = indexedDB.open(getAppName());
      openReq.onsuccess = async (event) => {
        try {
          let db = event.target.result;
          let store = db.transaction(getOsName(), "readwrite").objectStore(getOsName());
          let osData = {};
          osData["key"] = key;
          osData[key] = value;
          //console.log(getYMDHMSM() + " : put直前のosDataの内容↓");
          //console.log(osData);
          let putReq = await store.put(osData);
          putReq.onsuccess = (event) => {
            //console.log(getYMDHMSM() + " : setDb success");
            resolve();
          }
          putReq.onerror = (event) => {
            //console.log(getYMDHMSM() + " : setDb error");
            reject();
          }
        } catch(e) {
          //console.log(getYMDHMSM() + " : setDb error - " + e);
          reject();
        }
      }
    } catch {
      reject();
    }
  });
}

//domログ溜め込み
var globalDomLog = "";
var domLogger = async (value) => {
  globalDomLog = globalDomLog + value;
  try {
    await getDb("domLog").then( async (nowValue) => {
      if (nowValue) {
        await setDb("domLog", nowValue + globalDomLog).then(()=>{
          globalDomLog = "";
        }).catch(()=>{
          console.log(getYMDHMSM() + " : domlogger warning (get success bat setfail) - " + value);
        });
      } else {
        console.log(getYMDHMSM() + " : domlogger warning (get success bat valueExeption) - " + value);
      }
    }).catch( async () => {
      await setDb("domLog", value).then(()=>{
        globalDomLog = "";
        //console.log(getYMDHMSM() + " : domlogger success (get error to first set)");
      }).catch(()=>{
        console.log(getYMDHMSM() + " : domlogger warning (get error to set error) - " + value);
      });
    });
  } catch {
    console.log(getYMDHMSM() + " : domlogger error - " + value);
  }
}

//swログ溜め込み
var globalSwLog = "";
var swLogger = async (value) => {
  globalSwLog = globalSwLog + value;
  try {
    await getDb("swLog").then( async (nowValue) => {
      if (nowValue) {
        await setDb("swLog", nowValue + globalSwLog).then(()=>{
          globalSwLog = "";
        }).catch(()=>{
          console.log(getYMDHMSM() + " : swlogger warning (get success bat setfail) - " + value);
        });
      } else {
        console.log(getYMDHMSM() + " : swlogger warning (get success bat valueExeption) - " + value);
      }
    }).catch( async () => {
      await setDb("swLog", value).then(()=>{
        globalSwLog = "";
        //console.log(getYMDHMSM() + " : swlogger success (get error to first set)");
      }).catch(()=>{
        console.log(getYMDHMSM() + " : swlogger warning (get error to set error) - " + value);
      });
    });
  } catch {
    console.log(getYMDHMSM() + " : swlogger error - " + value);
  }
}

//ログ溜め込み
var logger = async (who, log) => {
  let value = getYMDHMSM() + "|" + who + "|" + log + "<br>";
  let key = who + "Log";
  if (who == "sw") {
    swLogger(value);
  } else {
    domLogger(value);
  }
}
