/* ============================================
   Dimsum Denaya — Supabase Client
   Menggunakan project Supabase yang sama dengan LaunchPage Studio
   ============================================ */

// ============================================
// Configuration (sama dengan LaunchPage Studio)
// ============================================
const DD_SUPABASE_URL = 'https://ifozejithwettwcayzqb.supabase.co';
const DD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlmb3plaml0aHdldHR3Y2F5enFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODI4NTksImV4cCI6MjA5ODA1ODg1OX0.iV6BBTNKIZ7knXYi0-5B_CYgsote-Mg1BpAvlbJjPHM';

// Prefix tabel untuk Dimsum Denaya (biar tidak bentrok dengan LaunchPage)
const DD_TABLE = {
  menu: 'dd_menu',
  testimoni: 'dd_testimoni',
  galeri: 'dd_galeri',
  config: 'dd_config',
  orders: 'dd_orders',
  antrian: 'dd_antrian',
};

// ============================================
// Supabase Client
// ============================================
let ddSupabase = null;

function ddInitSupabase() {
  if (typeof supabase === 'undefined') {
    console.warn('Supabase client library not loaded');
    return null;
  }
  if (ddSupabase) return ddSupabase;
  ddSupabase = supabase.createClient(DD_SUPABASE_URL, DD_SUPABASE_ANON_KEY);
  return ddSupabase;
}

// ============================================
// Config
// ============================================
async function ddGetConfig(key) {
  try {
    const sb = ddInitSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from(DD_TABLE.config)
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data ? data.value : null;
  } catch (e) {
    console.warn('Failed to fetch config:', key, e);
    return null;
  }
}

async function ddGetAllConfig() {
  try {
    const sb = ddInitSupabase();
    if (!sb) return {};
    const { data, error } = await sb
      .from(DD_TABLE.config)
      .select('key, value');
    if (error) throw error;
    const config = {};
    (data || []).forEach(function (item) {
      config[item.key] = item.value;
    });
    return config;
  } catch (e) {
    console.warn('Failed to fetch all config:', e);
    return {};
  }
}

