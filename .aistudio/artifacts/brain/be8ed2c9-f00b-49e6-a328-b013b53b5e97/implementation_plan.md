# KetikKilat - Modern Indonesian Typing Test & Speed Trainer

Website latihan mengetik dan tes kecepatan mengetik Bahasa Indonesia modern dengan mekanisme rolling line khas 10FastFingers, kalkulasi akurat live WPM/keakuratan, visualisasi grafik performa interaktif, engine tema adaptif, efek suara keyboard mekanikal Web Audio API, serta pelacak riwayat sesi lokal.

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan hasil klarifikasi Fase 1 telah diintegrasikan:
> - **Branding**: `KetikKilat` — desain modern, gesit, dan fokus produktivitas.
> - **Word Display**: Pola klasik 10FastFingers berupa viewport 2-baris dengan deteksi offset baris otomatis dan pergeseran vertikal halus saat berpindah baris.
> - **Audio Feedback**: Efek suara ketikan keyboard mekanikal realistis yang disintesis langsung menggunakan Web Audio API bawaan browser (zero-latency, tanpa file audio eksternal yang lambat dimuat), aktif secara default dengan tombol toggle mute dan slider volume.

- **Mode Standar & Kosakata**: Memulai pada durasi standar 60 detik dengan kosakata Bahasa Indonesia terkurasi (>600 kata dasar dan imbuhan umum), dapat beralih ke 15s, 30s, 120s, custom duration, atau Word Mode (10, 25, 50, 100 kata).
- **Grafik Interaktif**: Menggunakan visualisasi grafik garis SVG interaktif berbasis data runtun waktu asli tiap detik (time vs WPM & time vs accuracy), dilengkapi titik hover, tooltip akurat, dan integrasi palet warna tema aktif.

---

## 1. Overview & Core Concept

- **Apa yang Dibangun**: Platform web latihan dan tes kecepatan mengetik Bahasa Indonesia dengan pengalaman mengetik instan tanpa distraksi, kata-kata bergulir dua baris, feedback warna karakter langsung (benar/salah), kalkulasi WPM standar industri ($\text{WPM} = \frac{\text{Karakter Benar}}{5 \times \text{Menit}}$), ringkasan metrik mendalam pasca tes, dan riwayat perkembangan tersimpan lokal.
- **Target Pengguna**: Siswa, mahasiswa, pekerja kantor, programmer, serta enthusiast pengetikan yang ingin menguji dan meningkatkan akurasi serta kecepatan mengetik 10 jari dalam Bahasa Indonesia.
- **Nilai Tambah**: Pengalaman responsif tanpa lag, desain visual modern tanpa elemen AI generic murahan (anti-slop), sistem tema CSS variables dengan color picker kustom, audio ketikan mekanikal yang memuaskan, dan grafik performa nyata tanpa data manipulasi.

---

## 2. User Experience & Visual Design

### A. Alur Pengguna Utama (Key User Flows)
1. **Lobi & Mulai Cepat**: Halaman terbuka dengan area kata 2-baris terfokus. Begitu pengguna menekan tombol karakter pertama, timer otomatis berjalan, live WPM mulai dihitung, dan audio klik mekanikal berbunyi.
2. **Sesi Mengetik (Active Test)**:
   - Kata aktif disorot dengan latar aksen halus.
   - Karakter yang sedang diketik diperiksa secara real-time: karakter benar berwarna tajam, karakter salah berwarna kontras merah/oranye.
   - Menekan `Space` menyelesaikan kata aktif dan beralih ke kata berikutnya.
   - Jika pengguna berada di akhir baris, kata-kata bergeser ke atas secara halus sehingga baris berikutnya naik menjadi baris aktif (replikasi presisi mekanisme 10FastFingers).
   - Live baris statistik menunjukkan WPM, Akurasi, dan Sisa Waktu dengan angka tabular tanpa loncatan layout.
