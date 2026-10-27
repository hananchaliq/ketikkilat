<div align="center">

# KetikKilat

**Latih kecepatan mengetik. Ukur progres. Pecahkan rekor sendiri.**

Aplikasi typing test dengan fokus pada kecepatan, akurasi, dan perkembangan kemampuan mengetik.

[Repository](https://github.com/hananchaliq/ketikkilat)

</div>

---

## Tentang KetikKilat

**KetikKilat** adalah aplikasi latihan mengetik berbasis web yang membantu pengguna mengukur performa mengetik dan memahami kesalahan mereka. Hasil tes tidak berhenti di angka WPM; pengguna juga dapat melihat akurasi, meninjau kata yang salah, dan memantau perkembangan dari sesi ke sesi.

KetikKilat dikembangkan dengan identitas visual sendiri, antarmuka minimalis, dan pengalaman yang berfokus pada aktivitas mengetik.

## Fitur

- **Typing test** — latihan mengetik menggunakan kumpulan kata yang tersedia.
- **Statistik hasil** — melihat WPM, CPM, akurasi, jumlah keystroke, serta kata benar dan salah.
- **Pilihan durasi dan kumpulan kata** — menyesuaikan sesi latihan sesuai opsi yang tersedia di aplikasi.
- **Riwayat latihan** — melihat hasil dari sesi sebelumnya.
- **Grafik performa** — memantau perubahan kecepatan mengetik.
- **Personal best** — mencatat dan merayakan rekor terbaik.
- **Review kesalahan** — memeriksa kata yang salah dan berlatih kembali.
- **Salin hasil** — menyalin ringkasan hasil tes.
- **Ulangi tes** — memulai sesi baru tanpa proses yang berbelit.
- **Feedback visual dan audio** — animasi hasil, efek suara, dan confetti pada momen tertentu.

> Ketersediaan fitur dapat mengikuti versi aplikasi yang sedang digunakan.

## Teknologi

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- CSS dan komponen UI proyek

## Menjalankan Secara Lokal

### Persyaratan

- Node.js
- npm

### Instalasi

1. Clone repository:

   ```bash
   git clone https://github.com/hananchaliq/ketikkilat.git
   ```

2. Masuk ke direktori proyek:

   ```bash
   cd ketikkilat
   ```

3. Pasang dependency:

   ```bash
   npm install
   ```

4. Jalankan development server:

   ```bash
   npm run dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser.

### Perintah yang tersedia

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Perintah bergantung pada script yang tersedia di `package.json`. Jika salah satu script tidak tersedia, periksa konfigurasi proyek sebelum menjalankannya.

## Struktur Proyek

Struktur utama proyek dibagi berdasarkan tanggung jawab:

```text
ketikkilat/
├── app/          # Halaman dan konfigurasi aplikasi
├── components/   # Komponen antarmuka
├── lib/          # Utilitas dan logika pendukung
├── types/        # Definisi tipe TypeScript
├── public/       # Aset statis
└── package.json  # Dependency dan script proyek
```

Struktur aktual dapat berubah mengikuti perkembangan proyek.

## Tujuan Proyek

KetikKilat dibuat untuk menyediakan pengalaman latihan mengetik yang sederhana, informatif, dan nyaman digunakan. Fokusnya bukan sekadar mengejar angka tinggi, tetapi juga memahami akurasi dan membangun konsistensi melalui latihan.

## Kontribusi

Masukan, laporan bug, dan ide pengembangan sangat dipersilakan. Untuk perubahan besar, buat issue terlebih dahulu agar arah perubahan tetap selaras dengan tujuan proyek.

1. Fork repository.
2. Buat branch baru untuk perubahan.
3. Lakukan perubahan dan uji secara lokal.
4. Kirim pull request dengan penjelasan yang jelas.

## Lisensi

Belum ada informasi lisensi yang dicantumkan di README ini. Periksa file lisensi di repository sebelum menggunakan, mendistribusikan, atau memodifikasi proyek sesuai kebutuhan.
