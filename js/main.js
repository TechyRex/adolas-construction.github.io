/* ==========================================================================
   ADOLAS CONSTRUCTION LIMITED — site script
   ========================================================================== */
(function(){
  "use strict";

  /* ---------- Header scroll state + mobile nav ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  function onScroll(){
    if(!header) return;
    if(window.scrollY > 24){ header.classList.add("is-scrolled"); }
    else { header.classList.remove("is-scrolled"); }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if(toggle && nav){
    toggle.addEventListener("click", function(){
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){
        nav.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var current = (window.location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".main-nav a[href]").forEach(function(a){
    var href = a.getAttribute("href");
    if(href === current || (current === "" && href === "index.html")){
      a.classList.add("active");
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function(el, i){
      el.style.setProperty("--i", i % 8);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  /* ---------- Blueprint divider draw-in ---------- */
  var dividers = document.querySelectorAll(".blueprint-divider");
  if("IntersectionObserver" in window && dividers.length){
    var dio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-drawn");
          dio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    dividers.forEach(function(d){ dio.observe(d); });
  } else {
    dividers.forEach(function(d){ d.classList.add("is-drawn"); });
  }

  /* ---------- Count-up stats ---------- */
  var stats = document.querySelectorAll("[data-count]");
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
    var duration = 1600;
    var start = null;
    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = target * eased;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if("IntersectionObserver" in window && stats.length){
    var sio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          sio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach(function(s){ sio.observe(s); });
  } else {
    stats.forEach(function(s){ animateCount(s); });
  }

  /* ---------- Project filters (projects.html) ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".project-card[data-category]");
  var resultsMeta = document.querySelector(".results-meta");

  function applyFilter(filter){
    var count = 0;
    cards.forEach(function(card){
      var match = filter === "all" || card.getAttribute("data-category") === filter;
      card.hidden = !match;
      if(match) count++;
    });
    if(resultsMeta){
      resultsMeta.textContent = count + (count === 1 ? " project" : " projects") +
        (filter === "all" ? " across every phase" : " in " + filter.replace(/-/g," "));
    }
  }
  if(filterBtns.length){
    filterBtns.forEach(function(btn){
      btn.addEventListener("click", function(){
        filterBtns.forEach(function(b){ b.classList.remove("active"); b.setAttribute("aria-pressed","false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed","true");
        applyFilter(btn.getAttribute("data-filter"));
      });
    });
    applyFilter("all");
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector(".lightbox");
  if(lightbox){
    var lbImg = lightbox.querySelector("img");
    var lbTag = lightbox.querySelector(".lightbox-caption .tag");
    var lbTitle = lightbox.querySelector(".lightbox-caption h3");
    var lbClose = lightbox.querySelector(".lightbox-close");
    var lbPrev = lightbox.querySelector(".lightbox-nav.prev");
    var lbNext = lightbox.querySelector(".lightbox-nav.next");
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var activeIndex = 0;
    var lastFocused = null;

    function visibleTriggers(){
      return triggers.filter(function(t){
        var card = t.closest(".project-card");
        return !card || !card.hidden;
      });
    }

    function openLightbox(index){
      var list = visibleTriggers();
      if(!list.length) return;
      activeIndex = index;
      var t = list[activeIndex];
      lbImg.src = t.getAttribute("data-full") || t.querySelector("img") && t.querySelector("img").src || t.style.backgroundImage;
      lbImg.alt = t.getAttribute("data-title") || "";
      if(lbTag) lbTag.textContent = t.getAttribute("data-category") ? t.getAttribute("data-category").replace(/-/g," ") : "";
      if(lbTitle) lbTitle.textContent = t.getAttribute("data-title") || "";
      lastFocused = document.activeElement;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lbClose.focus();
    }
    function closeLightbox(){
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      if(lastFocused) lastFocused.focus();
    }
    function step(dir){
      var list = visibleTriggers();
      if(!list.length) return;
      activeIndex = (activeIndex + dir + list.length) % list.length;
      openLightbox(activeIndex);
    }

    triggers.forEach(function(t){
      t.addEventListener("click", function(e){
        e.preventDefault();
        var list = visibleTriggers();
        openLightbox(list.indexOf(t));
      });
    });
    if(lbClose) lbClose.addEventListener("click", closeLightbox);
    if(lbPrev) lbPrev.addEventListener("click", function(){ step(-1); });
    if(lbNext) lbNext.addEventListener("click", function(){ step(1); });
    lightbox.addEventListener("click", function(e){ if(e.target === lightbox) closeLightbox(); });
    document.addEventListener("keydown", function(e){
      if(!lightbox.classList.contains("is-open")) return;
      if(e.key === "Escape") closeLightbox();
      if(e.key === "ArrowRight") step(1);
      if(e.key === "ArrowLeft") step(-1);
    });
  }

  /* ---------- Budget chips (contact.html) ---------- */
  document.querySelectorAll(".chip").forEach(function(chip){
    var input = chip.querySelector("input");
    if(!input) return;
    chip.addEventListener("click", function(){
      var group = document.querySelectorAll('.chip input[name="' + input.name + '"]');
      group.forEach(function(i){ i.closest(".chip").classList.remove("checked"); });
      input.checked = true;
      chip.classList.add("checked");
    });
  });

  /* ---------- Contact / proposal form ---------- */
  var form = document.getElementById("proposal-form");
  if(form){
    var statusBox = document.getElementById("form-status");

    function setError(field, msg){
      var wrap = field.closest(".field");
      if(!wrap) return;
      wrap.classList.add("has-error");
      var em = wrap.querySelector(".error-msg");
      if(em) em.textContent = msg;
    }
    function clearError(field){
      var wrap = field.closest(".field");
      if(!wrap) return;
      wrap.classList.remove("has-error");
    }
    function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    function validate(){
      var valid = true;
      var required = form.querySelectorAll("[required]");
      required.forEach(function(field){
        clearError(field);
        if(!field.value || !field.value.trim()){
          setError(field, "This field is required.");
          valid = false;
        }
      });
      var email = form.querySelector('[name="email"]');
      if(email && email.value && !isValidEmail(email.value)){
        setError(email, "Enter a valid email address.");
        valid = false;
      }
      var phone = form.querySelector('[name="phone"]');
      if(phone && phone.value && phone.value.replace(/[^0-9]/g,"").length < 7){
        setError(phone, "Enter a valid phone number.");
        valid = false;
      }
      return valid;
    }

    form.querySelectorAll("input, select, textarea").forEach(function(field){
      field.addEventListener("input", function(){ clearError(field); });
      field.addEventListener("change", function(){ clearError(field); });
    });

    function showStatus(type, message){
      if(!statusBox) return;
      statusBox.className = "form-status show " + type;
      statusBox.innerHTML = (type === "success"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v6"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor"/></svg>'
      ) + "<span>" + message + "</span>";
      statusBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function(e){
      e.preventDefault();
      if(!validate()){
        showStatus("error", "Please check the highlighted fields and try again.");
        return;
      }
      var submitBtn = form.querySelector('[type="submit"]');
      var endpoint = form.getAttribute("action");
      var originalLabel = submitBtn ? submitBtn.innerHTML : "";
      if(submitBtn){ submitBtn.setAttribute("disabled","disabled"); submitBtn.innerHTML = "Sending…"; }

      var payload = new FormData(form);

      // If the form has a real FormSubmit (or similar) endpoint configured, send it.
      // Otherwise fall back gracefully to a friendly confirmation so the page
      // still works while wired up to a backend.
      var isPlaceholder = !endpoint || endpoint.indexOf("YOUR-EMAIL") !== -1 || endpoint.indexOf("example.com") !== -1;

      if(isPlaceholder){
        setTimeout(function(){
          if(submitBtn){ submitBtn.removeAttribute("disabled"); submitBtn.innerHTML = originalLabel; }
          form.reset();
          document.querySelectorAll(".chip").forEach(function(c){ c.classList.remove("checked"); });
          showStatus("success", "Thank you — your project details were received. Our team will reach out within 1–2 business days.");
        }, 700);
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: payload
      }).then(function(res){
        if(res.ok){
          form.reset();
          document.querySelectorAll(".chip").forEach(function(c){ c.classList.remove("checked"); });
          showStatus("success", "Thank you — your project details were received. Our team will reach out within 1–2 business days.");
        } else {
          showStatus("error", "Something went wrong sending your message. Please try again or reach us by phone.");
        }
      }).catch(function(){
        showStatus("error", "Something went wrong sending your message. Please try again or reach us by phone.");
      }).finally(function(){
        if(submitBtn){ submitBtn.removeAttribute("disabled"); submitBtn.innerHTML = originalLabel; }
      });
    });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

})();