/**
 * Script Pembuat PDF Resmi Field Kit PESANTREN AMAN
 * PC RMI NU Kabupaten Demak - Satgas Perlindungan Santri
 * Menggunakan Microsoft Edge Headless engine untuk menghasilkan PDF berkualitas tinggi
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const LOGO_PATH = path.join(__dirname, '..', 'website', 'logo-utama.png');
const LOGO_BASE64 = fs.readFileSync(LOGO_PATH).toString('base64');
const LOGO_SRC = `data:image/png;base64,${LOGO_BASE64}`;

const TEMP_DIR = path.join(__dirname, 'temp_html');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function runPdfConversion(htmlContent, outputPath, isLandscape = false) {
  const tempHtmlFile = path.join(TEMP_DIR, `temp_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtmlFile, htmlContent, 'utf-8');

  // Convert to absolute path
  const absoluteHtml = path.resolve(tempHtmlFile);
  const absolutePdf = path.resolve(outputPath);

  // Pastikan folder tujuan ada
  const outDir = path.dirname(absolutePdf);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const args = [
    `"${EDGE_PATH}"`,
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf="${absolutePdf}"`,
    `"${absoluteHtml}"`
  ];

  try {
    execSync(args.join(' '), { stdio: 'pipe' });
    console.log(`[SUCCESS] PDF tercipta: ${path.basename(absolutePdf)} (${fs.statSync(absolutePdf).size} bytes)`);
  } catch (err) {
    console.error(`[ERROR] Gagal membuat PDF ${absolutePdf}:`, err.message);
  } finally {
    if (fs.existsSync(tempHtmlFile)) {
      fs.unlinkSync(tempHtmlFile);
    }
  }
}

// =========================================================================
// 1. PR-01: MODUL FASILITATOR SAMBANG PESANTREN (FIELD GUIDE)
// =========================================================================
function generatePR01() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A2420; line-height: 1.5; font-size: 10.5pt; margin: 0; padding: 0; }
  .kop { display: flex; align-items: center; border-bottom: 3px double #145A42; padding-bottom: 10px; margin-bottom: 16px; }
  .kop img { height: 62px; width: auto; margin-right: 18px; }
  .kop-text h2 { color: #145A42; font-size: 13pt; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
  .kop-text h3 { color: #C7A45B; font-size: 10pt; font-weight: 700; margin: 2px 0; text-transform: uppercase; }
  .kop-text p { color: #555; font-size: 8.5pt; margin: 1px 0 0 0; }
  .badge { background: #145A42; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 8.5pt; font-weight: bold; font-family: monospace; }
  h1 { color: #145A42; font-size: 16pt; margin: 8px 0 4px 0; font-weight: 800; }
  h2 { color: #145A42; font-size: 12pt; border-bottom: 1.5px solid #145A42; padding-bottom: 4px; margin-top: 18px; margin-bottom: 10px; text-transform: uppercase; }
  h3 { color: #0E3D2D; font-size: 11pt; margin: 10px 0 4px 0; }
  p, li { text-align: justify; }
  ul { margin: 6px 0 10px 20px; padding: 0; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; }
  th { background-color: #145A42; color: #ffffff; padding: 8px; text-align: left; }
  td { padding: 7px 8px; border: 1px solid #DDE5E0; vertical-align: top; }
  tr:nth-child(even) td { background-color: #FAF8F5; }
  .quote-box { background: #FAF8F5; border-left: 4px solid #C7A45B; padding: 10px 14px; margin: 12px 0; font-style: italic; color: #2D3E35; font-size: 10pt; }
  .page-break { page-break-after: always; }
  .no-break { page-break-inside: avoid; }
  .meta-table { width: 100%; margin-bottom: 14px; font-size: 9pt; }
  .meta-table td { border: none; padding: 2px 4px; background: transparent !important; }
</style>
</head>
<body>

  <!-- HALAMAN 1 -->
  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Gedung PCNU Demak, Jl. Sultan Fatah No. 10 Demak | Hotline Khidmah: +62 812-3456-7890 | satgas@rminudemak.org</p>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
    <span class="badge">DOKUMEN RESMI PR-01</span>
    <span style="font-size: 8.5pt; color: #666; font-family: monospace;">Edisi Standar Operasional Lapangan v1.0</span>
  </div>

  <h1>PANDUAN LAPANGAN FASILITATOR (FIELD GUIDE)</h1>
  <p style="color: #666; font-size: 10pt; margin-top: 0; margin-bottom: 12px;"><strong>Program Sambang Pesantren:</strong> Menjaga Amanah, Melindungi Santri, Memuliakan Pesantren</p>

  <table class="meta-table">
    <tr><td width="20%"><strong>Inisiator</strong></td><td width="2%">:</td><td width="78%">PC RMI NU Kab. Demak & Satgas Perlindungan Santri</td></tr>
    <tr><td><strong>Peruntukan</strong></td><td>:</td><td>Pegangan Wajib Tim Fasilitator, Pendamping Lapangan & Pengurus MWC NU</td></tr>
    <tr><td><strong>Sifat Dokumen</strong></td><td>:</td><td>Panduan Pelaksanaan Teknis Fasilitasi Dialog Serambi 120 Menit</td></tr>
  </table>

  <h2>BAGIAN 1. HAKIKAT & KODE ETIK FASILITATOR</h2>
  
  <p>Fasilitator Program Sambang Pesantren <strong>BUKAN</strong> auditor investigasi, pemeriksa hukum kepolisian, atau pihak yang datang untuk mencari-cari kesalahan pondok pesantren. Fasilitator hadir sebagai <strong>Khadim & Sahabat Pesantren</strong> yang mendampingi Masyayikh menjaga amanah wali santri, meneladani pola asuh <em>Ta'dib Nabawi</em>, dan memuliakan marwah luhur pesantren dari risiko fitnah hukum serta viralitas negatif.</p>

  <div class="quote-box">
    "Kunjungan kami dari RMI NU Demak bukan untuk mengajari atau memeriksa Panjenengan, melainkan nderek khidmah mendampingi pesantren agar amanah para orang tua/wali santri terjaga, para santri selamat, dan marwah pesantren kian mulia di mata umat dan hukum."
  </div>

  <h3>Kode Etik Wajib Fasilitator:</h3>
  <ul>
    <li><strong>Adab Sowan:</strong> Berbusana santri sopan (berpeci, koko/batik rapi, bersarung). Masuk ndalem dengan ta'dhim, salam, senyum, dan niat khidmah tulus.</li>
    <li><strong>Kerahasiaan Mutlak (Strict Confidentiality):</strong> Seluruh temuan, dinamika kamar santri, atau keluhan yang terungkap saat pemetaan bersifat rahasia. Dilarang keras dipublikasikan ke media sosial atau dibicarakan di luar forum resmi.</li>
    <li><strong>Keberpihakan pada Keselamatan Jiwa:</strong> Apabila ditemukan indikasi bahaya darurat (kekerasan fisik berulang/pelecehan), fasilitator wajib memprioritaskan keselamatan fisik dan psikis korban dengan koordinasi tertutup bersama Pengasuh dan Tim Tanggap Satgas RMI NU.</li>
  </ul>

  <h2>BAGIAN 2. STRUKTUR & RUNDOWN SAMBANG PESANTREN (120 - 150 MENIT)</h2>
  
  <table>
    <thead>
      <tr>
        <th width="15%">Waktu</th>
        <th width="25%">Sesi</th>
        <th width="30%">Tujuan & Aktivitas</th>
        <th width="30%">Perangkat / Alat</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>00:00 - 00:30</strong><br>(30 Menit)</td>
        <td><strong>Sesi 1: Ta'aruf & Sowan Pengasuh</strong></td>
        <td>Silaturahmi di serambi ndalem bersama Kyai/Bu Nyai, menyamakan frekuensi niat bahwa program ini untuk membentengi nama baik pesantren.</td>
        <td>Surat Tugas PC RMI NU & Profil Program Sambang</td>
      </tr>
      <tr>
        <td><strong>00:30 - 01:10</strong><br>(40 Menit)</td>
        <td><strong>Sesi 2: Pemetaan 5 Pilar Reflektif</strong></td>
        <td>Memandu dialog 5 pertanyaan reflektif: Siapa yang dilindungi, pola asuh asrama, batasan sanksi, tanggung jawab kamar, dan kanal aduan.</td>
        <td>Kartu Percakapan PR-02 & Checklist Pemetaan PR-04</td>
      </tr>
      <tr>
        <td><strong>01:10 - 01:50</strong><br>(40 Menit)</td>
        <td><strong>Sesi 3: Simulasi Kasus Bersama Pengurus</strong></td>
        <td>Diskusi kelompok ustadz pembina & pengurus keamanan kamar membedah skenario nyata (senioritas, hukuman fisik, pengucilan, aduan).</td>
        <td>Kartu Simulasi Kasus PR-03 (Metode: Kasus - Diskusi - Solusi)</td>
      </tr>
      <tr>
        <td><strong>01:50 - 02:20</strong><br>(30 Menit)</td>
        <td><strong>Sesi 4: Rencana Aksi 90 Hari & Piagam</strong></td>
        <td>Merumuskan "Satu Pesantren, Satu Perubahan Nyata" dan penandatanganan Piagam Komitmen Pesantren Mitra Aman.</td>
        <td>Formulir Rencana Aksi PR-05 & Piagam Komitmen PR-06</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- HALAMAN 2 -->
  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Modul Operasional PR-01 — Panduan Lapangan Fasilitator Sambang Pesantren (Halaman 2)</p>
    </div>
  </div>

  <h2>BAGIAN 3. PANDUAN MENGHADAPI SITUASI KRITIS DI LAPANGAN</h2>

  <table>
    <thead>
      <tr>
        <th width="32%">Situasi di Lapangan</th>
        <th width="33%">Respons yang DILARANG (Salah)</th>
        <th width="35%">Respons yang DIANJURKAN (SOP Fasilitator)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Pengurus bersikap defensif / curiga:</strong><br><em>"Di pondok kami adem ayem, aman, tidak perlu diajari aturan baru."</em></td>
        <td>Mendebat, mengutip pasal-pasal pidana ancaman penjara, atau mencontohkan kasus pesantren lain yang sempat viral di media.</td>
        <td><strong>Apresiasi tradisi baik:</strong><br><em>"Alhamdulillah, kami bersaksi pesantren ini penuh berkah. Niat sowan kami justru untuk membentengi kemuliaan yang sudah ada agar tidak dirusak oleh kelalaian kecil di era medsos saat ini."</em></td>
      </tr>
      <tr>
        <td><strong>Ustadz menganggap hukuman fisik adalah tradisi mutlak:</strong><br><em>"Santri kalau tidak dipukul rotan atau ditampar tidak akan jera."</em></td>
        <td>Menuduh pengurus melanggar HAM, menakuti dengan polisi, atau menyebut pesantren ketinggalan zaman.</td>
        <td><strong>Muhasabah batas Ta'dib:</strong><br><em>"Mari kita bedakan antara mendidik adab dengan melampiaskan geram. Hukuman fisik berbekas luka berisiko pidana bagi ustadz sendiri. Mari kita kaji sanksi edukatif (hafalan/khidmah) yang lebih mengena di hati."</em></td>
      </tr>
      <tr>
        <td><strong>Muncul pengakuan / laporan insiden sensitif saat forum berlangsung:</strong></td>
        <td>Membahas detail insiden di depan forum terbuka atau menginterogasi terduga pelaku secara langsung.</td>
        <td><strong>Tenangkan & alihkan:</strong><br>Catat poin inti secara rahasia, jaga kerahasiaan nama, alihkan pembahasan umum, dan koordinasikan pasca acara secara tertutup khusus bersama Pengasuh.</td>
      </tr>
    </tbody>
  </table>

  <h2>BAGIAN 4. DAFTAR PERIKSA PERLENGKAPAN TAS SAMBANG (FIELD KIT)</h2>
  
  <ul>
    <li>[ &nbsp; ] <strong>Surat Tugas Resmi:</strong> Diterbitkan oleh Pengurus Cabang RMI NU Kabupaten Demak.</li>
    <li>[ &nbsp; ] <strong>1 Eksemplar Panduan Lapangan Fasilitator (PR-01)</strong> untuk tim pendamping.</li>
    <li>[ &nbsp; ] <strong>1 Set Kartu Percakapan 5 Pertanyaan Kunci (PR-02)</strong> bahan dialog Masyayikh.</li>
    <li>[ &nbsp; ] <strong>1 Set Kumpulan Kartu Simulasi Kasus Nyata (PR-03)</strong> untuk diskusi kelompok ustadz.</li>
    <li>[ &nbsp; ] <strong>3 Rangkap Checklist Pemetaan 5 Pilar (PR-04)</strong> untuk instrumen asesmen.</li>
    <li>[ &nbsp; ] <strong>2 Rangkap Formulir Rencana Aksi 90 Hari (PR-05)</strong> untuk komitmen satu perubahan nyata.</li>
    <li>[ &nbsp; ] <strong>1 Lembar Naskah Piagam Komitmen Berbingkai Resmi (PR-06)</strong> siap tanda tangan bersama.</li>
    <li>[ &nbsp; ] <strong>Paket Poster Edukasi 5 Pilar</strong> ukuran A3 untuk ditempel di majalah dinding asrama.</li>
  </ul>

  <div style="margin-top: 30px; padding: 12px; border: 1px solid #C7A45B; background-color: #FAF8F5; border-radius: 4px; font-size: 8.5pt; text-align: center;">
    <strong>PENGURUS CABANG NAHDLATUL ULAMA DEMAK — RABITHAH MA'AHID ISLAMIYAH</strong><br>
    Slogan Gerakan: <em>"Menjaga Amanah, Melindungi Santri, Memuliakan Pesantren"</em>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '01-modul-fasilitator', 'PR-01_MODUL_FASILITATOR_SAMBANG_PESANTREN.pdf');
  runPdfConversion(html, outputPath);
}

// =========================================================================
// 2. PR-02: KARTU PERCAKAPAN 5 PERTANYAAN INTI
// =========================================================================
function generatePR02() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A2420; line-height: 1.45; font-size: 10pt; margin: 0; padding: 0; }
  .kop { display: flex; align-items: center; border-bottom: 3px double #145A42; padding-bottom: 8px; margin-bottom: 14px; }
  .kop img { height: 55px; width: auto; margin-right: 15px; }
  .kop-text h2 { color: #145A42; font-size: 12pt; font-weight: 800; margin: 0; text-transform: uppercase; }
  .kop-text h3 { color: #C7A45B; font-size: 9.5pt; font-weight: 700; margin: 1px 0; text-transform: uppercase; }
  .kop-text p { color: #555; font-size: 8pt; margin: 0; }
  .badge { background: #145A42; color: #fff; padding: 2px 7px; border-radius: 3px; font-size: 8pt; font-weight: bold; font-family: monospace; }
  h1 { color: #145A42; font-size: 15pt; margin: 6px 0 2px 0; font-weight: 800; }
  .card-box { border: 1.5px solid #145A42; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #FAF8F5; page-break-inside: avoid; }
  .card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #D5C6AA; padding-bottom: 5px; margin-bottom: 8px; }
  .card-title { color: #145A42; font-weight: bold; font-size: 11pt; text-transform: uppercase; }
  .card-pilar { color: #C7A45B; font-size: 8.5pt; font-weight: bold; }
  .card-question { font-size: 11.5pt; font-weight: bold; color: #0E3D2D; font-style: italic; margin-bottom: 6px; }
  .card-subquestion { font-size: 9.5pt; color: #555; margin-bottom: 8px; }
  .card-guide { background: #ffffff; border-left: 3px solid #145A42; padding: 8px 10px; font-size: 9pt; border-radius: 0 4px 4px 0; }
  .card-guide strong { color: #145A42; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-02: Kartu Percakapan 5 Pertanyaan Kunci Dialog Serambi Ndalem</p>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
    <span class="badge">PERANGKAT PR-02</span>
    <span style="font-size: 8.5pt; color: #666; font-family: monospace;">Format Saku & Dialog Khidmah</span>
  </div>

  <h1>KARTU PERCAKAPAN: 5 PERTANYAAN KUNCI</h1>
  <p style="font-size: 9pt; color: #666; margin-top: 0; margin-bottom: 14px;">Panduan percakapan reflektif fasilitator bersama Masyayikh dan Pengurus Pondok Pesantren.</p>

  <!-- KARTU 1 -->
  <div class="card-box">
    <div class="card-header">
      <span class="card-title">KARTU 01: FONDASI AMANAH & PERLINDUNGAN</span>
      <span class="card-pilar">Refleksi Ekosistem</span>
    </div>
    <div class="card-question">"Siapa sebenarnya yang sedang kita lindungi di pondok kita ini?"</div>
    <div class="card-subquestion">Apakah hanya santri? Atau para ustadz dan marwah pesantren juga membutuhkan perlindungan?</div>
    <div class="card-guide">
      <strong>Panduan Fasilitator:</strong> Bangun kesadaran bahwa perlindungan bersifat menyeluruh: (1) <em>Santri</em> dilindungi hak tumbuh dan keselamatannya; (2) <em>Ustadz</em> dilindungi dari jeratan pidana akibat salah metode mendisiplinkan; (3) <em>Pesantren & Kyai</em> dilindungi dari fitnah media sosial dan kehancuran reputasi.
    </div>
  </div>

  <!-- KARTU 2 -->
  <div class="card-box">
    <div class="card-header">
      <span class="card-title">KARTU 02: POLA ASUH & BATASAN DISIPLIN</span>
      <span class="card-pilar">Pilar 1 — Pengasuhan Bermartabat</span>
    </div>
    <div class="card-question">"Bagaimana cara kita mendisiplinkan santri ketika mereka melanggar aturan?"</div>
    <div class="card-subquestion">Di mana batas tegas antara 'mendidik untuk menyadarkan' dan 'melampiaskan kemarahan yang melukai fisik'?</div>
    <div class="card-guide">
      <strong>Panduan Fasilitator:</strong> Diskusikan batas <em>Ta'dib Syar'i</em> tanpa pukulan rotan di kepala/badan atau tamparan. Tawarkan sanksi edukatif pengganti: membaca wirid, menghafal bait matan Imrithi/Alfiyyah, atau khidmah kebersihan masjid asrama.
    </div>
  </div>

  <!-- KARTU 3 -->
  <div class="card-box">
    <div class="card-header">
      <span class="card-title">KARTU 03: TANGGUNG JAWAB & PENGAWASAN</span>
      <span class="card-pilar">Pilar 3 — Tata Kelola Kelembagaan</span>
    </div>
    <div class="card-question">"Ketika terjadi peristiwa gesekan antar-santri di kamar, siapa yang memegang kendali?"</div>
    <div class="card-subquestion">Apakah aturan kamar santri sudah tertulis, atau masih berjalan berdasarkan tradisi senioritas liar?</div>
    <div class="card-guide">
      <strong>Panduan Fasilitator:</strong> Perjelas siapa yang mengawasi kamar santri pada jam-jam rawan (23.00 - 03.30). Pastikan peran santri senior difungsikan sebagai mentor belajar (kakak asuh), bukan pemegang sanksi sewenang-wenang.
    </div>
  </div>

  <!-- KARTU 4 -->
  <div class="card-box">
    <div class="card-header">
      <span class="card-title">KARTU 04: KANAL PENGADUAN AMAN</span>
      <span class="card-pilar">Pilar 4 — Sistem Pengaduan</span>
    </div>
    <div class="card-question">"Jika seorang santri merasa tertekan atau diintimidasi, ke mana ia berani melapor tanpa rasa takut?"</div>
    <div class="card-subquestion">Apakah santri yang melapor merasa aman dari ancaman balas dendam teman sekamarnya?</div>
    <div class="card-guide">
      <strong>Panduan Fasilitator:</strong> Urai anggapan bahwa "tidak ada laporan berarti pondok aman". Dorong penyediaan Kotak Curhat Tertutup atau kontak WhatsApp ustadz konselor yang menjamin kerahasiaan identitas santri 100%.
    </div>
  </div>

  <!-- KARTU 5 -->
  <div class="card-box">
    <div class="card-header">
      <span class="card-title">KARTU 05: PERUBAHAN NYATA 90 HARI</span>
      <span class="card-pilar">Pilar 5 — Evaluasi Berkelanjutan</span>
    </div>
    <div class="card-question">"Dari seluruh dialog hari ini, apa SATU perubahan konkret yang bisa kita sepakati dalam 90 hari?"</div>
    <div class="card-subquestion">Satu langkah kecil yang nyata dan realistis dijalankan bersama seluruh dewan asatidz.</div>
    <div class="card-guide">
      <strong>Panduan Fasilitator:</strong> Jangan tetapkan target yang terlalu rumit. Arahkan pada 1 perubahan: membuat draf SOP tertulis kamar, memasang kotak aduan, atau menunjuk ustadz pembina konseling. Tuangkan ke Form PR-05.
    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '02-kartu-kasus-dan-percakapan', 'PR-02_KARTU_PERCAKAPAN_5_PERTANYAAN.pdf');
  runPdfConversion(html, outputPath);
}

// =========================================================================
// 3. PR-03: KUMPULAN KARTU SIMULASI KASUS NYATA
// =========================================================================
function generatePR03() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A2420; line-height: 1.45; font-size: 9.5pt; margin: 0; padding: 0; }
  .kop { display: flex; align-items: center; border-bottom: 3px double #145A42; padding-bottom: 8px; margin-bottom: 12px; }
  .kop img { height: 50px; width: auto; margin-right: 14px; }
  .kop-text h2 { color: #145A42; font-size: 11.5pt; font-weight: 800; margin: 0; text-transform: uppercase; }
  .kop-text h3 { color: #C7A45B; font-size: 9pt; font-weight: 700; margin: 1px 0; text-transform: uppercase; }
  .kop-text p { color: #555; font-size: 7.5pt; margin: 0; }
  .badge { background: #145A42; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 8pt; font-weight: bold; font-family: monospace; }
  h1 { color: #145A42; font-size: 14pt; margin: 4px 0 2px 0; font-weight: 800; }
  .case-card { border: 1.5px solid #145A42; border-radius: 6px; padding: 11px; margin-bottom: 12px; background: #ffffff; page-break-inside: avoid; }
  .case-header { background: #145A42; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 9.5pt; margin-bottom: 8px; display: flex; justify-content: space-between; }
  .section-tag { font-weight: bold; color: #145A42; font-size: 9pt; text-transform: uppercase; margin-top: 6px; margin-bottom: 2px; }
  .scenario-text { background: #FAF8F5; border-left: 3px solid #C7A45B; padding: 6px 10px; font-style: italic; font-size: 9pt; color: #2D3E35; }
  .discuss-box { background: #F0F6F3; padding: 6px 10px; border-radius: 4px; font-size: 8.5pt; margin: 4px 0; }
  .risk-text { color: #A82020; font-size: 8.5pt; }
  .solution-box { border: 1px dashed #145A42; background: #FAF8F5; padding: 6px 10px; border-radius: 4px; font-size: 8.5pt; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-03: Kumpulan Kartu Simulasi Kasus Nyata (Metode: Kasus - Diskusi - Solusi)</p>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
    <span class="badge">PERANGKAT PR-03</span>
    <span style="font-size: 8pt; color: #666; font-family: monospace;">Bahan Diskusi Terarah (FGD) Dewan Asatidz</span>
  </div>

  <h1>KUMPULAN KARTU SIMULASI KASUS NYATA</h1>
  <p style="font-size: 8.5pt; color: #666; margin-top: 0; margin-bottom: 10px;">Setiap kartu menyajikan skenario realistis dinamika asrama santri, analisis risiko hukum, dan rekomendasi solusi SOP.</p>

  <!-- KASUS 1 -->
  <div class="case-card">
    <div class="case-header">
      <span>KASUS 01: SENIORITAS & PIKET BERLEBIHAN DI KAMAR PUTRA</span>
      <span>Pilar 1 & 3</span>
    </div>
    <div class="section-tag">1. Skenario Kasus:</div>
    <div class="scenario-text">
      Santri baru AF (13 th) kerap mengantuk saat subuh. Ditemukan bahwa AF dipaksa mencuci pakaian dan membelikan makanan untuk 3 santri senior (18 th) hingga larut malam. Jika menolak, AF diintimidasi, dicap "cengeng", dan kasurnya dibasahi air. AF takut melapor karena diancam dipukuli beramai-ramai.
    </div>
    <div class="section-tag">2. Bahan Diskusi Ustadz (15 Menit):</div>
    <div class="discuss-box">
      • Apakah ini tradisi orientasi wajar atau sudah masuk kategori perundungan (bullying)?<br>
      • Bagaimana membina santri senior tanpa mempermalukan mereka di hadapan santri lain?
    </div>
    <div class="section-tag">3. Analisis Risiko & Rekomendasi Solusi SOP:</div>
    <div class="solution-box">
      <span class="risk-text"><strong>Risiko Hukum:</strong> Pasal 76C jo Pasal 80 UU Perlindungan Anak (Kekerasan Psikis/Fisik). Santri trauma & pesantren dilaporkan atas pembiaran.</span><br>
      <strong>Solusi SOP:</strong> Pindahkan AF sementara ke kamar aman; alihkan peran santri senior menjadi mentor belajar (kakak asuh); sahkan jadwal piket kamar resmi tertulis larangan mempekerjakan yunior.
    </div>
  </div>

  <!-- KASUS 2 -->
  <div class="case-card">
    <div class="case-header">
      <span>KASUS 02: HUKUMAN FISIK SANTRI MEROKOK & KABUR MALAM</span>
      <span>Pilar 1 & 2</span>
    </div>
    <div class="section-tag">1. Skenario Kasus:</div>
    <div class="scenario-text">
      Dua santri MA tertangkap merokok di luar komplek pukul 01.30 malam. Oknum pengurus keamanan memukul telapak kaki dan menampar mereka dengan sandal, lalu menghukum berdiri di lapangan hingga subuh tanpa jaket. Pagi harinya salah satu santri demam tinggi dan pipinya lebam.
    </div>
    <div class="section-tag">2. Bahan Diskusi Ustadz (15 Menit):</div>
    <div class="discuss-box">
      • Bolehkah geram atas pelanggaran aturan direspons dengan pukulan fisik yang meninggalkan bekas luka lebam?<br>
      • Sanksi edukatif apa yang tetap memberi efek jera tanpa mencederai fisik santri?
    </div>
    <div class="section-tag">3. Analisis Risiko & Rekomendasi Solusi SOP:</div>
    <div class="solution-box">
      <span class="risk-text"><strong>Risiko Hukum:</strong> Pasal 351 KUHP & Pasal 80 UU PA (Penganiayaan). Pengurus pemukul berisiko pidana penjara dan Kyai digugat atas kelalaian pengawasan.</span><br>
      <strong>Solusi SOP:</strong> Larangan mutlak bagi ustadz/pengurus memukul fisik; alihkan ke ta'zir keilmuan (hafalan 50 bait Alfiyyah / Juz 30) dan musyawarah bersama orang tua santri.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- HALAMAN 2: KASUS 3, 4, 5 -->
  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-03: Kumpulan Kartu Simulasi Kasus Nyata (Halaman 2)</p>
    </div>
  </div>

  <!-- KASUS 3 -->
  <div class="case-card">
    <div class="case-header">
      <span>KASUS 03: PENGUCILAN KELOMPOK (CYBERBULLYING) DI ASRAMA PUTRI</span>
      <span>Pilar 1 & 4</span>
    </div>
    <div class="section-tag">1. Skenario Kasus:</div>
    <div class="scenario-text">
      Santriwati RN dituduh mencuri kerudung temannya. Rekan sekamar membuat grup chat gosip rahasia dan menyebarkan tuduhan bahwa RN "pencuri kambuhan". RN dijauhi satu angkatan, mukenanya disembunyikan, menangis tiap malam dan mengancam kabur atau bunuh diri jika tidak diboyongkan orang tuanya.
    </div>
    <div class="section-tag">2. Bahan Diskusi & Solusi SOP:</div>
    <div class="solution-box">
      <span class="risk-text"><strong>Risiko:</strong> Depresi berat remaja, isolasi sosial, dan jeratan UU ITE pencemaran nama baik.</span><br>
      <strong>Solusi SOP:</strong> Pendampingan pribadi oleh Bu Nyai/Ustadzah; muhasabah adab ukhuwwah kamar; investigasi barang hilang dipimpin langsung ustadzah tanpa pengadilan liar sesama santri.
    </div>
  </div>

  <!-- KASUS 4 -->
  <div class="case-card">
    <div class="case-header">
      <span>KASUS 04: PENGADUAN PELECEHAN SEKSUAL & PROTOKOL KERAHASIAAN</span>
      <span>Pilar 2 & 4</span>
    </div>
    <div class="section-tag">1. Skenario Kasus:</div>
    <div class="scenario-text">
      Santri berusia 14 tahun dengan gemetar melapor ke ustadz muda bahwa seorang oknum pembina kerap memanggilnya ke kamar pribadi larut malam dengan dalih memijat, lalu melakukan sentuhan tidak senonoh disertai ancaman tidak meluluskan hafalan jika bercerita ke orang lain.
    </div>
    <div class="section-tag">2. Bahan Diskusi & Solusi SOP:</div>
    <div class="solution-box">
      <span class="risk-text"><strong>Risiko Hukum:</strong> UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS). Pembiaran berakibat sanksi administratif pencabutan izin operasional pesantren.</span><br>
      <strong>Protokol Respons Cepat:</strong> (1) Percayai santri tanpa victim-blaming; (2) Isolasi akses oknum terduga dari santri; (3) Jaga kerahasiaan ketat hanya kepada Pengasuh; (4) Hubungi Satgas RMI NU & Unit PPA Polres Demak untuk rujukan hukum dan medis tanpa merusak nama baik pondok.
    </div>
  </div>

  <!-- KASUS 5 -->
  <div class="case-card">
    <div class="case-header">
      <span>KASUS 05: WALI SANTRI MARAH & MENGANCAM MEMVIRALKAN KE MEDSOS</span>
      <span>Pilar 3 & 5</span>
    </div>
    <div class="section-tag">1. Skenario Kasus:</div>
    <div class="scenario-text">
      Wali santri mendatangi pondok dengan emosi tinggi membawa foto punggung anaknya lebam akibat dipukul kayu pengurus. Wali santri berteriak di kantor sekretariat, mengancam lapor polisi dan merekam video komplain ke TikTok/Facebook dengan judul "Pondok Penganiaya Santri".
    </div>
    <div class="section-tag">2. Bahan Diskusi & Solusi SOP:</div>
    <div class="solution-box">
      <span class="risk-text"><strong>Risiko:</strong> Kehancuran reputasi pondok pesantren dalam hitungan jam sebelum fakta terverifikasi.</span><br>
      <strong>Solusi SOP:</strong> Sambut humanis di ruang khusus dalem; dengarkan penuh tabayyun tanpa berdebat; jika ada kesalahan oknum pengurus, akui dengan tulus dan tanggung pengobatan penuh; nonaktifkan oknum pengurus dari tugas; libatkan Tim Mediasi Islah PC RMI NU Demak sebagai pihak penengah terpercaya.
    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '02-kartu-kasus-dan-percakapan', 'PR-03_KARTU_SIMULASI_KASUS.pdf');
  runPdfConversion(html, outputPath);
}

// =========================================================================
// 4. PR-04: CHECKLIST PEMETAAN 5 PILAR PESANTREN AMAN
// =========================================================================
function generatePR04() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 14mm 14mm 14mm 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A2420; line-height: 1.4; font-size: 9pt; margin: 0; padding: 0; }
  .kop { display: flex; align-items: center; border-bottom: 3px double #145A42; padding-bottom: 8px; margin-bottom: 10px; }
  .kop img { height: 50px; width: auto; margin-right: 14px; }
  .kop-text h2 { color: #145A42; font-size: 11.5pt; font-weight: 800; margin: 0; text-transform: uppercase; }
  .kop-text h3 { color: #C7A45B; font-size: 9pt; font-weight: 700; margin: 1px 0; text-transform: uppercase; }
  .kop-text p { color: #555; font-size: 7.5pt; margin: 0; }
  .badge { background: #145A42; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 8pt; font-weight: bold; font-family: monospace; }
  h1 { color: #145A42; font-size: 13pt; margin: 4px 0 2px 0; font-weight: 800; text-transform: uppercase; }
  .id-box { border: 1px solid #DDE5E0; background: #FAF8F5; padding: 8px; margin-bottom: 10px; font-size: 8.5pt; }
  .id-box table { width: 100%; border-collapse: collapse; }
  .id-box td { border: none; padding: 2px 4px; background: transparent !important; }
  table.rubrik { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 8.5pt; }
  table.rubrik th { background-color: #145A42; color: #ffffff; padding: 6px; font-size: 8.5pt; }
  table.rubrik td { border: 1px solid #DDE5E0; padding: 5px 6px; vertical-align: top; }
  table.rubrik tr:nth-child(even) td { background-color: #FAF8F5; }
  .pilar-head { background-color: #FAF0D7 !important; color: #145A42; font-weight: bold; font-size: 9pt; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-04: Instrumen Checklist Pemetaan Mandiri 5 Pilar Pesantren Aman</p>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
    <span class="badge">INSTRUMEN PR-04</span>
    <span style="font-size: 8pt; color: #666; font-family: monospace;">Instrumen Dialog & Refleksi Mandiri</span>
  </div>

  <h1>CHECKLIST PEMETAAN 5 PILAR PESANTREN AMAN</h1>
  <p style="font-size: 8pt; color: #555; margin-top: 0; margin-bottom: 8px;"><em>Catatan: Formulir ini adalah sarana muhasabah internal bersama Pengasuh, bukan audit investigatif perizinan.</em></p>

  <div class="id-box">
    <table>
      <tr>
        <td width="18%"><strong>Nama Pesantren</strong></td><td width="2%">:</td><td width="40%">........................................................</td>
        <td width="15%"><strong>Kecamatan</strong></td><td width="2%">:</td><td width="23%">........................</td>
      </tr>
      <tr>
        <td><strong>Nama Pengasuh</strong></td><td>:</td><td>........................................................</td>
        <td><strong>Jumlah Santri</strong></td><td>:</td><td>........ Pa / ........ Pi</td>
      </tr>
      <tr>
        <td><strong>Lurah Pondok/PIC</strong></td><td>:</td><td>........................................................</td>
        <td><strong>Tgl Sambang</strong></td><td>:</td><td>........................</td>
      </tr>
    </table>
  </div>

  <table class="rubrik">
    <thead>
      <tr>
        <th width="5%" style="text-align:center;">No</th>
        <th width="50%">Indikator Evaluasi 5 Pilar</th>
        <th width="7%" style="text-align:center;">Belum</th>
        <th width="7%" style="text-align:center;">Lisan</th>
        <th width="7%" style="text-align:center;">Tertulis</th>
        <th width="24%">Catatan Praktik Baik / Celah</th>
      </tr>
    </thead>
    <tbody>
      <!-- PILAR 1 -->
      <tr><td colspan="6" class="pilar-head">PILAR 1: PENGASUHAN YANG AMAN & BERMARTABAT (TA'DIB NABAWI)</td></tr>
      <tr>
        <td align="center">1.1</td>
        <td>Panduan tertulis sanksi edukatif (bebas hukuman tamparan, pukulan rotan, & fisik berlebihan).</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">1.2</td>
        <td>Larangan perpeloncoan, piket sewenang-wenang, dan senioritas liar antarsantri di kamar asrama.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">1.3</td>
        <td>Jadwal pengawasan / ronda malam ustadz pembina di lorong dan kamar tidur santri.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">1.4</td>
        <td>Pembina kamar menerapkan pendekatan kasih sayang, keteladanan, dan muhasabah adab.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">1.5</td>
        <td>Program orientasi dan pendampingan adaptasi ramah bagi santri baru tanpa rasa tertekan.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>

      <!-- PILAR 2 -->
      <tr><td colspan="6" class="pilar-head">PILAR 2: KEPATUHAN HUKUM & LITERASI PERLINDUNGAN</td></tr>
      <tr>
        <td align="center">2.1</td>
        <td>Pengasuh & dewan ustadz memahami UU Perlindungan Anak & batasan pidana kekerasan.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">2.2</td>
        <td>Ustadz memahami batasan pendisiplinan guna melindungi diri dari tuduhan hukum (self-protection).</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">2.3</td>
        <td>Pesantren memiliki kontak koordinasi dengan Satgas RMI NU / Unit PPA Polres Demak.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">2.4</td>
        <td>Perlindungan privasi santri (larangan mengunggah foto santri melanggar ke media sosial publik).</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">2.5</td>
        <td>Edukasi berkala hak belajar aman dan larangan bullying disampaikan terbuka kepada santri.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>

      <!-- PILAR 3 -->
      <tr><td colspan="6" class="pilar-head">PILAR 3: TATA KELOLA & TANGGUNG JAWAB KELEMBAGAAN</td></tr>
      <tr>
        <td align="center">3.1</td>
        <td>Buku Tata Tertib Pengasuhan Santri tertulis dan diketahui wali santri sejak awal pendaftaran.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">3.2</td>
        <td>Penunjukan resmi (SK/Tugas) Ustadz/Ustadzah Penanggung Jawab Perlindungan Santri.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">3.3</td>
        <td>Pencatatan buku mutasi / insiden santri yang terdokumentasi rapi dan terjamin kerahasiaannya.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">3.4</td>
        <td>Pembekalan dan pakta integritas bagi pengurus asrama baru sebelum bertugas.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">3.5</td>
        <td>Saluran komunikasi rutin pengurus dan wali santri terkait perkembangan akhlak anak.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- HALAMAN 2: PILAR 4 & 5 + REKOMENDASI -->
  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-04: Instrumen Checklist Pemetaan Mandiri 5 Pilar (Halaman 2)</p>
    </div>
  </div>

  <table class="rubrik">
    <thead>
      <tr>
        <th width="5%" style="text-align:center;">No</th>
        <th width="50%">Indikator Evaluasi 5 Pilar</th>
        <th width="7%" style="text-align:center;">Belum</th>
        <th width="7%" style="text-align:center;">Lisan</th>
        <th width="7%" style="text-align:center;">Tertulis</th>
        <th width="24%">Catatan Praktik Baik / Celah</th>
      </tr>
    </thead>
    <tbody>
      <!-- PILAR 4 -->
      <tr><td colspan="6" class="pilar-head">PILAR 4: SISTEM PERLINDUNGAN & KANAL PENGADUAN AMAN</td></tr>
      <tr>
        <td align="center">4.1</td>
        <td>Tersedia Kotak Curhat Tertutup di area santri atau kanal WhatsApp konseling pengasuhan.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">4.2</td>
        <td>Jaminan kerahasiaan 100% dan perlindungan pelapor (whistleblower) dari risiko pembalasan.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">4.3</td>
        <td>Adanya ustadz/ustadzah konselor kamar yang dipercaya santri dan bersikap empati (tidak menghakimi).</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">4.4</td>
        <td>Prosedur rujukan cepat saat terjadi santri sakit, trauma psikis, atau insiden darurat.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">4.5</td>
        <td>Pemberian ruang mediasi damai (islah) kekeluargaan yang adil tanpa intimidasi korban.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>

      <!-- PILAR 5 -->
      <tr><td colspan="6" class="pilar-head">PILAR 5: EVALUASI & PERBAIKAN BERKELANJUTAN</td></tr>
      <tr>
        <td align="center">5.1</td>
        <td>Penyusunan Rencana Aksi 90 Hari ("Satu Pesantren, Satu Perubahan Nyata") secara tertulis.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">5.2</td>
        <td>Evaluasi berkala kepengurusan asrama minimal satu kali dalam tiap triwulan.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">5.3</td>
        <td>Kesediaan menerima kunjungan pendampingan berkala Sambang Pesantren RMI NU Demak.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">5.4</td>
        <td>Penandatanganan bersama Piagam Komitmen Pesantren Mitra Perlindungan Santri.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
      <tr>
        <td align="center">5.5</td>
        <td>Keterbukaan belajar dari studi kasus nyata pondok lain untuk perbaikan tata kelola asrama.</td>
        <td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td align="center">[ &nbsp; ]</td><td></td>
      </tr>
    </tbody>
  </table>

  <div style="border: 1px solid #145A42; background: #FAF8F5; padding: 10px; border-radius: 4px; font-size: 8.5pt;">
    <strong>KESIMPULAN TINGKAT KESIAPAN PESANTREN (MARHALAH):</strong><br>
    [ &nbsp; ] <strong>Tahap Perintisan (Ta'sis):</strong> Skor &lt; 50% — Membutuhkan pendampingan prioritas pembuatan regulasi dasar.<br>
    [ &nbsp; ] <strong>Tahap Berkembang (Tarqiyah):</strong> Skor 50 - 79% — Sudah memiliki aturan, butuh penguatan kanal aduan & SOP darurat.<br>
    [ &nbsp; ] <strong>Tahap Mandiri (Istiqlal):</strong> Skor 80 - 100% — Sistem matang dan siap menjadi model percontohan Pesantren Aman.
  </div>

  <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 9pt;">
    <div style="text-align: center; width: 45%;">
      Pengurus / Lurah Pondok Pesantren,<br><br><br><br>
      ( ............................................................ )
    </div>
    <div style="text-align: center; width: 45%;">
      Fasilitator Satgas RMI NU Demak,<br><br><br><br>
      ( ............................................................ )
    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '03-instrumen-pemetaan-dan-rencana-aksi', 'PR-04_CHECKLIST_PEMETAAN_5_PILAR.pdf');
  runPdfConversion(html, outputPath);
}

// =========================================================================
// 5. PR-05: FORMULIR RENCANA AKSI 90 HARI
// =========================================================================
function generatePR05() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1A2420; line-height: 1.45; font-size: 9.5pt; margin: 0; padding: 0; }
  .kop { display: flex; align-items: center; border-bottom: 3px double #145A42; padding-bottom: 8px; margin-bottom: 12px; }
  .kop img { height: 55px; width: auto; margin-right: 15px; }
  .kop-text h2 { color: #145A42; font-size: 12pt; font-weight: 800; margin: 0; text-transform: uppercase; }
  .kop-text h3 { color: #C7A45B; font-size: 9.5pt; font-weight: 700; margin: 1px 0; text-transform: uppercase; }
  .kop-text p { color: #555; font-size: 8pt; margin: 0; }
  .badge { background: #145A42; color: #fff; padding: 2px 7px; border-radius: 3px; font-size: 8pt; font-weight: bold; font-family: monospace; }
  h1 { color: #145A42; font-size: 14pt; margin: 4px 0 2px 0; font-weight: 800; }
  .id-box { border: 1px solid #DDE5E0; background: #FAF8F5; padding: 8px 12px; margin-bottom: 12px; font-size: 9pt; }
  .id-box table { width: 100%; border-collapse: collapse; }
  .id-box td { border: none; padding: 3px 4px; background: transparent !important; }
  .focus-box { border: 1.5px solid #145A42; border-radius: 4px; padding: 10px; margin-bottom: 12px; background: #ffffff; }
  .focus-title { font-weight: bold; color: #145A42; margin-bottom: 6px; font-size: 9.5pt; }
  table.timeline { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9pt; }
  table.timeline th { background-color: #145A42; color: #ffffff; padding: 6px 8px; text-align: left; }
  table.timeline td { border: 1px solid #DDE5E0; padding: 6px 8px; vertical-align: top; }
  .page-break { page-break-after: always; }
</style>
</head>
<body>

  <div class="kop">
    <img src="${LOGO_SRC}" alt="Logo">
    <div class="kop-text">
      <h2>Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama</h2>
      <h3>Satgas Perlindungan Santri — Kabupaten Demak</h3>
      <p>Perangkat Lapangan PR-05: Formulir Rencana Aksi 90 Hari (Satu Pesantren, Satu Perubahan Nyata)</p>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
    <span class="badge">LEMBAR KERJA PR-05</span>
    <span style="font-size: 8.5pt; color: #666; font-family: monospace;">Komitmen Aksi Jangka Pendek (3 Bulan)</span>
  </div>

  <h1>FORMULIR RENCANA AKSI 90 HARI</h1>
  <p style="font-size: 9pt; color: #666; margin-top: 0; margin-bottom: 10px;"><em>"Dari komitmen lisan menuju pembentukan sistem perlindungan nyata yang bermartabat."</em></p>

  <div class="id-box">
    <table>
      <tr>
        <td width="22%"><strong>Nama Pesantren</strong></td><td width="2%">:</td><td width="76%">.................................................................................................................</td>
      </tr>
      <tr>
        <td><strong>Kecamatan / Wilayah</strong></td><td>:</td><td>........................................................ / Kabupaten Demak</td>
      </tr>
      <tr>
        <td><strong>Pengasuh Utama</strong></td><td>:</td><td>.................................................................................................................</td>
      </tr>
      <tr>
        <td><strong>Ustadz PIC Lapangan</strong></td><td>:</td><td>........................................................ (No. WhatsApp: ....................................)</td>
      </tr>
      <tr>
        <td><strong>Fasilitator RMI NU</strong></td><td>:</td><td>.................................................................................................................</td>
      </tr>
      <tr>
        <td><strong>Periode Aksi 90 Hari</strong></td><td>:</td><td>............................... s.d. ............................... (Tahun 2026)</td>
      </tr>
    </table>
  </div>

  <div class="focus-box">
    <div class="focus-title">1. RUMUSAN SATU PERUBAHAN PRIORITAS (Pilih 1 atau Maksimal 2 Pilihan):</div>
    <div style="font-size: 9pt; line-height: 1.6;">
      [ &nbsp; ] <strong>A. Kebijakan & Tata Tertib:</strong> Menyusun & mengesahkan Buku Pedoman Sanksi Edukatif Santri Tanpa Hukuman Fisik.<br>
      [ &nbsp; ] <strong>B. Kanal Pengaduan Aman:</strong> Memasang Kotak Curhat Tertutup dan menunjuk 1 Ustadz & 1 Ustadzah Konselor Kamar.<br>
      [ &nbsp; ] <strong>C. Penataan Kamar Asrama:</strong> Meniadakan senioritas kamar liar, membuat jadwal piket resmi, dan ronda malam pembina.<br>
      [ &nbsp; ] <strong>D. Literasi Asatidz:</strong> Mengadakan halaqah literasi perlindungan anak & batasan hukum bagi seluruh ustadz pondok.<br>
      [ &nbsp; ] <strong>E. Lainnya:</strong> ...................................................................................................................................................
    </div>
  </div>

  <div class="focus-title">2. TAHAPAN AKSI BERKALA (MILESTONE 90 HARI):</div>

  <table class="timeline">
    <thead>
      <tr>
        <th width="28%">Periode & Target</th>
        <th width="44%">Aktivitas Nyata</th>
        <th width="28%">Bukti Fisik & Verifikasi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>BULAN I (Hari 1 - 30)</strong><br><em style="font-size: 8pt; color: #555;">Tahap Konsolidasi & Draf Aturan</em></td>
        <td>
          1. Rapat dewan ustadz internal pondok.<br>
          2. Penyusunan draf aturan/SOP tertulis.<br>
          3. Penunjukan ustadz/ustadzah pelaksana.
        </td>
        <td>
          • Notulen Rapat Internal<br>
          • Lembar Draf Tata Tertib<br>
          • Verifikasi RMI (Hari ke-30):<br>
          [ &nbsp; ] Tercapai &nbsp; [ &nbsp; ] Proses
        </td>
      </tr>
      <tr>
        <td><strong>BULAN II (Hari 31 - 60)</strong><br><em style="font-size: 8pt; color: #555;">Tahap Sosialisasi & Uji Coba</em></td>
        <td>
          1. Pengesahan SK oleh Kyai/Pengasuh.<br>
          2. Sosialisasi kepada seluruh santri asrama.<br>
          3. Penyiapan sarana fisik (kotak curhat/banner).
        </td>
        <td>
          • Dokumentasi Sosialisasi<br>
          • Kotak Curhat Terpasang<br>
          • Verifikasi RMI (Hari ke-60):<br>
          [ &nbsp; ] Tercapai &nbsp; [ &nbsp; ] Proses
        </td>
      </tr>
      <tr>
        <td><strong>BULAN III (Hari 61 - 90)</strong><br><em style="font-size: 8pt; color: #555;">Tahap Penerapan & Evaluasi</em></td>
        <td>
          1. Sistem pengasuhan & aduan berjalan aktif.<br>
          2. Evaluasi kendala bersama pengurus kamar.<br>
          3. Pelaporan capaian progres ke RMI NU Demak.
        </td>
        <td>
          • Catatan Rekap Aduan Aktif<br>
          • Laporan Evaluasi 90 Hari<br>
          • Verifikasi RMI (Hari ke-90):<br>
          [ &nbsp; ] Tuntas &nbsp; [ &nbsp; ] Diperpanjang
        </td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 25px; display: flex; justify-content: space-between; font-size: 9pt;">
    <div style="text-align: center; width: 45%;">
      PENGASUH PONDOK PESANTREN,<br><br><br><br>
      ( ............................................................ )
    </div>
    <div style="text-align: center; width: 45%;">
      TIM FASILITATOR PC RMI NU DEMAK,<br><br><br><br>
      ( ............................................................ )
    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '03-instrumen-pemetaan-dan-rencana-aksi', 'PR-05_FORM_RENCANA_AKSI_90_HARI.pdf');
  runPdfConversion(html, outputPath);
}

// =========================================================================
// 6. PR-06: PIAGAM KOMITMEN PESANTREN MITRA AMAN (A4 LANDSCAPE)
// =========================================================================
function generatePR06() {
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; color: #1A2420; margin: 0; padding: 0; background-color: #FAF8F5; }
  .outer-border { border: 4px solid #C7A45B; padding: 4px; height: 185mm; }
  .inner-border { border: 1.5px solid #145A42; padding: 18px 30px; height: 100%; text-align: center; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; }
  .logo-header { display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 4px; }
  .logo-header img { height: 50px; width: auto; }
  .instansi { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; font-weight: bold; color: #145A42; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
  .sub-instansi { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8pt; color: #C7A45B; font-weight: bold; text-transform: uppercase; margin: 1px 0 6px 0; }
  h1 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 19pt; font-weight: 800; color: #145A42; margin: 0; letter-spacing: 1.5px; }
  h2 { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12.5pt; font-weight: bold; color: #C7A45B; margin: 2px 0 6px 0; text-transform: uppercase; }
  .nomor { font-family: monospace; font-size: 8.5pt; color: #666; margin-bottom: 8px; }
  .slogan { font-style: italic; font-size: 10.5pt; color: #145A42; font-weight: bold; margin-bottom: 8px; }
  .mukadimah { font-size: 9.5pt; line-height: 1.4; max-width: 90%; margin: 0 auto 8px auto; text-align: center; }
  .pesantren-nama { font-family: 'Segoe UI', Arial, sans-serif; font-size: 14pt; font-weight: 800; color: #145A42; text-transform: uppercase; text-decoration: underline; margin: 4px 0 1px 0; }
  .pesantren-alamat { font-size: 9pt; color: #555; margin-bottom: 8px; }
  .butir-komitmen { text-align: left; max-width: 82%; margin: 0 auto; font-size: 8.5pt; line-height: 1.35; }
  .butir-komitmen ol { margin: 0; padding-left: 20px; }
  .butir-komitmen li { margin-bottom: 2px; }
  .ttd-container { display: flex; justify-content: space-between; margin-top: 10px; font-size: 9pt; padding: 0 35px; }
  .ttd-box { text-align: center; width: 28%; }
  .ttd-line { border-bottom: 1px solid #1A2420; font-weight: bold; margin-top: 40px; padding-bottom: 2px; }
</style>
</head>
<body>

  <div class="outer-border">
    <div class="inner-border">
      
      <div>
        <div class="logo-header">
          <img src="${LOGO_SRC}" alt="Logo PESANTREN AMAN">
        </div>
        <div class="instansi">PENGURUS CABANG NAHDLATUL ULAMA KABUPATEN DEMAK</div>
        <div class="sub-instansi">RABITHAH MA'AHID ISLAMIYAH — SATGAS PERLINDUNGAN SANTRI</div>
        <h1>PIAGAM KOMITMEN</h1>
        <h2>PESANTREN MITRA AMAN</h2>
        <div class="nomor">Nomor Registrasi: PA-DMK / 2026 / .....................</div>
        <div class="slogan">"Menjaga Amanah, Melindungi Santri, Memuliakan Pesantren"</div>
      </div>

      <div>
        <div class="mukadimah">
          Dengan senantiasa memohon taufiq, hidayah, dan ridho Allah Subhanahu Wa Ta'ala, Pengurus Cabang Rabithah Ma'ahid Islamiyah Nahdlatul Ulama (PC RMI NU) Kabupaten Demak bersama Satgas Perlindungan Santri menyatakan bahwa:
        </div>

        <div class="pesantren-nama">[ NAMA LENGKAP PONDOK PESANTREN ]</div>
        <div class="pesantren-alamat">Kecamatan ........................................, Kabupaten Demak, Jawa Tengah | NSP: ........................................</div>

        <div class="butir-komitmen">
          Telah berpartisipasi aktif dalam Program Sambang Pesantren dan menyatakan <strong>KOMITMEN TEGUH</strong> untuk:
          <ol>
            <li>Menjaga amanah para wali santri dengan mewujudkan lingkungan pengasuhan yang aman, damai, dan bermartabat.</li>
            <li>Menerapkan pola pengasuhan dan disiplin berbasis <em>Ta'dib Nabawi</em> tanpa kekerasan fisik, verbal, maupun perundungan antarsantri.</li>
            <li>Menegakkan tata kelola pengasuhan yang taat hukum serta menjunjung tinggi hak-hak santri selaras maqashid syariah.</li>
            <li>Menyediakan saluran pengaduan tertutup yang aman dan menjamin kerahasiaan identitas santri yang melapor.</li>
            <li>Menjalankan Rencana Aksi 90 Hari (<em>Satu Pesantren, Satu Perubahan Nyata</em>) demi kemuliaan pondok pesantren.</li>
          </ol>
        </div>
      </div>

      <div>
        <div style="font-size: 8pt; color: #666; margin-bottom: 4px;">Ditetapkan di Demak, pada tanggal: .................................................... 2026 M</div>
        
        <div class="ttd-container">
          <div class="ttd-box">
            Pengasuh Pondok Pesantren,
            <div class="ttd-line">( .................................................... )</div>
            <span style="font-size: 7.5pt; color: #555;">Kyai / Pengasuh</span>
          </div>

          <div class="ttd-box">
            PC RMI NU Kabupaten Demak,
            <div class="ttd-line">KH. Aniq Muhammad, Lc.</div>
            <span style="font-size: 7.5pt; color: #555;">Ketua PC RMI NU Demak</span>
          </div>

          <div class="ttd-box">
            Satgas Perlindungan Santri,
            <div class="ttd-line">( .................................................... )</div>
            <span style="font-size: 7.5pt; color: #555;">Koordinator Satgas Demak</span>
          </div>
        </div>
      </div>

    </div>
  </div>

</body>
</html>`;

  const outputPath = path.join(__dirname, '..', 'perangkat-lapangan', '04-piagam-dan-administrasi', 'PR-06_PIAGAM_KOMITMEN.pdf');
  runPdfConversion(html, outputPath, true);
}

// =========================================================================
// RUN ALL GENERATORS
// =========================================================================
console.log('Memulai proses konversi dokumen Field Kit ke format PDF resmi...');
generatePR01();
generatePR02();
generatePR03();
generatePR04();
generatePR05();
generatePR06();

// Bersihkan folder temp
if (fs.existsSync(TEMP_DIR)) {
  fs.rmdirSync(TEMP_DIR, { recursive: true });
}
console.log('Semua 6 dokumen Field Kit berhasil dikonversi ke PDF!');