3. **Hasil & Evaluasi**:
   - Begitu waktu habis atau kata terakhir diselesaikan, input dinonaktifkan seketika.
   - Layar hasil menampilkan Skor Utama (WPM Besar), Akurasi %, Karakter Benar/Salah, Kata Benar/Salah, dan Rekor Terbaik (Personal Best).
   - Grafik garis performa interaktif memvisualisasikan ritme WPM per detik selama durasi tes.
   - Tombol aksi cepat: *Coba Lagi (`Tab` + `Enter` atau tombol restart)*, *Ganti Kata*, *Salin Hasil*, dan *Buka Riwayat*.
4. **Kustomisasi Tema & Pengaturan**:
   - Tombol tema di header membuka panel preset (Dark, Light, Midnight, OLED Black, Sepia, Kustom).
   - Pengaturan kustom mendukung color picker untuk Accent, Background, Panel, Text, Correct, Error, Caret, dan Garis Grafik.
   - Pengaturan font, ukuran teks, mode kesulitan (Mudah, Normal, Mahir), dan volume suara.

### B. Identitas Visual & Desain Bersih (Anti-Slop Restraint)
- **Palette & Contrast**:
  - Base Dark: Background `#0A0A0C` / `#0F1117`, Surface `#161922`, Border `#252A37`.
  - Accent: Electric Cyan `#00F0FF` atau Emerald `#10B981` (dapat diubah dinamis lewat CSS variables `--bg-app`, `--bg-surface`, `--color-accent`, `--color-correct`, `--color-error`, `--color-caret`).
  - Text: Teks utama kontras tinggi, teks kata belum diketik abu-abu netral teredam (`opacity: 0.5`).
- **Tipografi**:
  - Display/Judul: Sans-serif modern dan bersih (`Plus Jakarta Sans` / modern system neo-grotesque).
  - Teks Mengetik & Statistik: Font monospace / tabular yang nyaman dibaca (`JetBrains Mono`, `IBM Plex Mono`, `font-mono tabular-nums`) untuk menghilangkan jitter saat angka berubah.
- **Disiplin Desain**:
  - Tanpa badge pil bersarang berlebihan (*Zero-Pill discipline*).
  - Tanpa teks hiasan robotik `// 01_EXECUTION` atau status palsu.
  - Border hairline 1px tipis, radius konsisten (8px - 12px), elevasi tunggal bersih.

---

## 3. Key Product Decisions & Trade-Offs

- **Mekanisme Word Scrolling 2-Baris (10FastFingers Classic)**:
  - *Pendekatan Terpilih*: Wadah dengan tinggi tetap 2 baris teks kata (`overflow-hidden`). Deteksi posisi `offsetTop` pada kata aktif; ketika kata aktif berpindah ke baris kedua dan mencapai titik tertentu, kalkulasi transform `translateY` menggeser container secara instan/halus per baris.
  - *Alasan*: Pola ini terbukti paling ergonomis bagi pengetik cepat karena mata tetap berada di zona pandang horizontal yang konsisten tanpa scrolling halaman browser.
- **Audio Synthesis Menggunakan Web Audio API**:
  - *Pendekatan Terpilih*: Generator sintesis suara `AudioContext` lokal (kombinasi low-pass filtered click pulse + resonant metallic ping).
  - *Alasan*: Menghindari masalah loading file `.mp3` eksternal yang rentan gagal di sandbox atau menimbulkan latency jaringan; respon suara seketika di bawah 5ms per keystroke.
- **Pengukuran Data Grafik Aktual Per Detik**:
  - *Pendekatan Terpilih*: Interval snapshot 1000ms mencatat `timestamp`, `currentWpm`, dan `accuracy` secara berkala selama tes berjalan.
  - *Alasan*: Menjamin bahwa grafik mencerminkan kurva akselerasi dan kelelahan pengguna yang sebenarnya, bukan kurva acak buatan.
- **Penyimpanan Lokal (localStorage) Tanpa Server Auth**:
  - *Pendekatan Terpilih*: Riwayat tersimpan di `localStorage` dengan penanganan hydration safe (`useEffect` / client-side only read).
  - *Alasan*: Privasi penuh, kecepatan maksimal, bekerja offline (PWA-ready), dan tanpa hambatan login.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KetikKilat Application                          │
