const API_ENDPOINT = ""; 
// PRODUKSI: isi dengan URL server/Worker yang menyimpan titik operasional.
// JANGAN menaruh GARAGE_LAT/GARAGE_LNG di file ini untuk versi publik.

const checkBtn = document.getElementById("checkBtn");
const retryBtn = document.getElementById("retryBtn");
const bookingBtn = document.getElementById("bookingBtn");
const result = document.getElementById("result");
const statusEl = document.getElementById("status");
const zoneBadge = document.getElementById("zoneBadge");
const zoneTitle = document.getElementById("zoneTitle");
const distanceText = document.getElementById("distanceText");
const priceBox = document.getElementById("priceBox");
const note = document.getElementById("note");

function setStatus(msg){ statusEl.textContent = msg || ""; }

function showResult(data){
  result.classList.remove("hidden");
  zoneTitle.textContent = data.zone;
  distanceText.textContent = `Jarak Anda: ${Number(data.distanceKm).toFixed(1)} KM`;
  priceBox.textContent = data.price || "";
  note.textContent = data.note || "";
  zoneBadge.textContent = data.badge || data.zone;
}

async function askServer(lat,lng){
  if(!API_ENDPOINT) throw new Error("API_ENDPOINT belum diatur.");
  const r = await fetch(API_ENDPOINT,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({lat,lng})
  });
  if(!r.ok) throw new Error("Server tidak dapat memproses lokasi.");
  return r.json();
}

function getLocation(){
  if(!navigator.geolocation){
    setStatus("Perangkat/browser ini tidak mendukung GPS.");
    return;
  }
  setStatus("Meminta izin lokasi…");
  checkBtn.disabled=true;
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      setStatus("Lokasi diterima. Menentukan zona…");
      const data = await askServer(pos.coords.latitude,pos.coords.longitude);
      showResult(data);
      setStatus("");
    }catch(err){
      setStatus("Demo belum terhubung ke server penentu zona. Untuk versi publik, koordinat VRRINS harus disimpan di server, bukan di JavaScript.");
    }finally{checkBtn.disabled=false;}
  },err=>{
    checkBtn.disabled=false;
    const messages={
      1:"Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi.",
      2:"Lokasi tidak dapat ditentukan. Pastikan GPS aktif.",
      3:"Permintaan lokasi terlalu lama. Coba lagi."
    };
    setStatus(messages[err.code]||"Lokasi tidak dapat diperoleh.");
  },{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}

checkBtn.addEventListener("click",getLocation);
retryBtn.addEventListener("click",getLocation);
bookingBtn.addEventListener("click",()=>{
  alert("Form booking akan dihubungkan setelah alur harga final disepakati.");
});
