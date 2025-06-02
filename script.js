document.addEventListener("DOMContentLoaded", () => {
  // Datos de la galería con fotografías reales adaptadas al contexto cristiano juvenil
  const galleryItems = [
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
    },
    {
      id: 4,
      type: "image",
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",
      category: "events",
      title: "Valentía Juvenil",
      description: "Líderes jóvenes con corazón de león",
      verse: "Josué 1:9"
    },
    {
      id: 5,
      type: "image",
      src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
      category: "service",
      title: "Río de Bendición",
      description: "Sirviendo con amor como agua viva",
      verse: "Juan 7:38"
    },
    {
      id: 6,
      type: "image",
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop",
      category: "worship",
      title: "Oleadas de Alabanza",
      description: "Adoración que llega hasta el trono",
      verse: "Apocalipsis 4:8"
    },
    {
      id: 7,
      type: "image",
      src: "https://images.unsplash.com/photo-1418065460487-3656888ac049?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1418065460487-3656888ac049?w=400&h=300&fit=crop",
      category: "fellowship",
      title: "Luz de Comunión",
      description: "Unidos en el amor de Cristo",
      verse: "1 Juan 1:7"
    },
    {
      id: 8,
      type: "image",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      category: "events",
      title: "Gloria del Amanecer",
      description: "Retiro juvenil al amanecer",
      verse: "Lamentaciones 3:23"
    },
    {
      id: 9,
      type: "image",
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop",
      category: "service",
      title: "Campo de Esperanza",
      description: "Sirviendo en la gran comisión",
      verse: "Mateo 28:19"
    },
    {
      id: 10,
      type: "image",
      src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=300&fit=crop",
      category: "fellowship",
      title: "Gracia y Elegancia",
      description: "Jóvenes creciendo en gracia",
      verse: "2 Pedro 3:18"
    },
    {
      id: 11,
      type: "image",
      src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=600&fit=crop",
      category: "events",
      title: "Cielo en la Tierra",
      description: "Campamento juvenil de verano",
      verse: "Mateo 6:10"
    },
    {
      id: 12,
      type: "image",
      src: "https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=400&h=400&fit=crop",
      category: "worship",
      title: "Presencia Celestial",
      description: "En Su presencia hay plenitud de gozo",
      verse: "Salmos 16:11"
    },
    {
      id: 13,
      type: "image",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      category: "service",
      title: "Fe que Mueve Montañas",
      description: "Jóvenes con fe inquebrantable",
      verse: "Mateo 17:20"
    },
    {
      id: 14,
      type: "image",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      category: "fellowship",
      title: "Manada de Líderes",
      description: "Entrenando la próxima generación",
      verse: "2 Timoteo 2:2"
    },
    {
      id: 15,
      type: "image",
      src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
      category: "events",
      title: "Roca de Salvación",
      description: "Firmes sobre la Roca eterna",
      verse: "Salmos 18:2"
    },
    {
      id: 16,
      type: "image",
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop",
      category: "worship",
      title: "Templo Viviente",
      description: "Adoración en espíritu y verdad",
      verse: "Juan 4:24"
    },
    {
      id: 17,
      type: "image",
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
      category: "service",
      title: "Aurora de Esperanza",
      description: "Llevando esperanza al mundo",
      verse: "Romanos 15:13"
    },
    {
      id: 18,
      type: "image",
      src: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?w=400&h=300&fit=crop",
      category: "fellowship",
      title: "Vuelo de Fe",
      description: "Elevándose en alas como águilas",
      verse: "Isaías 40:31"
    },
    {
      id: 19,
      type: "image",
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=600&fit=crop",
      category: "events",
      title: "Tesoros del Reino",
      description: "Descubriendo las riquezas de Cristo",
      verse: "Colosenses 2:3"
    },
    {
      id: 20,
      type: "image",
      src: "https://images.unsplash.com/photo-1418065460487-3656888ac049?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1418065460487-3656888ac049?w=400&h=400&fit=crop",
      category: "worship",
      title: "Jardín de Oración",
      description: "Tiempo íntimo con el Padre",
      verse: "Mateo 6:6"
    },
    {
      id: 21,
      type: "image",
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
      category: "fellowship",
      title: "Reflejo del Cielo",
      description: "Siendo imagen de Cristo",
      verse: "2 Corintios 3:18"
    },
    {
      id: 22,
      type: "image",
      src: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=1200&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=600&fit=crop",
      category: "service",
      title: "Rebaño del Pastor",
      description: "Cuidando los unos de los otros",
      verse: "Juan 10:11"
    },
    {
      id: 23,
      type: "image",
      src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800&h=800&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=400&fit=crop",
      category: "events",
      title: "Paraíso Encontrado",
      description: "Retiro espiritual de jóvenes",
      verse: "Apocalipsis 21:4"
    },
    {
      id: 24,
      type: "image",
      src: "https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=800&h=600&fit=crop",
      thumbnail: "https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=400&h=300&fit=crop",
      category: "fellowship",
      title: "Sendero de Vida",
      description: "Caminando en los caminos del Señor",
      verse: "Salmos 16:11"
    }
  ];

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

  let currentItemIndex = 0;
  let filteredItems = [...galleryItems];

  // Detectar si es dispositivo móvil
  const isMobile = window.innerWidth <= 768;

  // Actualizar contador de fotos
  photoCount.textContent = galleryItems.length;

  // Función para toggle del menú móvil
  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.contains('active');
    
    if (isActive) {
      // Cerrar menú
      mobileMenu.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    } else {
      // Abrir menú
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

  // Función para descargar imagen
  async function downloadImage(src, filename) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'jovenes-cristianos-photo.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
      // Fallback: abrir en nueva ventana
      window.open(src, '_blank');
    }
  }

  // Función para cargar la galería
  function loadGallery(category = "all") {
    galleryContainer.innerHTML = "";

    filteredItems = category === "all" 
      ? galleryItems 
      : galleryItems.filter(item => item.category === category);

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
          <div class="loading-placeholder w-full h-48 sm:h-64 rounded-2xl"></div>
          <img 
            src="${item.thumbnail}" 
            alt="${item.title}" 
            class="w-full h-auto object-cover rounded-2xl hidden"
            onload="this.classList.remove('hidden'); this.parentElement.querySelector('.loading-placeholder').style.display='none';"
            onerror="this.parentElement.querySelector('.loading-placeholder').innerHTML='<i class=\\'fas fa-image text-gray-400 text-4xl flex items-center justify-center h-full\\></i>';"
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
  }

  // Función para abrir modal
  function openModal(index) {
    currentItemIndex = index;
    updateModalContent();
    modal.classList.remove("opacity-0", "pointer-events-none");
    document.body.style.overflow = "hidden";
  }

  // Función para cerrar modal
  function closeModalHandler() {
    modal.classList.add("opacity-0", "pointer-events-none");
    document.body.style.overflow = "";
  }

  // Función para actualizar contenido del modal
  function updateModalContent() {
    const item = filteredItems[currentItemIndex];

    modalContent.innerHTML = `
      <img 
        src="${item.src}" 
        alt="${item.title}" 
        class="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
      >
    `;

    modalTitle.textContent = item.title;
    modalDescription.textContent = item.description;
    modalCounter.textContent = `${currentItemIndex + 1} / ${filteredItems.length}`;

    // Actualizar información del modal con versículo
    const modalInfo = document.getElementById("modal-info");
    modalInfo.innerHTML = `
      <h3 class="font-semibold mb-1">${item.title}</h3>
      <p class="text-sm opacity-80 mb-2">${item.description}</p>
      <p class="text-xs opacity-60 italic">"${item.verse}"</p>
    `;

    // Actualizar botón de descarga del modal
    downloadModal.onclick = () => downloadImage(item.src, `${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`);
  }

  // Navegación en modal
  function goToPrevItem() {
    currentItemIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length;
    updateModalContent();
  }

  function goToNextItem() {
    currentItemIndex = (currentItemIndex + 1) % filteredItems.length;
    updateModalContent();
  }

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
  closeModal.addEventListener("click", closeModalHandler);
  prevButton.addEventListener("click", goToPrevItem);
  nextButton.addEventListener("click", goToNextItem);

  // Cerrar modal al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler();
  });

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("opacity-0")) return;

    if (e.key === "Escape") closeModalHandler();
    else if (e.key === "ArrowLeft") goToPrevItem();
    else if (e.key === "ArrowRight") goToNextItem();
    else if (e.key === "d" || e.key === "D") {
      const item = filteredItems[currentItemIndex];
      downloadImage(item.src, `${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`);
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

  // Función global para descargar (accesible desde onclick)
  window.downloadImage = downloadImage;

  // Inicializar galería
  loadGallery();

  // Efecto parallax sutil en el header
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('header');
    if (scrolled > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.8)';
    }
  });

  // Manejar redimensionamiento de ventana
  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
      // Recargar galería con nuevo layout
      location.reload();
    }
  });

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

  // Aplicar lazy loading a las imágenes
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  // Mejorar experiencia táctil en móviles
  if (isMobile) {
    // Deshabilitar efectos hover en móviles
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

  // Prevenir zoom en doble tap en iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
});