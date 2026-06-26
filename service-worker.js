// バージョン管理（今後サイトを更新した際は、ここを v3, v4 と増やしてください）
const CACHE_NAME = 'mai-game-v3';

// 事前キャッシュするファイル一覧（パスが正しいか一応確認してください）
const ASSETS = [
    './index.html',
    './top.png',
    './loading.png'
];

// 1. インストールイベント（ファイルをスマホに保存）
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(() => {
                console.log('キャッシュの初期登録をスキップしました');
            });
        }).then(() => self.skipWaiting()) // 🔄 新しいSWをすぐに強制適用
    );
});

// 2. アクティベートイベント（古いバージョンのキャッシュを自動で即座に削除）
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 🔄 開いている全ての画面に即座に反映
    );
});

// 3. フェッチイベント（★ネットワーク優先に変更して古い固定を防止）
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // まずはインターネットから最新のファイルを取得しに行く
        fetch(event.request)
            .then((response) => {
                // ネットから取得できたら、それを最新キャッシュとして上書き保存
                if (response.status === 200 && ASSETS.includes(new URL(event.request.url).pathname)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // ⚠️ もし電波がない（オフライン）の時だけ、スマホ内のキャッシュを返す
                return caches.match(event.request);
            })
    );
});
