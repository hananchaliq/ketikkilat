# Indikator Pengguna Online Real-Time & Animasi Angka Slide-Up (KetikKilat)

Pembaruan ini menghadirkan sinkronisasi jumlah pengguna online secara *real-time* instan tanpa perlu memuat ulang halaman (*refresh*), menghitung setiap tab atau jendela aktif secara presisi, serta menampilkan animasi angka *slide-up* dari bawah ke atas setiap kali jumlah pengguna berubah.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berikut adalah keputusan utama yang telah dikonfirmasi dari sesi tanya jawab sebelumnya:

- **Penghitungan Sesi Per Tab/Jendela Aktif**: Setiap tab atau jendela browser yang membuka KetikKilat memiliki identitas sesi tersendiri (`sessionStorage`), sehingga ketika pengguna membuka tab baru atau pengguna lain masuk/keluar, jumlah pengguna online langsung bertambah atau berkurang secara akurat.
- **Animasi Angka Slide-Up (Dari Bawah ke Atas) & Denyut Hijau**: Saat angka pengguna online berubah, angka lama bergeser ke atas dan angka baru muncul naik dari bawah ke atas (*vertical odometer slide-up*) disertai efek denyut hijau singkat pada indikator.

---

## 1. Overview & Core Concept

- **What It Does**: Memperbarui indikator **Online** di sudut kanan atas navigasi agar selalu tersinkronisasi secara *real-time* menggunakan kombinasi *Server-Sent Events (SSE)* / *fast-polling* dan *leave beacon* otomatis ketika tab ditutup, dilengkapi transisi angka *slide-up* vertikal.
- **Target Audience / Persona**: Seluruh pengguna KetikKilat yang ingin melihat aktivitas komunitas secara langsung ketika berlatih atau berlomba mengetik.
- **Key Value**: Pengalaman aplikasi yang hidup dan responsif—begitu tab kedua atau perangkat lain membuka halaman, indikator pada pengguna pertama langsung bergerak naik dari bawah ke atas secara instan tanpa perlu menekan *refresh*.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. Pengguna pertama membuka KetikKilat dan melihat indikator `1 Online` di kanan atas.
  2. Ketika pengguna kedua (atau tab baru) membuka KetikKilat, server langsung memancarkan pembaruan daftar sesi aktif.
  3. Tanpa *refresh*, angka pada layar pengguna pertama langsung bertransisi dari bawah ke atas (`1` naik menghilang ke atas, `2` muncul naik dari bawah) dengan efek *pulse* hijau halus pada titik status.
  4. Ketika salah satu tab ditutup, sinyal keluar (*beacon*) dikirim secara otomatis sehingga angka langsung turun kembali dengan animasi yang sama.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Utilitarian, bersih, dan presisi selaras dengan sistem desain KetikKilat.
  - *Color Palette & Mood*: Mempertahankan kontras tinggi pada tema Terang (`#f4f6f8` / `#ffffff`) maupun Gelap (`#0b0f17` / `#131b2e`) dengan aksen indikator hijau zamrud (`#22c55e`) untuk status koneksi aktif.
  - *Typography & Hierarchy*: Menggunakan **Space Grotesk (`--font-display` dengan `tabular-nums`)** untuk angka indikator online agar lebar karakter tetap konsisten saat beranimasi.
- **Interactive Feedback & Motion**:
  - Transisi angka *slide-up* vertikal berdurasi `220ms` (`cubic-bezier(0.22, 1, 0.36, 1)`) yang hanya menganimasikan properti kompositor (`transform` dan `opacity`).
  - Efek cincin denyut hijau singkat ketika terjadi perubahan nilai jumlah pengguna.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sinkronisasi Real-Time Gabungan (SSE Stream + Fast Heartbeat + Unload Beacon)**
  - *Chosen Approach*: Menyediakan *endpoint streaming* SSE disertai *heartbeat* cepat dan pengiriman `navigator.sendBeacon` saat tab ditutup (`pagehide` / `beforeunload`), ditambah sinkronisasi instan antar-tab di browser yang sama melalui `BroadcastChannel`.
  - *Why*: Menjamin perubahan jumlah pengguna online terlihat dalam hitungan milidetik hingga detik di semua perangkat maupun tab tanpa membebani performa mengetik.
  - *Alternatives Considered*: Polling lambat setiap 6–10 detik dengan `localStorage` ID tunggal tidak mampu mendeteksi tab baru di browser yang sama dan terasa lambat.
- **Decision 2: Identitas Sesi Per Tab (`sessionStorage`)**
  - *Chosen Approach*: Menyimpan ID sesi kehadiran di `sessionStorage` per tab (bukan `localStorage` global).
  - *Why*: Memastikan setiap tab/jendela aktif dihitung sebagai sesi online mandiri sesuai preferensi pengguna, dan langsung dihapus saat tab tersebut ditutup.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Client Tabs / Devices                           │
│                                                                         │
│  ┌──────────────────────────────┐     ┌──────────────────────────────┐  │
│  │ Navbar Online Indicator      │     │ AnimatedSlideNumber          │  │
│  │  • Titik Denyut Hijau        │────▶│  • Angka Lama: Geser ke Atas │  │
│  │  • Tooltip Sedang Mengetik   │     │  • Angka Baru: Naik dr Bawah │  │
│  └──────────────▲───────────────┘     └──────────────────────────────┘  │
│                 │                                                       │
│  ┌──────────────┴────────────────────────────────────────────────────┐  │
│  │ Real-Time Presence Manager (Per-Tab Session ID)                   │  │
│  │  • EventSource (SSE Stream) + Fast Heartbeat (2.5s)               │  │
│  │  • BroadcastChannel (Sinkronisasi Instan Antar-Tab Lokal)         │  │
│  │  • navigator.sendBeacon (Hapus Sesi Instan Saat Tab Ditutup)      │  │
│  └──────────────▲───────────────────────────────────┬────────────────┘  │
└─────────────────┼───────────────────────────────────┼───────────────────┘
                  │ Real-Time Push / Poll             │ Join / Heartbeat / Leave
┌─────────────────┴───────────────────────────────────▼───────────────────┐
│                     Server Presence Engine (Memory)                     │
│  • Menyimpan Map<sessionId, OnlineUserPresence> (TTL 10 detik)          │
│  • Event Emitter: Langsung push ke seluruh koneksi aktif saat berubah   │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `OnlineUserPresence`: Menyimpan `clientId` unik per tab, `username`, `status` (`idle` | `typing` | `completed`), `liveWpm`, `accuracy`, dan `lastSeen`.
  - `presenceListeners`: Kumpulan *subscriber* di sisi server yang langsung menerima pancaran data terbaru setiap kali ada pengguna baru bergabung, memperbarui status, atau menutup tab.
- **Interactive Component & State Mapping**:
  - Saat komponen utama dimuat, klien membuat `sessionId` per tab, mengirim sinyal *join* ke server, dan membuka koneksi *stream* / *listener* real-time.
  - Saat nilai `onlineCount` di `Navbar` berubah dari nilai sebelumnya, komponen angka memicu state transisi *slide-up* (angka sebelumnya keluar ke atas `-100%`, angka baru masuk dari bawah `+100%` menuju `0%`) serta mengaktifkan efek denyut hijau selama `600ms`.
  - Saat pengguna menutup tab (`pagehide` / `beforeunload`), klien mengirim sinyal `action: 'leave'` melalui `navigator.sendBeacon` agar server langsung menghapus sesi tersebut dan memancarkan angka terbaru ke pengguna lain.
