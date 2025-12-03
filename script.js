$(document).ready(function() {

    // 1. Initialize AOS (Animate On Scroll) - disable on mobile for perf
    AOS.init({
        once: true,
        offset: 100,
        duration: 900,
        easing: 'ease-out-cubic',
        disable: 'mobile'
    });

    // 2. Preloader Logic
    // Fade out preloader after page loads OR after 3 seconds (whichever comes first)
    function hidePreloader() {
        $('.preloader').addClass('hide').fadeOut(800, function() {
            $(this).hide();
        });
    }
    
    $(window).on('load', hidePreloader);
    
    // Fallback: hide preloader after 3 seconds to prevent getting stuck
    setTimeout(hidePreloader, 3000);

    // 3. Navbar Transition on Scroll (use passive listener for better scroll performance)
    var onScroll = function() {
        if (window.scrollY > 50) {
            document.querySelector('header').classList.add('scrolled');
        } else {
            document.querySelector('header').classList.remove('scrolled');
        }
    };
    // Use passive option to avoid blocking main thread during scroll
    if (window.addEventListener) {
        window.addEventListener('scroll', onScroll, { passive: true });
    } else {
        // fallback to jQuery for very old browsers
        $(window).on('scroll', function() { onScroll(); });
    }

    // Detect touch / mobile-like input and reduced-motion preference
    var isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(hover: none)').matches);

    // 4. Custom Cursor Logic (only on non-touch devices)
    // Use requestAnimationFrame + transform to avoid layout thrash
    var cursorEl = document.querySelector('.cursor');
    var cursor2El = document.querySelector('.cursor2');

    if (!isTouch && cursorEl && cursor2El) {
        var mouseX = 0, mouseY = 0;
        var posX = 0, posY = 0;
        var pos2X = 0, pos2Y = 0;

        // Read-only mouse listener (doesn't block scrolling)
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function renderCursor() {
            // simple ease / lerp for smooth movement
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;
            pos2X += (mouseX - pos2X) * 0.08;
            pos2Y += (mouseY - pos2Y) * 0.08;

            // use transform (composite) to avoid layout/reflow
            cursorEl.style.transform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
            cursor2El.style.transform = 'translate3d(' + pos2X + 'px,' + pos2Y + 'px,0)';

            requestAnimationFrame(renderCursor);
        }

        requestAnimationFrame(renderCursor);

        // Hover effect for interactive elements (use native listeners)
        var hoverables = document.querySelectorAll('a, button, .service-box');
        hoverables.forEach(function(el) {
            el.addEventListener('mouseenter', function() { document.body.classList.add('hovered'); }, { passive: true });
            el.addEventListener('mouseleave', function() { document.body.classList.remove('hovered'); }, { passive: true });
        });
    } else {
        // Hide custom cursor on touch devices
        if (cursorEl) cursorEl.style.display = 'none';
        if (cursor2El) cursor2El.style.display = 'none';
    }

    // 5. Mobile Menu Toggle
    $('.hamburger').on('click', function() {
        $(this).toggleClass('active');
        $('.mobile-menu').toggleClass('active');
    });

    $('.m-link').on('click', function() {
        $('.hamburger').removeClass('active');
        $('.mobile-menu').removeClass('active');
    });

    // 6. WhatsApp Redirection
    $('.whatsapp-trigger').on('click', function(e) {
        e.preventDefault();
        var message = "Hi WeddingBellOdisha, I visited your website and I am interested in your photography services.";
        var phone = "917978325313"; 
        var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
        window.open(url, '_blank');
    });

    // 7. Lazy-load hero video when it becomes visible (saves initial bandwidth)
    var heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        var sourceEl = heroVideo.querySelector('source');
        var loadHeroVideo = function() {
            if (sourceEl && sourceEl.dataset && sourceEl.dataset.src && !sourceEl.src) {
                sourceEl.src = sourceEl.dataset.src;
                try { 
                    heroVideo.load(); 
                    heroVideo.play().catch(function(){
                        // Video failed to load or play, hide it
                        heroVideo.style.display = 'none';
                    }); 
                } catch (e) {
                    // Error loading video, hide it
                    heroVideo.style.display = 'none';
                }
            }
        };

        // Handle video errors
        heroVideo.addEventListener('error', function() {
            heroVideo.style.display = 'none';
        });

        sourceEl.addEventListener('error', function() {
            heroVideo.style.display = 'none';
        });

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        loadHeroVideo();
                        io.disconnect();
                    }
                });
            }, { rootMargin: '200px 0px' });
            io.observe(heroVideo);
        } else {
            // Fallback: load immediately
            loadHeroVideo();
        }
    }

    // --- Initialize Magnific Popup Gallery ---
    $('.popup-gallery').magnificPopup({
        delegate: 'a', // child items selector, by clicking on it popup will open
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0,1]
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
            titleSrc: function(item) {
                return item.el.find('img').attr('alt');
            }
        },
        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
            opener: function(openerElement) {
              return openerElement.is('img') ? openerElement : openerElement.find('img');
            }
        }
    });

});