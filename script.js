/**
 * ==========================================================================
 * CINEMATIC MINIMALIST PORTFOLIO — INTERACTIVE ENGINE (VANILLA JS)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Custom Fluid Cursor ---
  const cursorRing = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  
  let mouseX = 0, mouseY = 0; // Mouse coords
  let ringX = 0, ringY = 0;   // Ring coords (spring animation)
  let dotX = 0, dotY = 0;     // Dot coords
  
  const ringSpeed = 0.15; // Fluid lag speed
  const dotSpeed = 1.0;   // Pure follow speed
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Animation Loop for Cursor
  function animateCursor() {
    ringX += (mouseX - ringX) * ringSpeed;
    ringY += (mouseY - ringY) * ringSpeed;
    
    dotX += (mouseX - dotX) * dotSpeed;
    dotY += (mouseY - dotY) * dotSpeed;
    
    if (cursorRing && cursorDot) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
    }
    
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  
  // Add hovering classes for interactive elements
  const hoverables = document.querySelectorAll('a, button, .filter-btn, .portfolio-card, .form-input, .magnet-element');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if(cursorRing) cursorRing.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      if(cursorRing) cursorRing.classList.remove('hovering');
    });
    el.addEventListener('mousedown', () => {
      if(cursorRing) cursorRing.classList.add('clicking');
    });
    el.addEventListener('mouseup', () => {
      if(cursorRing) cursorRing.classList.remove('clicking');
    });
  });

  // --- 2. Mobile Responsive Nav Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  if (mobileToggle && mobileOverlay) {
    const toggleMenu = () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    };
    
    mobileToggle.addEventListener('click', toggleMenu);
    
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
    });
  }

  // --- 3. Scroll-Driven Reveal System (Intersection Observer) ---
  const sections = document.querySelectorAll('.reveal-section');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);
  
  sections.forEach(section => {
    revealObserver.observe(section);
  });

  // --- 4. Staggered 3D Tilt / Magnet Interaction ---
  const tiltElements = document.querySelectorAll('.tilt-element');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice && tiltElements.length > 0) {
    tiltElements.forEach(el => {
      const scaleFactor = parseFloat(el.getAttribute('data-tilt-scale')) || 1.03;
      const maxTilt = 10;
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        const rotateY = x * maxTilt * 2;
        const rotateX = -y * maxTilt * 2;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleFactor}, ${scaleFactor}, ${scaleFactor})`;
        el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  // --- 5. Portfolio Gallery Tab Filtering ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const gridItems = document.querySelectorAll('.grid-item');
  
  if (filterButtons.length > 0 && gridItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        gridItems.forEach(item => {
          if (filterValue === 'all' || item.classList.contains(filterValue)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
        
        revealActiveElementsInViewport();
      });
    });
  }
  
  function revealActiveElementsInViewport() {
    const visibleReveals = document.querySelectorAll('.reveal-section.reveal-active .reveal-item');
    visibleReveals.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  // --- 6. Custom Client Testimonial Slider ---
  const slides = document.querySelectorAll('.review-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  
  let currentSlide = 0;
  
  if (slides.length > 0) {
    const updateSlider = (index) => {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentSlide = index;
      
      const sliderContainer = document.getElementById('reviews-slider');
      if (sliderContainer) {
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
      
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });
      
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    };
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => updateSlider(currentSlide + 1));
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => updateSlider(currentSlide - 1));
    }
    
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        updateSlider(index);
      });
    });
    
    let autoRotate = setInterval(() => {
      updateSlider(currentSlide + 1);
    }, 8000);
    
    const resetTimer = () => {
      clearInterval(autoRotate);
      autoRotate = setInterval(() => {
        updateSlider(currentSlide + 1);
      }, 8000);
    };
    
    if (prevBtn) prevBtn.addEventListener('click', resetTimer);
    if (nextBtn) nextBtn.addEventListener('click', resetTimer);
    dots.forEach(dot => dot.addEventListener('click', resetTimer));
  }

  // --- 7. Aesthetic Contact Form Handling to WhatsApp ---
  const contactForm = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // പേജ് റീഫ്രഷ് ആകുന്നത് തടയുന്നു
      
      // ഇൻപുട്ടുകളിൽ നിന്നുള്ള വാല്യു എടുക്കുന്നു
      const name = document.getElementById('user-name').value;
      const email = document.getElementById('user-email').value;
      const message = document.getElementById('user-message').value;

      if (name.trim() === "" || email.trim() === "" || message.trim() === "") {
        alert("Please fill in all the fields before sending!");
        return;
      }

      // പ്ലസും സ്പേസും മാറ്റിയ കറക്റ്റ് വാട്സാപ്പ് നമ്പർ ഫോർമാറ്റ്
      const phoneNumber = "+91 9526335290"; 

      // വാട്സാപ്പ് ടെക്സ്റ്റ് മെസ്സേജ് ക്ലീൻ ഫോർമാറ്റിങ്
      // വാട്സാപ്പ് ടെക്സ്റ്റ് മെസ്സേജ് ക്ലീൻ ഫോർമാറ്റിങ് (Template Literals വഴി പുതിയ വരികളാക്കിയത്)
const text = `*New Portfolio Inquiry*\n\n` +
             `*Name:* ${name}\n` +
             `*Email:* ${email}\n` +
             `*Message:* ${message}`;

const whatsappMessage = encodeURIComponent(text);
      // const whatsappMessage = `*New Portfolio Inquiry*%0A%0A` +
      //                         `*Name:* ${encodeURIComponent(name)}%0A` +
      //                         `*Email:* ${encodeURIComponent(email)}%0A` +
      //                         `*Message:* ${encodeURIComponent(message)}`;

      // const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${whatsappMessage}`;

      // വിഷ്വൽ എഫക്റ്റ്: ബട്ടൺ ടെക്സ്റ്റ് മാറ്റുന്നു
      const submitBtn = document.getElementById('form-submit');
      const submitText = submitBtn.querySelector('span');
      
      if (submitText) submitText.textContent = 'Opening WhatsApp...';
      submitBtn.style.opacity = '0.7';

      // പുതിയ ടാബിൽ വാട്സാപ്പ് തുറക്കുന്നു
      window.open(whatsappURL, '_blank');

      // ഫോം ഹൈഡ് ചെയ്ത് 'Thank you' മെസ്സേജ് കാണിക്കുന്നു
      setTimeout(() => {
        contactForm.style.transition = 'opacity 0.4s ease';
        contactForm.style.opacity = '0';
        
        setTimeout(() => {
          contactForm.style.display = 'none';
          if (successMessage) successMessage.style.display = 'block';
          contactForm.reset();
        }, 400);
      }, 1000);
    });
  }
  
  // Custom Magnet buttons movement tracker (ടൈപ്പോ പൂർണ്ണമായി പരിഹരിച്ചത്)
  const magnets = document.querySelectorAll('.magnet-element');
  if (!isTouchDevice && magnets.length > 0) {
    magnets.forEach(m => {
      m.addEventListener('mousemove', (e) => {
        const rect = m.getBoundingClientRect();
        const mouseXRel = e.clientX - rect.left - rect.width / 2;
        const mouseYRel = e.clientY - rect.top - rect.height / 2;
        
        m.style.transform = `translate(${mouseXRel * 0.3}px, ${mouseYRel * 0.3}px)`;
        m.style.transition = 'transform 0.1s ease';
      });
      
      m.addEventListener('mouseleave', () => {
        m.style.transform = `translate(0px, 0px)`;
        m.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      });
    });
  }

});