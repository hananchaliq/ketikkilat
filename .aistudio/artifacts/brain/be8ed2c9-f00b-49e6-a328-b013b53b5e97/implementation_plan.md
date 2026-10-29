# Rencana Pembaruan KetikKilat: Inline Typing, Multi-Font Harmonis, Responsif Lintas Perangkat & Optimasi PageSpeed

## 1. Gambaran Umum Solusi
Pembaruan ini mengubah pengalaman mengetik di **KetikKilat** menjadi sistem ketik langsung (*direct inline typing* ala Monkeytype) di dalam container kata tanpa kotak teks terpisah di bawahnya, menyelaraskan sistem tiga keluarga font yang saling mendukung, merombak tata letak agar lega dan responsif di layar HP/Tablet/Laptop/PC, serta mengoptimalkan performa *rendering* untuk mendongkrak skor PageSpeed Mobile tanpa mengurangi satu pun fitur yang ada.

---

## 2. Perubahan Utama yang Akan Dikerjakan

### A. Sistem Ketik Langsung (*Direct Inline Typing*) & Kursor Halus
- **Penghapusan Kotak Input Bawah**: Menghapus baris `<input>` terpisah di bagian bawah area ketik.
- **Ketik Langsung di Container Kata**:
  - Menempatkan input tersembunyi (`opacity-0` dengan ukuran font minimal `16px` agar browser HP seperti iOS Safari tidak melakukan *auto-zoom* saat disentuh) yang otomatis aktif ketika pengguna menekan huruf di keyboard fisik atau menyentuh area teks di layar HP/Tablet.
  - **Pewarnaan Huruf Real-Time**: Setiap huruf pada kata aktif akan langsung berubah warna saat diketik (hijau/kontras tinggi untuk huruf benar, merah dengan garis bawah untuk huruf salah, serta tampilan karakter berlebih/*extra overflow* jika pengguna mengetik melebihi panjang kata sebelum menekan spasi).
  - **Kursor Halus (*Smooth Caret*)**: Kursor garis vertikal yang bergerak mulus mengikuti posisi huruf yang sedang diketik di dalam container kata, dilengkapi kursor bayangan *Pace Car* yang menyesuaikan posisi secara proporsional.
- **Header Bar Area Ketik**: Memindahkan indikator **Timer Hitung Mundur**, tombol sembunyikan/tampilkan waktu, serta tombol **Ulangi (Reset)** ke bar bagian atas area ketik agar langsung terlihat jelas saat fokus pada teks.

### B. Kombinasi 3 Keluarga Font Harmonis & Tanpa *Render-Blocking*
- **Migrasi ke `next/font/google`**: Menghapus `@import` font dari `app/globals.css` yang selama ini menghambat pemuatan awal (*render-blocking CSS*) di jaringan mobile, lalu memuat font secara lokal/optimal melalui `app/layout.tsx`:
  1. **IBM Plex Mono (`--font-mono`)**: Digunakan khusus untuk teks kata yang diketik. Bentuk karakter sangat tegas, proporsi spasi nyaman di mata, dan ukuran font adaptif (`text-lg` di HP, `text-xl` di Tablet, `text-2xl` di Desktop).
  2. **Plus Jakarta Sans (`--font-sans`)**: Digunakan untuk navigasi, tombol pengaturan, modal, dan teks antarmuka.
  3. **Space Grotesk (`--font-display` dengan `tabular-nums`)**: Digunakan khusus untuk angka metrik seperti WPM, Akurasi, CPM, dan Timer agar angka tidak bergoyang saat berubah cepat setiap detik.

### C. Desain Responsif & Tata Letak Lega di HP, Tablet, dan Desktop
- **Header & Pengaturan Ringkas di HP**:
  - Mengatur ulang bar navigasi atas dan kontrol durasi/mode/kesulitan agar rapi, menggunakan *scroll* horizontal halus atau *grid* adaptif yang tidak menumpuk sempit di layar HP (`360px–430px`).
  - Memastikan seluruh tombol interaktif memiliki area sentuh nyaman (minimal `40px–44px`).
- **HUD Statistik Adaptif**:
  - Menampilkan kartu statistik (WPM, Akurasi, Kata, Waktu) dalam format ringkas 2x2 atau baris padat yang proporsional di HP sehingga area teks ketik tetap berada di paruh atas layar (*above the fold*) ketika keyboard bawaan HP muncul.
- **Visualisasi Keyboard Pintar**:
  - Menyembunyikan komponen `KeyboardVisualizer` secara otomatis pada layar HP (`hidden md:block`) agar layar tetap lega dan pengguna bisa nyaman memakai keyboard sentuh bawaan HP, namun tetap menampilkannya secara penuh di layar Tablet lanskap/Laptop/PC.
- **Riwayat & Hasil Tes Responsif**:
  - Menyesuaikan tabel riwayat dan grafik analisis agar mudah digeser dan dibaca di layar sempit tanpa merusak lebar halaman (*zero horizontal overflow*).

### D. Optimasi Performa & PageSpeed Mobile
- **Memoisasi Komponen Kata (`React.memo`)**: Memisahkan setiap kata ke dalam komponen teroptimasi sehingga saat pengguna mengetik cepat, React **hanya melakukan *re-render* pada kata yang sedang diketik**, bukan merender ulang ratusan kata sekaligus di setiap ketukan huruf (menurunkan *Total Blocking Time* & *Interaction to Next Paint*).
- **Lazy Loading Komponen Berat (`next/dynamic`)**: Memuat komponen di bawah layar atau modal (`KeyboardVisualizer`, `ResultsDashboard`, `LeaderboardModal`, `CustomTextModal`, `CertificateModal`) secara dinamis sehingga ukuran *bundle* awal JavaScript jauh lebih ringan saat halaman pertama kali dibuka.
- **Optimasi Scroll Baris Instan**: Menggunakan `requestAnimationFrame` untuk pergeseran baris kata instan begitu baris pertama selesai diketik agar bebas *layout thrashing*.
