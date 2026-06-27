# Dimsum Denaya — Sistem Antrian & Order Digital

## 📋 Ringkasan

Membangun sistem terintegrasi untuk 2 lokasi penjualan:
1. **Rumah** → Delivery Order (butuh cek ongkir)
2. **Kebon Kembang** → Dine-in (antrian digital via QR)

---

## 🏗️ Komponen Sistem

### 1. Antrian Digital (Kebon Kembang)

**Alur:**
1. Customer datang → scan QR di counter (atau staff scan-kan via HP toko)
2. Web terbuka → otomatis dapet nomor antrian
3. Customer bisa langsung liat menu & pesan
4. Admin dashboard: liat urutan antrian real-time
5. Admin panggil → "Sudah Bayar" → "Selesai"

**Data:**
- Nomor antrian: `KK-001`, `KK-002`, ... (reset tiap hari)
- Status: `menunggu` → `dilayani` → `selesai` / `batal`
- Tercatat lokasi & tanggal

### 2. Order Menu (Via QR / Website)

**Alur:**
1. Customer liat menu di web
2. Pilih items + jumlah
3. Input nama & no HP
4. Submit → masuk ke dashboard admin
5. Untuk delivery: input alamat → hitung ongkir
6. Untuk dine-in: otomatis terikat nomor antrian

### 3. Cek Ongkir (Delivery)

**Data:**
- Alamat customer → konversi ke zona jarak
- 3 metode:
  - **Opsi A**: Pilih zona (radius 1km/3km/5km) → ongkir otomatis
  - **Opsi B**: Input manual jarak (km) → ongkir = jarak × tarif/km
  - **Opsi C**: Google Maps API (butuh API key & billing)

### 4. Status Pembayaran

- Admin yang kontrol: tombol "Sudah Bayar" di dashboard
- Metode bayar: Tunai / Transfer / QRIS
- Status order: `baru` → `dibayar` → `diproses` → `selesai`

### 5. Tampilan Antrian (Display)

- Halaman khusus buat ditampilkan di HP/TV:
  - Nomor antrian yang **sedang dilayani**
  - 3 nomor **selanjutnya**
  - Counter otomatis update setiap admin klik "panggil"

---

## 📊 Database (Supabase)

### Tabel Baru: `dd_antrian`

```
id              UUID (PK)
tanggal         DATE
nomor_antrian   TEXT (KK-001, KK-002...)
lokasi          TEXT ('rumah', 'kebon_kembang')
status          TEXT ('menunggu', 'dilayani', 'selesai', 'batal')
order_id        TEXT (link ke dd_orders)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Update Tabel: `dd_orders` (tambah kolom)

```
lokasi          TEXT ('rumah', 'kebon_kembang')
jarak_km        NUMERIC (0 = dine-in)
ongkir          INTEGER (0 = dine-in)
metode_bayar    TEXT ('tunai', 'transfer', 'qris')
nomor_antrian   TEXT (untuk dine-in)
status          TEXT ('baru', 'dibayar', 'diproses', 'selesai', 'batal')
```

---

## 📄 Halaman Web

| Halaman | URL | Fungsi |
|---------|-----|--------|
| Landing Page | `/` | Profil toko, menu, testimoni |
| Antrian | `/antrian/` | Scan QR → dapet nomor antrian |
| Order | `/antrian/order.html` | Pilih menu + submit (dine-in/delivery) |
| Display Antrian | `/antrian/display.html` | Tampilan TV/HP: siapa giliran |
| Admin Panel | `/admin/` | Dashboard: antrian, order, bayar |
| Menu QR | `/qr-menu.html` | Halaman khusus untuk QR (otomatis pilih lokasi) |

---

## 📱 User Flow Lengkap

### Skenario 1: Dine-in (Kebon Kembang)

```
Customer datang
    ↓
Scan QR di counter (atau staff bantu scan)
    ↓
Buka halaman → otomatis dapet nomor antrian (KK-042)
    ↓
Liat menu → pilih items → submit
    ↓
Admin dashboard muncul:
  ╔══════════════════════════════════╗
  ║  ANTRIAN  │  PESANAN  │  STATUS  ║
  ║  KK-042   │  Siomay 2, Hakau 1   ║
  ║  Nama: Budi                      ║
  ║  [✔ Sudah Bayar] [Selesai]      ║
  ╚══════════════════════════════════╝
    ↓
Customer bilang "sudah transfer"/kasih tunai
    ↓
Admin tap "Sudah Bayar"
    ↓
Setelah dimasakin → tap "Selesai"
```

### Skenario 2: Delivery (Rumah)

```
Customer buka web → klik "Pesan Delivery"
    ↓
Pilih menu + jumlah
    ↓
Input: Nama, No HP, Alamat
    ↓
Pilih jarak dari zona: 1km / 3km / 5km+
    ↓
Hitung ongkir otomatis → Total (menu + ongkir)
    ↓
Submit → admin dashboard muncul
    ↓
Admin cek → proses order
```

### Skenario 3: Gak bawa HP (Kebon Kembang)

```
Customer gak bawa HP
    ↓
Staff ambil HP toko → buka menu QR
    ↓
Scan QR → dapet nomor antrian
    ↓
Staff ketikin pesanan customer
    ↓
Submit → antrian & order masuk dashboard
```

---

## ⚙️ Teknis

### Stack
- Frontend: HTML + CSS + JS (static, GitHub Pages)
- Backend: Supabase (PostgreSQL + Auth)
- QR: QR code statis arah ke `/antrian/?lokasi=kebon_kembang`

### Generate Nomor Antrian
```
Hari ini: 27 Juni 2026
Lokasi: Kebon Kembang
Antrian terakhir: KK-015
Nomor baru: KK-016
```
Logika: `SELECT MAX(nomor_antrian) FROM dd_antrian WHERE tanggal = NOW() AND lokasi = 'kebon_kembang'`

### Cek Ongkir (Zona)
```
┌──────────┬──────────────┐
│  Zona    │  Ongkir      │
├──────────┼──────────────┤
│  < 1 km  │  Rp 5.000    │
│  1-3 km  │  Rp 10.000   │
│  3-5 km  │  Rp 15.000   │
│  > 5 km  │  Rp 20.000   │
└──────────┴──────────────┘
```
Atau kamu bisa tentuin sendiri tarifnya.

---

## 🔍 Yang Perlu Ditetapkan

Sebelum coding, saya perlu tau:

1. **Alamat rumah** — biar jadi titik acuan hitung ongkir
2. **Tarif ongkir** — per km atau per zona? Mau pake tabel zona kayak di atas?
3. **Nomor antrian** — format `KK-001` atau `A001` atau `1` aja?
4. **Menu untuk order** — semua menu ditampilkan atau pilih beberapa?
5. **QR code** — mau QR statis ditempel di counter? Ukuran kertas A5?
6. **Display antrian** — perlu halaman display khusus buat TV/HP? Atau cukup admin yang lihat?
7. **Jam buka** — antrian otomatis reset tiap hari jam berapa?

---

## 🎯 Prioritas V1

Kalau mau langsung jalan, V1 minimal:
1. ✅ Antrian via QR (dapet nomor + pesan)
2. ✅ Admin dashboard (lihat antrian, centang bayar, selesai)
3. ✅ Delivery order (form + ongkir berdasarkan zona)
4. ✅ Display antrian (buat HP/TV counter)

---

Gimana? Ada yang mau diubah dari planning ini? Atau langsung setujuin jawab pertanyaan di atas biar saya mulai coding? 🚀
