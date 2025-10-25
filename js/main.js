/* main-optimized.js — Performance + A11Y + SEO-friendly behaviors
   - rAF-throttled scroll
   - Debounced resize + CSS var vh fix
   - Reduced-motion awareness
   - IntersectionObserver for counters/animations (fallback to Waypoints)
   - OwlCarousel tuned for CLS + lazy
   - Parallax disabled on mobile/reduced-motion
*/

(function (window, document, $) {
  "use strict";

  // ---------- Feature flags ----------
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var supportsIO = 'IntersectionObserver' in window;
  var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ---------- AOS (Animate On Scroll) ----------
  try {
    if (window.AOS) {
      AOS.init({
        duration: mqReduce.matches ? 0 : 800,
        easing: 'ease-out',
        once: true,
        offset: 80,
        disable: function () { return mqReduce.matches; }
      });
    }
  } catch (_) {}

  // ---------- Parallax (Stellar) ----------
  function initParallax() {
    if (!$.fn.stellar) return;
    if (mqReduce.matches || isTouch) return; // perf/a11y
    $(window).stellar({
      responsive: true,
      parallaxBackgrounds: true,
      parallaxElements: true,
      horizontalScrolling: false,
      hideDistantElements: false,
      scrollProperty: 'scroll'
    });
  }

  // ---------- Full-height utility with vh CSS var fix ----------
  function setVhVar() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }

  function applyFullHeight() {
    // If you add .js-fullheight in CSS: height: calc(var(--vh, 1vh) * 100);
    $('.js-fullheight').each(function () {
      this.style.height = 'calc(var(--vh, 1vh) * 100)';
    });
  }

  // ---------- Loader ----------
  function hideLoaderSoon() {
    var el = document.getElementById('ftco-loader');
    if (!el) return;
    requestAnimationFrame(function () { el.classList.remove('show'); });
  }

  // ---------- Scrollax ----------
  function initScrollax() {
    if ($ && $.Scrollax && !mqReduce.matches) {
      $.Scrollax();
    }
  }

  // ---------- Burger Menu visual toggle only ----------
  function initBurgerMenu() {
    $('body').on('click', '.js-fh5co-nav-toggle', function (event) {
      event.preventDefault();
      $(this).toggleClass('active');
    });
  }

  // ---------- One page smooth scroll (native, fallback to jQuery) ----------
  function initOnePageScroll() {
    $(document).on('click', '#ftco-nav a[href^="#"]', function (event) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 70;
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: top, behavior: 'smooth' });
      } else {
        $('html, body').animate({ scrollTop: top }, 500);
      }
    });
  }

  // ---------- Carousel (Owl) ----------
  function initCarousel() {
    if (!$.fn.owlCarousel) return;
    $('.home-slider').owlCarousel({
      items: 1,
      loop: true,
      margin: 0,
      lazyLoad: true,
      autoplay: !mqReduce.matches,
      autoplayTimeout: 5000,
      smartSpeed: 600,
      nav: false,
      dots: true,
      autoplayHoverPause: true,
      animateOut: mqReduce.matches ? undefined : 'fadeOut',
      animateIn: mqReduce.matches ? undefined : 'fadeIn',
      responsive: { 0: { items: 1 }, 600: { items: 1 }, 1000: { items: 1 } }
    });
  }

  // ---------- Navbar scroll state (rAF throttled + passive) ----------
  function initNavbarScroll() {
    var navbar = document.querySelector('.ftco_navbar');
    if (!navbar) return;
    var sd = document.querySelector('.js-scroll-wrap');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > 150) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled', 'sleep');
        if (st > 350) {
          navbar.classList.add('awake');
          if (sd) sd.classList.add('sleep');
        } else {
          navbar.classList.remove('awake');
          navbar.classList.add('sleep');
          if (sd) sd.classList.remove('sleep');
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Counters (IO fallback to Waypoints) ----------
  function initCounters() {
    var numbers = document.querySelectorAll('.number[data-number]');
    if (!numbers.length) return;

    function animateNumber(el, to, duration) {
      var start = 0, startTime = null;
      var step = function (t) {
        if (!startTime) startTime = t;
        var p = Math.min(1, (t - startTime) / duration);
        var val = Math.floor(p * (to - start) + start);
        el.textContent = val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    var trigger = function (target) {
      if (target.classList.contains('ftco-animated')) return;
      target.classList.add('ftco-animated');
      numbers.forEach(function (n) {
        var to = parseInt(n.getAttribute('data-number'), 10) || 0;
        animateNumber(n, to, mqReduce.matches ? 0 : 1200);
      });
    };

    if (supportsIO) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { trigger(e.target); obs.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -5% 0px', threshold: 0.25 });
      document.querySelectorAll('#section-counter, .hero-wrap, .ftco-counter, .ftco-about').forEach(function (el) { observer.observe(el); });
    } else if ($.fn.waypoint) {
      $('#section-counter, .hero-wrap, .ftco-counter, .ftco-about').waypoint(function (direction) {
        if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
          trigger(this.element);
        }
      }, { offset: '95%' });
    } else {
      // Fallback: trigger immediately
      trigger(document.body);
    }
  }

  // ---------- Content reveal (IO or fallback classes) ----------
  function initContentReveal() {
    var items = document.querySelectorAll('.ftco-animate');
    if (!items.length) return;

    function reveal(el) {
      el.classList.add('ftco-animated', 'fadeInUp');
    }

    if (supportsIO) {
      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); o.unobserve(e.target); }
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
      items.forEach(function (el) { obs.observe(el); });
    } else if ($.fn.waypoint) {
      $('.ftco-animate').waypoint(function (direction) {
        if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {
          reveal(this.element);
        }
      }, { offset: '95%' });
    } else {
      items.forEach(reveal);
    }
  }

  // ---------- Magnific Popup ----------
  function initMagnific() {
    if (!$.fn.magnificPopup) return;

    $('.image-popup').magnificPopup({
      type: 'image',
      closeOnContentClick: true,
      closeBtnInside: false,
      fixedContentPos: true,
      mainClass: 'mfp-no-margins mfp-with-zoom',
      gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] },
      image: { verticalFit: true },
      zoom: { enabled: !mqReduce.matches, duration: mqReduce.matches ? 0 : 250 }
    });

    $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
      disableOn: 700,
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
    });
  }

  // ---------- Init on DOM ready ----------
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    setVhVar();
    applyFullHeight();
    initParallax();
    hideLoaderSoon();
    initScrollax();
    initBurgerMenu();
    initOnePageScroll();
    initCarousel();
    initNavbarScroll();
    initCounters();
    initContentReveal();
    initMagnific();
  });

  // ---------- Resize (debounced) ----------
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setVhVar();
      applyFullHeight();
    }, 150);
  }, { passive: true });

  // React to reduced-motion changes dynamically
  if (mqReduce.addEventListener) {
    mqReduce.addEventListener('change', function () {
      // Reload AOS & carousel with updated motion prefs
      try { if (window.AOS) AOS.refreshHard(); } catch (_) {}
    });
  }

})(window, document, window.jQuery);
