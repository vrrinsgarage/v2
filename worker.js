// Cloudflare Worker — contoh backend penentu zona.
// TITIK OPERASIONAL DISIMPAN DI SERVER, TIDAK DIKIRIM KE BROWSER.
// Ganti dua nilai rahasia ini di Worker Environment Variables:
// GARAGE_LAT dan GARAGE_LNG
//
// Body POST: { "lat": -2.9, "lng": 104.7 }
// Response: { zone, badge, distanceKm, price, note }

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    try {
      const {lat,lng} = await request.json();
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return Response.json({error:"Lokasi tidak valid"}, {status:400});
      }

      const distanceKm = haversineKm(
        lat, lng,
        Number(env.GARAGE_LAT),
        Number(env.GARAGE_LNG)
      );

      let data;
      if (distanceKm <= 8) {
        data = {
          zone:"ZONA 1",
          badge:"🟢 ZONA 1 • 0–8 KM",
          price:"Zona utama layanan",
          note:"Anda berada dalam zona utama layanan VRRINS GARAGE."
        };
      } else if (distanceKm <= 15) {
        data = {
          zone:"ZONA 2",
          badge:"🟡 ZONA 2 • 8–15 KM",
          price:"Rp70.000 – Rp120.000",
          note:"Harga akhir dikonfirmasi berdasarkan lokasi dan layanan."
        };
      } else {
        data = {
          zone:"ZONA 3",
          badge:"🔴 ZONA 3 • >15 KM",
          price:"Rp120.000 – Rp250.000",
          note:"Harga akhir dikonfirmasi melalui proses booking."
        };
      }

      return Response.json({
        ...data,
        distanceKm:Number(distanceKm.toFixed(2))
      },{
        headers:{
          "Cache-Control":"no-store",
          "Access-Control-Allow-Origin":"*",
          "Access-Control-Allow-Headers":"Content-Type"
        }
      });
    } catch {
      return Response.json({error:"Permintaan tidak valid"}, {status:400});
    }
  }
};

function haversineKm(lat1,lon1,lat2,lon2){
  const R=6371;
  const rad=x=>x*Math.PI/180;
  const dLat=rad(lat2-lat1);
  const dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+
    Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