// ============================================
// Menu
// ============================================
async function ddGetMenu() {
  try {
    const sb = ddInitSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from(DD_TABLE.menu)
      .select('*')
      .eq('tersedia', true)
      .order('harga', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Failed to fetch menu:', e);
    return null;
  }
}

async function ddAddMenuItem(item) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb
    .from(DD_TABLE.menu)
    .insert([{
      menu_id: item.menu_id,
      nama: item.nama,
      harga: item.harga,
      gambar: item.gambar || '',
      badge: item.badge || '',
      kategori: item.kategori || 'dimsum',
      deskripsi: item.deskripsi || '',
      tersedia: true
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function ddUpdateMenuItem(menuId, updates) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb
    .from(DD_TABLE.menu)
    .update(updates)
    .eq('menu_id', menuId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function ddDeleteMenuItem(menuId) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb
    .from(DD_TABLE.menu)
    .delete()
    .eq('menu_id', menuId);
  if (error) throw error;
  return true;
}

// ============================================
// Testimoni
// ============================================
async function ddGetTestimoni() {
  try {
    const sb = ddInitSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from(DD_TABLE.testimoni)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Failed to fetch testimoni:', e);
    return null;
  }
}

async function ddAddTestimoni(item) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb
    .from(DD_TABLE.testimoni)
    .insert([{
      nama: item.nama,
      avatar: item.avatar || '',
      rating: item.rating || 5,
      teks: item.teks
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function ddDeleteTestimoni(id) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb
    .from(DD_TABLE.testimoni)
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================
// Galeri
// ============================================
async function ddGetGaleri() {
  try {
    const sb = ddInitSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from(DD_TABLE.galeri)
      .select('*')
      .order('urutan', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.warn('Failed to fetch galeri:', e);
    return null;
  }
}

async function ddAddGaleri(item) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb
    .from(DD_TABLE.galeri)
    .insert([{
      src: item.src,
      alt: item.alt || '',
      kategori: item.kategori || 'produk',
      urutan: item.urutan || 0
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function ddDeleteGaleri(id) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb
    .from(DD_TABLE.galeri)
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// ============================================
// Orders (pesanan pelanggan)
// ============================================
async function ddSubmitOrder(order) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const date = new Date();
  const dateStr = date.getFullYear().toString().slice(-2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderId = 'DD-' + dateStr + '-' + rand;

  const itemDetails = order.items || [];
  const itemText = Array.isArray(itemDetails)
    ? itemDetails.map(function (i) { return i.nama + ' x' + i.jumlah; }).join(', ')
    : '';

  const subTotal = Array.isArray(itemDetails)
    ? itemDetails.reduce(function (sum, i) { return sum + (i.harga * i.jumlah); }, 0)
    : (order.total || 0);

  const { data, error } = await sb
    .from(DD_TABLE.orders)
    .insert([{
      order_id: orderId,
      name: order.name || '',
      phone: order.phone || '',
      email: order.email || '',
      items: itemText,
      item_details: JSON.stringify(itemDetails),
      sub_total: subTotal,
      ongkir: order.ongkir || 0,
      total: subTotal + (order.ongkir || 0),
      lokasi: order.lokasi || 'rumah',
      jarak_km: order.jarak_km || 0,
      metode_bayar: order.metode_bayar || 'tunai',
      nomor_antrian: order.nomor_antrian || '',
      notes: order.notes || '',
      status: 'baru'
    }])
    .select()
    .single();
  if (error) throw error;
  return { ...data, order_id: orderId };
}

// ============================================
// Antrian (Queue System)
// ============================================

// Generate nomor antrian berikutnya
async function ddGetNextAntrian(lokasi) {
  const sb = ddInitSupabase();
  if (!sb) return null;

  const today = new Date().toISOString().split('T')[0];
  const prefix = lokasi === 'kebon_kembang' ? 'KK' : 'RM';

  // Cari nomor terakhir hari ini
  const { data, error } = await sb
    .from(DD_TABLE.antrian)
    .select('nomor_antrian')
    .eq('tanggal', today)
    .eq('lokasi', lokasi)
    .order('nomor_antrian', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNum = 1;
  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].nomor_antrian.split('-')[1], 10);
    nextNum = (isNaN(lastNum) ? 0 : lastNum) + 1;
  }

  return prefix + '-' + String(nextNum).padStart(3, '0');
}

// Buat antrian baru
async function ddCreateAntrian(lokasi, nama, noHp) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const nomorAntrian = await ddGetNextAntrian(lokasi);
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await sb
    .from(DD_TABLE.antrian)
    .insert([{
      tanggal: today,
      nomor_antrian: nomorAntrian,
      lokasi: lokasi,
      status: 'menunggu',
      nama_pelanggan: nama || '',
      no_hp: noHp || ''
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Ambil daftar antrian hari ini
async function ddGetAntrianList(lokasi, statusFilter) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const today = new Date().toISOString().split('T')[0];
  let query = sb
    .from(DD_TABLE.antrian)
    .select('*')
    .eq('tanggal', today)
    .order('nomor_antrian', { ascending: true });

  if (lokasi) query = query.eq('lokasi', lokasi);
  if (statusFilter) query = query.eq('status', statusFilter);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Update status antrian
async function ddUpdateAntrianStatus(id, status) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb
    .from(DD_TABLE.antrian)
    .update({ status: status })
    .eq('id', id);
  if (error) throw error;
  return true;
}

// Data untuk display antrian (sedang dilayani + 3 antrian berikutnya)
async function ddGetDisplayData(lokasi) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const today = new Date().toISOString().split('T')[0];
  const allData = await ddGetAntrianList(lokasi);

  const sedangDilayani = allData.filter(function (a) { return a.status === 'dilayani'; });
  const menunggu = allData.filter(function (a) { return a.status === 'menunggu'; });
  const selesai = allData.filter(function (a) { return a.status === 'selesai' || a.status === 'batal'; });

  return {
    sedang_dilayani: sedangDilayani,
    menunggu: menunggu,
    selesai: selesai,
    total_antrian: allData.length,
    sisa_antrian: menunggu.length
  };
}

// ============================================
// QR Token
// ============================================

// Validasi token QR
async function ddValidateQrToken(lokasi, token) {
  try {
    const key = lokasi === 'kebon_kembang' ? 'qr_token_kebon_kembang' : 'qr_token_rumah';
    const stored = await ddGetConfig(key);
    return stored === token;
  } catch (e) {
    return false;
  }
}

// Generate token QR baru
async function ddRegenerateQrToken(lokasi) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');

  const prefix = lokasi === 'kebon_kembang' ? 'kk' : 'rm';
  const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const newToken = prefix + '-' + random;
  const key = lokasi === 'kebon_kembang' ? 'qr_token_kebon_kembang' : 'qr_token_rumah';

  const { error } = await sb
    .from(DD_TABLE.config)
    .upsert({ key: key, value: newToken, updated_at: new Date().toISOString() });

  if (error) throw error;
  return newToken;
}

// Ambil token QR saat ini
async function ddGetQrToken(lokasi) {
  try {
    const key = lokasi === 'kebon_kembang' ? 'qr_token_kebon_kembang' : 'qr_token_rumah';
    return await ddGetConfig(key);
  } catch (e) {
    return null;
  }
}

// ============================================
// Auth (admin panel)
// ============================================
async function ddAdminLogin(email, password) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { data, error } = await sb.auth.signInWithPassword({
    email: email,
    password: password
  });
  if (error) throw error;
  return data;
}

async function ddAdminLogout() {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  await sb.auth.signOut();
}

async function ddGetSession() {
  const sb = ddInitSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

// ============================================
// Orders Admin
// ============================================
async function ddGetOrders(statusFilter) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  let query = sb.from(DD_TABLE.orders).select('*').order('created_at', { ascending: false });
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function ddUpdateOrderStatus(orderId, status) {
  const sb = ddInitSupabase();
  if (!sb) throw new Error('Supabase not initialized');
  const { error } = await sb
    .from(DD_TABLE.orders)
    .update({ status: status })
    .eq('order_id', orderId);
  if (error) throw error;
  return true;
}
