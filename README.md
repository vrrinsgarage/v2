# VRRINS GARAGE — GPS Zona V3

## GitHub Pages
Upload semua isi folder ini. Settings → Pages → Source: **GitHub Actions**.

## Cloudflare Worker
Deploy `worker.js`. Buat Worker Variables/Secrets:
- `GARAGE_LAT` = lintang koordinat operasional asli
- `GARAGE_LNG` = bujur koordinat operasional asli

Jangan memasukkan kedua nilai tersebut ke GitHub/app.js.

Tes URL Worker dengan browser: harus muncul JSON `ok: true`.

## Hubungkan frontend
Setelah Worker online, edit `app.js`:
`const API_ENDPOINT = "https://NAMA-WORKER.workers.dev";`
Commit. Tombol CEK LOKASI SAYA kemudian meminta GPS pelanggan dan mengirim hanya koordinat pelanggan ke Worker. Worker menghitung jarak dan mengembalikan jarak + zona + kisaran biaya.

## Zona
- 0–8 KM = Zona 1
- >8–15 KM = Zona 2, Rp70.000–Rp120.000
- >15 KM = Zona 3, Rp120.000–Rp250.000

Catatan: koordinat operasional tidak ditampilkan di UI. Namun API publik yang menerima koordinat dan mengembalikan jarak tetap merupakan distance oracle; untuk produksi sebaiknya ditambah rate limiting/anti-abuse.
