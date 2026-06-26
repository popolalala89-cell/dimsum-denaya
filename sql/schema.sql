-- ============================================
-- Dimsum Denaya — Supabase Schema
-- ============================================

-- 1. TABLE: menu
CREATE TABLE IF NOT EXISTS menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  gambar TEXT,
  badge TEXT DEFAULT '',
  kategori TEXT DEFAULT 'dimsum',
  deskripsi TEXT DEFAULT '',
  tersedia BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE: testimoni
CREATE TABLE IF NOT EXISTS testimoni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  teks TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: galeri
CREATE TABLE IF NOT EXISTS galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT DEFAULT '',
  kategori TEXT DEFAULT 'produk',
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: config
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: orders (pesanan pelanggan via form)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  items TEXT DEFAULT '', -- JSON string of ordered items
  total INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimoni ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read access (anon)
CREATE POLICY "Public read menu" ON menu FOR SELECT USING (true);
CREATE POLICY "Public read testimoni" ON testimoni FOR SELECT USING (true);
CREATE POLICY "Public read galeri" ON galeri FOR SELECT USING (true);
CREATE POLICY "Public read config" ON config FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);

-- Authenticated admin write access
CREATE POLICY "Admin write menu" ON menu FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write testimoni" ON testimoni FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write galeri" ON galeri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write config" ON config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- Trigger: auto update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_updated_at
  BEFORE UPDATE ON menu FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_menu_kategori ON menu(kategori);
CREATE INDEX IF NOT EXISTS idx_menu_tersedia ON menu(tersedia);
CREATE INDEX IF NOT EXISTS idx_galeri_kategori ON galeri(kategori);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- ============================================
-- Seed Data
-- ============================================
INSERT INTO config (key, value) VALUES
  ('nomor_wa', '6281234567890'),
  ('pesan_default', 'Halo Dimsum Denaya, saya mau order dong'),
  ('jam_operasional', 'Senin - Minggu, 08.00 - 21.00'),
  ('alamat', 'Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota 12345'),
  ('link_google_maps', 'https://maps.app.goo.gl/example'),
  ('instagram', 'https://instagram.com/dimsumdenaya'),
  ('tiktok', 'https://tiktok.com/@dimsumdenaya'),
  ('nama_toko', 'Dimsum Denaya'),
  ('tagline', 'Dimsum Premium Keluarga Indonesia'),
  ('deskripsi_singkat', 'Nikmati dimsum ayam premium dengan bahan pilihan, fresh setiap hari'),
  ('tahun', '2026')
ON CONFLICT (key) DO NOTHING;

INSERT INTO menu (menu_id, nama, harga, gambar, badge, kategori) VALUES
  ('siomay-ayam', 'Siomay Ayam Premium', 2000, 'assets/images/menu/siomay-ayam.svg', 'Best Seller', 'dimsum'),
  ('hakau-udang', 'Hakau Udang', 2500, 'assets/images/menu/hakau-udang.svg', 'Favorit', 'dimsum'),
  ('dimsum-mentai', 'Dimsum Mentai', 3000, 'assets/images/menu/dimsum-mentai.svg', 'Premium', 'dimsum'),
  ('ceker-ayam', 'Ceker Ayam', 1500, 'assets/images/menu/ceker-ayam.svg', '', 'dimsum'),
  ('lumpia-udang', 'Lumpia Udang', 2500, 'assets/images/menu/lumpia-udang.svg', 'Rekomendasi', 'lumpia')
ON CONFLICT (menu_id) DO NOTHING;

INSERT INTO testimoni (nama, avatar, rating, teks) VALUES
  ('Ibu Rina', 'assets/images/testimoni/1.svg', 5, 'Dimsumnya lembut banget. Anak-anak suka banget, udah pesen berkali-kali. Recomended!'),
  ('Bapak Andi', 'assets/images/testimoni/2.svg', 4, 'Rasa enak, pengiriman cepat, packing rapi. Langsung jadi langganan deh.'),
  ('Mbak Sari', 'assets/images/testimoni/3.svg', 5, 'Dimsumnya fresh, bumbunya pas. Siomay ayamnya favorit saya. Murah mer mer.'),
  ('Keluarga Wijaya', 'assets/images/testimoni/4.svg', 5, 'Enak, murah, recommended banget buat frozen stock di rumah.'),
  ('Mas Dwi', 'assets/images/testimoni/5.svg', 4, 'Buat temen ngopi sore, dimsumnya cocok banget. Crackernya juara.')
ON CONFLICT DO NOTHING;

INSERT INTO galeri (src, alt, kategori, urutan) VALUES
  ('assets/images/gallery/produksi1.svg', 'Proses produksi dimsum di dapur', 'produksi', 1),
  ('assets/images/gallery/packing1.svg', 'Packing dimsum rapih dan higienis', 'packing', 2),
  ('assets/images/gallery/dimsum1.svg', 'Siomay ayam premium siap saji', 'produk', 3),
  ('assets/images/gallery/outlet1.svg', 'Outlet Dimsum Denaya', 'outlet', 4),
  ('assets/images/gallery/customer1.svg', 'Pelanggan menikmati dimsum', 'customer', 5),
  ('assets/images/gallery/produksi2.svg', 'Pembuatan hakau udang', 'produksi', 6),
  ('assets/images/gallery/dimsum2.svg', 'Dimsum mentai premium', 'produk', 7),
  ('assets/images/gallery/outlet2.svg', 'Suasana outlet Dimsum Denaya', 'outlet', 8)
ON CONFLICT DO NOTHING;