├────────────────────────────────────────────────────────────────────────┤
│  Top Bar: Brand Wordmark │ Mode & Duration Selectors │ Theme & Settings│
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Live Header: Timer (60s) │ Live WPM │ Live Accuracy │ Restart    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 2-Line Rolling Word Box (10FastFingers Engine)                   │  │
│  │ [selamat] [pagi] [dunia] [dan] [semua] [orang] [yang] [sedang]   │  │
│  │  Active: [kata...]  (Correct: green, Error: red, Caret: blinking)│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Hidden / Synchronized Active Keyboard Input (<input>)            │  │
│  │ Handles keystrokes, spaces, backspaces, and mobile touch tap     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Results Modal / Screen (When Timer Hits 0 or Target Words Done)  │  │
│  │ ├─ Key Metrics: WPM Hero, Net WPM, Accuracy, Keystrokes, Words   │  │
│  │ ├─ Interactive SVG Performance Timeline Chart (WPM & Acc vs Sec) │  │
│  │ └─ Action Bar: [Coba Lagi] [Salin Ringkasan] [Lihat Riwayat]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Settings Drawer & Custom Theme Editor                            │  │
│  │ ├─ Theme Presets & Hex Color Pickers (CSS Vars sync)             │  │
│  │ ├─ Mechanical Sound Synthesizer Controls (Volume & Mute)         │  │
│  │ └─ Vocabulary Difficulty (Mudah, Normal, Mahir)                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Komponen & Modul Kunci:
1. `src/data/words-id.ts`: Bank kata Bahasa Indonesia (>600 kata) terbagi berdasarkan tingkat kesulitan (Umum, Menengah, Kompleks).
2. `src/lib/sound.ts`: Mesin sintesis suara Web Audio API (mechanical click, spacebar thud, error beep).
3. `src/lib/typing-engine.ts`: Helper kalkulasi WPM bersih, WPM kotor, akurasi, dan pemotongan kata.
4. `src/types/index.ts`: Definisi tipe data sesi tes, tema, data titik grafik, dan riwayat.
5. `src/components/TypingArea.tsx`: Komponen inti 2 baris dengan pergeseran otomatis dan input sinkron.
6. `src/components/PerformanceChart.tsx`: Komponen grafik garis SVG interaktif dengan tooltip dan grid responsif.
7. `src/components/ResultsView.tsx`: Tampilan hasil tes terperinci dengan rekor personal dan perbandingan sesi.
8. `src/components/ThemeManager.tsx`: Engine tema dinamis pengubah CSS custom properties secara instan.
9. `src/components/HistoryModal.tsx`: Riwayat sesi lengkap dan statistik rata-rata pengguna.
10. `src/components/SettingsModal.tsx`: Pengaturan durasi, mode, suara, font, dan kustomisasi warna.

---

## 5. Rencana Pengujian & Kriteria Selesai (Verification Checklist)

- [ ] Pengetikan langsung aktif saat membuka halaman dan menekan tombol keyboard.
- [ ] Kata bergeser mulus ke atas saat pengguna mencapai akhir baris 1 menuju baris 2.
- [ ] Spasi menyelesaikan kata; Backspace mengoreksi karakter aktif.
- [ ] Live WPM dan akurasi tidak pernah menghasilkan `NaN` atau `Infinity`.
- [ ] Timer 15s, 30s, 60s, 120s dan word mode berhenti tepat pada waktunya.
- [ ] Titik-titik grafik direkam dari interval waktu nyata selama sesi berlangsung.
- [ ] Perubahan tema (preset maupun kustom color picker) langsung diterapkan ke seluruh elemen antarmuka dan tersimpan di `localStorage`.
- [ ] Efek suara keyboard mekanikal bekerja tanpa delay dan dapat di-mute kapan saja.
- [ ] Riwayat tes tersimpan dan dapat dilihat kembali di panel riwayat.
- [ ] Aplikasi lulus `compile_applet` tanpa error TypeScript maupun layout glitch.
