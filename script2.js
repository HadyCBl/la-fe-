// Configuración del contador
class CountdownTimer {
  constructor() {
    this.initializeTimer()
    this.setupMobileMenu()
    this.startCountdown()
  }

  initializeTimer() {
    // Calcular la fecha objetivo (2 días y 3 horas desde ahora)
    const now = new Date()
    this.targetDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)

    // Elementos del DOM
    this.daysElement = document.getElementById("days")
    this.hoursElement = document.getElementById("hours")
    this.minutesElement = document.getElementById("minutes")
    this.secondsElement = document.getElementById("seconds")

    // Variables para detectar cambios
    this.previousValues = {
      days: null,
      hours: null,
      minutes: null,
      seconds: null,
    }
  }

  setupMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle")
    const mobileMenu = document.getElementById("mobile-menu")
    const mobileMenuOverlay = document.getElementById("mobile-menu-overlay")
    const hamburger = menuToggle.querySelector(".hamburger")

    const toggleMenu = () => {
      const isActive = mobileMenu.classList.contains("active")

      if (isActive) {
        // Cerrar menú
        mobileMenu.classList.remove("active")
        mobileMenuOverlay.classList.remove("active")
        hamburger.classList.remove("active")
        document.body.style.overflow = ""
      } else {
        // Abrir menú
        mobileMenu.classList.add("active")
        mobileMenuOverlay.classList.add("active")
        hamburger.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    }

    menuToggle.addEventListener("click", toggleMenu)
    mobileMenuOverlay.addEventListener("click", toggleMenu)

    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = mobileMenu.querySelectorAll("a")
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setTimeout(toggleMenu, 100)
      })
    })

    // Cerrar menú con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) {
        toggleMenu()
      }
    })
  }

  calculateTimeRemaining() {
    const now = new Date().getTime()
    const distance = this.targetDate.getTime() - now

    if (distance < 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        finished: true,
      }
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    return {
      days,
      hours,
      minutes,
      seconds,
      finished: false,
    }
  }

  formatNumber(number) {
    return number.toString().padStart(2, "0")
  }

  addPulseEffect(element) {
    element.classList.add("update")
    setTimeout(() => {
      element.classList.remove("update")
    }, 600)
  }

  updateDisplay(timeRemaining) {
    const { days, hours, minutes, seconds, finished } = timeRemaining

    // Actualizar días
    if (this.previousValues.days !== days) {
      this.daysElement.textContent = this.formatNumber(days)
      if (this.previousValues.days !== null) {
        this.addPulseEffect(this.daysElement)
      }
      this.previousValues.days = days
    }

    // Actualizar horas
    if (this.previousValues.hours !== hours) {
      this.hoursElement.textContent = this.formatNumber(hours)
      if (this.previousValues.hours !== null) {
        this.addPulseEffect(this.hoursElement)
      }
      this.previousValues.hours = hours
    }

    // Actualizar minutos
    if (this.previousValues.minutes !== minutes) {
      this.minutesElement.textContent = this.formatNumber(minutes)
      if (this.previousValues.minutes !== null) {
        this.addPulseEffect(this.minutesElement)
      }
      this.previousValues.minutes = minutes
    }

    // Actualizar segundos
    if (this.previousValues.seconds !== seconds) {
      this.secondsElement.textContent = this.formatNumber(seconds)
      if (this.previousValues.seconds !== null) {
        this.addPulseEffect(this.secondsElement)
      }
      this.previousValues.seconds = seconds
    }

    // Manejar cuando el contador termine
    if (finished) {
      this.handleCountdownFinished()
    }
  }

  handleCountdownFinished() {
    document.body.classList.add("countdown-finished")

    const titleElement = document.querySelector("h2")
    if (titleElement) {
      titleElement.textContent = "¡El retiro ha comenzado!"
      titleElement.style.color = "#10b981"
      titleElement.style.textShadow = "0 0 30px rgba(16, 185, 129, 0.5)"
    }

    this.showCelebration()
  }

  showCelebration() {
    const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"]

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div")
        confetti.style.cssText = `
          position: fixed;
          top: -10px;
          left: ${Math.random() * 100}%;
          width: 8px;
          height: 8px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 10px currentColor;
          animation: fall 4s linear forwards;
        `

        document.body.appendChild(confetti)

        setTimeout(() => {
          confetti.remove()
        }, 4000)
      }, i * 50)
    }
  }

  startCountdown() {
    // Actualización inicial
    const initialTime = this.calculateTimeRemaining()
    this.updateDisplay(initialTime)

    // Actualizar cada segundo
    this.intervalId = setInterval(() => {
      const timeRemaining = this.calculateTimeRemaining()
      this.updateDisplay(timeRemaining)

      if (timeRemaining.finished) {
        clearInterval(this.intervalId)
      }
    }, 1000)
  }

  // Método para limpiar el intervalo si es necesario
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
  }
}

// Agregar estilos de animación para el confetti
const style = document.createElement("style")
style.textContent = `
  @keyframes fall {
    0% {
      transform: translateY(-100vh) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Inicializar el contador cuando el DOM esté listo
let countdown // Declare the countdown variable here
document.addEventListener("DOMContentLoaded", () => {
  countdown = new CountdownTimer()

  // Limpiar el intervalo cuando la página se descarga
  window.addEventListener("beforeunload", () => {
    countdown.destroy()
  })
})

// Manejar cambios de visibilidad de la página para pausar/reanudar
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // La página está oculta, podrías pausar aquí si quisieras
    console.log("Página oculta")
  } else {
    // La página es visible de nuevo
    console.log("Página visible")
  }
})

// Función para manejar errores
window.addEventListener("error", (e) => {
  console.error("Error en el contador:", e.error)
})

// Función de utilidad para debugging
window.debugCountdown = () => {
  console.log("Estado del contador:", {
    targetDate: new Date(countdown.targetDate),
    timeRemaining: countdown.calculateTimeRemaining(),
  })
}
