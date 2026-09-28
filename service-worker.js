// Đặt tên cho bộ nhớ đệm
const TEN_BO_NHO = 'vovinam-cache-v1';

// Danh sách các tệp quan trọng cần tải sẵn vào điện thoại
const TEP_CAN_LUU = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/Logo_VVF.png'
];

// Sự kiện cài đặt: Trình duyệt tải và lưu các tệp trên vào bộ nhớ
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(TEN_BO_NHO)
            .then(cache => {
                return cache.addAll(TEP_CAN_LUU);
            })
    );
});

// Sự kiện lấy dữ liệu: Ưu tiên lấy từ bộ nhớ điện thoại để load siêu nhanh
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Nếu tìm thấy trong bộ nhớ thì trả về luôn, nếu không thì tải từ mạng internet
                return response || fetch(event.request);
            })
    );
});