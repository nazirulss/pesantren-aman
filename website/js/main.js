/**
 * PESANTREN AMAN - Main Client JavaScript
 * Mengatur interaktivitas UI, mobile menu, modal 5 pilar, filter unduhan,
 * instrumen asesmen mandiri, pembaca dokumen di peramban, generator piagam/SOP,
 * dan registrasi Service Worker PWA.
 *
 * PC RMI NU Kabupaten Demak - Satgas Perlindungan Santri
 */

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initSplashScreen();
  initMobileMenu();
  initPillarModal();
  initStatCounters();
  initUnduhanFilters();
  initSambangForm();
  initAsesmenMandiri();
  initDocReader();
  initDocGenerator();
});

/* ----------------------------------------------------
 * 0. Service Worker Registration (PWA Offline-First)
 * -------------------------------------------------- */
function initServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker terpasang aktif. Ruang lingkup:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker gagal didaftarkan:', err);
        });
    });
  }
}

/* ----------------------------------------------------
 * 0.1 Splash Screen Handler
 * -------------------------------------------------- */
function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    const dismissSplash = () => {
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      setTimeout(() => {
        if (splash && splash.parentElement) {
          splash.remove();
        }
      }, 500);
    };

    if (document.readyState === 'complete') {
      setTimeout(dismissSplash, 400);
    } else {
      window.addEventListener('load', () => setTimeout(dismissSplash, 400));
      setTimeout(dismissSplash, 1800);
    }
  }
}

/* ----------------------------------------------------
 * 1. Mobile Menu Toggle
 * -------------------------------------------------- */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.innerHTML = `
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        `;
      } else {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = `
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        `;
      }
    });
  }
}

/* ----------------------------------------------------
 * 2. Data 5 Pilar & Modal Interaktif
 * -------------------------------------------------- */
const PILLAR_DETAILS = {
  1: {
    title: 'Pilar 1 — Pengasuhan yang Aman & Bermartabat',
    subtitle: 'Ta’dib Nabawi & Disiplin Positif Tanpa Kekerasan',
    icon: '/brand/icons/pilar-1-pengasuhan-aman.svg',
    summary: 'Membangun pola pengasuhan yang mendidik, meneladani akhlak Rasulullah SAW, menghormati martabat santri, serta meniadakan hukuman fisik dan intimidasi.',
    focusList: [
      'Transformasi metode disiplin dari hukuman fisik (ta’zir berlebihan) ke pembinaan restoratif bermakna.',
      'Pelatihan manajemen emosi ustadz, pembina asrama, dan pengurus kamar.',
      'Pemberdayaan santri senior sebagai pelindung dan teladan, bukan penegak sanksi liar.',
      'Standar perlindungan kesehatan, higienitas, dan ruang istirahat santri yang layak.'
    ],
    fieldKit: 'Modul Fasilitator PR-01 (Sesi 2), Kartu Kasus K-01 & K-02',
    link: '/lima-pilar.html#pilar-1'
  },
  2: {
    title: 'Pilar 2 — Kepatuhan Hukum & Literasi Perlindungan',
    subtitle: 'Kepastian Payung Hukum & Harmonisasi Kitab Kuning',
    icon: '/brand/icons/pilar-2-kepatuhan-hukum.svg',
    summary: 'Meningkatkan pemahaman jajaran pimpinan dan pengasuh tentang UU Perlindungan Anak, UU TPKS, PMA Pencegahan Kekerasan di Pesantren, serta relasinya dengan maqashid syariah.',
    focusList: [
      'Sosialisasi batas-batas hukum pidana dan perdata dalam interaksi di lembaga pendidikan.',
      'Harmonisasi kaidah fiqih (dar’ul mafasid muqaddamun ‘ala jalbil mashalih) dengan perlindungan anak.',
      'Pencegahan risiko hukum bagi pimpinan pesantren akibat pembiaran insiden kekerasan.',
      'Pemberian panduan tertulis mengenai larangan perundungan siber, fisik, maupun verbal.'
    ],
    fieldKit: 'Buku Saku Literasi Hukum Santri, Kartu Kasus K-03, Leaflet Hak Anak',
    link: '/lima-pilar.html#pilar-2'
  },
  3: {
    title: 'Pilar 3 — Tata Kelola & Tanggung Jawab Kelembagaan',
    subtitle: 'Struktur Satgas Internal & Prosedur Operasional Terbuka',
    icon: '/brand/icons/pilar-3-tata-kelola.svg',
    summary: 'Memastikan pesantren memiliki regulasi tertulis, pembagian peran pengawasan yang terstruktur, Tim Tanggap Cepat internal, serta kejelasan alur tanggung jawab.',
    focusList: [
      'Pembentukan Satgas Penanggulangan & Pencegahan Kekerasan tingkat pondok pesantren.',
      'Penyusunan SOP Pengasuhan Asrama dan Protokol Keamanan Jam Malam / Tamu.',
      'Pakta Integritas seluruh pengajar dan pengurus terhadap perlindungan santri.',
      'Sistem seleksi dan pencatatan riwayat tenaga pendidik dan pembina asrama.'
    ],
    fieldKit: 'Template SK Satgas Pesantren, Format SOP Asrama, Berita Acara PR-08',
    link: '/lima-pilar.html#pilar-3'
  },
  4: {
    title: 'Pilar 4 — Sistem Perlindungan & Pengaduan Aman',
    subtitle: 'Kanal Aduan Rahasia, Tanpa Rasa Takut, Respon 24 Jam',
    icon: '/brand/icons/pilar-4-sistem-pengaduan.svg',
    summary: 'Mendorong tersedianya saluran pelaporan yang aman, terjamin kerahasiaannya, prosedur respons cepat tanpa intimidasi korban, dan rujukan profesional saat darurat.',
    focusList: [
      'Penyediaan kotak aduan fisik tertutup di area santri dan kanal digital/WhatsApp konselor.',
      'Protokol perlindungan pelapor (whistleblower) dari risiko perundungan atau pembalasan.',
      'Layanan bimbingan konseling sebaya dan pendampingan psikologis awal.',
      'Alur rujukan terpadu ke Unit PPA Polres Demak, Dinas Sosial/P3A, dan RMI NU Demak.'
    ],
    fieldKit: 'Poster Alur Pengaduan Aman, SOP Kotak Curhat Santri, Kartu Kasus K-04 & K-05',
    link: '/lima-pilar.html#pilar-4'
  },
  5: {
    title: 'Pilar 5 — Evaluasi & Perbaikan Berkelanjutan',
    subtitle: 'Siklus Pendampingan 90 Hari & Perubahan Nyata',
    icon: '/brand/icons/pilar-5-evaluasi-berkelanjutan.svg',
    summary: 'Memastikan komitmen deklarasi pesantren diterjemahkan menjadi rencana aksi konkrit, pemetaan berkala, monitoring partisipatif, serta evaluasi kemajuan tiap triwulan.',
    focusList: [
      'Penerapan instrumen pemetaan mandiri 5 pilar untuk mengidentifikasi celah kerentanan.',
      'Penyusunan Rencana Aksi 90 Hari: "Satu Pesantren, Satu Perbaikan Nyata".',
      'Kunjungan berkala (Sambang Pesantren) oleh Tim Fasilitator RMI NU Demak.',
      'Pemberian Piagam Komitmen Pesantren Aman dan rekognisi publik bagi pesantren teladan.'
    ],
    fieldKit: 'Checklist Pemetaan PR-07, Form Rencana Aksi PR-06, Piagam Komitmen PR-05',
    link: '/lima-pilar.html#pilar-5'
  }
};

