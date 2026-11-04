/**
 * PESANTREN AMAN - Public Web Server (pesantrenaman.rminudemak.org)
 * Backend: Node.js + Express.js
 * Inisiator: RMI NU Demak - Satgas Perlindungan Santri
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Data directory for persistent storage
const DATA_DIR = path.join(__dirname, 'data');
const PERMOHONAN_FILE = path.join(DATA_DIR, 'permohonan-sambang.json');
const PESANTREN_FILE = path.join(DATA_DIR, 'pesantren-demak.json');
const KOMITMEN_FILE = path.join(DATA_DIR, 'komitmen-90-hari.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and files exist
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PERMOHONAN_FILE)) {
    fs.writeFileSync(PERMOHONAN_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(PESANTREN_FILE)) {
    fs.writeFileSync(PESANTREN_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(KOMITMEN_FILE)) {
    fs.writeFileSync(KOMITMEN_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('[DATA] Peringatan saat inisialisasi direktori data (read-only filesystem):', err.message);
}

// 14 Kecamatan resmi di Kabupaten Demak
const DEMAK_KECAMATAN = [
  { nama: 'Mranggen', target: 35 },
  { nama: 'Demak Kota', target: 20 },
  { nama: 'Sayung', target: 15 },
  { nama: 'Bonang', target: 14 },
  { nama: 'Guntur', target: 12 },
  { nama: 'Karangawen', target: 11 },
  { nama: 'Dempet', target: 9 },
  { nama: 'Karangtengah', target: 8 },
  { nama: 'Wedung', target: 8 },
  { nama: 'Wonosalam', target: 6 },
  { nama: 'Karanganyar', target: 4 },
  { nama: 'Gajah', target: 3 },
  { nama: 'Mijen', target: 3 },
  { nama: 'Kebonagung', target: 2 }
];

function readJsonFile(filePath, defaultVal = []) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading JSON file:', filePath, e.message);
  }
  return defaultVal;
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing JSON file:', filePath, e.message);
    return false;
  }
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------------------------------------------------------------
 * AUTENTIKASI & MULTI-USER ACCESS (PC RMI NU DEMAK)
 * -------------------------------------------------------------------------- */
// Active in-memory session cache: token -> session data
const activeSessions = new Map();

function hashPasswordWithSalt(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    if (!name) return;
    const value = parts.slice(1).join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function getSessionFromRequest(req) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }
  if (!token) {
    const cookies = parseCookies(req);
    token = cookies.pa_session;
  }
  if (!token) return null;

  const session = activeSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }

  return { token, ...session };
}

function requireAuthWeb(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) {
    const redirectUrl = encodeURIComponent(req.originalUrl || '/admin');
    return res.redirect(`/login?redirect=${redirectUrl}`);
  }
  req.user = session;
  next();
}

