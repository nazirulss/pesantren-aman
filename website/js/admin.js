/**
 * PESANTREN AMAN - Admin Monitoring & Data Management
 * PC RMI NU Kabupaten Demak - Satgas Perlindungan Santri
 */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verifikasi Autentikasi Pengguna
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) return;

  // 2. Inisialisasi Panel Dashboard
  initTabs();
  loadDashboardData();
  loadPermohonanData();
  loadPesantrenData();
  loadKomitmenData();
  initModals();
  initForms();
  initRefresh();
  initLogout();

  // Print Date
  const printDateEl = document.getElementById('print-date');
  if (printDateEl) {
    printDateEl.textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  }
});

/* ----------------------------------------------------
 * 0. Autentikasi & Pengaturan Hak Akses Peran
 * -------------------------------------------------- */
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.status === 401) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    const result = await res.json();
    if (!result.success || !result.user) {
      window.location.href = '/login';
      return false;
    }

    currentUser = result.user;
    applyUserRole(currentUser);
    return true;
  } catch (err) {
    console.error('Error saat verifikasi sesi login:', err);
    window.location.href = '/login';
    return false;
  }
}

function applyUserRole(user) {
  // Update Header User Profile
  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-display-role');
  const wilayahEl = document.getElementById('user-display-wilayah');

  if (nameEl) nameEl.textContent = user.nama;
  if (wilayahEl) wilayahEl.textContent = `${user.jabatan} — Wilayah: ${user.wilayahTugas || '14 Kecamatan'}`;

  if (roleEl) {
    if (user.role === 'superadmin') {
      roleEl.textContent = 'Super Admin';
      roleEl.className = 'bg-emerald-800 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase';
    } else if (user.role === 'fasilitator') {
      roleEl.textContent = 'Fasilitator';
      roleEl.className = 'bg-amber-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase';
    } else {
      roleEl.textContent = 'Pengamat MWC';
      roleEl.className = 'bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase';
    }
  }

  // Tampilkan tab Pengguna khusus Super Admin
  const tabBtnPengguna = document.getElementById('tab-btn-pengguna');
  if (user.role === 'superadmin' && tabBtnPengguna) {
    tabBtnPengguna.classList.remove('hidden');
  }

  // Mode Viewer / Pengamat: Nonaktifkan aksi tulis
  const bannerViewer = document.getElementById('banner-viewer-mode');
  const btnTambahPesantren = document.getElementById('btn-modal-tambah-pesantren');

  if (user.role === 'viewer') {
    if (bannerViewer) bannerViewer.classList.remove('hidden');
    if (btnTambahPesantren) btnTambahPesantren.classList.add('hidden');
  }
}

function initLogout() {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin keluar dari sistem monitoring?')) {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
          console.error(e);
        }
        localStorage.removeItem('pa_auth_token');
        localStorage.removeItem('pa_auth_user');
        window.location.href = '/login';
      }
    });
  }
}

/* ----------------------------------------------------
 * 1. Tab Navigation
 * -------------------------------------------------- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('active', 'bg-pa-primary', 'text-white');
        b.classList.add('text-gray-600');
      });

      btn.classList.add('active', 'bg-pa-primary', 'text-white');
      btn.classList.remove('text-gray-600');

      tabContents.forEach(tc => {
        if (tc.id === targetId) {
          tc.classList.remove('hidden');
        } else {
          tc.classList.add('hidden');
        }
      });

      // Lazy load tab data
      if (targetId === 'tab-pengguna' && currentUser?.role === 'superadmin') {
        loadUsersData();
      }
    });
  });
}

/* ----------------------------------------------------
 * 2. Load Dashboard & 14 Kecamatan Data
 * -------------------------------------------------- */
