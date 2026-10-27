# Rencana Implementasi Pembaruan KetikKilat

Rencana ini mencakup penyempurnaan pengalaman mengetik, pembersihan visual dari efek glow berlebih (*anti-AI-slop*), serta penambahan fitur komunitas real-time (Pengguna Online & Papan Peringkat / Leaderboard persisten berbasis username) tanpa mengubah fungsi inti yang sudah berjalan.

---

## 1. Pembersihan Visual & Penghapusan Efek Glow (Anti-AI-Slop)
- **Penghapusan Speed Aura & Box-Shadow Glow (`components/TypingArea.tsx` & `app/globals.css`)**:
  - Menghapus fungsi `getSpeedAuraClass()` beserta animasi glow `.animate-speed-blaze` dan `.animate-lightning-surge` pada kotak kata.
  - Menghapus `boxShadow` glow pada kursor/caret (`0 0 6px var(--color-caret)`) dan partikel percikan berlebih agar kotak teks tampil bersih, tajam, dan fokus pada keterbacaan huruf.
  - Menggunakan perubahan warna border tipis yang tegas (1px/2px solid) tanpa pendaran cahaya kabur saat mengetik cepat.

---

## 2. Pengguliran Baris Kata Instan (Immediate Line Scroll)
- **Naik Otomatis Begitu Baris Pertama Selesai (`components/TypingArea.tsx`)**:
  - Mengubah logika `useLayoutEffect` pengguliran baris pada `wordsWrapperRef`: sebelumnya menunggu kata berpindah ke baris ke-3 (`lineDelta > 65`), kini langsung menggeser `translateY(-${lineDelta}px)` tepat saat `currentWordIndex` berpindah ke kata pertama di baris ke-2 (`lineDelta > 20`).
  - Hasilnya: baris aktif yang sedang diketik **selalu berada di baris paling atas** kotak teks, sehingga mata pengguna tidak perlu berpindah baris dan kata-kata di baris bawah langsung naik seketika setelah baris pertama selesai.

---

## 3. Auto-Focus Instan Saat Menekan Huruf Apa Saja (Global Key Capture)
- **Ketik Langsung Tanpa Perlu Klik Kotak Input (`components/TypingArea.tsx` & `app/page.tsx`)**:
  - Menambahkan pendengar `keydown` global pada `window` ketika status tes `idle` atau `running` dan tidak ada modal/input lain (seperti kolom input username) yang sedang aktif (`document.activeElement`).
  - Saat pengguna menekan tombol huruf/karakter tunggal (`e.key.length === 1` tanpa `ctrlKey`/`metaKey`/`altKey`), aplikasi otomatis memfokuskan `inputRef.current`, memasukkan huruf pertama tersebut ke state input, dan langsung memulai sesi ketik tanpa kehilangan huruf pertama yang ditekan.

---

## 4. Fitur Tambahan Maksimal: Pace Car (Kursor Bayangan) & Mode Fokus Otomatis
- **Pace Car / Kursor Bayangan Target (`components/TypingArea.tsx`)**:
  - Menampilkan penanda bayangan (*ghost caret/highlight* tipis) yang bergerak secara proporsional di sepanjang kata sesuai kecepatan target (bisa dipilih: Rekor Terbaik Pribadi, Pemuncak Leaderboard, atau Target WPM tertentu).
  - Membantu pengguna merasakan ritme kecepatan secara visual dan langsung tahu apakah ketikan mereka sedang unggul atau tertinggal dari target.
- **Mode Fokus Otomatis Saat Mengetik Cepat (`app/page.tsx` & `components/Navbar.tsx`)**:
  - Saat sesi sedang berjalan (`testState === 'running'`), elemen navigasi atas, pilihan mode, dan konten bawah otomatis meredup halus (`opacity-30 hover:opacity-100 transition-opacity`) agar mata pengguna 100% tertuju pada kotak kata. Begitu kursor mouse digerakkan atau tes selesai, tampilan kembali normal seketika.

---

## 5. Sistem Pengguna Online & Leaderboard Persisten (Cukup Username, Tanpa Login)
- **Penyimpanan Server Persisten (`/app/api/leaderboard/route.ts`, `/app/api/presence/route.ts`, & `lib/serverStore.ts`)**:
  - Menggunakan penyimpanan file JSON persisten di sisi server (lengkap dengan *atomic write* dan *in-memory cache*) sehingga data papan peringkat **tidak ter-reset saat halaman di-refresh** maupun saat dibuka dari tab/perangkat lain, serta langsung berjalan tanpa konfigurasi eksternal.
- **Identitas Ringan Cukup Username (`components/OnlineLeaderboardPanel.tsx`)**:
  - Pengguna cukup memasukkan `username` (disimpan juga di `localStorage` agar tidak perlu mengetik ulang saat refresh) dan dapat langsung menggantinya kapan saja.
- **Indikator Pengguna Online & Status Mengetik Real-Time**:
  - Sistem *heartbeat* ringan setiap beberapa detik yang mencatat daftar pengguna yang sedang aktif membuka KetikKilat, menampilkan status apakah mereka sedang **Siap / Melihat** atau **Sedang Mengetik (Live WPM & Durasi)**.
- **Aturan Leaderboard & Validasi Anti-Cheat**:
  - **Satu Rekor Terbaik per Username per Durasi**: Menyimpan skor tertinggi (`wpm`) untuk masing-masing username pada setiap kategori durasi (`30 Detik`, `60 Detik`, `120 Detik`). Jika pengguna yang sama mencetak WPM lebih tinggi, skornya diperbarui otomatis.
  - **Filter Berdasarkan Durasi**: Tab filter cepat di Papan Peringkat untuk melihat Top Skor mode `60 Detik`, `30 Detik`, dan `120 Detik`.
  - **Syarat Akurasi & Anti-Cheat**: Hanya menerima skor dengan **Akurasi minimal 85%**, memverifikasi kecocokan jumlah karakter benar dengan durasi & WPM di server, serta menolak skor tidak wajar (> 220 WPM atau rasio ketikan manipulatif).
