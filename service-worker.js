// 最もシンプルなService Worker（インストール条件を満たすための最小構成）
const CACHE_NAME = 'mai-game-v1';

// インストール時にキャッシュを作成（今回は空でもPWA条件を満たせます）
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './index.html',
                './top.png',
                './loading.png'
            ]).catch(() => {
                // 万が一ファイルがなくてもエラーで止まらないようにする保護
                console.log('キャッシュの初期登録をスキップしました');
            });
        })
    );
});

// オフライン時や通常読み込み時にファイルを返す設定（Fetchイベント）
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // キャッシュがあればそれを返し、なければ通常通りネットから取得する
            return response || fetch(event.request);
        })
    );
});