async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard');
    if (res.status === 401) return (window.location.href = '/login');
    const result = await res.json();
    if (!result.success) return;

    const { metrics, kecamatan, recentSambang, recentPermohonan } = result.data;

    // Update KPI Bar
    document.getElementById('kpi-target').textContent = metrics.totalTargetKabupaten;
    document.getElementById('kpi-tersambang').textContent = metrics.totalPesantrenTersambang;
    document.getElementById('kpi-terjadwal').textContent = metrics.totalPesantrenTerjadwal;
    document.getElementById('kpi-santri').textContent = (metrics.totalSantriTerlindungi || 0).toLocaleString('id-ID');
    document.getElementById('kpi-komitmen').textContent = metrics.totalKomitmen90Hari;
    document.getElementById('kpi-permohonan-baru').textContent = metrics.permohonanMenunggu;

    const pct = Math.round((metrics.totalPesantrenTersambang / metrics.totalTargetKabupaten) * 100);
    document.getElementById('kpi-persen-tersambang').textContent = `${pct}% tercapai`;

    const badgePermohonan = document.getElementById('badge-permohonan-count');
    if (badgePermohonan) {
      badgePermohonan.textContent = metrics.permohonanMenunggu;
      badgePermohonan.className = metrics.permohonanMenunggu > 0
        ? 'bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold'
        : 'bg-gray-400 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold';
    }

    renderKecamatanGrid(kecamatan);
    renderRecentSambang(recentSambang);
    renderRecentPermohonan(recentPermohonan);
  } catch (err) {
    console.error('Error load dashboard:', err);
  }
}

function renderKecamatanGrid(list) {
  const container = document.getElementById('grid-kecamatan-progress');
  if (!container) return;

  container.innerHTML = list.map(k => `
    <div class="p-3 bg-white rounded border border-gray-200 hover:border-pa-primary/40 transition-colors">
      <div class="flex items-center justify-between mb-1">
        <h4 class="font-bold text-xs text-pa-ink">${k.nama}</h4>
        <span class="text-[10px] font-mono font-bold ${k.persen > 0 ? 'text-emerald-700' : 'text-gray-400'}">${k.persen}%</span>
      </div>
      <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
        <div class="bg-pa-primary h-1.5 rounded-full transition-all duration-500" style="width: ${k.persen}%"></div>
      </div>
      <div class="flex justify-between items-center text-[10px] text-gray-500 font-editorial">
        <span>Tersambang: <strong class="text-pa-ink">${k.tersambang}/${k.target}</strong></span>
        <span>Santri: <strong class="font-mono text-pa-ink">${k.santri.toLocaleString('id-ID')}</strong></span>
      </div>
    </div>
  `).join('');
}

function renderRecentSambang(list) {
  const container = document.getElementById('list-recent-sambang');
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-500 py-3 text-center">Belum ada kunjungan tersambang tercatat.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="py-2.5 flex items-start justify-between border-b border-gray-100 last:border-0 gap-2">
      <div>
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[10px] text-gray-400">${item.id}</span>
          <h5 class="text-xs font-bold text-pa-ink font-display">${item.namaPesantren}</h5>
        </div>
        <p class="text-[11px] text-gray-500 font-editorial">Kec. ${item.kecamatan} • Pengasuh: ${item.pengasuh}</p>
        <span class="inline-block mt-0.5 text-[10px] font-mono font-medium text-emerald-700">
          Skor Indeks: ${item.skorIndeks}%
        </span>
      </div>
      <div class="text-right flex-shrink-0">
        <span class="text-[10px] font-mono text-gray-500 block">${item.tanggalSambang}</span>
        <span class="inline-block bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold mt-1">Tersambang</span>
      </div>
    </div>
  `).join('');
}

function renderRecentPermohonan(list) {
  const container = document.getElementById('list-recent-permohonan');
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-500 py-3 text-center">Tidak ada permohonan baru yang menunggu verifikasi.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="py-2.5 flex items-start justify-between gap-2 border-b border-gray-100 last:border-0">
      <div>
        <div class="flex items-center gap-1.5">
          <span class="font-mono text-[10px] text-gray-400">${item.id}</span>
          <h5 class="text-xs font-bold text-pa-ink font-display">${item.namaPesantren}</h5>
        </div>
        <p class="text-[11px] text-gray-500 font-editorial">Pengasuh: ${item.namaPengasuh} | Kec. ${item.kecamatan}</p>
        <span class="text-[10px] text-gray-400 font-mono">WA: ${item.kontakWa}</span>
      </div>
      <div class="text-right flex-shrink-0">
        ${currentUser?.role !== 'viewer' ? `
          <button onclick="bukaModalJadwal('${item.id}', '${item.namaPesantren.replace(/'/g, "\\'")}')" class="btn-primary text-[10px] py-1 px-2.5 font-bold shadow-sm">
            Jadwalkan →
          </button>
        ` : `
          <span class="text-[10px] text-gray-400 font-mono italic">Hanya Baca</span>
        `}
      </div>
    </div>
  `).join('');
}

