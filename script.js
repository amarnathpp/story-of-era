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
    // Spring physics (lerp) for the ring cursor
    ringX += (mouseX - ringX) * ringSpeed;
    ringY += (mouseY - ringY) * ringSpeed;
    
    // Exact tracking for center dot
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
      cursorRing.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hovering');
    });
    el.addEventListener('mousedown', () => {
      cursorRing.classList.add('clicking');
    });
    el.addEventListener('mouseup', () => {
      cursorRing.classList.remove('clicking');
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
      document.body.style.overflow = isExpanded ? 'auto' : 'hidden'; // Lock scrolling
    };
    
    mobileToggle.addEventListener('click', toggleMenu);
    
    // Close overlay when clicking on a link
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
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before section enters screen fully
  };
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // Unobserve to keep performance highly optimized after initial entrance
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
  
  // Disable 3D tilt on mobile/tablets to prevent screen layout recalculation stutters
  if (!isTouchDevice && tiltElements.length > 0) {
    tiltElements.forEach(el => {
      const scaleFactor = parseFloat(el.getAttribute('data-tilt-scale')) || 1.03;
      const maxTilt = 10; // Max rotation degrees
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        
        // Calculate mouse relative coordinates within card (ranges from -1 to 1)
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Horizontal mouse movement rotates around Y axis, vertical rotates around X
        const rotateY = x * maxTilt * 2;
        const rotateX = -y * maxTilt * 2;
        
        // Inject smooth 3D transform matrices dynamically
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scaleFactor}, ${scaleFactor}, ${scaleFactor})`;
        el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
      });
      
      // Reset card position smoothly on mouse leave
      el.addEventListener('mouseleave', () => {
        el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }

  // --- 5. Portfolio Gallery Tab Filtering ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const gridItems = document.querySelectorAll('.grid-item');
  const portfolioGrid = document.querySelector('#portfolio-grid');
  
  if (filterButtons.length > 0 && gridItems.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle Active Tab Styling
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        // Filter elements smoothly
        gridItems.forEach(item => {
          if (filterValue === 'all' || item.classList.contains(filterValue)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
        
        // Re-trigger viewport calculations to avoid blank holes in reveal animations
        revealActiveElementsInViewport();
      });
    });
  }
  
  // Helper to trigger entrance animations immediately on remaining visible nodes
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
      // Keep boundaries
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentSlide = index;
      
      // Update Slide Positions and visibility
      const sliderContainer = document.getElementById('reviews-slider');
      if (sliderContainer) {
        sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      }
      
      // Update active states
      slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
      });
      
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    };
    
    // Control clicks
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
    
    // Auto Rotation every 8 seconds
    let autoRotate = setInterval(() => {
      updateSlider(currentSlide + 1);
    }, 8000);
    
    // Reset timer on manual navigation
    const resetTimer = () => {
      clearInterval(autoRotate);
      autoRotate = setInterval(() => {
        updateSlider(currentSlide + 1);
      }, 8000);
    };
    
    [prevBtn, nextBtn].forEach(btn => {
      if (btn) btn.addEventListener('click', resetTimer);
    });
    dots.forEach(dot => dot.addEventListener('click', resetTimer));
  }

  // --- 7. Aesthetic Underlined Contact Form Handling ---
  const contactForm = document.getElementById('contact-form');
  const successMessage = document.getElementById('form-success');
  
  if (contactForm && successMessage) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Stop default browser refresh
      
      // Visual feedback submit button transition
      const submitBtn = document.getElementById('form-submit');
      const submitText = submitBtn.querySelector('span');
      
      submitText.textContent = 'Submitting Inquiries...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;
      
      // Simulate API submit delay
      setTimeout(() => {
        // Fade Out Form Smoothly
        contactForm.style.transition = 'opacity 0.4s ease';
        contactForm.style.opacity = '0';
        
        setTimeout(() => {
          contactForm.style.display = 'none';
          
          // Display Elegant Success Alert
          successMessage.style.display = 'block';
          
          // Reset form fields
          contactForm.reset();
        }, 400);
        
      }, 1500);
    });
  }
  
  // Custom Magnet buttons movement tracker (gives subtle bounce to headers/CTAs)
  const magnets = document.querySelectorAll('.magnet-element');
  if (!isTouchDevice && magnets.length > 0) {
    magnets.forEach(m => {
      m.addEventListener('mousemove', (e) => {
        const rect = m.getBoundingClientRect();
        const mouseXRel = e.clientX - rect.left - rect.width / 2;
        const mouseYRel = e.clientY - rect.top - rect.height / 2;
        
        // Move element slightly towards cursor
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