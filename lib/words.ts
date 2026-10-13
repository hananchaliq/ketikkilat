import { Difficulty } from '@/types/typing';

export const EASY_WORDS_ID = [
  'dan', 'itu', 'yang', 'ada', 'dari', 'untuk', 'pada', 'ke', 'dengan', 'saya',
  'kita', 'bisa', 'mau', 'lagi', 'satu', 'dua', 'tiga', 'hari', 'ini', 'kamu',
  'mereka', 'kalau', 'tapi', 'sudah', 'belum', 'sangat', 'baik', 'kata', 'suka',
  'tahu', 'rumah', 'air', 'mata', 'makan', 'waktu', 'orang', 'jalan', 'buku',
  'uang', 'baru', 'lama', 'besar', 'kecil', 'putih', 'hitam', 'merah', 'pagi',
  'siang', 'malam', 'kota', 'desa', 'laut', 'gunung', 'pohon', 'bunga', 'daun',
  'anak', 'ibu', 'ayah', 'teman', 'pintu', 'jendela', 'meja', 'kursi', 'lampu',
  'tidur', 'bangun', 'pergi', 'datang', 'naik', 'turun', 'masuk', 'keluar',
  'ambil', 'kasih', 'bawa', 'lihat', 'dengar', 'bicara', 'tulis', 'baca', 'main',
  'kerja', 'belajar', 'ajar', 'cepat', 'lambat', 'jauh', 'dekat', 'tinggi',
  'rendah', 'banyak', 'sedikit', 'panas', 'dingin', 'sejuk', 'kering', 'basah',
  'kaya', 'miskin', 'senang', 'sedih', 'marah', 'takut', 'berani', 'hidup',
  'mati', 'sehat', 'sakit', 'kuat', 'lemah', 'benar', 'salah', 'mudah', 'sulit',
  'manis', 'pahit', 'asin', 'pedas', 'enak', 'lapar', 'haus', 'kenyang', 'lelah',
  'baju', 'celana', 'sepatu', 'topi', 'kaca', 'jam', 'tas', 'pena', 'kertas',
  'kucing', 'anjing', 'burung', 'ikan', 'ayam', 'sapi', 'kuda', 'langit', 'bumi',
  'bulan', 'bintang', 'hujan', 'angin', 'awan', 'tanah', 'batu', 'pasir', 'api',
  'sungai', 'danau', 'pulau', 'hutan', 'kebun', 'sawah', 'pasar', 'toko', 'sekolah',
  'taman', 'kamar', 'dapur', 'atap', 'lantai', 'dinding', 'pagar', 'mobil', 'motor',
  'sepeda', 'kapal', 'pesawat', 'stasiun', 'bandara', 'pelabuhan', 'halte', 'jalan',
  'garam', 'gula', 'kopi', 'teh', 'susu', 'roti', 'nasi', 'sayur', 'buah', 'daging',
  'minum', 'cuci', 'sapu', 'beli', 'jual', 'bayar', 'tukar', 'pinjam', 'hitung',
  'tunggu', 'cari', 'temu', 'tutup', 'buka', 'antar', 'jemput', 'kirim', 'terima',
  'ingat', 'lupa', 'pikir', 'rasa', 'harap', 'percaya', 'yakin', 'cinta', 'sayang',
  'benci', 'rindu', 'malu', 'heran', 'senyum', 'tawa', 'tangis', 'teriak', 'bisik'
];

export const NORMAL_WORDS_ID = [
  'sekarang', 'kemudian', 'sehingga', 'mengapa', 'bagaimana', 'karena', 'walaupun',
  'meskipun', 'supaya', 'seperti', 'tentang', 'terhadap', 'menurut', 'antara',
  'melalui', 'selama', 'setelah', 'sebelum', 'sampai', 'hingga', 'bersama',
  'sendiri', 'kembali', 'kemarin', 'besok', 'lusa', 'minggu', 'bulan', 'tahun',
  'musim', 'zaman', 'kehidupan', 'keadaan', 'masalah', 'kegiatan', 'pekerjaan',
  'keluarga', 'hubungan', 'masyarakat', 'pemerintah', 'pendidikan', 'kesehatan',
  'lingkungan', 'teknologi', 'informasi', 'komunikasi', 'ekonomi', 'industri',
  'perusahaan', 'organisasi', 'kebijakan', 'keputusan', 'tindakan', 'perubahan',
  'perkembangan', 'kemajuan', 'kesempatan', 'kemampuan', 'keberhasilan', 'kegagalan',
  'kesalahan', 'pengalaman', 'pengetahuan', 'keterampilan', 'pendapat', 'pandangan',
  'pemikiran', 'perasaan', 'keinginan', 'kebutuhan', 'tujuan', 'rencana', 'harapan',
  'kenyataan', 'kejadian', 'peristiwa', 'situasi', 'kondisi', 'posisi', 'tempat',
  'daerah', 'wilayah', 'bagian', 'tingkat', 'jumlah', 'kualitas', 'harga', 'nilai',
  'makna', 'alasan', 'akibat', 'pengaruh', 'manfaat', 'keuntungan', 'kerugian',
  'menggunakan', 'membuat', 'melakukan', 'melihat', 'mendengar', 'mengatakan',
  'memberikan', 'menerima', 'membawa', 'mengambil', 'menemukan', 'mencari',
  'mengetahui', 'memahami', 'mempelajari', 'mengajarkan', 'menjelaskan', 'menunjukkan',
  'membantu', 'mendukung', 'mengembangkan', 'membangun', 'menciptakan', 'menghasilkan',
  'meningkatkan', 'mengurangi', 'menjaga', 'melindungi', 'memperbaiki', 'mengubah',
  'menyelesaikan', 'menghadapi', 'menghindari', 'mengikuti', 'memimpin', 'mengatur',
  'mengelola', 'menyediakan', 'membutuhkan', 'menginginkan', 'merasakan', 'memikirkan',
  'mempertimbangkan', 'memutuskan', 'merencanakan', 'berbicara', 'berjalan', 'berlari',
  'berkumpul', 'bertemu', 'berpisah', 'berkembang', 'berubah', 'berhasil', 'berusaha',
  'bekerja', 'belajar', 'berpikir', 'berharap', 'bermain', 'beristirahat', 'berangkat',
  'berlangsung', 'bertambah', 'berkurang', 'berbeda', 'bersama', 'terbuka', 'tertutup',
  'terlihat', 'terdengar', 'terjadi', 'termasuk', 'terdapat', 'terkenal', 'terbaik',
  'terbesar', 'terkecil', 'tertinggi', 'terendah', 'tercepat', 'terlambat', 'terakhir'
];