function requireAuthApi(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Akses ditolak: Sesi login belum aktif atau telah berakhir.' });
  }
  req.user = session;
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Akses ditolak: Belum terotentikasi.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Hak akses peran '${req.user.role}' tidak berwenang melakukan tindakan ini.`
      });
    }
    next();
  };
}

// Serve Brand assets (/brand/tokens.css, /brand/logos/..., /brand/icons/...)
app.use('/brand', express.static(path.join(__dirname, 'brand')));

// Serve Raw Perangkat Lapangan for download
app.use('/perangkat-lapangan', express.static(path.join(__dirname, 'perangkat-lapangan')));

// Serve Media dan Kampanye assets
app.use('/media-dan-kampanye', express.static(path.join(__dirname, 'media-dan-kampanye')));

// Favicon direct route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'favicon.png'));
});

// Apple Touch Icon direct route for iOS Home Screen
app.get(['/apple-touch-icon.png', '/apple-touch-icon-precomposed.png'], (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'apple-touch-icon.png'));
});

// Service Worker route with root scope
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'website', 'sw.js'));
});

// Prevent direct static bypass of admin.html
app.use((req, res, next) => {
  if (req.path === '/admin.html') {
    return res.redirect('/admin');
  }
  next();
});

// Protected Admin Page
app.get('/admin', requireAuthWeb, (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'admin.html'));
});

// Login Page Route
app.get('/login', (req, res) => {
  const session = getSessionFromRequest(req);
  if (session) {
    return res.redirect('/admin');
  }
  res.sendFile(path.join(__dirname, 'website', 'login.html'));
});

// Serve website static files (css, js, assets, etc.)
app.use(express.static(path.join(__dirname, 'website')));

// Clean Pretty Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.get('/tentang', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'tentang.html'));
});

app.get('/mitra', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'mitra.html'));
});

app.get('/lima-pilar', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'lima-pilar.html'));
});

app.get('/sambang', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'sambang.html'));
});

app.get('/unduhan', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'unduhan.html'));
});

app.get('/media', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'media.html'));
});

app.get('/kabar', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'kabar.html'));
});

app.get('/kontak', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'kontak.html'));
});

app.get('/asesmen', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'asesmen-mandiri.html'));
});

app.get('/perkembangan', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'perkembangan.html'));
});

// API: Dapatkan Statistik Gerakan
app.get('/api/statistik', (req, res) => {
  res.json({
    success: true,
    data: {
      targetPesantren: 150,
      pesantrenTersambang: 48,
      santriTerlindungi: 24850,
      fasilitatorTerlatih: 64,
      komitmenAksi90Hari: 42,
      kecamatanCakupan: 14,
      wilayah: 'Kabupaten Demak, Jawa Tengah',
      pembaruanTerakhir: 'November 2026'
    }
  });
});

// API Publik: Data Perkembangan & Sebaran 14 Kecamatan
app.get('/api/perkembangan-publik', (req, res) => {
  const pesantrenList = readJsonFile(PESANTREN_FILE);
  const komitmenList = readJsonFile(KOMITMEN_FILE);

  const totalPesantren = pesantrenList.length;
  const tersambang = pesantrenList.filter(p => p.statusSambang === 'Tersambang');
  const terjadwal = pesantrenList.filter(p => p.statusSambang === 'Terjadwal');
  const santriTerlindungi = tersambang.reduce((acc, curr) => acc + (parseInt(curr.totalSantri) || 0), 0);

  const kecamatanData = DEMAK_KECAMATAN.map(kec => {
    const listInKec = pesantrenList.filter(p => p.kecamatan && p.kecamatan.toLowerCase() === kec.nama.toLowerCase());
    const tersambangInKec = listInKec.filter(p => p.statusSambang === 'Tersambang').length;
    const santriInKec = listInKec.reduce((acc, curr) => acc + (parseInt(curr.totalSantri) || 0), 0);
    const progress = Math.min(Math.round((tersambangInKec / kec.target) * 100), 100);

    return {
      nama: kec.nama,
      target: kec.target,
      totalPesantren: listInKec.length,
      tersambang: tersambangInKec,
      santri: santriInKec,
      persen: progress
    };
  });

  const publicPesantren = pesantrenList.map(p => ({
    id: p.id,
    namaPesantren: p.namaPesantren,
    nsp: p.nsp,
    pengasuh: p.pengasuh,
    kecamatan: p.kecamatan,
    alamat: p.alamat,
    totalSantri: p.totalSantri,
    statusSambang: p.statusSambang,
    tanggalSambang: p.tanggalSambang,
    prioritasPilar: p.prioritasPilar,
    skorIndeks: p.skorIndeks
  }));

  res.json({
    success: true,
    data: {
      metrics: {
        totalTargetKabupaten: 150,
        totalPesantrenTerdata: totalPesantren,
        totalPesantrenTersambang: tersambang.length,
        totalPesantrenTerjadwal: terjadwal.length,
        totalSantriTerlindungi: Math.max(santriTerlindungi, 24850),
        totalKomitmen90Hari: Math.max(komitmenList.length, 42),
        fasilitatorTerlatih: 64,
        kecamatanCakupan: 14
      },
      kecamatan: kecamatanData,
      pesantren: publicPesantren
    }
  });
});

// API: Daftar Unduhan Dokumen Resmi Field Kit
app.get('/api/unduhan-list', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'PR-01',
        title: 'Modul Fasilitator Sambang Pesantren (Field Guide)',
        category: 'modul',
        format: 'Dokumen PDF Resmi',
        size: '324 KB',
        path: '/perangkat-lapangan/01-modul-fasilitator/PR-01_MODUL_FASILITATOR_SAMBANG_PESANTREN.pdf',
        description: 'Panduan operasional alur fasilitasi 90-120 menit: Salam, Dialog 5 Pertanyaan, Simulasi Kasus, dan Perumusan Rencana Aksi.'
      },
      {
        id: 'PR-02',
        title: 'Kartu Percakapan 5 Pertanyaan Inti',
        category: 'kartu',
        format: 'Dokumen PDF Resmi',
        size: '302 KB',
        path: '/perangkat-lapangan/02-kartu-kasus-dan-percakapan/PR-02_KARTU_PERCAKAPAN_5_PERTANYAAN.pdf',
        description: 'Panduan dialog reflektif bersama Masyaikh & Pengurus: Siapa yang dilindungi, pola asuh, tanggung jawab, kanal aduan, dan aksi perbaikan.'
      },
      {
        id: 'PR-03',
        title: 'Kartu Simulasi Kasus & Studi Skenario',
        category: 'kartu',
        format: 'Dokumen PDF Resmi',
        size: '374 KB',
        path: '/perangkat-lapangan/02-kartu-kasus-dan-percakapan/PR-03_KARTU_SIMULASI_KASUS.pdf',
        description: 'Studi kasus nyata penanganan perundungan kamar, pendisiplinan santri baru, alur mediasi damai, dan koordinasi rujukan medis.'
      },
      {
        id: 'PR-04',
        title: 'Instrumen Checklist Pemetaan 5 Pilar Pesantren Aman',
        category: 'instrumen',
        format: 'Dokumen PDF Resmi',
        size: '350 KB',
        path: '/perangkat-lapangan/03-instrumen-pemetaan-dan-rencana-aksi/PR-04_CHECKLIST_PEMETAAN_5_PILAR.pdf',
        description: 'Alat asesmen mandiri untuk memetakan tingkat kepatuhan regulasi, tata tertib pengasuhan, kanal curhat, dan satgas internal.'
      },
      {
        id: 'PR-05',
        title: 'Formulir Rencana Aksi 90 Hari (Satu Pesantren, Satu Perubahan)',
        category: 'instrumen',
        format: 'Dokumen PDF Resmi',
        size: '298 KB',
        path: '/perangkat-lapangan/03-instrumen-pemetaan-dan-rencana-aksi/PR-05_FORM_RENCANA_AKSI_90_HARI.pdf',
        description: 'Lembar kerja target aksi konkret jangka pendek pesantren dalam memperbaiki sistem pencegahan kekerasan.'
      },
      {
        id: 'PR-06',
        title: 'Piagam Komitmen & Berita Acara Kunjungan Sambang',
        category: 'instrumen',
        format: 'Dokumen PDF Resmi',
        size: '332 KB',
        path: '/perangkat-lapangan/04-piagam-dan-administrasi/PR-06_PIAGAM_KOMITMEN.pdf',
        description: 'Naskah piagam komitmen kesediaan pesantren menjadi mitra Pesantren Aman beserta format berita acara kunjungan resmi.'
      },
      {
        id: 'MD-01',
        title: 'Paket Desain Feed Medsos & Poster Edukasi 5 Pilar',
        category: 'poster',
        format: 'SVG / PNG Vector',
        size: '2.8 MB',
        path: '/media-dan-kampanye/01-template-media-sosial/template-feed-carousel-slide1.svg',
        description: 'Desain visual siap cetak ukuran A3/A2 untuk mading asrama dan konten carousel media sosial kampanye anti kekerasan.'
      }
    ]
  });
});

// API: Pengajuan Permohonan Sambang Pesantren
app.post('/api/permohonan-sambang', (req, res) => {
  try {
    const {
      namaPesantren,
      namaPengasuh,
      kontakWa,
      kecamatan,
      alamat,
      jumlahSantri,
      tanggalRencana,
      fokusPrioritas,
      catatanTambahan
    } = req.body;

    if (!namaPesantren || !namaPengasuh || !kontakWa || !kecamatan) {
      return res.status(400).json({
        success: false,
        message: 'Mohon isi semua data wajib: Nama Pesantren, Pengasuh, No. WhatsApp, dan Kecamatan.'
      });
    }

    let records = [];
    if (fs.existsSync(PERMOHONAN_FILE)) {
      const raw = fs.readFileSync(PERMOHONAN_FILE, 'utf-8');
      records = JSON.parse(raw || '[]');
    }

    const registrationId = `SBG-${new Date().getFullYear()}-${String(records.length + 1).padStart(3, '0')}`;

    const newRecord = {
      id: registrationId,
      namaPesantren,
      namaPengasuh,
      kontakWa,
      kecamatan,
      alamat: alamat || '-',
      jumlahSantri: jumlahSantri || 'Belum diisi',
      tanggalRencana: tanggalRencana || 'Fleksibel / Sesuai Jadwal RMI',
      fokusPrioritas: fokusPrioritas || 'Semua 5 Pilar',
      catatanTambahan: catatanTambahan || '-',
      status: 'Menunggu Verifikasi Tim Satgas',
      waktuPengajuan: new Date().toISOString()
    };

    records.push(newRecord);
    writeJsonFile(PERMOHONAN_FILE, records);

    return res.status(201).json({
      success: true,
      message: 'Permohonan kunjungan Sambang Pesantren berhasil diterima. Tim Satgas RMI NU Demak akan segera menghubungi narahubung.',
      data: newRecord
    });
  } catch (error) {
    console.error('Error saat menyimpan permohonan sambang:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem saat memproses permohonan Anda.'
    });
  }
});

/* =========================================================================
 * AUTH & USER MANAGEMENT API (PC RMI NU DEMAK)
 * ========================================================================= */

// 1. Login Petugas / Fasilitator
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Nama pengguna dan kata sandi wajib diisi.' });
    }

    const users = readJsonFile(USERS_FILE);
    const user = users.find(u => 
      u.username.toLowerCase() === username.trim().toLowerCase() ||
      (u.email && u.email.toLowerCase() === username.trim().toLowerCase())
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Nama pengguna atau kata sandi tidak cocok.' });
    }

    if (user.status !== 'Aktif') {
      return res.status(403).json({ success: false, message: 'Akun Anda berstatus non-aktif. Hubungi Sekretariat RMI.' });
    }

    const calculatedHash = hashPasswordWithSalt(password, user.salt);
    if (calculatedHash !== user.hash) {
      return res.status(401).json({ success: false, message: 'Nama pengguna atau kata sandi tidak cocok.' });
    }

    // Token acak aman (64 karakter hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 Jam masa aktif

    activeSessions.set(token, {
      userId: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      email: user.email,
      jabatan: user.jabatan,
      wilayahTugas: user.wilayahTugas,
      expiresAt
    });

    // Set HTTP-Only Cookie
    res.setHeader('Set-Cookie', `pa_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);

    res.json({
      success: true,
      message: `Selamat datang, ${user.nama}`,
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
        email: user.email,
        jabatan: user.jabatan,
        wilayahTugas: user.wilayahTugas
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Logout Petugas
app.post('/api/auth/logout', (req, res) => {
  const session = getSessionFromRequest(req);
  if (session) {
    activeSessions.delete(session.token);
  }
  res.setHeader('Set-Cookie', 'pa_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true, message: 'Sesi telah diakhiri. Berhasil keluar.' });
});

// 3. Cek Status Login Aktif (Current User)
app.get('/api/auth/me', requireAuthApi, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      nama: req.user.nama,
      role: req.user.role,
      email: req.user.email,
      jabatan: req.user.jabatan,
      wilayahTugas: req.user.wilayahTugas
    }
  });
});

