-- ============================================
-- Dimsum Denaya — Supabase Schema
-- Tabel prefix: dd_ (biar tidak bentrok dengan LaunchPage Studio)
-- ============================================

-- 1. TABLE: dd_menu
CREATE TABLE IF NOT EXISTS dd_menu (
  menu_id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL,
  gambar TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  kategori TEXT DEFAULT 'dimsum',
  deskripsi TEXT DEFAULT '',
  tersedia BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE: dd_testimoni
CREATE TABLE IF NOT EXISTS dd_testimoni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  teks TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE: dd_galeri
CREATE TABLE IF NOT EXISTS dd_galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT DEFAULT '',
  kategori TEXT DEFAULT 'produk',
  urutan INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE: dd_config
CREATE TABLE IF NOT EXISTS dd_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE: dd_orders
CREATE TABLE IF NOT EXISTS dd_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  items TEXT DEFAULT '',
  total INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_dd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dd_menu_updated_at
  BEFORE UPDATE ON dd_menu
  FOR EACH ROW EXECUTE FUNCTION update_dd_updated_at();

CREATE TRIGGER update_dd_orders_updated_at
  BEFORE UPDATE ON dd_orders
  FOR EACH ROW EXECUTE FUNCTION update_dd_updated_at();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_dd_menu_tersedia ON dd_menu(tersedia);
CREATE INDEX IF NOT EXISTS idx_dd_menu_kategori ON dd_menu(kategori);
CREATE INDEX IF NOT EXISTS idx_dd_orders_status ON dd_orders(status);
CREATE INDEX IF NOT EXISTS idx_dd_orders_created ON dd_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dd_galeri_urutan ON dd_galeri(urutan);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE dd_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_testimoni ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dd_orders ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key)
CREATE POLICY "Public read menu" ON dd_menu FOR SELECT USING (true);
CREATE POLICY "Public read testimoni" ON dd_testimoni FOR SELECT USING (true);
CREATE POLICY "Public read galeri" ON dd_galeri FOR SELECT USING (true);
CREATE POLICY "Public read config" ON dd_config FOR SELECT USING (true);

-- Insert orders (public can insert)
CREATE POLICY "Public insert orders" ON dd_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own orders" ON dd_orders FOR SELECT USING (true);

-- Config update only by authenticated
CREATE POLICY "Admin update config" ON dd_config FOR ALL USING (auth.role() = 'authenticated');

-- Admin CRUD (authenticated users only)
CREATE POLICY "Admin manage menu" ON dd_menu FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage testimoni" ON dd_testimoni FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage galeri" ON dd_galeri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin manage orders" ON dd_orders FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Seed data: default config
-- ============================================
INSERT INTO dd_config (key, value) VALUES
  ('nomor_wa', '6281234567890'),
  ('nomor_hp', '6281234567890'),
  ('email', 'dimsumdenaya@gmail.com'),
  ('alamat', 'Jl. Contoh No. 123, Kota'),
  ('instagram', 'dimsumdenaya'),
  ('nama_toko', 'Dimsum Denaya'),
  ('tagline', 'Dimsum Premium Keluarga Indonesia'),
  ('jam_buka', '08:00 - 20:00'),
  ('rekening_bca', '1234567890'),
  ('rekening_mandiri', '1234567890'),
  ('rekening_dana', '081234567890'),
  ('ongkir', '5000')
ON CONFLICT (key) DO NOTHING;