export const ADVANCED_WORDS_ID = [
  'mengimplementasikan', 'karakteristik', 'produktivitas', 'keanekaragaman',
  'pertanggungjawaban', 'transformatif', 'komprehensif', 'diferensiasi',
  'fleksibilitas', 'kesinambungan', 'keefektivan', 'akuntabilitas',
  'profesionalisme', 'kredibilitas', 'kompatibilitas', 'aksesibilitas',
  'keberlanjutan', 'keberagaman', 'kesejahteraan', 'kemakmuran',
  'kebijaksanaan', 'kebanggaan', 'kehormatan', 'kejujuran', 'keadilan',
  'kedisiplinan', 'kesabaran', 'keikhlasan', 'kebersamaan', 'kekeluargaan',
  'persaudaraan', 'persahabatan', 'perdamaian', 'persatuan', 'kesatuan',
  'kemerdekaan', 'kedaulatan', 'kebangsaan', 'kemanusiaan', 'kebudayaan',
  'peradaban', 'perkembangan', 'pertumbuhan', 'peningkatan', 'pengurangan',
  'penyesuaian', 'penyempurnaan', 'pembaruan', 'pembangunan', 'pembentukan',
  'pemberdayaan', 'pemeliharaan', 'penyelamatan', 'perlindungan', 'pengawasan',
  'pemeriksaan', 'penyelidikan', 'penelitian', 'pengembangan', 'pengelolaan',
  'pengaturan', 'pengendalian', 'pengoperasian', 'pelaksanaan', 'penerapan',
  'pemanfaatan', 'pendayagunaan', 'pendistribusian', 'pengalokasian', 'pembiayaan',
  'perencanaan', 'pengorganisasian', 'pengarahan', 'pengkoordinasian', 'pengevaluasian',
  'pertimbangan', 'pengambilan', 'penyusunan', 'perumusan', 'penetapan',
  'kesepakatan', 'perjanjian', 'kerjasama', 'kompromi', 'konsensus',
  'keselarasan', 'keseimbangan', 'keserasian', 'keharmonisan', 'keterpaduan',
  'keterikatan', 'ketergantungan', 'kemandirian', 'kebebasan', 'keterbukaan',
  'kejernihan', 'ketegasan', 'ketepatan', 'kecepatan', 'kemudahan',
  'kelancaran', 'keluwesan', 'keringanan', 'kenyamanan', 'keamanan',
  'keselamatan', 'kesehatan', 'kesegaran', 'kebugaran', 'ketahanan'
];

export function getWordBankByDifficulty(difficulty: Difficulty): string[] {
  switch (difficulty) {
    case 'easy':
      return EASY_WORDS_ID;
    case 'advanced':
      return [...NORMAL_WORDS_ID, ...ADVANCED_WORDS_ID];
    case 'normal':
    default:
      return [...EASY_WORDS_ID, ...NORMAL_WORDS_ID];
  }
}

export function generateWordList(difficulty: Difficulty, count: number = 250): string[] {
  const bank = getWordBankByDifficulty(difficulty);
  const result: string[] = [];
  let lastWord = '';

  for (let i = 0; i < count; i++) {
    let word = bank[Math.floor(Math.random() * bank.length)];
    // Prevent immediate consecutive duplicate words
    let attempts = 0;
    while (word === lastWord && attempts < 5) {
      word = bank[Math.floor(Math.random() * bank.length)];
      attempts++;
    }
    result.push(word);
    lastWord = word;
  }

  return result;
}