function initPillarModal() {
  const modal = document.getElementById('pillar-modal');
  const closeBtn = document.getElementById('close-pillar-modal');
  const triggers = document.querySelectorAll('[data-pillar-id]');

  if (!modal) return;

  triggers.forEach(card => {
    card.addEventListener('click', () => {
      const pilarId = card.getAttribute('data-pillar-id');
      const data = PILLAR_DETAILS[pilarId];
      if (!data) return;

      document.getElementById('modal-pillar-title').textContent = data.title;
      document.getElementById('modal-pillar-subtitle').textContent = data.subtitle;
      document.getElementById('modal-pillar-summary').textContent = data.summary;
      document.getElementById('modal-pillar-icon').src = data.icon;
      document.getElementById('modal-pillar-kit').textContent = data.fieldKit;
      
      const linkEl = document.getElementById('modal-pillar-link');
      if (linkEl) linkEl.href = data.link;

      const listContainer = document.getElementById('modal-pillar-focus');
      listContainer.innerHTML = '';
      data.focusList.forEach(item => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2 text-xs text-gray-700';
        li.innerHTML = `
          <span class="text-emerald-700 font-bold">✦</span>
          <span>${item}</span>
        `;
        listContainer.appendChild(li);
      });

      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    });
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

/* ----------------------------------------------------
 * 3. Counter Statistik Agregat Animasi
 * -------------------------------------------------- */
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
        const duration = 1500;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = Math.floor(easeOut * target);

          entry.target.textContent = currentVal.toLocaleString('id-ID');

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            entry.target.textContent = target.toLocaleString('id-ID');
          }
        };

        requestAnimationFrame(updateCount);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

/* ----------------------------------------------------
 * 4. Filter dan Pencarian Unduhan
 * -------------------------------------------------- */
function initUnduhanFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('search-unduhan');
  const downloadCards = document.querySelectorAll('.download-item');

  if (!downloadCards.length) return;

  let currentCategory = 'all';
  let currentKeyword = '';

  const applyFilters = () => {
    downloadCards.forEach(card => {
      const cardCat = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('.download-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.download-desc')?.textContent || '').toLowerCase();

      const matchesCat = (currentCategory === 'all' || cardCat === currentCategory);
      const matchesKeyword = !currentKeyword || cardTitle.includes(currentKeyword) || cardDesc.includes(currentKeyword);

      if (matchesCat && matchesKeyword) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('bg-pa-primary', 'text-white');
        b.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-300');
      });
      btn.classList.add('bg-pa-primary', 'text-white');
      btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');

      currentCategory = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentKeyword = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

/* ----------------------------------------------------
 * 5. Form Permohonan Sambang Pesantren + URL Param Autopopulate
 * -------------------------------------------------- */
