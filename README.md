# Dimsum Denaya 🥟

Website resmi Dimsum Denaya — Dimsum Premium Keluarga Indonesia.
Static site + Supabase backend, hosted di GitHub Pages.

## Tech Stack

- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Backend**: Supabase (PostgreSQL + REST API)
- **Hosting**: GitHub Pages
- **Domain**: dimsumdenaya.my.id

## Struktur Proyek

```
dimsum-denaya/
├── index.html              # Landing page utama
├── admin/
│   └── index.html          # Admin panel (login via Supabase Auth)
├── assets/
│   ├── css/
│   │   └── style.css       # Custom styles
│   ├── js/
│   │   ├── main.js         # Main JavaScript (interactive)
│   │   └── supabase.js     # Supabase client + API functions
│   └── images/
│       ├── icons/           # Favicon, logo
│       ├── menu/            # Gambar menu (SVG)
│       ├── hero/            # Hero background
│       ├── gallery/         # Galeri foto
│       └── testimoni/       # Avatar testimoni
├── data/
│   ├── menu.json           # Fallback data menu
│   ├── testimoni.json      # Fallback data testimoni
│   └── galeri.json         # Fallback data galeri
├── sql/
│   └── schema.sql          # Supabase database schema
├── sitemap.xml
├── robots.txt
└── README.md
```

## Cara Setup

### 1. Setup Supabase

1. Buka **supabase.com** → **New project**
2. Nama project: `dimsum-denaya`
3. Password database simpan baik-baik
4. Tunggu provisioning ~2 menit
5. Ke **SQL Editor** → paste isi `sql/schema.sql` → **Run**
6. Ke **Project Settings** → **API** → salin:
   - `Project URL`
   - `anon public key`

### 2. Konfigurasi Supabase di Website

Edit `assets/js/supabase.js`:

```js
const DD_SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const DD_SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

Ganti dengan URL dan anon key dari project Supabase kamu.

### 3. Setup Admin Panel

1. Di Supabase dashboard → **Authentication** → **Providers** → **Email**
   - Pastikan email auth aktif
2. Ke **Authentication** → **Add User**
   - Buat akun admin (email + password)
3. Buka `https://dimsumdenaya.my.id/admin/` → login

### 4. Deploy ke GitHub Pages

```bash
# Init git
git init
git add .
git commit -m "Initial commit: Dimsum Denaya"

# Buat repo di GitHub dulu, lalu:
git remote add origin https://github.com/popolalala89-cell/dimsum-denaya.git
git push -u origin main
```

Di GitHub:
- Settings → Pages → Branch: `main` → `/ (root)` → Save
- Custom domain: `dimsumdenaya.my.id`

### 5. Setup Domain

Di SumoPod dashboard → DNS Management:

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | popolalala89-cell.github.io |

Di GitHub Settings → Pages:
- Custom domain: `dimsumdenaya.my.id`
- Centang **Enforce HTTPS**

## Fitur

- ✅ Landing page responsif
- ✅ Menu favorit + filter kategori
- ✅ Testimoni carousel
- ✅ Galeri foto
- ✅ Integrasi WhatsApp
- ✅ Admin panel (CRUD menu, testimoni, galeri)
- ✅ Manajemen pesanan
- ✅ Dark mode support (via prefers-color-scheme)
- ✅ Supabase backend (fallback ke JSON)
- ✅ SEO optimized
- ✅ Mobile friendly

## Lisensi

Hak cipta Dimsum Denaya.