// 4. Daftar Akun Pengguna / Fasilitator (Khusus Super Admin)
app.get('/api/admin/users', requireAuthApi, requireRole('superadmin'), (req, res) => {
  const users = readJsonFile(USERS_FILE).map(u => ({
    id: u.id,
    username: u.username,
    nama: u.nama,
    role: u.role,
    email: u.email,
    jabatan: u.jabatan,
    wilayahTugas: u.wilayahTugas,
    status: u.status,
    createdAt: u.createdAt
  }));
  res.json({ success: true, count: users.length, data: users });
});

// 5. Tambah Akun Pengguna / Fasilitator Baru (Khusus Super Admin)
app.post('/api/admin/users', requireAuthApi, requireRole('superadmin'), (req, res) => {
  try {
    const { username, nama, role, email, password, jabatan, wilayahTugas } = req.body;
    if (!username || !password || !nama) {
      return res.status(400).json({ success: false, message: 'Nama, username, dan kata sandi wajib diisi.' });
    }

    const users = readJsonFile(USERS_FILE);
    if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Username sudah terdaftar.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPasswordWithSalt(password, salt);
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;

    const newUser = {
      id: newId,
      username: username.trim(),
      nama: nama.trim(),
      role: role || 'fasilitator',
      email: email?.trim() || `${username.trim()}@rminudemak.org`,
      jabatan: jabatan?.trim() || 'Fasilitator Satgas Sambang',
      wilayahTugas: wilayahTugas?.trim() || 'Kabupaten Demak',
      status: 'Aktif',
      salt,
      hash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJsonFile(USERS_FILE, users);

    res.status(201).json({
      success: true,
      message: 'Akun petugas baru berhasil dibuat.',
      data: {
        id: newUser.id,
        username: newUser.username,
        nama: newUser.nama,
        role: newUser.role,
        email: newUser.email,
        jabatan: newUser.jabatan,
        wilayahTugas: newUser.wilayahTugas
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =========================================================================
 * ADMIN API ENDPOINTS (DASHBOARD, 14 KECAMATAN, MONITORING SAMBANG)
 * ========================================================================= */

// 1. Dashboard Metrics & 14 Kecamatan Stats
app.get('/api/admin/dashboard', requireAuthApi, (req, res) => {
  const pesantrenList = readJsonFile(PESANTREN_FILE);
  const permohonanList = readJsonFile(PERMOHONAN_FILE);
  const komitmenList = readJsonFile(KOMITMEN_FILE);

  const totalPesantren = pesantrenList.length;
  const tersambang = pesantrenList.filter(p => p.statusSambang === 'Tersambang');
  const terjadwal = pesantrenList.filter(p => p.statusSambang === 'Terjadwal');
  const totalSantriTerlindungi = tersambang.reduce((acc, curr) => acc + (parseInt(curr.totalSantri) || 0), 0);
  const permohonanMenunggu = permohonanList.filter(p => p.status && p.status.includes('Menunggu')).length;

  // Rekapitulasi per 14 Kecamatan Demak
  const kecamatanData = DEMAK_KECAMATAN.map(kec => {
    const listInKec = pesantrenList.filter(p => p.kecamatan && p.kecamatan.toLowerCase() === kec.nama.toLowerCase());
    const tersambangInKec = listInKec.filter(p => p.statusSambang === 'Tersambang').length;
    const santriInKec = listInKec.reduce((acc, curr) => acc + (parseInt(curr.totalSantri) || 0), 0);
    const progress = Math.min(Math.round((tersambangInKec / kec.target) * 100), 100);

    return {
      nama: kec.nama,
      target: kec.target,
      totalPesantren: listInKec.length,
      tersambang: tersambangInKec,
      santri: santriInKec,
      persen: progress
    };
  });

  res.json({
    success: true,
    data: {
      metrics: {
        totalTargetKabupaten: 150,
        totalPesantrenTerdata: totalPesantren,
        totalPesantrenTersambang: tersambang.length,
        totalPesantrenTerjadwal: terjadwal.length,
        totalSantriTerlindungi: totalSantriTerlindungi,
        totalKomitmen90Hari: komitmenList.length,
        permohonanMenunggu: permohonanMenunggu,
        fasilitatorAktif: 64
      },
      kecamatan: kecamatanData,
      recentSambang: tersambang.slice(0, 5),
      recentPermohonan: permohonanList.slice(-5).reverse()
    }
  });
});

// 2. Daftar Pesantren (Filter & Search)
app.get('/api/admin/pesantren', requireAuthApi, (req, res) => {
  let list = readJsonFile(PESANTREN_FILE);
  const { search, kecamatan, status } = req.query;

  if (search) {
    const kw = search.toLowerCase();
    list = list.filter(p => 
      (p.namaPesantren && p.namaPesantren.toLowerCase().includes(kw)) ||
      (p.pengasuh && p.pengasuh.toLowerCase().includes(kw)) ||
      (p.nsp && p.nsp.includes(kw))
    );
  }

  if (kecamatan && kecamatan !== 'all') {
    list = list.filter(p => p.kecamatan && p.kecamatan.toLowerCase() === kecamatan.toLowerCase());
  }

  if (status && status !== 'all') {
    list = list.filter(p => p.statusSambang === status);
  }

  res.json({ success: true, count: list.length, data: list });
});

// 3. Tambah Pesantren Baru
app.post('/api/admin/pesantren', requireAuthApi, requireRole('superadmin', 'fasilitator'), (req, res) => {
  try {
    const list = readJsonFile(PESANTREN_FILE);
    const { namaPesantren, nsp, pengasuh, kecamatan, alamat, santriPutra, santriPutri, statusSambang, prioritasPilar } = req.body;

    if (!namaPesantren || !kecamatan) {
      return res.status(400).json({ success: false, message: 'Nama Pesantren dan Kecamatan wajib diisi.' });
    }

    const putra = parseInt(santriPutra) || 0;
    const putri = parseInt(santriPutri) || 0;
    const newId = `PS-DMK-${String(list.length + 1).padStart(3, '0')}`;

    const newPesantren = {
      id: newId,
      namaPesantren: namaPesantren.trim(),
      nsp: nsp?.trim() || '-',
      pengasuh: pengasuh?.trim() || 'Pengasuh Pesantren',
      kecamatan: kecamatan.trim(),
      alamat: alamat?.trim() || '-',
      santriPutra: putra,
      santriPutri: putri,
      totalSantri: putra + putri,
      statusSambang: statusSambang || 'Tahap Asesmen',
      tanggalSambang: statusSambang === 'Tersambang' ? new Date().toISOString().split('T')[0] : '-',
      fasilitator: '-',
      skorIndeks: 0,
      prioritasPilar: prioritasPilar || 'Belum Terpetakan'
    };

    list.push(newPesantren);
    writeJsonFile(PESANTREN_FILE, list);

    res.status(201).json({ success: true, message: 'Pesantren berhasil ditambahkan.', data: newPesantren });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Data / Status Sambang Pesantren
app.patch('/api/admin/pesantren/:id', requireAuthApi, requireRole('superadmin', 'fasilitator'), (req, res) => {
  try {
    const list = readJsonFile(PESANTREN_FILE);
    const idx = list.findIndex(p => p.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data pesantren tidak ditemukan.' });
    }

    list[idx] = { ...list[idx], ...req.body };
    if (req.body.santriPutra !== undefined || req.body.santriPutri !== undefined) {
      const pa = parseInt(list[idx].santriPutra) || 0;
      const pi = parseInt(list[idx].santriPutri) || 0;
      list[idx].totalSantri = pa + pi;
    }

    writeJsonFile(PESANTREN_FILE, list);
    res.json({ success: true, message: 'Data pesantren berhasil diperbarui.', data: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Daftar Permohonan Sambang
app.get('/api/admin/permohonan', requireAuthApi, (req, res) => {
  const list = readJsonFile(PERMOHONAN_FILE);
  res.json({ success: true, count: list.length, data: list.reverse() });
});

// 6. Update Status Permohonan (Verifikasi / Jadwalkan)
app.patch('/api/admin/permohonan/:id', requireAuthApi, requireRole('superadmin', 'fasilitator'), (req, res) => {
  try {
    const list = readJsonFile(PERMOHONAN_FILE);
    const idx = list.findIndex(p => p.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan.' });
    }

    const { status, tanggalKunjungan, fasilitator, catatanSatgas } = req.body;
    list[idx] = {
      ...list[idx],
      status: status || list[idx].status,
      tanggalKunjungan: tanggalKunjungan || list[idx].tanggalKunjungan,
      fasilitator: fasilitator || list[idx].fasilitator,
      catatanSatgas: catatanSatgas || list[idx].catatanSatgas,
      waktuPembaruan: new Date().toISOString()
    };

    writeJsonFile(PERMOHONAN_FILE, list);

    // Jika dijadwalkan / disetujui, update atau tambahkan ke pesantren-demak.json
    if (status === 'Terjadwal' || status === 'Tersambang') {
      const pesantrenList = readJsonFile(PESANTREN_FILE);
      const exists = pesantrenList.find(p => p.namaPesantren.toLowerCase() === list[idx].namaPesantren.toLowerCase());
      
      if (!exists) {
        pesantrenList.push({
          id: `PS-DMK-${String(pesantrenList.length + 1).padStart(3, '0')}`,
          namaPesantren: list[idx].namaPesantren,
          nsp: '-',
          pengasuh: list[idx].namaPengasuh,
          kecamatan: list[idx].kecamatan,
          alamat: list[idx].alamat || '-',
          santriPutra: 0,
          santriPutri: 0,
          totalSantri: parseInt(list[idx].jumlahSantri) || 0,
          statusSambang: status,
          tanggalSambang: tanggalKunjungan || list[idx].tanggalRencana || '-',
          fasilitator: fasilitator || 'Tim Satgas RMI NU',
          skorIndeks: 0,
          prioritasPilar: list[idx].fokusPrioritas || 'Semua 5 Pilar'
        });
        writeJsonFile(PESANTREN_FILE, pesantrenList);
      } else {
        exists.statusSambang = status;
        if (tanggalKunjungan) exists.tanggalSambang = tanggalKunjungan;
        if (fasilitator) exists.fasilitator = fasilitator;
        writeJsonFile(PESANTREN_FILE, pesantrenList);
      }
    }

    res.json({ success: true, message: 'Permohonan berhasil diperbarui.', data: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Daftar Komitmen 90 Hari
app.get('/api/admin/komitmen', requireAuthApi, (req, res) => {
  const list = readJsonFile(KOMITMEN_FILE);
  res.json({ success: true, count: list.length, data: list });
});

// 8. Update Milestone Komitmen 90 Hari
app.patch('/api/admin/komitmen/:id', requireAuthApi, requireRole('superadmin', 'fasilitator'), (req, res) => {
  try {
    const list = readJsonFile(KOMITMEN_FILE);
    const idx = list.findIndex(k => k.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Data komitmen tidak ditemukan.' });
    }

    const updates = { ...req.body };
    ['milestoneBulan1', 'milestoneBulan2', 'milestoneBulan3'].forEach(mKey => {
      if (updates[mKey]) {
        list[idx][mKey] = { ...(list[idx][mKey] || {}), ...updates[mKey] };
        delete updates[mKey];
      }
    });

    list[idx] = { ...list[idx], ...updates };
    writeJsonFile(KOMITMEN_FILE, list);

    res.json({ success: true, message: 'Milestone komitmen berhasil diperbarui.', data: list[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Ekspor Rekapitulasi Data ke CSV
app.get('/api/admin/export-csv', requireAuthApi, (req, res) => {
  try {
    const list = readJsonFile(PESANTREN_FILE);
    let csv = 'ID,Nama Pesantren,NSP,Pengasuh,Kecamatan,Total Santri,Status Sambang,Tanggal Sambang,Fasilitator,Skor Indeks,Fokus Pilar\n';

    list.forEach(p => {
      const row = [
        `"${p.id || ''}"`,
        `"${(p.namaPesantren || '').replace(/"/g, '""')}"`,
        `"${p.nsp || ''}"`,
        `"${(p.pengasuh || '').replace(/"/g, '""')}"`,
        `"${p.kecamatan || ''}"`,
        p.totalSantri || 0,
        `"${p.statusSambang || ''}"`,
        `"${p.tanggalSambang || ''}"`,
        `"${(p.fasilitator || '').replace(/"/g, '""')}"`,
        p.skorIndeks || 0,
        `"${(p.prioritasPilar || '').replace(/"/g, '""')}"`
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Rekap_Sambang_Pesantren_Demak_2026.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).send('Error generating CSV');
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'website', 'index.html'));
});

if (require.main === module && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
  =============================================================
  ✦ PESANTREN AMAN - PORTAL RESMI PUBLIK RMI NU KABUPATEN DEMAK
  ✦ Alamat Web : http://localhost:${PORT}
  ✦ Domain Ref : https://pesantrenaman.rminudemak.org
  ✦ Slogan     : Menjaga Amanah, Melindungi Santri, Memuliakan Pesantren
  =============================================================
  Server berjalan normal pada port ${PORT}. Siap menerima kunjungan.
  `);
  });
}

module.exports = app;

