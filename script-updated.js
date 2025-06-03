document.addEventListener("DOMContentLoaded", () => {
  // Variables globales
  let galleryItems = [];
  let filteredItems = [];
  let currentItemIndex = 0;

  // Referencias DOM
  const galleryContainer = document.getElementById("gallery-container");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const modal = document.getElementById("gallery-modal");
  const modalContent = document.getElementById("modal-content");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const modalCounter = document.getElementById("modal-counter");
  const closeModal = document.getElementById("close-modal");
  const prevButton = document.getElementById("prev-item");
  const nextButton = document.getElementById("next-item");
  const downloadModal = document.getElementById("download-modal");
  const photoCount = document.getElementById("photo-count");
  
  // Referencias para menú móvil
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const hamburger = document.querySelector(".hamburger");

  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth <= 768;

  // Inicializar la aplicación
  init();

  async function init() {
    try {
      await loadPhotosFromAPI();
      setupEventListeners();
      loadGallery();
    } catch (error) {
      console.error('Error initializing gallery:', error);
      // Fallback a datos estáticos si falla la API
      loadStaticData();
      setupEventListeners();
      loadGallery();
    }
  }

  // Cargar fotos desde la API
  async function loadPhotosFromAPI() {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      
      if (data.success !== false && data.photos) {
        galleryItems = data.photos.map(photo => ({
          id: photo.id,
          type: "image",
          src: photo.src,
          thumbnail: photo.thumbnail || photo.src,
          category: photo.category,
          title: photo.title,
          description: photo.description,
          verse: photo.verse
        }));
        
        console.log(`Loaded ${galleryItems.length} photos from API`);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Failed to load photos from API:', error);
      throw error;
    }
  }

  // Datos estáticos como fallback
  function loadStaticData() {
    galleryItems = [
      {
        id: 1,
        type: "image",
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
        category: "worship",
        title: "Adoración en las Alturas",
        description: "Alabanza juvenil bajo cielo abierto",
        verse: "Salmos 150:6"
      },
      {
        id: 2,
        type: "image",
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop",
        category: "fellowship",
        title: "Camino de Fe",
        description: "Jóvenes caminando juntos en propósito",
        verse: "Proverbios 27:17"
      },
      {
        id: 3,
        type: "image",
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1200&fit=crop",
        thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop",
        category: "worship",
        title: "Reflexión Divina",
        description: "Momento de contemplación y oración",
        verse: "Salmos 46:10"
      }
      // Más datos estáticos...
    ];
    console.log('Loaded static fallback data');
  }

  function setupEventListeners() {
    // Función para toggle del menú móvil
    function toggleMobileMenu() {
      const isActive = mobileMenu.classList.contains('active');
      
      if (isActive) {
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    // Event listeners para menú móvil
    if (menuToggle) {
      menuToggle.addEventListener("click", toggleMobileMenu);
    }
    
    if (mobileMenuOverlay) {
      mobileMenuOverlay.addEventListener("click", toggleMobileMenu);
    }

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.mobile-nav-item a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMobileMenu();
      });
    });

    // Event Listeners para filtros
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Actualizar botones activos
        filterButtons.forEach((btn) => {
          btn.classList.remove("active");
        });
        this.classList.add("active");

        // Filtrar galería
        loadGallery(this.dataset.filter);
      });
    });

    // Event Listeners para modal
    if (closeModal) closeModal.addEventListener("click", closeModalHandler);
    if (prevButton) prevButton.addEventListener("click", goToPrevItem);
    if (nextButton) nextButton.addEventListener("click", goToNextItem);

    // Cerrar modal al hacer clic fuera
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModalHandler();
      });
    }

    // Navegación con teclado
    document.addEventListener("keydown", (e) => {
      if (modal && modal.classList.contains("opacity-0")) return;

      if (e.key === "Escape") closeModalHandler();
      else if (e.key === "ArrowLeft") goToPrevItem();
      else if (e.key === "ArrowRight") goToNextItem();
      else if (e.key === "d" || e.key === "D") {
        const item = filteredItems[currentItemIndex];
        if (item) downloadImage(item.src, `${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`);
      }
    });

    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });

          // Actualizar navegación activa
          document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
          });
          this.classList.add("active");
        }
      });
    });

    // Efecto parallax sutil en el header
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const header = document.querySelector('header');
      if (header) {
        if (scrolled > 100) {
          header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
          header.style.background = 'rgba(255, 255, 255, 0.8)';
        }
      }
    });

    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', () => {
      const newIsMobile = window.innerWidth <= 768;
      if (newIsMobile !== isMobile) {
        // Recargar galería con nuevo layout
        loadGallery();
      }
    });
  }

  // Función para descargar imagen
  async function downloadImage(src, filename) {
    try {
      // Crear un enlace temporal para la descarga
      const link = document.createElement('a');
      link.href = src;
      link.download = filename || 'jovenes-cristianos-photo.jpg';
      link.target = '_blank';
      
      // Agregar al DOM temporalmente
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Mostrar mensaje de éxito
      showNotification('Descarga iniciada', 'success');
    } catch (error) {
      console.error('Error al descargar:', error);
      // Fallback: abrir en nueva ventana
      window.open(src, '_blank');
      showNotification('Imagen abierta en nueva ventana', 'info');
    }
  }

  // Función para mostrar notificaciones
  function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-download mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Función para cargar la galería
  function loadGallery(category = "all") {
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = "";

    filteredItems = category === "all" 
      ? [...galleryItems] 
      : galleryItems.filter(item => item.category === category);

    // Actualizar contador de fotos
    if (photoCount) {
      photoCount.textContent = filteredItems.length;
    }

    // Aplicar clase mobile si es necesario
    if (isMobile) {
      galleryContainer.classList.add('gallery-container-mobile');
    }

    filteredItems.forEach((item, index) => {
      const element = document.createElement("div");
      element.className = "gallery-item opacity-0 cursor-pointer mb-4 break-inside-avoid";
      element.dataset.index = index;

      element.innerHTML = `
        <div class="image-container group">
          <div class="loading-placeholder w-full h-48 sm:h-64 rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
            <i class="fas fa-image text-gray-400 text-2xl"></i>
          </div>
          <img 
            src="${item.thumbnail}" 
            alt="${item.title}" 
            class="w-full h-auto object-cover rounded-2xl hidden"
            onload="this.classList.remove('hidden'); this.parentElement.querySelector('.loading-placeholder').style.display='none';"
            onerror="this.parentElement.querySelector('.loading-placeholder').innerHTML='<i class=\\'fas fa-exclamation-triangle text-red-400 text-2xl\\></i><p class=\\'text-xs text-red-500 mt-2\\>Error al cargar</p>';"
          >
          
          <!-- Overlay con información -->
          <div class="photo-info absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl flex flex-col justify-end p-3 sm:p-4">
            <div class="flex justify-between items-end">
              <div class="text-white">
                <h3 class="font-semibold text-xs sm:text-sm mb-1">${item.title}</h3>
                <p class="text-xs opacity-80 mb-1 hidden sm:block">${item.description}</p>
                <p class="text-xs opacity-60 italic">${item.verse}</p>
              </div>
              <button 
                class="download-btn w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all"
                onclick="event.stopPropagation(); downloadImage('${item.src}', '${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg')"
                title="Descargar imagen"
              >
                <i class="fas fa-download text-xs sm:text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      // Animación de entrada con delay
      setTimeout(() => {
        element.classList.add("animate-in");
      }, index * 50);

      element.addEventListener("click", () => openModal(index));
      galleryContainer.appendChild(element);
    });

    // Mostrar mensaje si no hay fotos
    if (filteredItems.length === 0) {
      galleryContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-images text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-lg font-medium text-gray-500 mb-2">No hay fotos en esta categoría</h3>
          <p class="text-gray-400">Selecciona otra categoría o sube nuevas fotos</p>
        </div>
      `;
    }
  }

  // Función para abrir modal
  function openModal(index) {
    if (!modal) return;
    
    currentItemIndex = index;
    updateModalContent();
    modal.classList.remove("opacity-0", "pointer-events-none");
    document.body.style.overflow = "hidden";
  }

  // Función para cerrar modal
  function closeModalHandler() {
    if (!modal) return;
    
    modal.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "";
  }

  // Función para actualizar contenido del modal
  function updateModalContent() {
    if (!modalContent || filteredItems.length === 0) return;
    
    const item = filteredItems[currentItemIndex];

    modalContent.innerHTML = `
      <img 
        src="${item.src}" 
        alt="${item.title}" 
        class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onerror="this.src='${item.thumbnail}'"
      >
    `;

    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDescription) modalDescription.textContent = item.description;
    if (modalCounter) modalCounter.textContent = `${currentItemIndex + 1} / ${filteredItems.length}`;

    // Actualizar información del modal con versículo
    const modalInfo = document.getElementById("modal-info");
    if (modalInfo) {
      modalInfo.innerHTML = `
        <h3 class="font-semibold mb-1">${item.title}</h3>
        <p class="text-sm opacity-80 mb-2">${item.description}</p>
        <p class="text-xs opacity-60 italic">"${item.verse}"</p>
      `;
    }

    // Actualizar botón de descarga del modal
    if (downloadModal) {
      downloadModal.onclick = () => downloadImage(item.src, `${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`);
    }
  }

  // Navegación en modal
  function goToPrevItem() {
    if (filteredItems.length === 0) return;
    currentItemIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length;
    updateModalContent();
  }

  function goToNextItem() {
    if (filteredItems.length === 0) return;
    currentItemIndex = (currentItemIndex + 1) % filteredItems.length;
    updateModalContent();
  }

  // Función global para descargar (accesible desde onclick)
  window.downloadImage = downloadImage;

  // Función para recargar fotos (útil para cuando se suben nuevas)
  window.refreshGallery = async function() {
    try {
      await loadPhotosFromAPI();
      loadGallery();
      showNotification('Galería actualizada', 'success');
    } catch (error) {
      console.error('Error refreshing gallery:', error);
      showNotification('Error al actualizar la galería', 'error');
    }
  };

  // Lazy loading para mejor rendimiento
  const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  }, observerOptions);

  // Prevenir zoom en doble tap en iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Mejorar experiencia táctil en móviles
  if (isMobile) {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .gallery-item:hover {
          transform: none !important;
          box-shadow: none !important;
        }
        .image-container:hover img {
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
});