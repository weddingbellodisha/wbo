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
    $(window).on('load', function() {
        $('.preloader').fadeOut(800);
    });

    // 3. Navbar Transition on Scroll
    $(window).on('scroll', function() {
        if ($(this).scrollTop() > 50) {
            $('header').addClass('scrolled');
        } else {
            $('header').removeClass('scrolled');
        }
    });

    // Detect touch / mobile-like input and reduced-motion preference
    var isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(hover: none)').matches);

    // 4. Custom Cursor Logic (only on non-touch devices)
    var cursor = $('.cursor');
    var cursor2 = $('.cursor2');

    if (!isTouch) {
        $(document).on('mousemove', function(e) {
            cursor.css({ left: e.clientX, top: e.clientY });
            cursor2.css({ left: e.clientX, top: e.clientY });
        });

        // Hover effect for links and buttons
        $('a, button, .service-box').on('mouseenter', function() {
            $('body').addClass('hovered');
        }).on('mouseleave', function() {
            $('body').removeClass('hovered');
        });
    } else {
        // Hide custom cursor on touch devices
        cursor.hide();
        cursor2.hide();
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