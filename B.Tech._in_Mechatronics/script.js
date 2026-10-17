document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('admissionForm');
  const submitBtn = document.getElementById('submitBtn');
  const successMsg = document.getElementById('formSuccessMessage');
  const mobileInput = document.getElementById('mobileNumber');
  const navbarCollapse = document.getElementById('navbarContent');

  // Close mobile navbar on link click
  if (navbarCollapse) {
    const navLinks = navbarCollapse.querySelectorAll('.nav-link, .btn-nav-cta');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (navbarCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }

  // Format and restrict phone number input
  if (mobileInput) {
    mobileInput.addEventListener('input', function (e) {
      let val = e.target.value;
      // Allow only numbers, spaces, plus sign
      val = val.replace(/[^0-9+ ]/g, '');
      e.target.value = val;
    });
  }

  // Handle form submission with validation
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      // Add loading state to button
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Submitting...
      `;

      // Simulate submission delay
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Show success alert
        if (successMsg) {
          successMsg.classList.remove('d-none');
          // Reset form fields
          form.reset();
          form.classList.remove('was-validated');

          // Auto-hide alert after 6 seconds
          setTimeout(function () {
            successMsg.classList.add('d-none');
          }, 6000);
        }
      }, 1000);
    });
  }



  // ==========================================================================
  // Universal Smooth Scroll to Admission Form & Highlight Focus
  // ==========================================================================
  function scrollToAdmissionForm() {
    const enquiryCard = document.getElementById('enquiryCard') || document.querySelector('.enquiry-card') || document.getElementById('admissionForm');
    if (!enquiryCard) return;

    // 1. Close any open Bootstrap modal
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(function (m) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modalInst = bootstrap.Modal.getInstance(m);
        if (modalInst) modalInst.hide();
      }
    });

    // 2. Close mobile navbar if open
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    }

    // 3. Calculate position with navbar offset
    const navEl = document.querySelector('.site-navbar');
    const navHeight = navEl ? navEl.offsetHeight : 70;
    const cardRect = enquiryCard.getBoundingClientRect();
    const scrollTarget = window.pageYOffset + cardRect.top - navHeight - 16;
    const distance = Math.abs(window.pageYOffset - scrollTarget);

    // 4. Smooth scroll directly to the form
    window.scrollTo({
      top: Math.max(0, scrollTarget),
      behavior: 'smooth'
    });

    // Function to trigger glowing pulse and focus when arriving at form
    function triggerFormGlowAndFocus() {
      enquiryCard.classList.remove('enquiry-card-glow');
      void enquiryCard.offsetWidth; // Force CSS reflow to re-trigger animation
      enquiryCard.classList.add('enquiry-card-glow');

      const nameInput = document.getElementById('fullName');
      if (nameInput) {
        nameInput.focus({ preventScroll: true });
      }

      setTimeout(function () {
        enquiryCard.classList.remove('enquiry-card-glow');
      }, 2800);
    }

    // If already near form, trigger immediately
    if (distance < 300) {
      triggerFormGlowAndFocus();
    } else {
      // If scrolling from far down (like footer), trigger glow as it arrives at destination
      let arrived = false;
      const onArrive = function () {
        if (arrived) return;
        arrived = true;
        triggerFormGlowAndFocus();
      };

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', onArrive, { once: true });
      }
      // Estimated scroll duration fallback based on distance
      const fallbackDuration = Math.min(1300, Math.max(500, Math.round(distance * 0.12)));
      setTimeout(onArrive, fallbackDuration);
    }
  }

  // Delegated click listener: Any button or link targeting the form (including footer links)
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest(
      'a[href="#admissionForm"], ' +
      'a[href="#enquiryCard"], ' +
      '.floating-admissions-link, ' +
      '.floating-admissions-cta, ' +
      '.legal-link, ' +
      '.social-icon-btn, ' +
      '.btn-nav-cta, ' +
      '.btn-elig-banner-apply, ' +
      '.btn-faq-cta, ' +
      '.btn-prefooter-primary, ' +
      '.showcase-apply-link, ' +
      '.card-hover-btn, ' +
      '.btn-bento-view-more, ' +
      '[data-scroll-to="form"]'
    );

    if (trigger) {
      // Don't intercept the actual form submit button
      if (trigger.type === 'submit' || trigger.id === 'submitBtn') return;

      e.preventDefault();
      scrollToAdmissionForm();
      return;
    }

    // Also catch any generic empty hash anchor inside footer bottom bar or legal links wrap
    const legalOrFooterLink = e.target.closest('.legal-links-wrap a, .footer-bottom-bar a');
    if (legalOrFooterLink) {
      const href = legalOrFooterLink.getAttribute('href');
      if (!href || href === '#' || href === '#admissionForm') {
        e.preventDefault();
        scrollToAdmissionForm();
      }
    }
  });

  // Floating CTA: Hide on mobile when typing to prevent keyboard collision
  const floatingCta = document.getElementById('floatingAdmissionsCta');
  if (floatingCta) {
    document.addEventListener('focusin', function (e) {
      if (window.innerWidth < 992 && e.target.matches('input, select, textarea')) {
        floatingCta.classList.add('cta-hidden');
      }
    });

    document.addEventListener('focusout', function (e) {
      if (window.innerWidth < 992 && e.target.matches('input, select, textarea')) {
        setTimeout(function () {
          const active = document.activeElement;
          if (!active || !active.matches('input, select, textarea')) {
            floatingCta.classList.remove('cta-hidden');
          }
        }, 120);
      }
    });
  }

  // ==========================================================================
  // Interactive Domain Track Filters
  // ==========================================================================
  const filterPills = document.querySelectorAll('.domain-filter-group .filter-pill');
  const cardWrappers = document.querySelectorAll('.domain-card-wrapper');

  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      const filter = this.getAttribute('data-filter');

      // Update active pill styling
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      this.classList.add('active');

      // Animate card filtering
      cardWrappers.forEach(function (wrapper) {
        const category = wrapper.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          wrapper.style.display = '';
          setTimeout(function () {
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'scale(1)';
          }, 10);
        } else {
          wrapper.style.opacity = '0';
          wrapper.style.transform = 'scale(0.95)';
          setTimeout(function () {
            wrapper.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // ==========================================================================
  // Domain Showcase Interactive Hover (Highlights Section)
  // ==========================================================================
  const domainCards = document.querySelectorAll('.highlights-section .domain-card');
  const showcaseImage = document.getElementById('showcaseImage');
  const showcaseNumber = document.getElementById('showcaseNumber');
  const showcaseBadge = document.getElementById('showcaseBadge');
  const showcaseCategory = document.getElementById('showcaseCategory');
  const showcaseTitle = document.getElementById('showcaseTitle');
  const showcaseDesc = document.getElementById('showcaseDesc');
  const showcaseChips = document.getElementById('showcaseChips');

  const domainsData = {
    '01': {
      number: 'USP 01',
      title: 'Industry 4.0 Specialisations',
      category: 'SPECIALISED ELECTIVES',
      isFuturistic: true,
      image: 'images/aboutlab1.webp',
      desc: 'Specialised elective tracks covering Industry 4.0, Mechatronics in Medical, Material Manufacturing, and Testing domains.',
      chips: ['Industry 4.0', 'Medical Mechatronics', 'Manufacturing', 'Testing Domains']
    },
    '02': {
      number: 'USP 02',
      title: 'Advanced Upgraded Curriculum',
      category: 'ROBOTICS & AI',
      isFuturistic: true,
      image: 'images/aiimpact2.png',
      desc: 'Upgraded curriculum with Industrial Robotics, Advanced Automation, IIoT, AI, ML, NLP, and Computer Vision.',
      chips: ['Industrial Robotics', 'Advanced Automation', 'IIoT & AI/ML', 'Computer Vision']
    },
    '03': {
      number: 'USP 03',
      title: 'Interdisciplinary Engineering Foundation',
      category: 'INTERDISCIPLINARY',
      isFuturistic: true,
      image: 'images/aiimpact3.png',
      desc: 'Comprehensive interdisciplinary education spanning Mechanical, Electrical, Electronics, and Computer Engineering for complete engineering mastery.',
      chips: ['Mechanical', 'Electrical', 'Electronics', 'Computer Engineering']
    },
    '04': {
      number: 'USP 04',
      title: 'Top Global Industry Partners',
      category: 'INDUSTRY PARTNERS',
      isFuturistic: true,
      image: 'images/aiimpact4.jpg',
      desc: 'Industry-valued programme with active partnerships from Wipro PARI, Mercedes-Benz, Tech Mahindra, Volvo, and global leaders.',
      chips: ['Wipro PARI', 'Mercedes-Benz', 'Tech Mahindra', 'Volvo']
    }
  };

  let imageTransitionTimeout = null;

  function updateShowcase(domainId) {
    const data = domainsData[domainId];
    if (!data) return;

    // Update active class on cards
    domainCards.forEach(function (c) {
      const cardData = domainsData[c.getAttribute('data-domain-id')];
      if (cardData) {
        const cardTag = c.querySelector('.domain-pill-tag');
        const cardTitle = c.querySelector('.domain-name');
        const cardDesc = c.querySelector('.domain-brief');
        const cardFeature = c.querySelector('.domain-feature-badge');

        if (cardTag) cardTag.textContent = cardData.chips[0] || cardData.category;
        if (cardTitle) cardTitle.textContent = cardData.title;
        if (cardDesc) cardDesc.textContent = cardData.desc;
        if (cardFeature) cardFeature.textContent = cardData.chips[1] || '';
      }

      if (c.getAttribute('data-domain-id') === domainId) {
        c.classList.add('active-domain');
      } else {
        c.classList.remove('active-domain');
      }
    });

    // Smooth image transition
    if (showcaseImage && showcaseImage.getAttribute('src') !== data.image) {
      clearTimeout(imageTransitionTimeout);
      showcaseImage.style.opacity = '0.35';
      showcaseImage.style.transform = 'scale(1.05)';
      imageTransitionTimeout = setTimeout(function () {
        showcaseImage.src = data.image;
        showcaseImage.alt = data.title;
        showcaseImage.style.opacity = '1';
        showcaseImage.style.transform = 'scale(1)';
      }, 120);
    }

    if (showcaseNumber) showcaseNumber.textContent = data.number;
    if (showcaseCategory) showcaseCategory.textContent = data.category;
    if (showcaseTitle) showcaseTitle.textContent = data.title;
    if (showcaseDesc) showcaseDesc.textContent = data.desc;

    if (showcaseBadge) {
      if (data.isFuturistic) {
        showcaseBadge.style.display = 'inline-flex';
      } else {
        showcaseBadge.style.display = 'none';
      }
    }

    if (showcaseChips && Array.isArray(data.chips)) {
      showcaseChips.innerHTML = data.chips
        .map(function (chip) {
          return '<span class="showcase-chip">' + chip + '</span>';
        })
        .join('');
    }
  }

  domainCards.forEach(function (card) {
    const id = card.getAttribute('data-domain-id');

    card.addEventListener('mouseenter', function () {
      updateShowcase(id);
    });

    card.addEventListener('focus', function () {
      updateShowcase(id);
    });

    card.addEventListener('click', function () {
      updateShowcase(id);
    });
  });

  updateShowcase('01');

  // ==========================================================================
  // Skill-Based Learning Carousel - Infinite Auto-Running Loop
  // ==========================================================================
  const carouselTrack = document.getElementById('skillCarouselTrack');
  const btnPrev = document.getElementById('skillCarouselPrev');
  const btnNext = document.getElementById('skillCarouselNext');

  if (carouselTrack && btnPrev && btnNext) {
    const originalItems = Array.from(carouselTrack.querySelectorAll('.skill-carousel-item'));
    const count = originalItems.length;

    if (count > 0) {
      // 1. Create clones before and after for true seamless infinite loop
      const prependFrag = document.createDocumentFragment();
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        prependFrag.appendChild(clone);
      });
      carouselTrack.insertBefore(prependFrag, carouselTrack.firstChild);

      const appendFrag = document.createDocumentFragment();
      originalItems.forEach(item => {
        const clone = item.cloneNode(true);
        clone.classList.add('is-clone');
        clone.setAttribute('aria-hidden', 'true');
        appendFrag.appendChild(clone);
      });
      carouselTrack.appendChild(appendFrag);

      // Helper to calculate exact item width (including gap)
      function getItemWidth() {
        const firstItem = carouselTrack.querySelector('.skill-carousel-item');
        if (firstItem) {
          const style = window.getComputedStyle(carouselTrack);
          const gap = parseFloat(style.gap) || 24;
          return firstItem.getBoundingClientRect().width + gap;
        }
        return 340;
      }

      // Helper to get total width of one complete set of original cards
      function getSetWidth() {
        const allItems = carouselTrack.children;
        if (allItems.length >= count * 2) {
          return allItems[count].offsetLeft - allItems[0].offsetLeft;
        }
        return getItemWidth() * count;
      }

      // Instant jump without smooth scroll animation or visual disruption
      function jumpWithoutAnimation(targetScrollLeft) {
        carouselTrack.style.scrollBehavior = 'auto';
        carouselTrack.style.scrollSnapType = 'none';
        carouselTrack.scrollLeft = targetScrollLeft;
        void carouselTrack.offsetWidth; // Force reflow
        carouselTrack.style.scrollBehavior = '';
        carouselTrack.style.scrollSnapType = '';
      }

      // Set initial scroll position to start at original cards (index: count)
      function initPosition() {
        const setWidth = getSetWidth();
        if (setWidth > 0) {
          jumpWithoutAnimation(setWidth);
        }
      }

      // Initialize position on load
      initPosition();
      window.addEventListener('load', initPosition, { once: true });

      // Check boundary and silently wrap around when passing into clone zones
      function checkBoundary() {
        const setWidth = getSetWidth();
        if (setWidth <= 0) return;

        const currentScroll = carouselTrack.scrollLeft;
        // If scrolled past original set into appended clones:
        if (currentScroll >= setWidth * 2 - 20) {
          jumpWithoutAnimation(currentScroll - setWidth);
        }
        // If scrolled before original set into prepended clones:
        else if (currentScroll <= 20) {
          jumpWithoutAnimation(currentScroll + setWidth);
        }
      }

      // Settle detection for smooth infinite wrapping
      let scrollSettleTimer = null;
      carouselTrack.addEventListener('scroll', function () {
        clearTimeout(scrollSettleTimer);
        scrollSettleTimer = setTimeout(checkBoundary, 140);
      }, { passive: true });

      if ('onscrollend' in window) {
        carouselTrack.addEventListener('scrollend', checkBoundary);
      }

      // Smooth slide forward / backward
      function slideNext() {
        const itemWidth = getItemWidth();
        carouselTrack.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }

      function slidePrev() {
        const itemWidth = getItemWidth();
        carouselTrack.scrollBy({ left: -itemWidth, behavior: 'smooth' });
      }

      // Autoplay: runs infinitely every 3 seconds
      let autoPlayTimer = null;
      let isUserInteracting = false;
      const AUTOPLAY_INTERVAL = 3000;

      function startAutoPlay() {
        stopAutoPlay();
        if (isUserInteracting) return;
        autoPlayTimer = setInterval(function () {
          slideNext();
        }, AUTOPLAY_INTERVAL);
      }

      function stopAutoPlay() {
        if (autoPlayTimer) {
          clearInterval(autoPlayTimer);
          autoPlayTimer = null;
        }
      }

      // Button controls (infinite clicking, never disabled)
      btnNext.addEventListener('click', function () {
        stopAutoPlay();
        slideNext();
        startAutoPlay();
      });

      btnPrev.addEventListener('click', function () {
        stopAutoPlay();
        slidePrev();
        startAutoPlay();
      });

      // Hover pause on carousel track and buttons
      const pauseElements = [carouselTrack, btnPrev, btnNext];
      pauseElements.forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          isUserInteracting = true;
          stopAutoPlay();
        });
        el.addEventListener('mouseleave', function () {
          isUserInteracting = false;
          startAutoPlay();
        });
      });

      // Mouse drag to scroll
      let isMouseDown = false;
      let startX = 0;
      let scrollStart = 0;

      carouselTrack.addEventListener('mousedown', function (e) {
        isMouseDown = true;
        isUserInteracting = true;
        stopAutoPlay();
        carouselTrack.style.cursor = 'grabbing';
        carouselTrack.style.scrollSnapType = 'none';
        startX = e.pageX - carouselTrack.offsetLeft;
        scrollStart = carouselTrack.scrollLeft;
      });

      window.addEventListener('mouseup', function () {
        if (isMouseDown) {
          isMouseDown = false;
          isUserInteracting = false;
          carouselTrack.style.cursor = '';
          carouselTrack.style.scrollSnapType = '';
          checkBoundary();
          startAutoPlay();
        }
      });

      carouselTrack.addEventListener('mousemove', function (e) {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - carouselTrack.offsetLeft;
        const walk = (x - startX) * 1.4;
        carouselTrack.scrollLeft = scrollStart - walk;
      });

      // Touch interactions (mobile/tablet)
      carouselTrack.addEventListener('touchstart', function () {
        isUserInteracting = true;
        stopAutoPlay();
      }, { passive: true });

      carouselTrack.addEventListener('touchend', function () {
        isUserInteracting = false;
        checkBoundary();
        startAutoPlay();
      }, { passive: true });

      // Pause when tab is hidden, resume when visible
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          stopAutoPlay();
        } else if (!isUserInteracting) {
          startAutoPlay();
        }
      });

      // Recalculate on window resize
      window.addEventListener('resize', function () {
        checkBoundary();
      });

      // Start running automatically
      startAutoPlay();
    }
  }

  // ==========================================================================
  // Comparative Market Analysis Bento Grid - Scroll Entrance & Running Counter
  // ==========================================================================
  const bentoSection = document.getElementById('career-projection');
  if (bentoSection) {
    let hasAnimatedBento = false;

    function runBentoAnimations() {
      if (hasAnimatedBento) return;
      hasAnimatedBento = true;

      // 1. Running counter for Card 1 Experience Ladder
      const runningValues = bentoSection.querySelectorAll('.bento-running-val');
      runningValues.forEach(function (el) {
        const minTarget = parseFloat(el.getAttribute('data-min'));
        const maxTarget = parseFloat(el.getAttribute('data-max'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';

        if (isNaN(minTarget) || isNaN(maxTarget)) return;

        const duration = 1600;
        const startTime = performance.now();

        function updateRunningNumber(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3); // smooth ease out

          const currentMin = (easeOut * minTarget).toFixed(minTarget % 1 === 0 ? 0 : 1);
          const currentMax = (easeOut * maxTarget).toFixed(maxTarget % 1 === 0 ? 0 : 1);

          el.textContent = `${prefix}${currentMin}–${currentMax}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateRunningNumber);
          } else {
            // Final exact string
            const finalMin = minTarget % 1 === 0 ? minTarget : minTarget.toFixed(1);
            const finalMax = maxTarget % 1 === 0 ? maxTarget : maxTarget.toFixed(1);
            el.textContent = `${prefix}${finalMin}–${finalMax}${suffix}`;
          }
        }

        setTimeout(function () {
          requestAnimationFrame(updateRunningNumber);
        }, 300);
      });

      // 2. Running counter for Card 5 Donut Gauge ("3×")
      const donutVal = document.getElementById('bentoDonutVal');
      if (donutVal) {
        const target = parseFloat(donutVal.getAttribute('data-target')) || 3;
        const suffix = donutVal.getAttribute('data-suffix') || '×';
        const duration = 1400;
        const startTime = performance.now();

        function updateDonutCount(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(easeOut * target);

          donutVal.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateDonutCount);
          } else {
            donutVal.textContent = target + suffix;
          }
        }

        setTimeout(function () {
          requestAnimationFrame(updateDonutCount);
        }, 400);
      }
    }

    if ('IntersectionObserver' in window) {
      const bentoObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            bentoSection.classList.add('is-visible');
            runBentoAnimations();
            bentoObserver.unobserve(bentoSection);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px 50px 0px'
      });

      bentoObserver.observe(bentoSection);
    } else {
      bentoSection.classList.add('is-visible');
      runBentoAnimations();
    }
  }

  // ==========================================================================
  // About Aspects Section - Scroll Entrance & Running Numbers Counter
  // ==========================================================================
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const counters = aboutSection.querySelectorAll('.aspect-counter');
    let hasAnimated = false;

    function runAspectCounters() {
      if (hasAnimated) return;
      hasAnimated = true;

      counters.forEach(function (counter) {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        const duration = 2000; // ms
        const startTime = performance.now();

        function updateCount(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Quintic ease-out for ultra smooth slowdown
          const easeOut = 1 - Math.pow(1 - progress, 4);
          const current = Math.floor(easeOut * target);

          counter.textContent = current.toLocaleString('en-US');

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            counter.textContent = target.toLocaleString('en-US');
          }
        }

        requestAnimationFrame(updateCount);
      });
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            aboutSection.classList.add('is-visible');
            runAspectCounters();
            observer.unobserve(aboutSection);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      observer.observe(aboutSection);

      // Immediate check if section is already in viewport
      setTimeout(function () {
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          aboutSection.classList.add('is-visible');
          runAspectCounters();
        }
      }, 250);
    } else {
      aboutSection.classList.add('is-visible');
      runAspectCounters();
    }
  }

  // ==========================================================================
  // FAQs Section - Silky Smooth Accordion & Visual Switcher
  // ==========================================================================
  const faqItems = document.querySelectorAll('.faq-acc-item');
  const faqPhotoTall = document.getElementById('faqPhotoTall');
  const faqPhotoShort = document.getElementById('faqPhotoShort');
  const faqBadgeTall = document.getElementById('faqBadgeTall');
  const faqBadgeShort = document.getElementById('faqBadgeShort');
  const faqCaption = document.getElementById('faqVisualCaption');

  if (faqPhotoTall) {
    faqPhotoTall.addEventListener('error', function () {
      if (!this.src.includes('card-clinical-dietetics.webp')) {
        this.src = 'images/card-clinical-dietetics.webp';
      }
    });
  }
  if (faqPhotoShort) {
    faqPhotoShort.addEventListener('error', function () {
      if (!this.src.includes('card-human-nutrition.webp')) {
        this.src = 'images/card-human-nutrition.webp';
      }
    });
  }

  if (faqItems.length > 0) {
    faqItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        const isCurrentlyActive = this.classList.contains('is-active');

        // If clicking already open item, toggle it closed smoothly
        if (isCurrentlyActive) {
          this.classList.remove('is-active');
          const toggleBtn = this.querySelector('.faq-toggle-btn');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'bi bi-plus';
          }
          return;
        }

        // Close all items smoothly
        faqItems.forEach(function (other) {
          other.classList.remove('is-active');
          const toggleBtn = other.querySelector('.faq-toggle-btn');
          if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'bi bi-plus';
          }
        });

        // Activate selected item
        this.classList.add('is-active');
        const activeBtn = this.querySelector('.faq-toggle-btn');
        if (activeBtn) {
          activeBtn.setAttribute('aria-expanded', 'true');
          const activeIcon = activeBtn.querySelector('i');
          if (activeIcon) {
            activeIcon.className = 'bi bi-dash';
          }
        }

        // Cross-fade images & update tags smoothly
        const newTall = this.getAttribute('data-img-tall');
        const newShort = this.getAttribute('data-img-short');
        const newCaption = this.getAttribute('data-caption');
        const newBadgeTall = this.getAttribute('data-badge-tall');
        const newBadgeShort = this.getAttribute('data-badge-short');

        if (faqPhotoTall && newTall && !newTall.endsWith('/.webp')) {
          faqPhotoTall.style.opacity = '0.35';
          setTimeout(function () {
            faqPhotoTall.src = newTall;
            faqPhotoTall.style.opacity = '1';
            if (faqBadgeTall && newBadgeTall) {
              faqBadgeTall.innerHTML = `<i class="bi bi-check2-circle me-1"></i> ${newBadgeTall}`;
            }
          }, 150);
        }

        if (faqPhotoShort && newShort && !newShort.endsWith('/.webp')) {
          faqPhotoShort.style.opacity = '0.35';
          setTimeout(function () {
            faqPhotoShort.src = newShort;
            faqPhotoShort.style.opacity = '1';
            if (faqBadgeShort && newBadgeShort) {
              faqBadgeShort.innerHTML = `<i class="bi bi-award me-1"></i> ${newBadgeShort}`;
            }
          }, 150);
        }

        if (faqCaption && newCaption) {
          faqCaption.textContent = newCaption;
        }
      });
    });
  }
});




// ==========================================================================
// Career Track Cards - Direct Scroll to Admission Form (Modal Removed)
// ==========================================================================
const pillarCards = document.querySelectorAll('.interactive-pillar-card');
pillarCards.forEach(function (card) {
  card.addEventListener('click', function (e) {
    e.preventDefault();
    scrollToAdmissionForm();
  });
});
