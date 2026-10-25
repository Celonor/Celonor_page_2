gsap.registerPlugin(ScrollTrigger);

/**
 * 0. UTILIDAD SPLITTEXT (Divide cada título en <span class="char">)
 */
function splitTextIntoChars(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el) => {
    if (window.SplitText) {
      new SplitText(el, { type: "chars", charsClass: "char" });
    } else {
      const text = el.textContent.trim();
      el.innerHTML = "";
      [...text].forEach((letter) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = letter === " " ? "\u00A0" : letter;
        el.appendChild(span);
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // 1. Dividir todos los títulos con [data-split="chars"] (incluyendo "Projects")
  splitTextIntoChars('[data-split="chars"]');

  const cards = gsap.utils.toArray(".project-card");
  const cardData = cards.map((card) => ({
    card,
    imgWrap: card.querySelector(".project-card__image-wrap"),
    chars: card.querySelectorAll(".project-card__title .char"),
    metaItems: card.querySelectorAll(".meta-item"),
    footer: card.querySelector(".project-card__footer"),
    indexEl: card.querySelector(".project-card__index"),
    btn: card.querySelector(".project-card__btn"),
    revealed: false,
  }));

  // Estado inicial de las 3 tarjetas horizontales (100% oculto debajo de su máscara)
  cardData.forEach(({ chars, metaItems, btn, indexEl }) => {
    gsap.set(chars, { yPercent: 125, y: 0, opacity: 0 });
    gsap.set(metaItems, { yPercent: 125, y: 0, opacity: 0 });
    gsap.set(btn, {
      opacity: 0,
      scale: 0.85,
      visibility: "hidden",
      pointerEvents: "none",
    });
    gsap.set(indexEl, { opacity: 1, visibility: "visible" });
  });

  // Selectores del Panel Editorial Derecho, Reel Vertical y Panel Negro
  const verticalReelTrack = document.getElementById("verticalReelTrack");
  const reelItemsGroup = document.getElementById("reelItemsGroup");
  const editorialTitleChars = gsap.utils.toArray("#editorialProjectsTitle .char");
  const editorialLines = gsap.utils.toArray(".editorial-line");
  const editorialNums = gsap.utils.toArray(".editorial-num");
  const editorialCats = gsap.utils.toArray(".editorial-cat");
  const editorialParagraph = document.getElementById("editorialParagraph");
  const blackSectionCover = document.getElementById("blackSectionCover");

  // Estados iniciales del Panel Editorial Derecho y Panel Negro
  gsap.set(editorialTitleChars, { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(editorialLines, { scaleX: 0, transformOrigin: "left center" });
  gsap.set([editorialNums, editorialCats], { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(editorialParagraph, { yPercent: 125, opacity: 0 });
  gsap.set(blackSectionCover, { xPercent: 100 });

  // Estado inicial del Logo Pequeño y Píldora de Menú (Inicia en 44px)
  const smallLogo = document.getElementById("smallAkaruLogo");
  const smallChars = gsap.utils.toArray(".small-char");
  const menuBtn = document.getElementById("menuBtn");
  const menuText = document.getElementById("menuText");
  const menuCircle = document.getElementById("menuCircle");

  gsap.set(smallChars, { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(menuBtn, { opacity: 0, width: 44, scale: 0.5 });
  gsap.set(menuText, { opacity: 0, x: 10 });
  gsap.set(menuCircle, { opacity: 0, scale: 0 });

  // =========================================================================
  // 1. PRELOADER (5 líneas blancas sobre fondo negro)
  // =========================================================================
  const preloaderTl = gsap.timeline();

  preloaderTl
    .fromTo(
      ".preloader__bars .bar",
      { scaleY: 0.25, opacity: 0 },
      {
        scaleY: 1,
        opacity: 1,
        duration: 0.65,
        stagger: 0.07,
        ease: "power3.out",
      }
    )
    .to(".preloader__bars .bar", {
      scaleY: 0.6,
      duration: 0.4,
      yoyo: true,
      repeat: 1,
      stagger: 0.05,
      ease: "sine.inOut",
    })
    .to(".preloader__bars .bar", {
      scaleY: 0,
      opacity: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: "power2.in",
    })
    .to(
      "#preloader",
      {
        yPercent: -100,
        duration: 0.85,
        ease: "expo.inOut",
        onComplete: () => {
          document.getElementById("preloader").style.display = "none";
        },
      },
      "-=0.15"
    );

  // =========================================================================
  // 2. REVELADO Y SALIDA DE TÍTULOS, METADATA, FOOTER Y UI FIJA SUPERIOR
  // =========================================================================
  function revealProjectText(index) {
    const item = cardData[index];
    if (item.revealed) return;
    item.revealed = true;

    gsap.killTweensOf([item.chars, item.metaItems, item.btn, item.indexEl, item.footer]);

    if (index === 2 && item.footer) {
      item.footer.classList.remove("is-reel-hidden");
      gsap.set([item.footer, item.indexEl], {
        opacity: 1,
        visibility: "visible",
      });
    }

    gsap.to(item.chars, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.045,
      ease: "sine.out",
      overwrite: true,
    });

    gsap.to(item.metaItems, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: "sine.out",
      overwrite: true,
    });

    gsap.set(item.btn, { visibility: "visible", pointerEvents: "auto" });
    gsap.to(item.btn, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
    });
  }

  function hideProjectTextDrop(index) {
    const item = cardData[index];
    if (!item.revealed) return;
    item.revealed = false;

    // BUG 1B FIX: Cancelar cualquier tween o stagger activo antes de bajar
    gsap.killTweensOf([item.chars, item.metaItems, item.btn, item.indexEl, item.footer]);

    // Salida simultánea (stagger: 0) con yPercent: 125 y opacity: 0 para no dejar letras colgadas
    gsap.to([item.chars, item.metaItems], {
      yPercent: 125,
      y: 0,
      opacity: 0,
      duration: 0.32,
      stagger: 0,
      ease: "power2.in",
      overwrite: true,
    });

    gsap.to(item.btn, {
      opacity: 0,
      scale: 0.85,
      duration: 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        if (!item.revealed) {
          gsap.set(item.btn, { visibility: "hidden", pointerEvents: "none" });
        }
      },
    });
  }

  // BUG 1A FIX: Control explícito para eliminar el "03" y desbloquear hovers del reel vertical
  let kirikoFooterHiddenForReel = false;

  function setKirikoFooterReelHidden(shouldHide) {
    if (kirikoFooterHiddenForReel === shouldHide) return;
    kirikoFooterHiddenForReel = shouldHide;

    const kItem = cardData[2];
    gsap.killTweensOf([kItem.footer, kItem.indexEl, kItem.btn]);

    if (shouldHide) {
      kItem.footer.classList.add("is-reel-hidden");
      gsap.set([kItem.footer, kItem.indexEl, kItem.btn], {
        opacity: 0,
        visibility: "hidden",
        pointerEvents: "none",
      });
    } else {
      kItem.footer.classList.remove("is-reel-hidden");
      gsap.set([kItem.footer, kItem.indexEl], {
        opacity: 1,
        visibility: "visible",
      });
      if (kItem.revealed) {
        gsap.set(kItem.btn, {
          opacity: 1,
           scale: 1,
          visibility: "visible",
          pointerEvents: "auto",
        });
      }
    }
  }

  // Fase 5: Revelado y salida sincronizada de "Projects", números (00-04), categorías y párrafo
  let editorialHeadingRevealed = false;

  function revealEditorialContent() {
    if (editorialHeadingRevealed) return;
    editorialHeadingRevealed = true;

    gsap.killTweensOf([
      editorialTitleChars,
      editorialNums,
      editorialCats,
      editorialParagraph,
    ]);

    gsap.to(editorialTitleChars, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: "sine.out",
      overwrite: true,
    });

    gsap.to(editorialNums, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.55,
      stagger: 0.06,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(editorialCats, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.55,
      stagger: 0.06,
      ease: "power3.out",
      overwrite: true,
    });

    gsap.to(editorialParagraph, {
      yPercent: 0,
      opacity: 1,
      duration: 0.65,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function hideEditorialContent() {
    if (!editorialHeadingRevealed) return;
    editorialHeadingRevealed = false;

    // BUG 1B FIX: Cancelar animaciones y delays pendientes antes de ocultar
    gsap.killTweensOf([
      editorialTitleChars,
      editorialNums,
      editorialCats,
      editorialParagraph,
    ]);

    // Forzar opacity: 0 y yPercent: 125 simultáneo (stagger: 0) para evitar que "cts" quede asomando
    gsap.to(editorialTitleChars, {
      yPercent: 125,
      y: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0,
      ease: "power2.in",
      overwrite: true,
    });

    gsap.to([editorialNums, editorialCats], {
      yPercent: 125,
      y: 0,
      opacity: 0,
      duration: 0.3,
      stagger: 0,
      ease: "power2.in",
      overwrite: true,
    });

    gsap.to(editorialParagraph, {
      yPercent: 125,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
  }

  // Control del Logo Pequeño y Píldora "MENU"
  let headerUIActive = false;

  function showHeaderUI() {
    if (headerUIActive) return;
    headerUIActive = true;

    smallLogo.style.pointerEvents = "auto";
    gsap.killTweensOf(smallChars);
    gsap.to(smallChars, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: {
        each: 0.045,
        from: "end",
      },
      overwrite: true,
    });

    menuBtn.style.pointerEvents = "auto";
    gsap.killTweensOf([menuBtn, menuText, menuCircle]);

    const pillTl = gsap.timeline();
    pillTl
      .to(menuBtn, {
        opacity: 1,
        scale: 1,
        width: 44,
        duration: 0.25,
        ease: "back.out(1.8)",
      })
      .to(menuBtn, {
        width: 148,
        duration: 0.42,
        ease: "power3.inOut",
      })
      .to(
        menuText,
        { opacity: 1, x: 0, duration: 0.28, ease: "power2.out" },
        "-=0.22"
      )
      .to(
        menuCircle,
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" },
        "-=0.25"
      );
  }

  function hideHeaderUI() {
    if (!headerUIActive) return;
    headerUIActive = false;

    smallLogo.style.pointerEvents = "none";
    gsap.killTweensOf(smallChars);
    gsap.to(smallChars, {
      yPercent: -120,
      y: 0,
      opacity: 0,
      duration: 0.35,
      ease: "power2.in",
      stagger: {
        each: 0.04,
        from: "end",
      },
      overwrite: true,
      onComplete: () => {
        if (!headerUIActive) {
          gsap.set(smallChars, { yPercent: 125, y: 0, opacity: 0 });
        }
      },
    });

    menuBtn.style.pointerEvents = "none";
    gsap.killTweensOf([menuBtn, menuText, menuCircle]);

    const hidePillTl = gsap.timeline();
    hidePillTl
      .to([menuText, menuCircle], {
        opacity: 0,
        duration: 0.18,
        ease: "power2.in",
      })
      .to(
        menuBtn,
        {
          width: 44,
          duration: 0.28,
          ease: "power3.inOut",
        },
        "-=0.1"
      )
      .to(menuBtn, {
        opacity: 0,
        scale: 0.5,
        duration: 0.2,
        ease: "power2.in",
      });
  }

  // =========================================================================
  // 3. TIMELINE MAESTRO (FASES 1 A 7 SINCRONIZADAS)
  // =========================================================================
  const track = document.getElementById("horizontalTrack");
  const mainWrapper = document.getElementById("mainWrapper");

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: mainWrapper,
      pin: true,
      scrub: 1.2,
      start: "top top",
      end: () => `+=${window.innerWidth * 6.8}`,
      invalidateOnRefresh: true,
      onUpdate: () => {
        const t = masterTl.time();

        // 1) Header fijo superior (t >= 0.88)
        if (t >= 0.88) {
          showHeaderUI();
        } else {
          hideHeaderUI();
        }

        // Contraste del logo fijo cuando el panel negro cubre la pantalla en Fase 7
        if (t >= 8.4) {
          gsap.to(smallChars, { color: "#ffffff", duration: 0.25, overwrite: "auto" });
        } else {
          gsap.to(smallChars, { color: "#121212", duration: 0.25, overwrite: "auto" });
        }

        // 2) Tarjeta 1 ("Megumin")
        if (t >= 0.24) {
          revealProjectText(0);
        } else {
          hideProjectTextDrop(0);
        }

        // 3) Tarjeta 2 ("Hatsune Miku")
        if (t >= 1.25) {
          revealProjectText(1);
        } else {
          hideProjectTextDrop(1);
        }

        // 4) Tarjeta 3 ("Kiriko"): visible en Fase 3, baja a su piso al iniciar la transición al reel (t >= 3.15)
        if (t >= 2.25 && t < 3.15) {
          revealProjectText(2);
        } else {
          hideProjectTextDrop(2);
        }

        // BUG 1A FIX: Ocultar por completo el footer de Kiriko ("03" + botón) en t >= 3.15
        if (t >= 3.15) {
          setKirikoFooterReelHidden(true);
        } else {
          setKirikoFooterReelHidden(false);
        }

        // 5) Fase 5: Revelado del Panel Editorial Derecho en t >= 4.2
        if (t >= 4.2) {
          revealEditorialContent();
        } else {
          hideEditorialContent();
        }
      },
    },
  });

  // -------------------------------------------------------------------------
  // FASE 1 (t: 0 -> 1): Sale el Hero (-50vw) y se expande Megumin (Tarjeta 1) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(track, { x: "-50vw", ease: "none", duration: 1 }, 0)
    .to(cardData[0].card, { width: "66vw", ease: "power2.out", duration: 1 }, 0)
    .to(
      cardData[0].imgWrap,
      { height: "66vh", marginTop: "0vh", ease: "power2.out", duration: 1 },
      0
    )
    .to(cardData[1].card, { width: "44vw", ease: "power2.out", duration: 1 }, 0)
    .to(
      cardData[1].imgWrap,
      { height: "46vh", marginTop: "13vh", ease: "power2.out", duration: 1 },
      0
    )
    .to(cardData[2].card, { width: "12vw", ease: "none", duration: 1 }, 0);

  // -------------------------------------------------------------------------
  // FASE 2 (t: 1 -> 2): Sale Megumin (-116vw) y se expande Hatsune Miku (Tarjeta 2) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(track, { x: "-116vw", ease: "none", duration: 1 }, 1)
    .to(cardData[1].card, { width: "66vw", ease: "power2.out", duration: 1 }, 1)
    .to(
      cardData[1].imgWrap,
      { height: "66vh", marginTop: "0vh", ease: "power2.out", duration: 1 },
      1
    )
    .to(cardData[2].card, { width: "44vw", ease: "power2.out", duration: 1 }, 1)
    .to(
      cardData[2].imgWrap,
      { height: "54vh", marginTop: "11vh", ease: "power2.out", duration: 1 },
      1
    );

  // -------------------------------------------------------------------------
  // FASE 3 (t: 2 -> 3): Sale Hatsune Miku (-182vw) y se expande Kiriko (Tarjeta 3) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(track, { x: "-182vw", ease: "none", duration: 1 }, 2)
    .to(cardData[2].card, { width: "66vw", ease: "power2.out", duration: 1 }, 2)
    .to(
      cardData[2].imgWrap,
      { height: "66vh", marginTop: "0vh", ease: "power2.out", duration: 1 },
      2
    );

  // -------------------------------------------------------------------------
  // FASE 4 (t: 2.85 -> 4.2): Crecen las líneas horizontales + Kiriko a 35vw y subida
  // -------------------------------------------------------------------------
  masterTl.to(
    editorialLines,
    {
      scaleX: 1,
      duration: 0.65,
      stagger: 0.08,
      ease: "power2.inOut",
    },
    2.85
  );

  masterTl
    .to(
      cardData[2].card,
      {
        width: "35vw",
        duration: 1.0,
        ease: "power2.inOut",
      },
      3.2
    )
    .to(
      cardData[2].imgWrap,
      {
        height: "45vh",
        duration: 1.0,
        ease: "power2.inOut",
      },
      3.2
    )
    .to(
      reelItemsGroup,
      {
        marginTop: "0vh",
        duration: 1.0,
        ease: "power2.inOut",
      },
      3.2
    )
    .to(
      verticalReelTrack,
      {
        y: "-45vh",
        duration: 1.0,
        ease: "none",
      },
      3.2
    );

  // -------------------------------------------------------------------------
  // FASE 5 (t: 4.2) & FASE 6 (t: 4.2 -> 7.4): Recorrido completo del reel vertical
  // -------------------------------------------------------------------------
  masterTl.to(
    verticalReelTrack,
    {
      y: "-287vh",
      duration: 3.2,
      ease: "none",
    },
    4.2
  );

  // -------------------------------------------------------------------------
  // FASE 7 (t: 7.6 -> 8.8): Entrada del Panel Negro (100vw x 100vh)
  // -------------------------------------------------------------------------
  masterTl
    .to(
      blackSectionCover,
      {
        xPercent: 0,
        duration: 1.2,
        ease: "none",
      },
      7.6
    )
    .to(
      cardData[2].card,
      {
        x: "-35vw",
        duration: 0.42,
        ease: "none",
      },
      8.38
    );

  // Click en el logo pequeño para volver suavemente al inicio
  smallLogo.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});