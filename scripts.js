document.addEventListener("DOMContentLoaded", () => {
  // Datos de la galería con los medios originales
  const galleryItems = [
    {
      id: 1,
      type: "video",
      src: "https://static.cdn-luma.com/files/981e483f71aa764b/Company%20Thing%20Exported.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 2,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/WebGL%20Exported%20(1).mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "motion",
    },
    {
      id: 3,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Jitter%20Exported%20Poster.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "motion",
    },
    {
      id: 4,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Exported%20Web%20Video.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 5,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Logo%20Exported.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 6,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Animation%20Exported%20(4).mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "motion",
    },
    {
      id: 7,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Illustration%20Exported%20(1).mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 8,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Art%20Direction%20Exported.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 9,
      type: "video",
      src: "https://static.cdn-luma.com/files/58ab7363888153e3/Product%20Video.mp4",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 10,
      type: "image",
      src: "/placeholder.svg?height=800&width=600",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 11,
      type: "image",
      src: "/placeholder.svg?height=600&width=800",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "design",
    },
    {
      id: 12,
      type: "image",
      src: "/placeholder.svg?height=700&width=700",
      thumbnail: "/placeholder.svg?height=400&width=600",
      category: "motion",
    },
  ]

  // Referencias DOM
  const galleryContainer = document.getElementById("gallery-container")
  const filterButtons = document.querySelectorAll(".filter-btn")
  const modal = document.getElementById("gallery-modal")
  const modalContent = document.getElementById("modal-content")
  const closeModal = document.getElementById("close-modal")
  const prevButton = document.getElementById("prev-item")
  const nextButton = document.getElementById("next-item")

  let currentItemIndex = 0
  let filteredItems = [...galleryItems]

  // Función para cargar la galería
  function loadGallery(category = "all") {
    galleryContainer.innerHTML = ""

    filteredItems =
      category === "all"
        ? galleryItems
        : galleryItems.filter((item) => {
            if (category === "video") return item.type === "video"
            return item.category === category
          })

    filteredItems.forEach((item, index) => {
      const element = document.createElement("div")
      element.className = "gallery-item opacity-0 cursor-pointer"
      element.dataset.index = index

      // Altura aleatoria para crear un layout más dinámico
      const heights = ["h-64", "h-72", "h-80", "h-64"]
      const randomHeight = heights[Math.floor(Math.random() * heights.length)]

      if (item.type === "image") {
        element.innerHTML = `
          <div class="relative overflow-hidden rounded-xl shadow-lg group ${randomHeight}">
            <img src="${item.src}" alt="Imagen ${item.id}" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        `
      } else {
        element.innerHTML = `
          <div class="relative overflow-hidden rounded-xl shadow-lg group ${randomHeight}">
            <video src="${item.src}" class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" muted loop></video>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div class="w-16 h-16 rounded-full video-overlay flex items-center justify-center">
                <i class="fas fa-play text-gray-800 text-xl ml-1"></i>
              </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        `

        // Auto-reproducir video en hover
        const video = element.querySelector("video")
        element.addEventListener("mouseenter", () => video.play())
        element.addEventListener("mouseleave", () => video.pause())
      }

      // Animación de entrada con delay
      setTimeout(() => {
        element.classList.add("animate-in")
      }, index * 100)

      element.addEventListener("click", () => openModal(index))
      galleryContainer.appendChild(element)
    })
  }

  // Función para abrir modal
  function openModal(index) {
    currentItemIndex = index
    updateModalContent()
    modal.classList.remove("opacity-0", "pointer-events-none")
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar modal
  function closeModalHandler() {
    modal.classList.add("opacity-0", "pointer-events-none")
    document.body.style.overflow = ""

    const video = modalContent.querySelector("video")
    if (video) video.pause()
  }

  // Función para actualizar contenido del modal
  function updateModalContent() {
    const item = filteredItems[currentItemIndex]

    if (item.type === "image") {
      modalContent.innerHTML = `
        <img src="${item.src}" alt="Imagen ${item.id}" class="max-w-full max-h-full object-contain rounded-lg">
      `
    } else {
      modalContent.innerHTML = `
        <video src="${item.src}" controls autoplay class="max-w-full max-h-full object-contain rounded-lg"></video>
      `
    }
  }

  // Navegación en modal
  function goToPrevItem() {
    currentItemIndex = (currentItemIndex - 1 + filteredItems.length) % filteredItems.length
    updateModalContent()
  }

  function goToNextItem() {
    currentItemIndex = (currentItemIndex + 1) % filteredItems.length
    updateModalContent()
  }

  // Event Listeners
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Actualizar botones activos
      filterButtons.forEach((btn) => {
        btn.classList.remove("active", "bg-gray-900", "text-white")
        btn.classList.add("bg-white", "text-gray-600")
      })
      this.classList.add("active", "bg-gray-900", "text-white")
      this.classList.remove("bg-white", "text-gray-600")

      // Filtrar galería
      loadGallery(this.dataset.filter)
    })
  })

  closeModal.addEventListener("click", closeModalHandler)
  prevButton.addEventListener("click", goToPrevItem)
  nextButton.addEventListener("click", goToNextItem)

  // Cerrar modal al hacer clic fuera
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler()
  })

  // Navegación con teclado
  document.addEventListener("keydown", (e) => {
    if (modal.classList.contains("opacity-0")) return

    if (e.key === "Escape") closeModalHandler()
    else if (e.key === "ArrowLeft") goToPrevItem()
    else if (e.key === "ArrowRight") goToNextItem()
  })

  // Navegación suave
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({ behavior: "smooth" })

        // Actualizar navegación activa
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.remove("active")
        })
        this.classList.add("active")
      }
    })
  })

  // Inicializar
  loadGallery()
})