function initSambangForm() {
  const form = document.getElementById('form-sambang');
  if (!form) return;

  // Tangkap query string dari URL (misal setelah asesmen mandiri)
  const params = new URLSearchParams(window.location.search);
  const paramPesantren = params.get('pesantren');
  const paramKecamatan = params.get('kecamatan');
  const paramSkor = params.get('skor');

  if (paramPesantren && form.namaPesantren) {
    form.namaPesantren.value = paramPesantren;
  }
  if (paramKecamatan && form.kecamatan) {
    form.kecamatan.value = paramKecamatan;
  }
  if (paramSkor && form.catatanTambahan) {
    form.catatanTambahan.value = `[Hasil Asesmen Mandiri 5 Pilar: Skor Indeks ${paramSkor}%]. Kami bermaksud mengundang Tim Fasilitator RMI NU Demak untuk mendiskusikan tindak lanjut rekomendasi Rencana Aksi 90 Hari.`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Kirim Permohonan';

    const payload = {
      namaPesantren: form.namaPesantren?.value?.trim(),
      namaPengasuh: form.namaPengasuh?.value?.trim(),
      kontakWa: form.kontakWa?.value?.trim(),
      kecamatan: form.kecamatan?.value,
      alamat: form.alamat?.value?.trim(),
      jumlahSantri: form.jumlahSantri?.value,
      tanggalRencana: form.tanggalRencana?.value,
      fokusPrioritas: form.fokusPrioritas?.value || 'Semua 5 Pilar',
      catatanTambahan: form.catatanTambahan?.value?.trim()
    };

    if (!payload.namaPesantren || !payload.namaPengasuh || !payload.kontakWa || !payload.kecamatan) {
      showToast('Mohon lengkapi semua data wajib bertanda bintang (*)', 'warning');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Mengirim Permohonan...
      `;
    }

    try {
      const response = await fetch('/api/permohonan-sambang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast(`Alhamdulillah! Permohonan Sambang tercatat dengan No. Tiket: ${result.data?.id || 'PA-DEMAK'}`, 'success');
        form.reset();

        const successNotice = document.getElementById('form-success-notice');
        if (successNotice) {
          successNotice.classList.remove('hidden');
          const idEl = document.getElementById('ticket-reg-id');
          if (idEl) idEl.textContent = result.data?.id;
          successNotice.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        showToast(result.message || 'Terjadi kendala saat mengirim formulir. Silakan coba kembali.', 'error');
      }
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Gagal terhubung ke server. Pastikan koneksi jaringan Anda aktif.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

/* ----------------------------------------------------
 * 6. Simulasi Asesmen Mandiri 5 Pilar (Interactive Checklist)
 * -------------------------------------------------- */
function initAsesmenMandiri() {
  const container = document.getElementById('kuesioner-container');
  if (!container) return;

  const allQuestions = [
    'p1_1', 'p1_2', 'p1_3',
    'p2_1', 'p2_2', 'p2_3',
    'p3_1', 'p3_2', 'p3_3',
    'p4_1', 'p4_2', 'p4_3',
    'p5_1', 'p5_2', 'p5_3'
  ];

  const radioInputs = container.querySelectorAll('input[type="radio"]');
  const textProgres = document.getElementById('text-progres');
  const barProgres = document.getElementById('bar-progres');
  const btnHitung = document.getElementById('btn-hitung-asesmen');
  const hasilContainer = document.getElementById('hasil-asesmen-container');
  const btnCetak = document.getElementById('btn-cetak-hasil');
  const btnMulaiUlang = document.getElementById('btn-mulai-ulang');
  const linkSambang = document.getElementById('link-lanjut-sambang');

  // Update progress tracker
  const updateProgress = () => {
    let answered = 0;
    allQuestions.forEach(qName => {
      const checked = container.querySelector(`input[name="${qName}"]:checked`);
      if (checked) answered++;
    });

    const percent = Math.round((answered / allQuestions.length) * 100);
    if (textProgres) textProgres.textContent = `${answered}/${allQuestions.length} Terjawab`;
    if (barProgres) barProgres.style.width = `${percent}%`;
  };

  radioInputs.forEach(input => {
    input.addEventListener('change', updateProgress);
  });

  // Calculate scores and render action plan
  if (btnHitung) {
    btnHitung.addEventListener('click', () => {
      // Validasi data identitas singkat
      const namaPesantren = document.getElementById('namaPesantrenAsesmen')?.value?.trim() || 'Pondok Pesantren Mitra';
      const pengasuh = document.getElementById('pengasuhAsesmen')?.value?.trim() || 'Pengasuh Pesantren';
      const kecamatan = document.getElementById('kecamatanAsesmen')?.value || 'Kabupaten Demak';

      // Periksa butir yang belum terisi
      const unanswered = [];
      allQuestions.forEach((qName, idx) => {
        const checked = container.querySelector(`input[name="${qName}"]:checked`);
        if (!checked) unanswered.push(idx + 1);
      });

      if (unanswered.length > 0) {
        showToast(`Mohon lengkapi seluruh 15 butir pertanyaan (${unanswered.length} butir belum terisi).`, 'warning');
        // Scroll ke butir pertama yang belum dijawab
        const firstUnansweredInput = container.querySelector(`input[name="p${Math.ceil(unanswered[0]/3)}_${((unanswered[0]-1)%3)+1}"]`);
        if (firstUnansweredInput) {
          firstUnansweredInput.closest('div').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Hitung skor per pilar (Masing-masing 3 pertanyaan @0, 50, 100 => Max 300)
      const getPillarScore = (pIndex) => {
        let total = 0;
        for (let i = 1; i <= 3; i++) {
          const val = container.querySelector(`input[name="p${pIndex}_${i}"]:checked`)?.value;
          total += parseInt(val || '0', 10);
        }
        return total;
      };

      const scoreP1 = getPillarScore(1);
      const scoreP2 = getPillarScore(2);
      const scoreP3 = getPillarScore(3);
      const scoreP4 = getPillarScore(4);
      const scoreP5 = getPillarScore(5);

      const totalPoints = scoreP1 + scoreP2 + scoreP3 + scoreP4 + scoreP5;
      const totalPercent = Math.round((totalPoints / 1500) * 100);

      const percentP1 = Math.round((scoreP1 / 300) * 100);
      const percentP2 = Math.round((scoreP2 / 300) * 100);
      const percentP3 = Math.round((scoreP3 / 300) * 100);
      const percentP4 = Math.round((scoreP4 / 300) * 100);
      const percentP5 = Math.round((scoreP5 / 300) * 100);

      // Render Hasil ke Elemen DOM
      const resNama = document.getElementById('res-nama-pesantren');
      const resLokasi = document.getElementById('res-detail-lokasi');
      const resSkor = document.getElementById('res-skor-total');
      const resBadge = document.getElementById('res-badge-kategori');
      const printTanggal = document.getElementById('print-tanggal-waktu');

      if (resNama) resNama.textContent = namaPesantren;
      if (resLokasi) resLokasi.textContent = `Pengasuh: ${pengasuh} | Kec. ${kecamatan}, Kab. Demak`;
      if (resSkor) resSkor.textContent = `${totalPercent}%`;

      if (printTanggal) {
        const now = new Date();
        printTanggal.textContent = now.toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }) + ' WIB';
      }

      // Tentukan Marhalah / Kategori Kesiapan
      let badgeText = '';
      let badgeClasses = '';
      if (totalPercent < 50) {
        badgeText = 'Tahap Perintisan (Ta’sis)';
        badgeClasses = 'bg-amber-100 text-amber-900 border border-amber-300';
      } else if (totalPercent < 80) {
        badgeText = 'Tahap Berkembang (Tarqiyah)';
        badgeClasses = 'bg-emerald-100 text-emerald-900 border border-emerald-300';
      } else {
        badgeText = 'Tahap Mandiri (Istiqlal)';
        badgeClasses = 'bg-[#FAF0D7] text-[#8C6D1F] border border-[#D5C6AA]';
      }

      if (resBadge) {
        resBadge.textContent = badgeText;
        resBadge.className = `inline-block px-3 py-1 rounded text-xs font-bold font-display mt-0.5 ${badgeClasses}`;
      }

      // Set Per-Pillar Progress & Texts
      const updatePillarRow = (pNum, percent) => {
        const textEl = document.getElementById(`score-p${pNum}`);
        const barEl = document.getElementById(`bar-p${pNum}`);
        if (textEl) textEl.textContent = `${percent}%`;
        if (barEl) {
          barEl.style.width = `${percent}%`;
          if (percent < 50) {
            barEl.className = 'h-full transition-all duration-500 bg-amber-500';
          } else if (percent < 80) {
            barEl.className = 'h-full transition-all duration-500 bg-[#23966B]';
          } else {
            barEl.className = 'h-full transition-all duration-500 bg-[#145A42]';
          }
        }
      };

      updatePillarRow(1, percentP1);
      updatePillarRow(2, percentP2);
      updatePillarRow(3, percentP3);
      updatePillarRow(4, percentP4);
      updatePillarRow(5, percentP5);

      // Rumuskan 3 Rekomendasi Rencana Aksi 90 Hari yang Dipersonalisasi
      const pillarScores = [
        { id: 1, name: 'Pilar 1 (Pengasuhan)', score: percentP1, rec: 'Penerbitan Surat Keputusan (SK) Pengasuh tentang Penghapusan Hukuman Fisik dan Pembakuan Sanksi Edukatif (hafalan nadhom / khidmah kebersihan) sebagai pengganti ta’zir fisik.' },
        { id: 2, name: 'Pilar 2 (Literasi Hukum)', score: percentP2, rec: 'Penyelenggaraan Halaqah Literasi Hukum Santri & Ustadz Pembina Asrama bersama Satgas RMI NU terkait batasan pidana perundungan dan perlindungan hak anak.' },
        { id: 3, name: 'Pilar 3 (Tata Kelola)', score: percentP3, rec: 'Pembentukan Tim Satgas Pencegahan Kekerasan tingkat pesantren dan penyusunan SOP Pengasuhan Jam Istirahat Asrama secara tertulis.' },
        { id: 4, name: 'Pilar 4 (Kanal Pengaduan)', score: percentP4, rec: 'Penyediaan Kotak Curhat Tertutup di area santri putra/putri serta penunjukan ustadz/ustadzah konselor rahasia yang tidak mengintimidasi pelapor.' },
        { id: 5, name: 'Pilar 5 (Evaluasi)', score: percentP5, rec: 'Penjadwalan Kunjungan Sambang Pesantren oleh RMI NU Demak dan penandatanganan Piagam Komitmen Deklarasi Pesantren Aman.' }
      ];

      // Urutkan dari pilar dengan skor terendah
      pillarScores.sort((a, b) => a.score - b.score);

      const listRekomendasi = document.getElementById('list-rekomendasi');
      if (listRekomendasi) {
        listRekomendasi.innerHTML = '';
        pillarScores.slice(0, 3).forEach((item, index) => {
          const li = document.createElement('li');
          li.className = 'flex items-start gap-2 bg-white p-2.5 rounded border border-gray-200';
          li.innerHTML = `
            <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pa-primary text-white text-[10px] font-mono font-bold flex-shrink-0 mt-0.5">
              ${index + 1}
            </span>
            <div class="flex-1">
              <strong class="text-pa-ink block font-display text-[11px]">${item.name} — Capaian: ${item.score}%</strong>
              <span class="text-gray-700 leading-snug block mt-0.5">${item.rec}</span>
            </div>
          `;
          listRekomendasi.appendChild(li);
        });
      }

      // Hubungkan tombol aksi Sambang dengan parameter auto-fill
      if (linkSambang) {
        linkSambang.href = `/kontak?pesantren=${encodeURIComponent(namaPesantren)}&kecamatan=${encodeURIComponent(kecamatan)}&skor=${totalPercent}`;
      }

      // Tampilkan kontainer hasil dan scroll ke sana
      if (hasilContainer) {
        hasilContainer.classList.remove('hidden');
        hasilContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      showToast('Analisis indeks kesiapan berhasil dihitung!', 'success');
    });
  }

  // Tombol Cetak / PDF
  if (btnCetak) {
    btnCetak.addEventListener('click', () => {
      window.print();
    });
  }

  // Tombol Mulai Ulang
  if (btnMulaiUlang) {
    btnMulaiUlang.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mengulang pengisian asesmen dari awal?')) {
        radioInputs.forEach(i => i.checked = false);
        updateProgress();
        if (hasilContainer) hasilContainer.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}

/* ----------------------------------------------------
 * 7. In-Browser Document Reader (Modal Field Kit v1.0)
 * -------------------------------------------------- */
const DOC_CONTENT_MAP = {
  'PR-01': {
    code: 'PR-01',
    title: 'Modul Fasilitator Sambang Pesantren (Field Guide)',
    category: 'Panduan Lapangan Operasional',
    duration: '120 Menit Alur Fasilitasi',
    sections: [
      {
        heading: '1. Etika & Adab Sowan Pengasuh',
        body: 'Fasilitator Satgas RMI NU wajib berpakaian santri sopan (berpeci, berbaju koko/batik rapi, dan bersarung). Kedatangan bukan sebagai auditor yang memeriksa atau menyalahkan, melainkan sebagai santri yang sowan tabarrukan dan mendengarkan keluh kesah pengasuh dalam mendidik generasi saat ini.'
      },
      {
        heading: '2. Alur Dialog 5 Pertanyaan Kunci',
        body: 'Sesi santai di serambi ndalem selama 40 menit: (1) Siapa santri yang paling rentan membutuhkan perlindungan? (2) Pola asuh dan pendisiplinan apa yang saat ini diterapkan? (3) Siapa yang bertanggung jawab langsung ketika terjadi gesekan antar-santri? (4) Bagaimana santri dapat melapor tanpa takut diintimidasi? (5) Apa satu perbaikan konkret yang disepakati bersama dalam 90 hari ke depan?'
      },
      {
        heading: '3. Memandu Simulasi Kartu Kasus Bersama Pengurus',
        body: 'Fasilitator membagikan 5 kartu kasus fiktif kepada ustadz pembina dan pengurus kamar. Setiap kelompok mendiskusikan selama 15 menit: mana tindakan yang sah secara fiqih ta\'dib, mana yang melanggar batas hukum pidana negara, dan bagaimana menyusun sanksi edukatif pengganti hukuman fisik.'
      },
      {
        heading: '4. Perumusan Rencana Aksi 90 Hari & Penyerahan Piagam',
        body: 'Menutup pertemuan dengan menetapkan "Satu Pesantren, Satu Perubahan Nyata". Pengasuh menandatangani Piagam Komitmen Pesantren Mitra Aman yang dibubuhi stempel resmi PC RMI NU Demak sebagai simbol kemitraan berkelanjutan.'
      }
    ]
  },
  'PR-02': {
    code: 'PR-02',
    title: 'Kartu Percakapan 5 Pertanyaan Reflektif',
    category: 'Kartu Saku Masyaikh & Pengurus',
    duration: '40 Menit Dialog Serambi',
    sections: [
      {
        heading: 'Pertanyaan 1: Siapa yang Kita Lindungi?',
        body: 'Mengidentifikasi santri baru, santri yunior, santri yatim/piatu, santri yang berkebutuhan khusus, serta santri yang berkarakter pemalu atau pendiam yang kerap menjadi sasaran empuk perundungan relasional.'
      },
      {
        heading: 'Pertanyaan 2: Bagaimana Pola Asuh & Batas Disiplin?',
        body: 'Meninjau ulang tradisi ta’zir asrama: meniadakan tamparan wajah, sanksi fisik yang melebihi batas kekuatan anak, dan menggantinya dengan ta’zir keilmuan seperti membaca wirid, menghafal bait matan, atau khidmah kebersihan masjid.'
      },
      {
        heading: 'Pertanyaan 3: Siapa yang Memegang Kendali Pengawasan?',
        body: 'Mencegah terjadinya kekuasaan liar santri senior atas yunior di kamar asrama pada malam hari. Memastikan selalu ada Ustadz/Ustadzah Pembina yang memantau lorong dan ruang istirahat.'
      },
      {
        heading: 'Pertanyaan 4: Apakah Kanal Curhat Santri Benar-Benar Aman?',
        body: 'Menilai apakah ada rasa takut santri untuk melapor. Memastikan santri yang melapor tidak dihakimi, tidak dicap sebagai pengkhianat kamar, dan identitasnya dilindungi penuh.'
      },
      {
        heading: 'Pertanyaan 5: Apa Komitmen Perbaikan Konkret Kita?',
        body: 'Menentukan 1 langkah realistis dalam 90 hari: misalnya menerbitkan SOP Tata Tertib Kamar tertulis, memasang kotak curhat tertutup, atau mengadakan pelatihan komunikasi empati ustadz.'
      }
    ]
  },
  'PR-03': {
    code: 'PR-03',
    title: 'Kumpulan Kartu Simulasi Kasus Nyata Lapangan',
    category: 'Studi Skenario & Analisis Risiko',
    duration: '5 Kasus Tematik',
    sections: [
      {
        heading: 'Kasus 1: Senioritas & Piket Paksa di Kamar Putra',
        body: 'Skenario: Santri baru sering dipaksa mencuci baju dan membelikan makanan senior hingga larut malam. Solusi SOP: Pisahkan peran santri senior sebagai mentor belajar (kakak asuh), terbitkan jadwal piket resmi kamar tertulis, dan berikan sanksi pembinaan jika ada senioritas liar.'
      },
      {
        heading: 'Kasus 2: Hukuman Fisik Santri Merokok / Kabur Malam',
        body: 'Skenario: Pengurus memukul telapak kaki santri yang melanggar jam malam hingga lebam. Analisis Hukum: Hukuman fisik berisiko pidana Pasal 80 UU Perlindungan Anak & Pasal 351 KUHP. Solusi SOP: Ubah sanksi ke ta’zir keilmuan (hafalan 50 bait Alfiyyah / Juz 30) dan musyawarah bersama wali santri.'
      },
      {
        heading: 'Kasus 3: Pengucilan Sosial (Cyberbullying) di Asrama Putri',
        body: 'Skenario: Santriwati dituduh mencuri kerudung dan dikucilkan seluruh asrama melalui rumor grup HP hingga ingin boyong. Solusi SOP: Konseling empati oleh Bu Nyai, muhasabah adab ukhuwwah kamar, dan investigasi barang hilang dipimpin langsung ustadzah tanpa pengadilan massa.'
      },
      {
        heading: 'Kasus 4: Pengaduan Dugaan Pelecehan Seksual',
        body: 'Skenario: Santri melapor dipanggil oknum pembina ke kamar pribadi larut malam. Protokol SOP: Prinsip zero victim-blaming, isolasi akses oknum dari santri, jaga kerahasiaan ketat hanya kepada Pengasuh, dan koordinasi terarah ke Satgas RMI NU & Unit PPA Polres Demak.'
      },
      {
        heading: 'Kasus 5: Wali Santri Marah & Mengancam Memviralkan Pondok',
        body: 'Skenario: Wali santri mendatangi sekretariat sambil merekam video keluhan. Solusi SOP: Sambut secara humanis di ruang khusus, dengarkan penuh tabayyun, akui kekhilafan jika ada oknum menyalahi aturan, tanggung biaya medis, dan libatkan mediasi islah RMI NU.'
      }
    ]
  },
  'PR-04': {
    code: 'PR-04',
    title: 'Instrumen Checklist Pemetaan 5 Pilar Pesantren Aman',
    category: 'Rubrik Evaluasi & Audit Mandiri',
    duration: '15 Indikator Kunci',
    sections: [
      {
        heading: 'Cakupan Penilaian Rubrik',
        body: 'Mencakup 15 indikator terukur yang membagi tingkat kematangan pesantren menjadi 3 fase: Tahap Perintisan (Ta\'sis, <50%), Tahap Berkembang (Tarqiyah, 50-79%), dan Tahap Mandiri (Istiqlal, 80-100%).'
      },
      {
        heading: 'Pilar yang Dinilai',
        body: '1. Pengasuhan yang Aman & Bermartabat\n2. Kepatuhan Regulasi & Literasi Hukum\n3. Tata Kelola & Struktur Tanggap Cepat\n4. Sistem Pengaduan & Perlindungan Pelapor\n5. Evaluasi & Perbaikan Berkelanjutan (Rencana Aksi 90 Hari).'
      }
    ]
  },
  'PR-05': {
    code: 'PR-05',
    title: 'Formulir Rencana Aksi 90 Hari (Satu Pesantren, Satu Perubahan)',
    category: 'Lembar Kerja Operasional',
    duration: 'Implementasi 3 Bulan',
    sections: [
      {
        heading: 'Prinsip Satu Pesantren, Satu Perbaikan Nyata',
        body: 'Pesantren tidak dituntut mengubah seluruh sistem dalam satu malam. Fokus pada 1 prioritas paling mendesak hasil asesmen: misalnya pembentukan SK Satgas internal, peniadaan hukuman tamparan, atau pemasangan kotak curhat tertutup.'
      },
      {
        heading: 'Unsur Isian Formulir',
        body: '• Nama Target Perubahan Prioritas\n• Ustadz / Pengurus Penanggung Jawab Lapangan\n• Tenggat Waktu Pelaksanaan (30, 60, 90 Hari)\n• Indikator Keberhasilan yang Dapat Dilihat Nyata\n• Catatan Pendampingan dari Fasilitator RMI NU.'
      }
    ]
  },
  'PR-06': {
    code: 'PR-06',
    title: 'Piagam Komitmen Pesantren Mitra Aman',
    category: 'Naskah Deklarasi Resmi',
    duration: 'Pengikatan Kemitraan',
    sections: [
      {
        heading: 'Ikrar Bersama Menjaga Marwah Pesantren',
        body: 'Naskah piagam resmi yang ditandatangani oleh Pengasuh Pondok Pesantren dan Ketua PC RMI NU Kabupaten Demak. Menyatakan tekad bersama mengawal pengasuhan santri berbasis Ta’dib Nabawi tanpa kekerasan fisik, verbal, maupun psikis demi kemuliaan pesantren.'
      }
    ]
  }
};

const DOC_PDF_MAP = {
  'PR-01': '/perangkat-lapangan/01-modul-fasilitator/PR-01_MODUL_FASILITATOR_SAMBANG_PESANTREN.pdf',
  'PR-02': '/perangkat-lapangan/02-kartu-kasus-dan-percakapan/PR-02_KARTU_PERCAKAPAN_5_PERTANYAAN.pdf',
  'PR-03': '/perangkat-lapangan/02-kartu-kasus-dan-percakapan/PR-03_KARTU_SIMULASI_KASUS.pdf',
  'PR-04': '/perangkat-lapangan/03-instrumen-pemetaan-dan-rencana-aksi/PR-04_CHECKLIST_PEMETAAN_5_PILAR.pdf',
  'PR-05': '/perangkat-lapangan/03-instrumen-pemetaan-dan-rencana-aksi/PR-05_FORM_RENCANA_AKSI_90_HARI.pdf',
  'PR-06': '/perangkat-lapangan/04-piagam-dan-administrasi/PR-06_PIAGAM_KOMITMEN.pdf'
};

function initDocReader() {
  const modal = document.getElementById('doc-reader-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('close-doc-reader');
  const bottomCloseBtn = document.getElementById('btn-close-reader-bottom');
  const downloadBtn = document.getElementById('reader-doc-download-btn');
  const readTriggers = document.querySelectorAll('[data-read-doc]');
  const copyBtn = document.getElementById('btn-copy-doc-reader');
  const printBtn = document.getElementById('btn-print-doc-reader');

  let currentDocCode = '';

  readTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const docCode = btn.getAttribute('data-read-doc');
      const doc = DOC_CONTENT_MAP[docCode];
      if (!doc) return;

      currentDocCode = docCode;

      const codeEl = document.getElementById('reader-doc-code');
      const titleEl = document.getElementById('reader-doc-title');
      const catEl = document.getElementById('reader-doc-category');
      const durEl = document.getElementById('reader-doc-duration');

      if (codeEl) codeEl.textContent = doc.code;
      if (titleEl) titleEl.textContent = doc.title;
      if (catEl) catEl.textContent = doc.category;
      if (durEl) durEl.textContent = doc.duration;

      const bodyContainer = document.getElementById('reader-doc-body');
      bodyContainer.innerHTML = '';

      const pdfUrl = DOC_PDF_MAP[docCode];

      if (downloadBtn) {
        if (pdfUrl) {
          downloadBtn.href = pdfUrl;
          downloadBtn.classList.remove('hidden');
        } else {
          downloadBtn.classList.add('hidden');
        }
      }

      if (pdfUrl) {
        // Embed PDF langsung 1 halaman penuh (Fit page) tanpa terpotong
        bodyContainer.innerHTML = `
          <iframe 
            src="${pdfUrl}#page=1&view=Fit&toolbar=1&navpanes=0" 
            class="w-full h-full border-0 block bg-gray-200" 
            title="${doc.title}">
          </iframe>
        `;
      } else {
        const wrapper = document.createElement('div');
        wrapper.className = 'p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full';
        doc.sections.forEach(sec => {
          const secDiv = document.createElement('div');
          secDiv.className = 'p-4 bg-white rounded-xl border border-gray-200 shadow-xs';
          secDiv.innerHTML = `
            <h4 class="font-bold text-gray-900 mb-1.5 text-sm">${sec.heading}</h4>
            <p class="text-gray-700 leading-relaxed text-xs">${sec.body}</p>
          `;
          wrapper.appendChild(secDiv);
        });
        bodyContainer.appendChild(wrapper);
      }

      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    });
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    // Clear iframe src to release memory/stop media when closed
    const bodyContainer = document.getElementById('reader-doc-body');
    if (bodyContainer) bodyContainer.innerHTML = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (bottomCloseBtn) bottomCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('reader-overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const doc = DOC_CONTENT_MAP[currentDocCode];
      if (!doc) return;
      let textToCopy = `${doc.code}: ${doc.title}\n${doc.category} — ${doc.duration}\n\n`;
      doc.sections.forEach(s => {
        textToCopy += `--- ${s.heading} ---\n${s.body}\n\n`;
      });
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Naskah dokumen berhasil disalin ke clipboard!', 'success');
      });
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      document.body.classList.add('printing-reader');
      window.print();
      setTimeout(() => document.body.classList.remove('printing-reader'), 1500);
    });
  }
}

/* ----------------------------------------------------
 * 8. Generator Draf Piagam & SOP Pengasuhan Instan
 * -------------------------------------------------- */
function initDocGenerator() {
  const genForm = document.getElementById('doc-generator-form');
  if (!genForm) return;

  const selectDocType = document.getElementById('gen-doc-type');
  const inputNamaPesantren = document.getElementById('gen-nama-pesantren');
  const inputPengasuh = document.getElementById('gen-nama-pengasuh');
  const selectKecamatan = document.getElementById('gen-kecamatan');
  const inputNsp = document.getElementById('gen-nsp');
  const previewContainer = document.getElementById('gen-preview-content');
  const btnCetakDraf = document.getElementById('btn-cetak-generator');
  const btnSalinDraf = document.getElementById('btn-salin-generator');

  const updatePreview = () => {
    const docType = selectDocType?.value || 'piagam';
    const nama = inputNamaPesantren?.value?.trim() || 'Pondok Pesantren Al-Fattahiyyah';
    const pengasuh = inputPengasuh?.value?.trim() || 'KH. Ahmad Fauzi';
    const kecamatan = selectKecamatan?.value || 'Mranggen';
    const nsp = inputNsp?.value?.trim() || '510033210000';
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    if (docType === 'piagam') {
      previewContainer.innerHTML = `
        <div class="border-4 border-[#C7A45B] p-6 sm:p-8 bg-[#FAF8F5] text-pa-ink text-center space-y-4">
          <div class="space-y-1">
            <span class="text-[10px] tracking-widest uppercase font-mono text-[#8C6D1F] block">PENGURUS CABANG NAHDLATUL ULAMA DEMAK — RABITHAH MA'AHID ISLAMIYAH</span>
            <h2 class="text-xl sm:text-2xl font-bold font-display text-pa-primary tracking-wide">PIAGAM KOMITMEN PESANTREN MITRA AMAN</h2>
            <p class="text-xs font-editorial italic text-pa-gold-dark">"Menjaga Amanah, Melindungi Santri, Memuliakan Pesantren"</p>
          </div>

          <div class="my-4 py-2 border-y border-[#D5C6AA] text-xs font-editorial leading-relaxed max-w-xl mx-auto text-gray-700">
            Dengan memohon taufiq dan ridho Allah SWT, PC RMI NU Kabupaten Demak bersama Satgas Perlindungan Santri menyatakan bahwa:
          </div>

          <div class="space-y-0.5">
            <h3 class="text-lg sm:text-xl font-extrabold font-display text-pa-primary uppercase">${nama}</h3>
            <p class="text-xs text-gray-600 font-editorial">Kecamatan ${kecamatan}, Kabupaten Demak, Jawa Tengah | NSP: ${nsp}</p>
          </div>

          <p class="text-xs text-gray-700 font-editorial leading-relaxed max-w-xl mx-auto pt-2">
            Telah berpartisipasi aktif dalam Program Sambang Pesantren dan menyatakan komitmen teguh untuk menerapkan pola pengasuhan <strong>Ta’dib Nabawi</strong> tanpa kekerasan fisik maupun perundungan, menjamin kerahasiaan kanal pengaduan santri, serta melaksanakan Rencana Aksi 90 Hari demi kemaslahatan umat.
          </p>

          <div class="pt-6 grid grid-cols-2 gap-4 text-xs font-editorial text-gray-800">
            <div>
              <p class="text-[11px] text-gray-500">Pengasuh Pesantren,</p>
              <div class="h-16 flex items-end justify-center">
                <span class="font-bold underline text-pa-ink">${pengasuh}</span>
              </div>
            </div>
            <div>
              <p class="text-[11px] text-gray-500">Demak, ${today}<br>PC RMI NU Kabupaten Demak,</p>
              <div class="h-16 flex items-end justify-center">
                <span class="font-bold underline text-pa-primary">KH. Aniq Muhammad, Lc.</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      previewContainer.innerHTML = `
        <div class="border border-gray-300 p-5 sm:p-7 bg-white text-pa-ink text-left space-y-4">
          <div class="border-b-2 border-pa-primary pb-3 flex items-start justify-between">
            <div>
              <h3 class="text-base font-bold font-display text-pa-primary uppercase">STANDAR OPERASIONAL PROSEDUR (SOP)</h3>
              <p class="text-xs font-bold text-gray-800">PENEGAKAN DISIPLIN EDUKATIF TANPA KEKERASAN FISIK</p>
              <p class="text-[11px] text-gray-500 font-editorial">${nama} — Kec. ${kecamatan}</p>
            </div>
            <span class="doc-badge">SOP-01/P-AMAN</span>
          </div>

          <div class="space-y-3 text-xs leading-relaxed text-gray-800">
            <div>
              <strong class="text-pa-primary block uppercase tracking-wider text-[11px]">Pasal 1: Prinsip Ta'dib Nabawi</strong>
              <p>Segala bentuk pendisiplinan santri diarahkan untuk membangun kesadaran akhlak karimah, meneladani kelembutan Rasulullah SAW, serta mengharamkan pukulan fisik ke wajah, tamparan, dan intimidasi psikologis.</p>
            </div>
            <div>
              <strong class="text-pa-primary block uppercase tracking-wider text-[11px]">Pasal 2: Larangan Sanksi Fisik Liar</strong>
              <p>Santri senior atau pengurus kamar dilarang keras memberikan sanksi fisik sepihak, menyuruh piket di luar jadwal resmi, atau melakukan perpeloncoan dalam bentuk apapun.</p>
            </div>
            <div>
              <strong class="text-pa-primary block uppercase tracking-wider text-[11px]">Pasal 3: Alternatif Ta'zir Edukatif</strong>
              <p>1. Ta'zir Keilmuan: Menghafal bait matan kitab (Alfiyyah/Imrithi) atau juz pilihan di bawah pengawasan langsung Ustadz Pembina.<br>2. Ta'zir Khidmah: Menata sandal jamaah masjid pondok atau membersihkan fasilitas umum pondok secara terukur.</p>
            </div>
            <div>
              <strong class="text-pa-primary block uppercase tracking-wider text-[11px]">Pasal 4: Kanal Perlindungan & Aduan</strong>
              <p>Santri yang merasa diperlakukan tidak adil berhak melapor ke Kotak Curhat Aman atau langsung sowan ke Dalem Pengasuh (${pengasuh}) dengan perlindungan kerahasiaan 100%.</p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-600">
            <span>Ditetapkan di: Demak (${today})</span>
            <span class="font-bold text-pa-ink">Pengasuh: ${pengasuh}</span>
          </div>
        </div>
      `;
    }
  };

  [selectDocType, inputNamaPesantren, inputPengasuh, selectKecamatan, inputNsp].forEach(el => {
    if (el) {
      el.addEventListener('input', updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  updatePreview();

  if (btnCetakDraf) {
    btnCetakDraf.addEventListener('click', () => {
      document.body.classList.add('printing-generator');
      window.print();
      setTimeout(() => document.body.classList.remove('printing-generator'), 1500);
    });
  }

  if (btnSalinDraf) {
    btnSalinDraf.addEventListener('click', () => {
      const text = previewContainer.innerText;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Naskah generator berhasil disalin!', 'success');
      });
    });
  }
}

/* ----------------------------------------------------
 * 9. Global Toast Notification System
 * -------------------------------------------------- */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast flex items-start gap-3';

  let borderColor = '#145A42';
  let iconSvg = '';

  if (type === 'success') {
    borderColor = '#1E8E5A';
    iconSvg = `
      <svg class="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `;
  } else if (type === 'warning') {
    borderColor = '#D97706';
    iconSvg = `
      <svg class="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    `;
  } else if (type === 'error') {
    borderColor = '#DC2626';
    iconSvg = `
      <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg class="w-6 h-6 text-emerald-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `;
  }

  toast.style.borderLeftColor = borderColor;
  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1">
      <p class="text-sm font-medium text-gray-800 leading-snug">${message}</p>
    </div>
    <button class="text-gray-400 hover:text-gray-600 ml-2" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}
