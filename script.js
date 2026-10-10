/**
 * TALA: ENTRE A TRADIÇÃO E A CIÊNCIA
 * Motor Interactivo de Apresentação Keynote (Visual Limpo & Alto Impacto)
 * Enfermeira Elsa • Angola
 */

class PresentationApp {
  constructor() {
    this.currentSlideIndex = 0;
    this.slides = document.querySelectorAll('.slide');
    this.totalSlides = this.slides.length;
    this.isMuted = false;
    this.audioCtx = null;

    // Elementos da Interface
    this.progressBar = document.getElementById('progress-bar');
    this.slideCounter = document.getElementById('slide-counter');
    this.prevBtn = document.getElementById('btn-prev');
    this.nextBtn = document.getElementById('btn-next');
    this.fullscreenBtn = document.getElementById('btn-fullscreen');
    this.gridBtn = document.getElementById('btn-grid');
    this.soundBtn = document.getElementById('btn-sound');
    this.themeBtn = document.getElementById('btn-theme');
    this.theme = localStorage.getItem('presentation_theme') || 'light';

    // Modais & Lightbox
    this.lightboxModal = document.getElementById('lightbox-modal');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxCaption = document.getElementById('lightbox-caption');
    this.lightboxClose = document.getElementById('lightbox-close');
    this.gridModal = document.getElementById('grid-modal');
    this.gridClose = document.getElementById('grid-close');
    this.gridContainer = document.getElementById('grid-thumbnails');

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.setupAudio();
    this.setupEventListeners();
    this.buildGridThumbnails();
    this.showSlide(0);
    this.setupLightboxTriggers();
    this.setupAccordionTriggers();
  }

  // Sintetizador de Áudio Táctil Clínico (Web Audio API)
  setupAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API não suportada neste browser');
    }
  }

  playClickSound(freq = 600, duration = 0.04) {
    if (this.isMuted || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playAlertSound() {
    if (this.isMuted || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, this.audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.35);
  }

  setupEventListeners() {
    // Teclado
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.showSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.showSlide(this.totalSlides - 1);
          break;
        case 'f':
        case 'F':
          this.toggleFullscreen();
          break;
        case 'g':
        case 'G':
          this.toggleGrid();
          break;
        case 'Escape':
          this.closeAllModals();
          break;
        case 't':
        case 'T':
          this.toggleTheme();
          break;
      }
    });

    // Controlos UI
    this.prevBtn?.addEventListener('click', () => this.prevSlide());
    this.nextBtn?.addEventListener('click', () => this.nextSlide());
    this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
    this.gridBtn?.addEventListener('click', () => this.toggleGrid());
    this.gridClose?.addEventListener('click', () => this.gridModal.classList.remove('active'));

    // Som & Tema
    this.themeBtn?.addEventListener('click', () => this.toggleTheme());

    this.soundBtn?.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.soundBtn.innerHTML = this.isMuted ? '🔇' : '🔊';
      if (!this.isMuted) this.playClickSound(800, 0.05);
    });

    // Fechar Lightbox
    this.lightboxClose?.addEventListener('click', () => {
      this.lightboxModal.classList.remove('active');
    });

    this.lightboxModal?.addEventListener('click', (e) => {
      if (e.target === this.lightboxModal) {
        this.lightboxModal.classList.remove('active');
      }
    });

    // Navegação Táctil Mobile (Swipe suave no ecrã do telemóvel)
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Se o movimento for predominantemente horizontal e superior a 45px
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
        if (diffX < 0) {
          this.nextSlide(); // Deslizar para a esquerda -> avança
        } else {
          this.prevSlide(); // Deslizar para a direita -> recua
        }
      }
    }, { passive: true });
  }

  showSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;

    this.slides[this.currentSlideIndex]?.classList.remove('active');
    this.currentSlideIndex = index;
    const current = this.slides[this.currentSlideIndex];
    current.classList.add('active');

    // No telemóvel, rola sempre para o início do novo slide
    current.scrollTop = 0;

    // Efeito Sonoro
    if (current.dataset.alert === 'true') {
      this.playAlertSound();
    } else {
      this.playClickSound(580 + index * 15, 0.04);
    }

    // Actualiza Barra de Progresso & Contador
    const progressPercent = ((index + 1) / this.totalSlides) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPercent}%`;
    }

    if (this.slideCounter) {
      const formattedCurrent = String(index + 1).padStart(2, '0');
      const formattedTotal = String(this.totalSlides).padStart(2, '0');
      this.slideCounter.textContent = `${formattedCurrent} / ${formattedTotal}`;
    }

    // Actualiza Selecção no Grid
    document.querySelectorAll('.thumb-card').forEach((card, idx) => {
      card.classList.toggle('current', idx === index);
    });
  }

  nextSlide() {
    if (this.currentSlideIndex < this.totalSlides - 1) {
      this.showSlide(this.currentSlideIndex + 1);
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.showSlide(this.currentSlideIndex - 1);
    }
  }

  toggleGrid() {
    this.gridModal?.classList.toggle('active');
    this.playClickSound(700, 0.03);
  }

  closeAllModals() {
    this.lightboxModal?.classList.remove('active');
    this.gridModal?.classList.remove('active');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Erro ao activar ecrã inteiro: ${err.message}`);
      });
      if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '⛶';
    } else {
      document.exitFullscreen();
      if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '🗖';
    }
    this.playClickSound(850, 0.05);
  }

  buildGridThumbnails() {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    this.slides.forEach((slide, idx) => {
      const titleEl = slide.querySelector('.slide-title');
      const title = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : `Diapositivo ${idx + 1}`;

      const card = document.createElement('div');
      card.className = `thumb-card ${idx === 0 ? 'current' : ''}`;
      card.innerHTML = `
        <div class="thumb-num">DIAPOSITIVO ${String(idx + 1).padStart(2, '0')}</div>
        <div class="thumb-title">${title}</div>
      `;

      card.addEventListener('click', () => {
        this.showSlide(idx);
        this.gridModal.classList.remove('active');
      });

      this.gridContainer.appendChild(card);
    });
  }

  setupLightboxTriggers() {
    const imagesWithZoom = document.querySelectorAll('[data-zoom]');
    imagesWithZoom.forEach(img => {
      img.addEventListener('click', () => {
        const src = img.getAttribute('src');
        const caption = img.getAttribute('data-caption') || img.getAttribute('alt') || '';
        
        if (this.lightboxImg) this.lightboxImg.src = src;
        if (this.lightboxCaption) this.lightboxCaption.textContent = caption;
        this.lightboxModal?.classList.add('active');
        this.playClickSound(750, 0.04);
      });
    });
  }

  setupAccordionTriggers() {
    const accordionHeaders = document.querySelectorAll('.acc-header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const item = header.parentElement;
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
        
        if (!isOpen) {
          item.classList.add('open');
          this.playClickSound(640, 0.03);
        }
      });
    });
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('presentation_theme', this.theme);
    this.applyTheme(this.theme);
    this.playClickSound(750, 0.05);
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      if (this.themeBtn) {
        this.themeBtn.innerHTML = '🌙';
        this.themeBtn.title = 'Mudar para Modo Claro (Tecla T)';
      }
    } else {
      document.body.removeAttribute('data-theme');
      if (this.themeBtn) {
        this.themeBtn.innerHTML = '☀️';
        this.themeBtn.title = 'Mudar para Modo Escuro (Tecla T)';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.presentation = new PresentationApp();
});
