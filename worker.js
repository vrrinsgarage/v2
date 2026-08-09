// Cloudflare Worker — VRRINS GARAGE GPS Zona V3
// GARAGE_LAT dan GARAGE_LNG wajib disimpan sebagai Worker Variables/Secrets.
// JANGAN masukkan koordinat operasional ke GitHub Pages / app.js.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method === "GET") return json({ ok: true, service: "VRRINS GARAGE GPS Zona V3" }, 200);
    if (request.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

    const garageLat = Number(env.GARAGE_LAT), garageLng = Number(env.GARAGE_LNG);
    if (!Number.isFinite(garageLat) || !Number.isFinite(garageLng)) return json({ error: "Koordinat operasional belum dikonfigurasi di Worker." }, 500);

    try {
      const body = await request.json();
      const lat = Number(body?.lat), lng = Number(body?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return json({ error: "Lokasi GPS tidak valid." }, 400);

      const distanceKm = haversineKm(lat, lng, garageLat, garageLng);
      let data;
      if (distanceKm <= 8) data = { zone: "ZONA 1", badge: "🟢 ZONA 1 • 0–8 KM", price: "Zona utama layanan", note: "Anda berada dalam zona utama layanan VRRINS GARAGE." };
      else if (distanceKm <= 15) data = { zone: "ZONA 2", badge: "🟡 ZONA 2 • 8–15 KM", price: "Rp70.000 – Rp120.000", note: "Klik BOOKING & CEK HARGA untuk mendapatkan harga pasti." };
      else data = { zone: "ZONA 3", badge: "🔴 ZONA 3 • >15 KM", price: "Rp120.000 – Rp250.000", note: "Klik BOOKING & CEK HARGA untuk mendapatkan harga pasti." };

      return json({ ...data, distanceKm: Number(distanceKm.toFixed(2)) }, 200);
    } catch (_) { return json({ error: "Permintaan tidak valid." }, 400); }
  }
};

function json(payload, status) { return new Response(JSON.stringify(payload), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "no-store" } }); }
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
