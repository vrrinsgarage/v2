const API_ENDPOINT = ""; // Isi URL Cloudflare Worker setelah Worker online.

const $ = (id) => document.getElementById(id);
const checkBtn = $("checkBtn"), retryBtn = $("retryBtn"), bookingBtn = $("bookingBtn");
const result = $("result"), statusEl = $("status"), zoneBadge = $("zoneBadge");
const zoneTitle = $("zoneTitle"), distanceText = $("distanceText"), priceBox = $("priceBox"), note = $("note");

function setStatus(message = "", type = "") { statusEl.textContent = message; statusEl.dataset.type = type; }

function showResult(data) {
  result.classList.remove("hidden");
  zoneTitle.textContent = data.zone || "ZONA";
  distanceText.textContent = `Jarak Anda: ${Number(data.distanceKm).toFixed(1)} KM`;
  priceBox.textContent = data.price || "";
  note.textContent = data.note || "";
  zoneBadge.textContent = data.badge || data.zone || "ZONA";
  result.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function askServer(lat, lng) {
  if (!API_ENDPOINT) throw new Error("URL backend Worker belum dipasang di app.js.");
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
    cache: "no-store"
  });
  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text); } catch (_) {}
  if (!response.ok) throw new Error(data.error || `Server error (${response.status}).`);
  return data;
}

function getLocation() {
  if (!window.isSecureContext) return setStatus("GPS memerlukan HTTPS. Buka melalui GitHub Pages HTTPS.", "error");
  if (!navigator.geolocation) return setStatus("Perangkat/browser ini tidak mendukung GPS.", "error");
  if (!API_ENDPOINT) return setStatus("GitHub Pages aktif. URL backend Worker belum dipasang.", "warning");

  setStatus("Meminta izin lokasi…");
  checkBtn.disabled = true; retryBtn.disabled = true;
  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      setStatus("Lokasi diterima. Menentukan zona…");
      const data = await askServer(position.coords.latitude, position.coords.longitude);
      showResult(data); setStatus("Zona berhasil ditentukan.", "success");
    } catch (error) {
      console.error(error); setStatus(error.message || "Server penentu zona belum siap.", "error");
    } finally { checkBtn.disabled = false; retryBtn.disabled = false; }
  }, (error) => {
    checkBtn.disabled = false; retryBtn.disabled = false;
    const messages = { 1: "Izin lokasi ditolak. Aktifkan izin lokasi untuk website ini lalu coba lagi.", 2: "Lokasi tidak dapat ditentukan. Pastikan GPS/lokasi aktif.", 3: "Permintaan lokasi terlalu lama. Coba lagi." };
    setStatus(messages[error.code] || "Lokasi tidak dapat diperoleh.", "error");
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
}

checkBtn.addEventListener("click", getLocation);
retryBtn.addEventListener("click", getLocation);
bookingBtn.addEventListener("click", () => alert("Form booking akan dihubungkan setelah alur booking ditetapkan."));
