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

  const { data, error } = await sb
    .from(DD_TABLE.orders)
    .insert([{
      order_id: orderId,
      name: order.name,
      phone: order.phone,
      email: order.email || '',
      items: order.items || '',
      total: order.total || 0,
      notes: order.notes || '',
      status: 'pending'
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
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
