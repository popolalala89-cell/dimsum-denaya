/* ============================================
   Dimsum Denaya — Main JavaScript
   ============================================ */

'use strict';

// ============================================
// Configuration
// ============================================
const CONFIG = {
  waNumber: '628xxxxxxxxxx',
  waMessage: 'Halo Dimsum Denaya, saya ingin memesan dimsum.',
  storageKey: 'dm_favorites',
  scrollThreshold: 300,
  toastDuration: 2500,
};

// ============================================
// WA Link Generator
// ============================================
function waLink(nomor, pesan) {
  const no = nomor || CONFIG.waNumber;
  const msg = pesan || CONFIG.waMessage;
  return `https://wa.me/${no}?text=${encodeURIComponent(msg)}`;
}

function openWA(e, nomor, pesan) {
  if (e) e.preventDefault();
  window.open(waLink(nomor, pesan), '_blank');
}

// ============================================
// Toast
// ============================================ 
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('toast--visible');
  setTimeout(function () {
    toast.classList.remove('toast--visible');
  }, CONFIG.toastDuration);
}

// ============================================
// Navbar
// ============================================
function initNavbar() {
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  const links = document.querySelectorAll('.navbar__link');

  // Toggle mobile menu
  if (toggle) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('navbar__toggle--active');
      menu.classList.toggle('navbar__menu--open');
      document.body.style.overflow = menu.classList.contains('navbar__menu--open') ? 'hidden' : '';
    });
  }

  // Close menu on link click
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('navbar__toggle--active');
      menu.classList.remove('navbar__menu--open');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });
    links.forEach(function (link) {
      link.classList.remove('navbar__link--active');
      const href = link.getAttribute('href');
      if (href && href === '#' + current) {
        link.classList.add('navbar__link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Navbar shadow on scroll
  const navbar = document.querySelector('.navbar');
  function updateNavbarShadow() {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }
  window.addEventListener('scroll', updateNavbarShadow, { passive: true });
  updateNavbarShadow();
}

// ============================================
// Floating WA Button & Back to Top
// ============================================
function initFloatingButtons() {
  const floatingWA = document.querySelector('.floating-wa');
  const backToTop = document.querySelector('.back-to-top');

  function toggleButtons() {
    const scrolled = window.scrollY > CONFIG.scrollThreshold;
    if (floatingWA) {
      floatingWA.classList.toggle('floating-wa--visible', scrolled);
    }
    if (backToTop) {
      backToTop.classList.toggle('back-to-top--visible', scrolled);
    }
  }

  window.addEventListener('scroll', toggleButtons, { passive: true });
  toggleButtons();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ============================================
// Menu Favorit — Load from JSON + Favorites
// ============================================
const menuFavorites = {
  get() {
    try {
      const data = localStorage.getItem(CONFIG.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  save(ids) {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(ids));
    } catch (e) {
      // localStorage not available
    }
  },
  toggle(id, btn) {
    let favs = this.get();
    const idx = favs.indexOf(id);
    if (idx === -1) {
      favs.push(id);
    } else {
      favs.splice(idx, 1);
    }
    this.save(favs);
    this.updateUI(id, btn);
  },
  updateUI(id, btn) {
    const favs = this.get();
    const isFav = favs.indexOf(id) !== -1;
    if (btn) {
      btn.classList.toggle('menu-card__love--active', isFav);
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isFav ? 'bi bi-heart-fill' : 'bi bi-heart';
      }
      if (isFav) {
        btn.classList.remove('heart-burst');
        // trigger reflow
        void btn.offsetWidth;
        btn.classList.add('heart-burst');
      }
    }
  },
  isFavorite(id) {
    return this.get().indexOf(id) !== -1;
  }
};

const MENU_FALLBACK = [
  { id: 'siomay-ayam', nama: 'Siomay Ayam Premium', harga: 2000, gambar: 'assets/images/menu/siomay.jpg', badge: 'Best Seller' },
  { id: 'hakau-udang', nama: 'Hakau Udang', harga: 2500, gambar: 'assets/images/menu/hakau.jpg', badge: 'Favorit' },
  { id: 'dimsum-mentai', nama: 'Dimsum Mentai', harga: 3000, gambar: 'assets/images/menu/mentai.jpg', badge: 'Premium' },
  { id: 'ceker-ayam', nama: 'Ceker Ayam', harga: 1500, gambar: 'assets/images/menu/ceker.jpg', badge: '' },
  { id: 'lumpia-udang', nama: 'Lumpia Udang', harga: 2500, gambar: 'assets/images/menu/lumpia.jpg', badge: 'Rekomendasi' }
];

function formatHarga(amount) {
  return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function imgSrcSvgFallback(path) {
  // If .jpg/.jpeg/.png, try .svg instead for placeholder support
  return path.replace(/\.(jpg|jpeg|png)$/i, '.svg');
}

function renderMenuCard(item) {
  // Support both Supabase (menu_id) and JSON (id) format
  const id = item.menu_id || item.id;
  const isFav = menuFavorites.isFavorite(id);
  const badgeHtml = item.badge ? '<span class="menu-card__badge">' + item.badge + '</span>' : '';
  const imgSrc = item.gambar || imgSrcSvgFallback(item.gambar || '');
  return `
    <div class="menu-card" data-menu-id="${id}">
      <div class="menu-card__image-wrap">
        <img class="menu-card__image" src="${imgSrc}" alt="${item.nama}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0e8e0;color:#999;font-size:2rem;\\'><i class=\\'bi bi-image\\'></i></div>'">
        ${badgeHtml}
        <button class="menu-card__love ${isFav ? 'menu-card__love--active' : ''}" data-id="${id}" aria-label="${isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}" title="${isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}">
          <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
        </button>
      </div>
      <div class="menu-card__body">
        <h3 class="menu-card__name">${item.nama}</h3>
        <div class="menu-card__price">${formatHarga(item.harga)}</div>
        <button class="btn btn--primary menu-card__order" onclick="openWA(event)" data-wa>
          <i class="bi bi-whatsapp"></i> Pesan Sekarang
        </button>
      </div>
    </div>
  `;
}

function renderSkeleton(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="menu-card">
        <div class="skeleton skeleton--image"></div>
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    `;
  }
  return html;
}

function renderEmpty() {
  return `
    <div class="menu-favorit__empty">
      <div class="menu-favorit__empty-icon"><i class="bi bi-emoji-frown"></i></div>
      <p>Menu sedang diperbarui, silakan hubungi kami via WhatsApp.</p>
      <button class="btn btn--primary mt-3" onclick="openWA(event)" style="margin-top:16px" data-wa>
        <i class="bi bi-whatsapp"></i> Hubungi WhatsApp
      </button>
    </div>
  `;
}

async function fetchMenu() {
  const grid = document.getElementById('menuGrid');
  if (!grid) return;

  // Show skeleton
  grid.innerHTML = renderSkeleton(6);

  try {
    // Try Supabase first
    if (typeof ddGetMenu !== 'undefined') {
      const data = await ddGetMenu();
      if (data && data.length > 0) {
        grid.innerHTML = data.map(renderMenuCard).join('');
        attachLoveListeners();
        return;
      }
    }
  } catch (e) {
    console.warn('Supabase menu failed, trying JSON:', e);
  }

  // Fallback: fetch from JSON
  fetch('data/menu.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(function (data) {
      if (!data || data.length === 0) {
        grid.innerHTML = renderEmpty();
        return;
      }
      grid.innerHTML = data.map(renderMenuCard).join('');
      attachLoveListeners();
    })
    .catch(function (err) {
      console.warn('Menu JSON gagal dimuat, menggunakan fallback:', err);
      grid.innerHTML = MENU_FALLBACK.map(renderMenuCard).join('');
      attachLoveListeners();
    });
}

function attachLoveListeners() {
  document.querySelectorAll('.menu-card__love').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const id = this.getAttribute('data-id');
      menuFavorites.toggle(id, this);
      // Update aria-label
      const isFav = this.classList.contains('menu-card__love--active');
      this.setAttribute('aria-label', isFav ? 'Hapus dari favorit' : 'Tambah ke favorit');
      this.setAttribute('title', isFav ? 'Hapus dari favorit' : 'Tambah ke favorit');
    });
  });
}

// ============================================
// Testimoni — Swiper Slider
// ============================================
const TESTIMONI_FALLBACK = [
  { nama: 'Ibu Rina', avatar: 'assets/images/testimoni/1.jpg', rating: 5, teks: 'Dimsumnya lembut banget. Anak-anak suka banget.' },
  { nama: 'Bapak Andi', avatar: 'assets/images/testimoni/2.jpg', rating: 4, teks: 'Rasa enak, pengiriman cepat, packing rapi.' },
  { nama: 'Mbak Sari', avatar: 'assets/images/testimoni/3.jpg', rating: 5, teks: 'Dimsumnya fresh, bumbunya pas. Siomay ayamnya favorit saya.' }
];

function renderTestimoniStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= rating ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
  }
  return html;
}

function renderTestimoniSlide(item) {
  const avatarSrc = imgSrcSvgFallback(item.avatar);
  return `
    <div class="swiper-slide">
      <div class="testimoni__card">
        <img class="testimoni__avatar" src="${avatarSrc}" alt="${item.nama}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'72\\' height=\\'72\\' viewBox=\\'0 0 72 72\\'%3E%3Crect fill=\\'%23f0e8e0\\' width=\\'72\\' height=\\'72\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'28\\' text-anchor=\\'middle\\' dy=\\'.35em\\' fill=\\'%23bbb\\'%3E${item.nama.charAt(0)}%3C/text%3E%3C/svg%3E'">
        <div class="testimoni__stars">${renderTestimoniStars(item.rating)}</div>
        <p class="testimoni__text">${item.teks}</p>
        <div class="testimoni__name">${item.nama}</div>
      </div>
    </div>
  `;
}

async function initTestimoni() {
  const container = document.getElementById('testimoniContainer');
  if (!container) return;

  // Check reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    // Try Supabase first
    if (typeof ddGetTestimoni !== 'undefined') {
      const data = await ddGetTestimoni();
      if (data && data.length > 0) {
        container.innerHTML = data.map(renderTestimoniSlide).join('');
        initSwiper(prefersReducedMotion);
        return;
      }
    }
  } catch (e) {
    console.warn('Supabase testimoni failed, trying JSON:', e);
  }

  fetch('data/testimoni.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(function (data) {
      if (!data || data.length === 0) throw new Error('Empty data');
      container.innerHTML = data.map(renderTestimoniSlide).join('');
    })
    .catch(function (err) {
      console.warn('Testimoni JSON gagal dimuat, menggunakan fallback:', err);
      container.innerHTML = TESTIMONI_FALLBACK.map(renderTestimoniSlide).join('');
    })
    .finally(function () {
      initSwiper(prefersReducedMotion);
    });
}

function initSwiper(prefersReducedMotion) {
  new Swiper('.testimoni__slider', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: prefersReducedMotion ? false : {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        navigation: {
          nextEl: '.testimoni__btn--next',
          prevEl: '.testimoni__btn--prev',
        },
        keyboard: {
          enabled: true,
        },
        a11y: {
          enabled: true,
          prevSlideMessage: 'Testimoni sebelumnya',
          nextSlideMessage: 'Testimoni berikutnya',
          firstSlideMessage: 'Ini adalah testimoni pertama',
          lastSlideMessage: 'Ini adalah testimoni terakhir',
          paginationBulletMessage: 'Pergi ke testimoni {{index}}',
          containerRole: 'region',
          containerRoleDescriptionMessage: 'Testimoni Pelanggan',
        },
      });
}

// ============================================
// Galeri — Masonry & Lightbox
// ============================================
const GALERI_FALLBACK = [
  { src: 'assets/images/gallery/produksi1.jpg', alt: 'Proses produksi dimsum', kategori: 'produksi' },
  { src: 'assets/images/gallery/dimsum1.jpg', alt: 'Siomay ayam premium', kategori: 'produk' },
  { src: 'assets/images/gallery/outlet1.jpg', alt: 'Outlet Dimsum Denaya', kategori: 'outlet' },
  { src: 'assets/images/gallery/packing1.jpg', alt: 'Packing dimsum', kategori: 'packing' },
  { src: 'assets/images/gallery/customer1.jpg', alt: 'Pelanggan menikmati dimsum', kategori: 'customer' },
  { src: 'assets/images/gallery/dimsum2.jpg', alt: 'Dimsum mentai premium', kategori: 'produk' }
];

function renderGaleriItem(item) {
  const imgSrc = imgSrcSvgFallback(item.src);
  return `
    <a class="galeri__item" href="${imgSrc}" data-fslightbox="gallery">
      <img src="${imgSrc}" alt="${item.alt}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;padding:40px;background:#f0e8e0;display:flex;align-items:center;justify-content:center;color:#999;font-size:3rem;\\'><i class=\\'bi bi-image\\'></i></div>'">
      <div class="galeri__item-overlay">
        <i class="bi bi-arrows-fullscreen galeri__item-icon"></i>
      </div>
    </a>
  `;
}

async function initGaleri() {
  const grid = document.getElementById('galeriGrid');
  if (!grid) return;

  try {
    // Try Supabase first
    if (typeof ddGetGaleri !== 'undefined') {
      const data = await ddGetGaleri();
      if (data && data.length > 0) {
        grid.innerHTML = data.map(renderGaleriItem).join('');
        refreshLightbox();
        return;
      }
    }
  } catch (e) {
    console.warn('Supabase galeri failed, trying JSON:', e);
  }

  fetch('data/galeri.json')
    .then(function (res) {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(function (data) {
      if (!data || data.length === 0) throw new Error('Empty data');
      grid.innerHTML = data.map(renderGaleriItem).join('');
    })
    .catch(function (err) {
      console.warn('Galeri JSON gagal dimuat, menggunakan fallback:', err);
      grid.innerHTML = GALERI_FALLBACK.map(renderGaleriItem).join('');
    })
    .finally(function () {
      // Refresh fslightbox if available
      if (typeof refreshFsLightbox !== 'undefined') {
        refreshFsLightbox();
      }
    });
}

function refreshLightbox() {
  if (typeof refreshFsLightbox !== 'undefined') {
    refreshFsLightbox();
  }
}

// ============================================
// FAQ Accordion (single expand)
// ============================================
function initFAQ() {
  const triggers = document.querySelectorAll('.faq__trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const content = this.nextElementSibling;
      const isOpen = this.getAttribute('aria-expanded') === 'true';

      // Close all
      triggers.forEach(function (t) {
        t.setAttribute('aria-expanded', 'false');
        t.nextElementSibling.classList.remove('faq__content--open');
      });

      if (!isOpen) {
        this.setAttribute('aria-expanded', 'true');
        content.classList.add('faq__content--open');
      }
    });
  });
}

// ============================================
// Lokasi — Google Maps Fallback
// ============================================
function initLokasi() {
  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer) return;

  const iframe = mapContainer.querySelector('.lokasi__map iframe');
  const fallback = mapContainer.querySelector('.lokasi__map-fallback');

  if (!iframe) return;

  // If iframe fails to load, show fallback
  iframe.addEventListener('error', function () {
    showMapFallback();
  });

  // Also set a timeout: if map doesn't load in 8s, show fallback
  setTimeout(function () {
    // Check if iframe actually loaded content
    try {
      // Some browsers block cross-origin access, just check if visible
      const rect = iframe.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        showMapFallback();
      }
    } catch (e) {
      // Cross-origin, assume it loaded
    }
  }, 8000);

  function showMapFallback() {
    iframe.style.display = 'none';
    if (fallback) {
      fallback.classList.add('lokasi__map-fallback--visible');
    }
  }
}

// ============================================
// AOS (Animate On Scroll)
// ============================================
function initAOS() {
  if (typeof AOS !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      disable: prefersReducedMotion,
    });
  }
}

// ============================================
// WA Buttons Binding
// ============================================
function bindWAButtons() {
  document.querySelectorAll('[data-wa]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      showToast('Mengarahkan ke WhatsApp\u2026');
      setTimeout(function () {
        openWA(e);
      }, 500);
    });
  });
}

// ============================================
// Reduced Motion — disable animations
// ============================================
function handleReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    document.querySelectorAll('.hero__scroll').forEach(function (el) {
      el.style.display = 'none';
    });
  }
}

// ============================================
// Config dari Supabase
// ============================================
async function initConfig() {
  try {
    if (typeof ddGetAllConfig !== 'undefined') {
      const config = await ddGetAllConfig();
      if (config && config.nomor_wa) {
        CONFIG.waNumber = config.nomor_wa;
        // Update all WhatsApp links
        document.querySelectorAll('[data-wa]').forEach(function (el) {
          const href = el.getAttribute('href');
          if (href && href.includes('wa.me/')) {
            el.setAttribute('href', waLink(config.nomor_wa, config.pesan_default || CONFIG.waMessage));
          }
        });
      }
    }
  } catch (e) {
    console.warn('Config loading failed:', e);
  }
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initFloatingButtons();
  initConfig().then(function () {
    fetchMenu();
    initTestimoni();
    initGaleri();
  });
  initFAQ();
  initLokasi();
  initAOS();
  bindWAButtons();
  handleReducedMotion();
});
