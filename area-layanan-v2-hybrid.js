/* VRRINS GARAGE — AREA LAYANAN V2 HYBRID
   V1: kartu Zona 1/2/3 tetap membuka daftar perumahan lama.
   V2: area pada gambar peta dapat diklik dan membuka pengalaman baru.
*/
(() => {
  'use strict';

  const GARAGE = {
    // Derived from the supplied local Plus Code: 2MQJ+466, Bukit Baru, Palembang.
    // Keep this in one place so it can be corrected later without touching UI code.
    lat: -2.9622125,
    lng: 104.680515625,
    label: '2MQJ+466, Bukit Baru, Kec. Ilir Bar. I, Kota Palembang, Sumatera Selatan 30153'
  };

  const ZONES = {
    1: { label: '0–8 KM', title: 'Zona Utama Layanan', color: '#18c96a', desc: 'Area utama layanan VRRINS GARAGE.' },
    2: { label: '8–15 KM', title: 'Zona Perluasan', color: '#e0b900', desc: 'Konfirmasi lokasi terlebih dahulu sebelum booking.' },
    3: { label: '>15 KM', title: 'Layanan Khusus', color: '#e10606', desc: 'Hubungi WhatsApp untuk konfirmasi ketersediaan.' }
  };

  const modal = document.getElementById('area-v2-modal');
  const content = document.getElementById('area-v2-modal-content');
  if (!modal || !content) return;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(GARAGE.label)}`;
  const waNumber = '62895622499262';
  const waUrl = text => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  function distanceKm(aLat, aLng, bLat, bLng) {
    const R = 6371;
    const rad = d => d * Math.PI / 180;
    const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  function detectZone(km) {
    if (km <= 8) return 1;
    if (km <= 15) return 2;
    return 3;
  }

  function openModal(zoneId = 1) {
    const z = ZONES[zoneId] || ZONES[1];
    content.innerHTML = `
      <span class="area-v2-modal__eyebrow">AREA LAYANAN V2</span>
      <h2>${esc(z.label)} <span style="color:${z.color}">•</span></h2>
      <div class="area-v2-modal__badge"><i style="background:${z.color}"></i>${esc(z.title)}</div>
      <p>${esc(z.desc)} Radius dihitung dari titik operasional VRRINS GARAGE.</p>
      <div class="area-v2-modal__visual">
        <div class="area-v2-modal__ring"><span class="area-v2-modal__ring-label">&gt;15 KM</span></div>
        <div class="area-v2-modal__garage" aria-hidden="true">🏠</div>
      </div>
      <div class="area-v2-modal__actions">
        <button class="area-v2-modal__button area-v2-modal__button--green" type="button" data-v2-gps>📍 CEK LOKASI SAYA</button>
        <a class="area-v2-modal__button" href="${mapsUrl}" target="_blank" rel="noopener">🗺️ LIHAT DI GOOGLE MAPS</a>
      </div>
      <div class="area-v2-modal__result" data-v2-result>
        <strong style="color:${z.color}">${esc(z.label)}</strong>
        <span>${esc(z.desc)}</span>
      </div>
      ${zoneId === 3 ? `<a class="area-v2-modal__button area-v2-modal__button--primary" style="margin-top:10px" href="${waUrl('Halo Vrrins Garage, saya ingin konfirmasi area layanan untuk lokasi saya.') }" target="_blank" rel="noopener">💬 HUBUNGI WHATSAPP</a>` : ''}
      <div class="area-v2-modal__fallback">Sistem lama tetap tersedia melalui kartu Zona 1, Zona 2, dan Zona 3 di halaman utama.</div>`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('area-v2-open');
    content.scrollTop = 0;
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('area-v2-open');
    content.innerHTML = '';
  }

  function locate() {
    const button = content.querySelector('[data-v2-gps]');
    const result = content.querySelector('[data-v2-result]');
    if (!button || !result) return;
    if (!navigator.geolocation) {
      result.innerHTML = '<strong>⚠️ GPS tidak tersedia</strong><span>Gunakan pilihan Google Maps atau hubungi VRRINS GARAGE.</span>';
      return;
    }
    button.disabled = true;
    button.textContent = '⏳ MENCARI LOKASI...';
    navigator.geolocation.getCurrentPosition(position => {
      const km = distanceKm(GARAGE.lat, GARAGE.lng, position.coords.latitude, position.coords.longitude);
      const zoneId = detectZone(km);
      const z = ZONES[zoneId];
      const icon = zoneId === 1 ? '🟢' : zoneId === 2 ? '🟡' : '🔴';
      result.innerHTML = `<strong style="color:${z.color}">${icon} ${esc(z.label)} — ${km.toFixed(1)} KM</strong><span>Lokasi Anda berhasil dibaca. ${esc(z.desc)}</span>`;
      button.disabled = false;
      button.textContent = '📍 CEK LOKASI SAYA';
    }, error => {
      const message = error && error.code === 1 ? 'Izin lokasi ditolak.' : 'Lokasi belum dapat dibaca.';
      result.innerHTML = `<strong>⚠️ ${message}</strong><span>Izinkan akses lokasi pada browser lalu coba lagi. Jika gagal, gunakan Google Maps.</span>`;
      button.disabled = false;
      button.textContent = '📍 CEK LOKASI SAYA';
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  }

  document.addEventListener('click', event => {
    const mapZone = event.target.closest('[data-map-zone]');
    if (mapZone) {
      event.preventDefault();
      openModal(Number(mapZone.dataset.mapZone));
      return;
    }
    if (event.target.closest('[data-area-v2-close]')) {
      closeModal();
      return;
    }
    if (event.target.closest('[data-v2-gps]')) {
      locate();
    }
  });

  document.addEventListener('keydown', event => {
    const activeMapZone = event.target.closest?.('[data-map-zone]');
    if (activeMapZone && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openModal(Number(activeMapZone.dataset.mapZone));
    }
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  window.VRRINS_AREA_V2 = { GARAGE, ZONES, distanceKm, detectZone, open: openModal, close: closeModal };
})();
