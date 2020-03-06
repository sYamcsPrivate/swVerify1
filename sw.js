//外部ファイル読込
importScripts('common.js');

//キャッシュ名、キャッシュアイテム
const CACHE_VERSION = "0.0.3.001";
const CACHE_NAME = `${registration.scope}!${CACHE_VERSION}`;
const CACHE_ITEMS = getCacheItems();


//エラー時のレスポンスDOM
offlineResBody = () => {
  let res = '\
<!DOCTYPE html>\
<html>\
<head>\
  <meta charset="utf-8">\
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">\
  <title>pwaEx1</title>\
<style>\
.index {\
  width:100vw;\
  height:100vh;\
}\
.btn {\
  color:#3273dc\
}\
</style>\
</head>\
<body>\
<div class="index">\
<h1>現在利用できません</h1>\
<p>\
お手数ですが、通信ができる状態で以下から「アプリの再読込」をお願いします。<br>\
再読み込みしてもアプリが正常に動かない場合は、再インストール後にアプリのアップデートをお試しください。<br>\
（保存したデータやアカウントは保持されます）\
</p>\
<div class="btn" id="reloadBtn">アプリ再読込</div>\
</div>\
<script>\
reloadFunc = () => {\
  try {\
    alert("キャッシュリフレッシュ中…");\
    caches.keys()\
    .then(keys => {\
      var promises = [];\
      keys.forEach( (cacheName) => {\
        console.log(getYMDHMSM() + " : cacheDelete");\
        console.log(cacheName);\
        if (cacheName) {\
          promises.push(caches.delete(cacheName));\
        }\
      })\
    })\
    .then( async () => {\
      console.log(getYMDHMSM() + " : doing : get regSw");\
      alert("ServiceWorker取得中…");\
      return await navigator.serviceWorker.getRegistration();\
    })\
    .then( async registration => {\
      console.log(getYMDHMSM() + " : doing : postMessage");\
      alert("キャッシュ再取得中…");\
      return await registration.active.postMessage("updateCache");\
    })\
    .then( async () => {\
      console.log(getYMDHMSM() + " : send : updateCache");\
      alert("アプリを再起動します");\
      location.reload(true);\
    })\
  } catch(e) {\
    alert("お使いのブラウザがサポートしていないため、通信復旧後に再インストール及びアップデートをお願いします");\
  }\
};\
window.addEventListener("DOMContentLoaded",() => {\
  document.getElementById("reloadBtn").addEventListener("click", () => {\
    reloadFunc();\
  };\
});\
</script>\
</body>\
</html>\
      ';
  return res;
};
offlineResHeaders = () => {
  let res = {
    status: 200,
    statusText: 'success',
    headers: [
      ['Content-Type', 'text/html']
    ]
  };
  return res;
};

//インストール
const install = (event) => {
  console.log(getYMDHMSM() + " : install/update start");
  return event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      CACHE_ITEMS.map(url => {
        return fetch(new Request(url)).then(response => {
          cloneRes = response.clone(); //クローンしてキャッシュ
          console.log(getYMDHMSM() + " : cachePut :" + cloneRes.url);
          return cache.put(url, cloneRes);
        });
      });
    }).catch(err => {
      console.log(getYMDHMSM() + " : install/update fail");
      console.log(err);
    }).finally(() => {
      console.log(getYMDHMSM() + " : skipWaiting");
      self.skipWaiting();
    })
  );
};

//インストール時に発火
self.addEventListener('install', (event) => {
  console.log(getYMDHMSM() + " : ServiceWorkerインストール");
  install(event);
});

//新しいバージョンのServiceWorkerが有効化されたとき
self.addEventListener('activate', (event) => {
  console.log(getYMDHMSM() + " : ServiceWorker有効化");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return cacheNames.filter((cacheName) => {
        // このスコープに所属していて且つCACHE_NAMEではないキャッシュを探す
        console.log(getYMDHMSM() + " : 不要キャッシュ探索");
        return cacheName.startsWith(`${registration.scope}!`) &&
               cacheName !== CACHE_NAME;
      });
    }).then((cachesToDelete) => {
      return Promise.all(cachesToDelete.map((cacheName) => {
        // いらないキャッシュを削除する
        console.log(getYMDHMSM() + " : 不要キャッシュ削除");
        return caches.delete(cacheName);
      }));
    }).finally(() => {
      console.log(getYMDHMSM() + " : ServiceWorkerコントロール開始");
      self.clients.claim();
    })
  );
});

//メッセージ受信
self.addEventListener('message', (event) => {
  console.log(`${getYMDHMSM()} : sw:onMessage:${JSON.stringify(event.data)}`);
  switch (event.data.func) {
    case 'updateCache': //キャッシュ更新リクエスト
      event.source.postMessage({func:event.data.func, data:""});
      install(event);
      break;
    case 'getVersion': //バージョン取得リクエスト
      event.source.postMessage({func:event.data.func, data:CACHE_VERSION});
      install(event);
      break;
    default:
      break;
  }
});

//フェッチ処理：キャッシュ優先取得
self.addEventListener('fetch', (event) => {

  console.log(getYMDHMSM() + " : fetch開始 : " + event.request.url);

  //キャッシュ優先で取得
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {

        // キャッシュ内に該当レスポンスがあれば、それを返す
        if (response) {
          console.log(getYMDHMSM() + " : from cache : " + response.url);
          return response;
        }

        // 重要：リクエストを clone する。リクエストは Stream なので
        // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
        // 必要なので、リクエストは clone しないといけない
        let fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {

          console.log(getYMDHMSM() + " : from net : " + response.url);

          if (!response || response.status !== 200 || response.type !== 'basic') {
            // キャッシュする必要のないタイプのレスポンスならそのまま返す
            return response;
          }

          // 重要：レスポンスを clone する。レスポンスは Stream で
          // ブラウザ用とキャッシュ用の2回必要。なので clone して
          // 2つの Stream があるようにする
          let responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });

      });
    })
  );

});

console.log(getYMDHMSM() + " : ここまで読んでるかチェック4");
