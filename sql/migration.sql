-- ============================================
-- Dimsum Denaya — Migration: Antrian & Delivery
-- Jalankan setelah schema.sql yang sudah ada
-- ============================================

-- ============================================
-- 1. ALTER dd_menu: tambah kolom tersedia_order
-- ============================================
ALTER TABLE dd_menu ADD COLUMN IF NOT EXISTS tersedia_order BOOLEAN DEFAULT TRUE;

-- ============================================
-- 2. TABLE BARU: dd_antrian
-- ============================================
CREATE TABLE IF NOT EXISTS dd_antrian (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  nomor_antrian TEXT NOT NULL,
  lokasi TEXT NOT NULL CHECK (lokasi IN ('rumah', 'kebon_kembang')),
  status TEXT DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'dilayani', 'selesai', 'batal')),
  nama_pelanggan TEXT DEFAULT '',
  no_hp TEXT DEFAULT '',
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nomor antrian unik per hari per lokasi
CREATE UNIQUE INDEX IF NOT EXISTS idx_dd_antrian_harian
  ON dd_antrian(tanggal, lokasi, nomor_antrian);

CREATE INDEX IF NOT EXISTS idx_dd_antrian_status ON dd_antrian(status);
CREATE INDEX IF NOT EXISTS idx_dd_antrian_tanggal ON dd_antrian(tanggal DESC);

-- ============================================
-- 3. ALTER dd_orders: tambah kolom antrian & lokasi
-- ============================================
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS lokasi TEXT DEFAULT 'rumah';
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS jarak_km NUMERIC(5,1) DEFAULT 0;
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS ongkir INTEGER DEFAULT 0;
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS metode_bayar TEXT DEFAULT 'tunai';
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS nomor_antrian TEXT DEFAULT '';
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS item_details JSONB DEFAULT '[]';
ALTER TABLE dd_orders ADD COLUMN IF NOT EXISTS sub_total INTEGER DEFAULT 0;

-- Hapus constraint CHECK lama, tambah yang baru
-- (Supabase ga bisa ganti constraint langsung, jadi drop & create)
ALTER TABLE dd_orders DROP CONSTRAINT IF EXISTS dd_orders_status_check;
ALTER TABLE dd_orders ADD CONSTRAINT dd_orders_status_check
  CHECK (status IN ('baru', 'dibayar', 'diproses', 'selesai', 'batal'));

-- ============================================
-- 4. Auto-update trigger untuk dd_antrian
-- ============================================
CREATE TRIGGER update_dd_antrian_updated_at
  BEFORE UPDATE ON dd_antrian
  FOR EACH ROW EXECUTE FUNCTION update_dd_updated_at();

-- ============================================
-- 5. RLS: dd_antrian
-- ============================================
ALTER TABLE dd_antrian ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read antrian" ON dd_antrian FOR SELECT USING (true);
CREATE POLICY "Public insert antrian" ON dd_antrian FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage antrian" ON dd_antrian FOR ALL USING (auth.role() = 'authenticated');

-- izinkan public update status antrian (misal: tandai sudah ambil)
CREATE POLICY "Public update own antrian" ON dd_antrian FOR UPDATE USING (true);

-- ============================================
-- 6. Recreate indexes for orders
-- ============================================
CREATE INDEX IF NOT EXISTS idx_dd_orders_lokasi ON dd_orders(lokasi);
CREATE INDEX IF NOT EXISTS idx_dd_orders_nomor_antrian ON dd_orders(nomor_antrian);

-- ============================================
-- 7. Update seed config: tambah QR & ongkir
-- ============================================
INSERT INTO dd_config (key, value) VALUES
  -- QR Token (ganti untuk nonaktifkan QR lama)
  ('qr_token_kebon_kembang', 'kk-' || lower(replace(gen_random_uuid()::text, '-', ''))),
  ('qr_token_rumah', 'rm-' || lower(replace(gen_random_uuid()::text, '-', ''))),

  -- Tarif ongkir (per km dalam rupiah)
  ('tarif_per_km', '2000'),

  -- Koordinat rumah (titik acuan ongkir)
  ('lat_rumah', '-6.3940019'),
  ('lng_rumah', '107.4668351'),

  -- Jam reset antrian
  ('reset_antrian_jam', '06:00'),

  -- Tampilkan order QR di landing page
  ('qr_aktif', 'true')
ON CONFLICT (key) DO NOTHING;
