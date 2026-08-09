# VRRINS GARAGE — GPS ZONA V3

Konsep uji coba:
- Tombol **CEK LOKASI SAYA** meminta GPS pelanggan.
- Pelanggan hanya menerima **jarak + zona + kisaran biaya**.
- Titik operasional VRRINS GARAGE **tidak ditampilkan** pada UI.
- Zona 1: 0–8 KM.
- Zona 2: 8–15 KM — Rp70.000–Rp120.000.
- Zona 3: >15 KM — Rp120.000–Rp250.000.
- Tombol **BOOKING & CEK HARGA** disiapkan untuk alur booking berikutnya.

## PENTING — keamanan koordinat

Jangan menaruh koordinat VRRINS GARAGE di `app.js` pada versi publik. Jika koordinat dimasukkan ke JavaScript yang dikirim ke browser, pelanggan yang membuka Developer Tools dapat menemukannya.

Karena itu `app.js` hanya mengirim koordinat GPS pelanggan ke backend. `worker.js` melakukan perhitungan jarak menggunakan `GARAGE_LAT` dan `GARAGE_LNG` yang disimpan sebagai Environment Variables di server/Cloudflare Worker.

### Titik referensi yang digunakan untuk rancangan

Pengguna sebelumnya memberikan Plus Code:
`2MQJ+466, Bukit Baru, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30153`

Plus Code tersebut adalah **short code**, sehingga secara teknis perlu konteks lokasi untuk memulihkannya menjadi full code. Untuk versi produksi, koordinat yang benar-benar Anda konfirmasi sebagai titik operasional harus dimasukkan ke Environment Variables backend. Jangan menaruhnya di halaman publik.

### Uji coba

1. Upload `index.html`, `style.css`, dan `app.js` ke repository uji.
2. Deploy `worker.js` sebagai backend (Cloudflare Worker atau serverless endpoint).
3. Set Environment Variables:
   - `GARAGE_LAT`
   - `GARAGE_LNG`
4. Masukkan URL Worker ke `API_ENDPOINT` di `app.js`.
5. Buka website melalui HTTPS.
6. Tekan **CEK LOKASI SAYA** dan izinkan lokasi.

Catatan: GitHub Pages saja tidak cukup untuk menyembunyikan koordinat referensi. Backend diperlukan jika larangan melihat koordinat harus benar-benar ditegakkan.