/* ----------------------------------------------------
 * 3. Load & Manage Permohonan Sambang
 * -------------------------------------------------- */
let permohonanCache = [];

async function loadPermohonanData() {
  try {
    const res = await fetch('/api/admin/permohonan');
    if (res.status === 401) return (window.location.href = '/login');
    const result = await res.json();
    if (!result.success) return;

    permohonanCache = result.data;
    renderPermohonanTable(permohonanCache);
  } catch (err) {
    console.error('Error load permohonan:', err);
  }
}

function renderPermohonanTable(list) {
  const tbody = document.getElementById('table-permohonan-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-xs text-gray-500">Belum ada data permohonan sambang.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(item => {
    let statusBadge = 'bg-amber-100 text-amber-900 border border-amber-300';
    if (item.status === 'Terjadwal') statusBadge = 'bg-blue-100 text-blue-900 border border-blue-300';
    if (item.status === 'Tersambang') statusBadge = 'bg-emerald-100 text-emerald-900 border border-emerald-300';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-mono font-bold text-pa-primary">${item.id}</td>
        <td class="p-3">
          <strong class="font-display text-pa-ink block">${item.namaPesantren}</strong>
          <span class="text-[11px] text-gray-500">${item.alamat || '-'} (${item.jumlahSantri || '0 santri'})</span>
        </td>
        <td class="p-3">
          <span class="block font-medium">${item.namaPengasuh}</span>
          <span class="text-[11px] text-gray-500 font-mono">${item.kontakWa}</span>
        </td>
        <td class="p-3 font-medium">${item.kecamatan}</td>
        <td class="p-3 font-mono text-[11px]">${item.tanggalRencana || '-'}</td>
        <td class="p-3">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusBadge}">
            ${item.status}
          </span>
          ${item.fasilitator ? `<span class="block text-[10px] text-gray-500 mt-0.5 font-editorial">Fasilitator: ${item.fasilitator}</span>` : ''}
        </td>
        <td class="p-3 text-right whitespace-nowrap">
          ${currentUser?.role !== 'viewer' ? `
            <button onclick="bukaModalJadwal('${item.id}', '${item.namaPesantren.replace(/'/g, "\\'")}')" class="btn-primary text-[11px] py-1 px-3 font-bold">
              Verifikasi / Jadwalkan
            </button>
          ` : `
            <span class="text-[10px] text-gray-400 font-mono italic">Akses Baca</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

window.bukaModalJadwal = function(id, namaPesantren) {
  if (currentUser?.role === 'viewer') return;
  const modal = document.getElementById('modal-jadwal');
  if (!modal) return;

  document.getElementById('verif-id').value = id;
  document.getElementById('verif-nama-pesantren').value = namaPesantren;
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('verif-tanggal').value = today;

  modal.classList.remove('hidden');
};

/* ----------------------------------------------------
 * 4. Load & Manage Data Induk Pesantren
 * -------------------------------------------------- */
let pesantrenCache = [];

async function loadPesantrenData() {
  try {
    const searchKw = document.getElementById('filter-search-pesantren')?.value || '';
    const kec = document.getElementById('filter-kecamatan')?.value || 'all';
    const status = document.getElementById('filter-status-sambang')?.value || 'all';

    const url = `/api/admin/pesantren?search=${encodeURIComponent(searchKw)}&kecamatan=${encodeURIComponent(kec)}&status=${encodeURIComponent(status)}`;
    const res = await fetch(url);
    if (res.status === 401) return (window.location.href = '/login');
    const result = await res.json();
    if (!result.success) return;

    pesantrenCache = result.data;
    renderPesantrenTable(pesantrenCache);
  } catch (err) {
    console.error('Error load pesantren:', err);
  }
}

function renderPesantrenTable(list) {
  const tbody = document.getElementById('table-pesantren-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-xs text-gray-500">Tidak ada data pesantren yang sesuai dengan filter.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(item => {
    let statusClass = 'bg-gray-100 text-gray-700';
    if (item.statusSambang === 'Tersambang') statusClass = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
    if (item.statusSambang === 'Terjadwal') statusClass = 'bg-blue-100 text-blue-900 border border-blue-300 font-bold';
    if (item.statusSambang === 'Tahap Asesmen') statusClass = 'bg-amber-100 text-amber-900 border border-amber-300';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-mono font-bold text-pa-primary">${item.id}</td>
        <td class="p-3">
          <strong class="font-display text-pa-ink block">${item.namaPesantren}</strong>
          <span class="text-[11px] text-gray-500 font-mono">NSP: ${item.nsp || '-'}</span>
        </td>
        <td class="p-3">
          <span class="block">${item.pengasuh || '-'}</span>
          <span class="text-[11px] text-gray-400 font-editorial">${item.alamat || ''}</span>
        </td>
        <td class="p-3 font-medium">${item.kecamatan}</td>
        <td class="p-3">
          <span class="font-bold text-pa-ink">${(item.totalSantri || 0).toLocaleString('id-ID')}</span>
          <span class="block text-[10px] text-gray-400">Pa: ${item.santriPutra || 0} | Pi: ${item.santriPutri || 0}</span>
        </td>
        <td class="p-3">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] ${statusClass}">
            ${item.statusSambang}
          </span>
          <span class="block text-[10px] text-gray-500 mt-0.5">${item.tanggalSambang || '-'}</span>
        </td>
        <td class="p-3 text-right">
          <span class="text-[10px] font-mono text-gray-500 block">${item.prioritasPilar || '-'}</span>
          ${item.skorIndeks ? `<span class="inline-block text-[10px] font-bold text-emerald-800">Indeks: ${item.skorIndeks}%</span>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/* ----------------------------------------------------
 * 5. Load & Manage Komitmen 90 Hari
 * -------------------------------------------------- */
async function loadKomitmenData() {
  try {
    const res = await fetch('/api/admin/komitmen');
    if (res.status === 401) return (window.location.href = '/login');
    const result = await res.json();
    if (!result.success) return;

    renderKomitmenCards(result.data);
  } catch (err) {
    console.error('Error load komitmen:', err);
  }
}

function renderKomitmenCards(list) {
  const container = document.getElementById('list-komitmen-cards');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-500 text-center py-6">Belum ada komitmen 90 hari aktif.</p>';
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="p-4 sm:p-5 bg-white rounded border border-gray-200 shadow-sm space-y-3">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-gray-100 gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-pa-primary">${item.id}</span>
            <span class="text-gray-300">|</span>
            <h4 class="text-sm font-bold font-display text-pa-ink">${item.namaPesantren}</h4>
          </div>
          <p class="text-[11px] text-gray-500 font-editorial mt-0.5">Kecamatan ${item.kecamatan} | Pengasuh: ${item.pengasuh} | PIC: ${item.pic} (${item.kontakPic})</p>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-block bg-[#FAF0D7] text-[#8C6D1F] border border-[#D5C6AA] text-[10px] px-2.5 py-1 rounded font-bold font-display">
            ${item.statusTahap}
          </span>
          <span class="text-[10px] font-mono text-gray-400 hidden sm:inline">${item.periodeMulai} s.d. ${item.periodeSelesai}</span>
          ${currentUser?.role !== 'viewer' ? `
            <button onclick="bukaModalKomitmen('${item.id}', '${item.namaPesantren.replace(/'/g, "\\'")}', '${item.fokusPilihan.replace(/'/g, "\\'")}', '${item.statusTahap}')" class="btn-primary text-[10px] py-1 px-2.5 font-bold shadow-sm">
              Verifikasi Milestone →
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Rumusan Aksi -->
      <div class="p-3 bg-[#FAF8F5] rounded border border-gray-200 text-xs">
        <strong class="text-pa-primary block uppercase tracking-wider text-[10px] mb-0.5">Rumusan Perubahan Prioritas:</strong>
        <p class="font-bold text-gray-900">${item.fokusPilihan}</p>
        <p class="text-gray-600 font-editorial mt-1">${item.deskripsiAksi}</p>
      </div>

      <!-- 3 Milestone Bulanan -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
        
        <!-- Bulan 1 -->
        <div class="p-3 rounded border border-gray-200 ${item.milestoneBulan1?.status === 'Tuntas' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white'}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-[11px] text-gray-800">Bulan I (Konsolidasi)</span>
            <span class="text-[10px] font-bold font-mono ${item.milestoneBulan1?.status === 'Tuntas' ? 'text-emerald-700' : 'text-amber-600'}">${item.milestoneBulan1?.status || 'Menunggu'}</span>
          </div>
          <p class="text-[11px] text-gray-600 mb-2">${item.milestoneBulan1?.target || '-'}</p>
          <div class="pt-1.5 border-t border-gray-100 text-[10px] text-gray-500 font-editorial">
            ✓ ${item.milestoneBulan1?.verifikasiRmi || 'Belum diverifikasi'}
          </div>
        </div>

        <!-- Bulan 2 -->
        <div class="p-3 rounded border border-gray-200 ${item.milestoneBulan2?.status === 'Tuntas' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white'}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-[11px] text-gray-800">Bulan II (Sosialisasi)</span>
            <span class="text-[10px] font-bold font-mono ${item.milestoneBulan2?.status === 'Tuntas' ? 'text-emerald-700' : 'text-amber-600'}">${item.milestoneBulan2?.status || 'Menunggu'}</span>
          </div>
          <p class="text-[11px] text-gray-600 mb-2">${item.milestoneBulan2?.target || '-'}</p>
          <div class="pt-1.5 border-t border-gray-100 text-[10px] text-gray-500 font-editorial">
            ✓ ${item.milestoneBulan2?.verifikasiRmi || 'Belum diverifikasi'}
          </div>
        </div>

        <!-- Bulan 3 -->
        <div class="p-3 rounded border border-gray-200 ${item.milestoneBulan3?.status === 'Tuntas' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white'}">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-[11px] text-gray-800">Bulan III (Evaluasi)</span>
            <span class="text-[10px] font-bold font-mono ${item.milestoneBulan3?.status === 'Tuntas' ? 'text-emerald-700' : 'text-amber-600'}">${item.milestoneBulan3?.status || 'Menunggu'}</span>
          </div>
          <p class="text-[11px] text-gray-600 mb-2">${item.milestoneBulan3?.target || '-'}</p>
          <div class="pt-1.5 border-t border-gray-100 text-[10px] text-gray-500 font-editorial">
            ✓ ${item.milestoneBulan3?.verifikasiRmi || 'Belum diverifikasi'}
          </div>
        </div>

      </div>

    </div>
  `).join('');
}

window.bukaModalKomitmen = function(id, namaPesantren, fokusPilihan, statusTahap) {
  if (currentUser?.role === 'viewer') return;
  const modal = document.getElementById('modal-komitmen');
  if (!modal) return;

  document.getElementById('komitmen-id').value = id;
  document.getElementById('komitmen-pesantren').value = `${namaPesantren} (${fokusPilihan})`;
  document.getElementById('komitmen-status-tahap').value = statusTahap;
  document.getElementById('komitmen-verifikator').value = currentUser ? currentUser.nama : 'Tim Fasilitator PC RMI NU Demak';

  modal.classList.remove('hidden');
};

/* ----------------------------------------------------
 * 6. Manajemen Pengguna & Fasilitator (Super Admin)
 * -------------------------------------------------- */
async function loadUsersData() {
  if (currentUser?.role !== 'superadmin') return;

  const tbody = document.getElementById('table-users-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/users');
    if (res.status === 401) return (window.location.href = '/login');
    const result = await res.json();
    if (!result.success) return;

    renderUsersTable(result.data);
  } catch (err) {
    console.error('Error load users:', err);
  }
}

function renderUsersTable(list) {
  const tbody = document.getElementById('table-users-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-xs text-gray-500">Belum ada akun petugas tambahan.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(u => {
    let roleBadge = 'bg-amber-100 text-amber-900 border border-amber-300';
    if (u.role === 'superadmin') roleBadge = 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold';
    if (u.role === 'viewer') roleBadge = 'bg-blue-100 text-blue-900 border border-blue-300';

    return `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="p-3 font-mono font-bold text-pa-primary">${u.id}</td>
        <td class="p-3">
          <strong class="font-display text-pa-ink block">${u.nama}</strong>
          <span class="text-[11px] text-gray-500 font-editorial">${u.jabatan || '-'}</span>
        </td>
        <td class="p-3">
          <span class="block font-mono font-semibold text-gray-800">${u.username}</span>
          <span class="text-[11px] text-gray-400 font-mono">${u.email || '-'}</span>
        </td>
        <td class="p-3">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono ${roleBadge}">
            ${u.role}
          </span>
        </td>
        <td class="p-3 text-[11px] text-gray-600">${u.wilayahTugas || '-'}</td>
        <td class="p-3">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ${u.status || 'Aktif'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

/* ----------------------------------------------------
 * 7. Modals & Forms Handlers
 * -------------------------------------------------- */
function initModals() {
  // Modal Jadwal
  const modalJadwal = document.getElementById('modal-jadwal');
  const closeJadwal = document.getElementById('close-modal-jadwal');
  const batalJadwal = document.getElementById('btn-batal-jadwal');

  [closeJadwal, batalJadwal].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalJadwal.classList.add('hidden'));
  });

  // Modal Tambah Pesantren
  const modalTambah = document.getElementById('modal-tambah-pesantren');
  const openTambah = document.getElementById('btn-modal-tambah-pesantren');
  const closeTambah = document.getElementById('close-modal-tambah-pesantren');
  const batalTambah = document.getElementById('btn-batal-tambah-pesantren');

  if (openTambah) openTambah.addEventListener('click', () => modalTambah.classList.remove('hidden'));
  [closeTambah, batalTambah].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalTambah.classList.add('hidden'));
  });

  // Modal Update Komitmen 90 Hari
  const modalKomitmen = document.getElementById('modal-komitmen');
  const closeKomitmen = document.getElementById('close-modal-komitmen');
  const batalKomitmen = document.getElementById('btn-batal-komitmen');

  [closeKomitmen, batalKomitmen].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalKomitmen.classList.add('hidden'));
  });

  // Modal Tambah User (Super Admin)
  const modalUser = document.getElementById('modal-tambah-user');
  const openUser = document.getElementById('btn-modal-tambah-user');
  const closeUser = document.getElementById('close-modal-user');
  const batalUser = document.getElementById('btn-batal-user');

  if (openUser) openUser.addEventListener('click', () => modalUser.classList.remove('hidden'));
  [closeUser, batalUser].forEach(btn => {
    if (btn) btn.addEventListener('click', () => modalUser.classList.add('hidden'));
  });

  // Global Escape Key Listener for All Modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [modalJadwal, modalTambah, modalKomitmen, modalUser].forEach(m => {
        if (m && !m.classList.contains('hidden')) {
          m.classList.add('hidden');
        }
      });
    }
  });
}

function initForms() {
  // Form Verifikasi Permohonan
  const formJadwal = document.getElementById('form-verifikasi-jadwal');
  if (formJadwal) {
    formJadwal.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('verif-id').value;
      const status = document.getElementById('verif-status').value;
      const tanggalKunjungan = document.getElementById('verif-tanggal').value;
      const fasilitator = document.getElementById('verif-fasilitator').value?.trim();
      const catatanSatgas = document.getElementById('verif-catatan').value?.trim();

      try {
        const res = await fetch(`/api/admin/permohonan/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, tanggalKunjungan, fasilitator, catatanSatgas })
        });
        const result = await res.json();

        if (result.success) {
          showToast(`Kunjungan untuk ${id} berhasil dijadwalkan!`, 'success');
          document.getElementById('modal-jadwal').classList.add('hidden');
          loadPermohonanData();
          loadPesantrenData();
          loadDashboardData();
        } else {
          showToast(result.message || 'Gagal menyimpan verifikasi jadwal.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan jaringan saat menyimpan jadwal.', 'error');
      }
    });
  }

  // Form Tambah Pesantren
  const formTambah = document.getElementById('form-tambah-pesantren');
  if (formTambah) {
    formTambah.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        namaPesantren: document.getElementById('add-nama-pesantren').value.trim(),
        nsp: document.getElementById('add-nsp').value.trim(),
        kecamatan: document.getElementById('add-kecamatan').value,
        pengasuh: document.getElementById('add-pengasuh').value.trim(),
        alamat: document.getElementById('add-alamat').value.trim(),
        santriPutra: document.getElementById('add-putra').value,
        santriPutri: document.getElementById('add-putri').value,
        statusSambang: document.getElementById('add-status').value,
        prioritasPilar: document.getElementById('add-pilar').value.trim()
      };

      try {
        const res = await fetch('/api/admin/pesantren', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
          showToast('Pesantren baru berhasil didaftarkan!', 'success');
          formTambah.reset();
          document.getElementById('modal-tambah-pesantren').classList.add('hidden');
          loadPesantrenData();
          loadDashboardData();
        } else {
          showToast(result.message || 'Gagal menambahkan pesantren.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan sistem saat mendaftar.', 'error');
      }
    });
  }

  // Form Update Komitmen 90 Hari
  const formKomitmen = document.getElementById('form-update-komitmen');
  if (formKomitmen) {
    formKomitmen.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('komitmen-id').value;
      const statusTahap = document.getElementById('komitmen-status-tahap').value;
      const selectedBulan = document.querySelector('input[name="pilih_bulan"]:checked')?.value || '1';
      const statusCapaian = document.getElementById('komitmen-milestone-status').value;
      const verifikator = document.getElementById('komitmen-verifikator').value.trim() || 'Tim Fasilitator RMI';
      const catatan = document.getElementById('komitmen-catatan').value.trim();

      const targetField = `milestoneBulan${selectedBulan}`;
      const payload = {
        statusTahap,
        [targetField]: {
          status: statusCapaian,
          verifikasiRmi: catatan ? `${catatan} (${verifikator})` : `Diverifikasi (${verifikator})`
        }
      };

      try {
        const res = await fetch(`/api/admin/komitmen/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
          showToast(`Milestone komitmen ${id} berhasil diperbarui!`, 'success');
          document.getElementById('modal-komitmen').classList.add('hidden');
          loadKomitmenData();
          loadDashboardData();
        } else {
          showToast(result.message || 'Gagal memperbarui milestone.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan saat menyimpan pembaruan komitmen.', 'error');
      }
    });
  }

  // Form Tambah User / Fasilitator (Super Admin)
  const formUser = document.getElementById('form-tambah-user');
  if (formUser) {
    formUser.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        nama: document.getElementById('user-nama').value.trim(),
        username: document.getElementById('user-username').value.trim(),
        role: document.getElementById('user-role').value,
        password: document.getElementById('user-password').value,
        email: document.getElementById('user-email').value.trim(),
        jabatan: document.getElementById('user-jabatan').value.trim(),
        wilayahTugas: document.getElementById('user-wilayah').value.trim()
      };

      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
          showToast('Akun petugas baru berhasil dibuat!', 'success');
          formUser.reset();
          document.getElementById('modal-tambah-user').classList.add('hidden');
          loadUsersData();
        } else {
          showToast(result.message || 'Gagal membuat akun.', 'error');
        }
      } catch (err) {
        showToast('Terjadi kesalahan saat membuat akun petugas.', 'error');
      }
    });
  }

  // Filters Event Listeners
  const searchInput = document.getElementById('filter-search-pesantren');
  const kecFilter = document.getElementById('filter-kecamatan');
  const statusFilter = document.getElementById('filter-status-sambang');

  [searchInput, kecFilter, statusFilter].forEach(el => {
    if (el) {
      el.addEventListener('input', loadPesantrenData);
      el.addEventListener('change', loadPesantrenData);
    }
  });
}

function initRefresh() {
  const btn = document.getElementById('btn-refresh-data');
  if (btn) {
    btn.addEventListener('click', () => {
      loadDashboardData();
      loadPermohonanData();
      loadPesantrenData();
      loadKomitmenData();
      if (currentUser?.role === 'superadmin') loadUsersData();
      showToast('Data dashboard telah dimutakhirkan.', 'info');
    });
  }
}

/* ----------------------------------------------------
 * 8. Toast Notification Helper
 * -------------------------------------------------- */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'p-3 rounded shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300';

  if (type === 'success') {
    toast.className += ' bg-emerald-800 text-white border border-emerald-600';
  } else if (type === 'error') {
    toast.className += ' bg-red-800 text-white border border-red-600';
  } else {
    toast.className += ' bg-gray-800 text-white border border-gray-600';
  }

  toast.innerHTML = `<span>✦</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
