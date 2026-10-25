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
  // 1. Dividir todos los títulos con [data-split="chars"]
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

  // Estado inicial de las 3 tarjetas horizontales
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

  // Selectores del Panel Editorial Derecho y Reel Vertical
  const verticalReelTrack = document.getElementById("verticalReelTrack");
  const reelItemsGroup = document.getElementById("reelItemsGroup");
  const editorialTitleChars = gsap.utils.toArray("#editorialProjectsTitle .char");
  const editorialLines = gsap.utils.toArray(".editorial-line");
  const editorialNums = gsap.utils.toArray(".editorial-num");
  const editorialCats = gsap.utils.toArray(".editorial-cat");
  const editorialParagraph = document.getElementById("editorialParagraph");

  // Selectores de la Sección Negra "Industry Awards" (#awardsSection)
  const awardsSection = document.getElementById("awardsSection");
  const awardsScrollTrack = document.getElementById("awardsScrollTrack");
  const awardsHeroImageWrap = document.getElementById("awardsHeroImageWrap");
  const awardsHeroImg = document.getElementById("awardsHeroImg");
  const awardsRevealItems = gsap.utils.toArray("[data-awards-reveal]");

  // Selectores de la Sección "Expertise" (#expertiseSection)
  const expertiseSection = document.getElementById("expertiseSection");
  const expertiseTitleChars = gsap.utils.toArray("#expertiseMainTitle .char");
  const expSlides = gsap.utils.toArray(".expertise-slide");
  const expImgWraps = expSlides.map((s) => s.querySelector(".expertise-slide__img-wrap"));
  const expImgs = expSlides.map((s) => s.querySelector(".expertise-slide__img"));
  const expTextItems = gsap.utils.toArray(".expertise-text-item");
  const expStepLabels = gsap.utils.toArray(".exp-step__label");
  const expertiseProgressBar = document.getElementById("expertiseProgressBar");

  // [AJUSTE 3] Geometría de las miniaturas del reel de Expertise.
  // El img-wrap ahora arranca en top:33vh (CSS). Las miniaturas "cuelgan" unos vh por
  // debajo de la imagen principal (antes 19vh / 26vh => tocaban el borde inferior).
  //  · EXP_THUMB: imagen del SIGUIENTE slide (franja grande asomando a la derecha)
  //  · EXP_STRIP: imagen del slide de DOS pasos (franja fina en el borde derecho)
  const EXP_THUMB = { x: "-41.8vw", y: "6vh", scale: 0.36 };
  const EXP_STRIP = { x: "-42.5vw", y: "9vh", scale: 0.14 };
  // [AJUSTE 3] Escala a la que se reduce la imagen saliente mientras la cubre el nuevo panel
  const EXP_EXIT_SCALE = 0.86;

  // Selectores de la Sección "About" (#aboutSection)
  const aboutSection = document.getElementById("aboutSection");
  const aboutScrollTrack = document.getElementById("aboutScrollTrack");
  const aboutTitleChars = gsap.utils.toArray("#aboutMainTitle .char");
  const aboutRevealItems = gsap.utils.toArray("[data-about-reveal]");
  const aboutImages = gsap.utils.toArray(".about-img");

  // Selectores de la Sección "Contact / Footer" (#contactSection)
  const contactSection = document.getElementById("contactSection");
  const contactScrollTrack = document.getElementById("contactScrollTrack");
  const contactRevealItems = gsap.utils.toArray("[data-contact-reveal]");
  const contactGiantLogo = document.getElementById("contactGiantLogo");
  const contactTitleMask = document.querySelector(".contact-title").closest(".contact-reveal-mask");

  // Estados iniciales del Panel Editorial Derecho
  gsap.set(editorialTitleChars, { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(editorialLines, { scaleX: 0, transformOrigin: "left center" });
  gsap.set([editorialNums, editorialCats], { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(editorialParagraph, { yPercent: 125, opacity: 0 });

  // Estados iniciales de la Sección "Industry Awards"
  gsap.set(awardsSection, { xPercent: 100 });
  gsap.set(awardsScrollTrack, { y: 0 });
  gsap.set(awardsHeroImageWrap, {
    xPercent: 120,
    x: 0,
    scale: 1.7,
    transformOrigin: "center center",
  });
  gsap.set(awardsHeroImg, {
    scale: 1.7,
    transformOrigin: "center center",
  });
  gsap.set(awardsRevealItems, { yPercent: 30, opacity: 0 });

  // Estados iniciales de la Sección "Expertise" (5 capas superpuestas con franjas laterales)
  gsap.set(expertiseSection, { yPercent: 100 });
  gsap.set(expertiseTitleChars, { yPercent: 120, opacity: 0 });
  gsap.set(expertiseProgressBar, { scaleX: 0.2, transformOrigin: "left center" });

  // Posicionamiento inicial de los 5 slides de Expertise (Slide 1 activo, 2 y 3 asomando a la derecha)
  gsap.set(expSlides[0], { xPercent: 0 });
  gsap.set(expSlides[1], { xPercent: 78 });
  gsap.set(expSlides[2], { xPercent: 94.5 });
  gsap.set(expSlides[3], { xPercent: 100 });
  gsap.set(expSlides[4], { xPercent: 100 });

  // Imágenes de Expertise: la 1 en posición central-derecha; de la 2 a la 5 recortadas en su franja
  gsap.set(expImgWraps[0], { x: "0vw", y: "0vh", scale: 1 });
  gsap.set(expImgs[0], { scale: 1 });

  // [AJUSTE 3] Slide 2 = miniatura grande; slides 3-5 = franja fina (valores unificados arriba)
  gsap.set(expImgWraps[1], { ...EXP_THUMB });
  gsap.set(expImgs[1], { scale: 1.08 });

  gsap.set(expImgWraps[2], { ...EXP_STRIP });
  gsap.set(expImgs[2], { scale: 1.08 });

  gsap.set(expImgWraps[3], { ...EXP_STRIP });
  gsap.set(expImgs[3], { scale: 1.08 });

  gsap.set(expImgWraps[4], { ...EXP_STRIP });
  gsap.set(expImgs[4], { scale: 1.08 });

  // Textos y etiquetas de progreso iniciales de Expertise (Slide 01 visible, 02-05 ocultos bajo máscara)
  expTextItems.forEach((item, idx) => {
    const els = item.querySelectorAll(".expertise-item__title, .expertise-item__tags");
    if (idx === 0) {
      gsap.set(els, { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(els, { yPercent: 120, opacity: 0 });
    }
  });

  expStepLabels.forEach((label, idx) => {
    if (idx === 0) {
      gsap.set(label, { yPercent: 0, opacity: 1 });
    } else {
      gsap.set(label, { yPercent: 120, opacity: 0 });
    }
  });

  // Estados iniciales de la Sección "About"
  gsap.set(aboutSection, { yPercent: 100 });
  gsap.set(aboutScrollTrack, { y: 0 });
  gsap.set(aboutTitleChars, { yPercent: 120, opacity: 0 });
  gsap.set(aboutRevealItems, { yPercent: 40, opacity: 0 });

  // Estados iniciales de la Sección "Contact / Footer"
  gsap.set(contactSection, { yPercent: 100 });
  gsap.set(contactScrollTrack, { y: 0 });
  gsap.set(contactRevealItems, { yPercent: 35, opacity: 0 });
  gsap.set(contactGiantLogo, { yPercent: 38 });

  // Estado inicial del Logo Pequeño y Píldora de Menú
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
  // 2. FUNCIONES DE REVELADO POR SECCIÓN Y UI FIJA SUPERIOR
  // =========================================================================
  function revealProjectText(index) {
    const item = cardData[index];
    if (item.revealed) return;
    item.revealed = true;

    gsap.killTweensOf([item.chars, item.metaItems, item.btn, item.indexEl, item.footer]);

    if (index === 2 && item.footer && !kirikoFooterHiddenForReel) {
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

    if (index !== 2 || !kirikoFooterHiddenForReel) {
      gsap.set(item.btn, { visibility: "visible", pointerEvents: "auto" });
      gsap.to(item.btn, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }

  function hideProjectTextDrop(index) {
    const item = cardData[index];
    if (!item.revealed) return;
    item.revealed = false;

    gsap.killTweensOf([item.chars, item.metaItems, item.btn, item.indexEl, item.footer]);

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

  // Fase 5: Panel Editorial ("Projects")
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

    gsap.killTweensOf([
      editorialTitleChars,
      editorialNums,
      editorialCats,
      editorialParagraph,
    ]);

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

  // Fase 7: Cabecera "Industry Awards"
  let awardsHeaderRevealed = false;

  function revealAwardsHeader() {
    if (awardsHeaderRevealed) return;
    awardsHeaderRevealed = true;

    gsap.killTweensOf(awardsRevealItems);
    gsap.to(awardsRevealItems, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.07,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function hideAwardsHeader() {
    if (!awardsHeaderRevealed) return;
    awardsHeaderRevealed = false;

    gsap.killTweensOf(awardsRevealItems);
    gsap.to(awardsRevealItems, {
      yPercent: 30,
      opacity: 0,
      duration: 0.32,
      stagger: 0,
      ease: "power2.in",
      overwrite: true,
    });
  }

  // Fase 10: Título Fijo "Expertise" y Control de Textos / Barra 01-05
  let expertiseTitleRevealed = false;

  function revealExpertiseTitle() {
    if (expertiseTitleRevealed) return;
    expertiseTitleRevealed = true;

    gsap.killTweensOf(expertiseTitleChars);
    gsap.to(expertiseTitleChars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.035,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function hideExpertiseTitle() {
    if (!expertiseTitleRevealed) return;
    expertiseTitleRevealed = false;

    gsap.killTweensOf(expertiseTitleChars);
    gsap.to(expertiseTitleChars, {
      yPercent: 120,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
  }

  let currentExpertiseIndex = 0;

  function setActiveExpertiseSlide(activeIndex) {
    if (currentExpertiseIndex === activeIndex) return;
    currentExpertiseIndex = activeIndex;

    // Crossfade y desplazamiento vertical con máscara de los títulos y tags
    expTextItems.forEach((item, idx) => {
      const els = item.querySelectorAll(".expertise-item__title, .expertise-item__tags");
      gsap.killTweensOf(els);

      if (idx === activeIndex) {
        item.classList.add("is-active");
        gsap.fromTo(
          els,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.48,
            stagger: 0.06,
            ease: "power3.out",
            overwrite: true,
          }
        );
      } else {
        item.classList.remove("is-active");
        gsap.to(els, {
          yPercent: -110,
          opacity: 0,
          duration: 0.28,
          ease: "power2.in",
          overwrite: true,
        });
      }
    });

    // Etiquetas acumulativas en la barra inferior (01, 01+02, 01+02+03, etc.)
    expStepLabels.forEach((label, idx) => {
      gsap.killTweensOf(label);
      if (idx <= activeIndex) {
        gsap.to(label, {
          yPercent: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
      } else {
        gsap.to(label, {
          yPercent: 120,
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
          overwrite: true,
        });
      }
    });
  }

  // Fase 15: Cabecera "About"
  let aboutHeaderRevealed = false;

  function revealAboutHeader() {
    if (aboutHeaderRevealed) return;
    aboutHeaderRevealed = true;

    gsap.killTweensOf([aboutTitleChars, aboutRevealItems]);
    gsap.to(aboutTitleChars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.04,
      ease: "power3.out",
      overwrite: true,
    });
    gsap.to(aboutRevealItems, {
      yPercent: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.07,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function hideAboutHeader() {
    if (!aboutHeaderRevealed) return;
    aboutHeaderRevealed = false;

    gsap.killTweensOf([aboutTitleChars, aboutRevealItems]);
    gsap.to([aboutTitleChars, aboutRevealItems], {
      yPercent: 120,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      overwrite: true,
    });
  }

  // Fase 17: Cabecera "Contact"
  let contactHeaderRevealed = false;

  function revealContactHeader() {
    if (contactHeaderRevealed) return;
    contactHeaderRevealed = true;

    gsap.killTweensOf(contactRevealItems);
    gsap.to(contactRevealItems, {
      yPercent: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.08,
      ease: "power3.out",
      overwrite: true,
    });
  }

  function hideContactHeader() {
    if (!contactHeaderRevealed) return;
    contactHeaderRevealed = false;

    gsap.killTweensOf(contactRevealItems);
    gsap.to(contactRevealItems, {
      yPercent: 35,
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
  // 3. TIMELINE MAESTRO (FASES 1 A 18 SINCRONIZADAS Y SIN ZONAS MUERTAS)
  // =========================================================================
  const track = document.getElementById("horizontalTrack");
  const mainWrapper = document.getElementById("mainWrapper");

  // -------------------------------------------------------------------------
  // [AJUSTE 8] TIMING DE EXPERTISE / ABOUT / CONTACT (más corto y reactivo)
  //   Unidades = unidades de la timeline. Las fases 1-10 NO se tocan.
  //   Antes: Expertise 4 x 1.4 | About entra 1.3 + recorre 2.9 | Contact 1.3 + 1.6
  //   Ahora: Expertise 4 x 0.9 | About entra 1.0 + recorre 1.8 | Contact 1.2 + 1.0
  //   La distancia de scroll por unidad se mantiene igual que antes (14.5 / 26.35 de
  //   ancho de ventana por unidad) para que las secciones intactas se sientan igual.
  // -------------------------------------------------------------------------
  const EXP_START = 13.65;
  const EXP_DUR = 0.9; // cada transición 01->02, 02->03... (antes 1.4)
  const EXP_PHASE_START = [0, 1, 2, 3].map((i) => EXP_START + i * EXP_DUR);
  const EXP_END = EXP_START + 4 * EXP_DUR; // 17.25

  const ABOUT_ENTER_START = EXP_END; // 17.25
  const ABOUT_ENTER_DUR = 1.0; // antes 1.3
  const ABOUT_SCROLL_START = ABOUT_ENTER_START + ABOUT_ENTER_DUR; // 18.25
  const ABOUT_SCROLL_DUR = 1.8; // antes 2.9 (el contenido avanzaba a ~0.5x del scroll)
  // [AJUSTE 4] +20vh de recorrido para dejar a la vista el aire extra bajo 2023 / 2026
  const ABOUT_SCROLL_Y = "-148vh"; // antes -128vh
  const ABOUT_EXIT_Y = "-235vh"; // antes -215vh (mismo delta de 87vh)

  const CONTACT_ENTER_START = ABOUT_SCROLL_START + ABOUT_SCROLL_DUR; // 20.05
  const CONTACT_ENTER_DUR = 1.2; // antes 1.3
  const CONTACT_RISE_START = CONTACT_ENTER_START + CONTACT_ENTER_DUR; // 21.25
  const CONTACT_RISE_DUR = 1.0; // antes 1.6
  const TIMELINE_END = CONTACT_RISE_START + CONTACT_RISE_DUR; // 22.25

  const SCROLL_W_PER_UNIT = 14.5 / 26.35; // anchos de ventana de scroll por unidad (igual que antes)

  // -------------------------------------------------------------------------
  // [AJUSTE 2] Instante exacto del cambio de texto/indicador en Expertise.
  // El panel entrante recorre xPercent: start -> 0 en EXP_DUR (ease none). El cambio
  // se dispara cuando su borde izquierdo llega a (borde derecho de la "E" + margen):
  // un poco antes de tocar la E. Se mide la E real, así funciona en cualquier tamaño.
  // -------------------------------------------------------------------------
  const EXP_INCOMING_START_X = [78, 80, 82, 84]; // xPercent inicial del panel entrante en cada fase
  let expSwitchTimes = EXP_PHASE_START.map((t0) => t0 + EXP_DUR * 0.78); // valor de respaldo

  function computeExpertiseSwitchTimes() {
    const W = window.innerWidth;
    const eChar = expertiseTitleChars[0];
    if (!eChar) return;
    const eRight = eChar.getBoundingClientRect().right; // borde derecho de la "E"
    const gap = W * 0.012; // margen "justo antes de tocar"
    expSwitchTimes = EXP_PHASE_START.map((t0, i) => {
      const startX = (EXP_INCOMING_START_X[i] / 100) * W; // borde izquierdo inicial del panel (px)
      const p = 1 - (eRight + gap) / startX; // progreso de la fase en que llega a ese punto
      return t0 + EXP_DUR * gsap.utils.clamp(0.05, 0.95, p);
    });
  }

  // -------------------------------------------------------------------------
  // [AJUSTE 7] Layout de la sección final: logo colosal ajustado al ancho y
  // altura del track calculada para que el scroll termine con el logo pegado
  // al borde inferior de la ventana y la frase fuera de pantalla.
  // -------------------------------------------------------------------------
  function fitGiantLogo() {
    const spans = contactGiantLogo.querySelectorAll("span");
    const available = contactGiantLogo.clientWidth;
    if (!available) return;
    contactGiantLogo.style.setProperty("--giant-fs", "100px");
    let sum = 0;
    spans.forEach((sp) => (sum += sp.getBoundingClientRect().width));
    if (!sum) return;
    let fs = (100 * available * 0.995) / sum; // llena el ancho disponible
    fs = Math.min(fs, window.innerHeight * 0.77); // tope por altura (pantallas muy anchas y bajas)
    contactGiantLogo.style.setProperty("--giant-fs", fs.toFixed(2) + "px");
  }

  function layoutContactSection() {
    fitGiantLogo();
    contactScrollTrack.style.minHeight = "0px";
    // alto que ocupa la frase (hasta el final de su máscara) medido desde el techo del track
    const rel =
      contactTitleMask.getBoundingClientRect().bottom -
      contactScrollTrack.getBoundingClientRect().top;
    // track = ventana + frase  =>  al desplazar (track - ventana) la frase sale justo por arriba
    contactScrollTrack.style.minHeight = window.innerHeight + rel + 12 + "px";
  }

  layoutContactSection();
  computeExpertiseSwitchTimes();
  ScrollTrigger.addEventListener("refreshInit", () => {
    layoutContactSection();
    computeExpertiseSwitchTimes();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: mainWrapper,
      pin: true,
      scrub: 0.6, // [AJUSTE 8] antes 1: respuesta más inmediata a la rueda
      start: "top top",
      end: () => "+=" + window.innerWidth * SCROLL_W_PER_UNIT * TIMELINE_END,
      invalidateOnRefresh: true,
      onUpdate: () => {
        const t = masterTl.time();

        // 1) Header fijo superior (t >= 0.88)
        if (t >= 0.88) {
          showHeaderUI();
        } else {
          hideHeaderUI();
        }

        // [AJUSTE 1] ELIMINADO el tween que forzaba color #ffffff / #121212 por scroll.
        // El contraste del logo fijo lo resuelve ahora CSS (mix-blend-mode: difference),
        // letra a letra y píxel a píxel, sin depender de la posición del scroll.

        // 2) Tarjetas de Proyectos (01 Megumin, 02 Hatsune Miku, 03 Kiriko)
        if (t >= 0.24) revealProjectText(0);
        else hideProjectTextDrop(0);

        if (t >= 1.25) revealProjectText(1);
        else hideProjectTextDrop(1);

        if (t >= 2.25) revealProjectText(2);
        else hideProjectTextDrop(2);

        if (t >= 3.85) setKirikoFooterReelHidden(true);
        else setKirikoFooterReelHidden(false);

        // 3) Panel Editorial "Projects" (t >= 4.2)
        if (t >= 4.2) revealEditorialContent();
        else hideEditorialContent();

        // 4) Cabecera "Industry Awards" (t >= 8.35)
        if (t >= 8.35) revealAwardsHeader();
        else hideAwardsHeader();

        // 5) Título y Slides activos de "Expertise" (Fases 10 a 14)
        if (t >= 13.0) revealExpertiseTitle();
        else hideExpertiseTitle();

        // [AJUSTE 2] El texto/indicador cambia cuando el borde izquierdo del panel
        // entrante está justo por delante de la "E" del título (expSwitchTimes se calcula
        // midiendo la E real, ver computeExpertiseSwitchTimes). Antes: siempre al 50%.
        let expActive = 0;
        for (let k = 0; k < expSwitchTimes.length; k++) {
          if (t >= expSwitchTimes[k]) expActive = k + 1;
        }
        setActiveExpertiseSlide(expActive);

        // 6) Cabecera "About" (Fase 15) - al ~46% de la entrada del panel
        if (t >= ABOUT_ENTER_START + ABOUT_ENTER_DUR * 0.46) revealAboutHeader();
        else hideAboutHeader();

        // 7) Cabecera "Contact" (Fase 17) - al ~42% de la entrada del panel
        if (t >= CONTACT_ENTER_START + CONTACT_ENTER_DUR * 0.42) revealContactHeader();
        else hideContactHeader();
      },
    },
  });

  // -------------------------------------------------------------------------
  // FASE 1 (t: 0 -> 1): Sale el Hero (-50vw) y se expande Megumin (Tarjeta 1)
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
  // FASE 2 (t: 1 -> 2): Sale Megumin (-116vw) y se expande Hatsune Miku (Tarjeta 2)
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
  // FASE 3 (t: 2 -> 3): Sale Hatsune Miku (-182vw) y se expande Kiriko (Tarjeta 3)
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
  // FASE 4 (t: 2.85 -> 4.2): Líneas editoriales + "A Silent Voice" cubre Kiriko
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
      reelItemsGroup,
      {
        marginTop: "0vh",
        duration: 0.68,
        ease: "power2.inOut",
      },
      3.2
    )
    .to(
      cardData[2].imgWrap,
      {
        height: "45vh",
        duration: 0.82,
        ease: "power2.inOut",
      },
      3.38
    )
    .to(
      verticalReelTrack,
      {
        y: "-45vh",
        duration: 0.82,
        ease: "none",
      },
      3.38
    );

  // -------------------------------------------------------------------------
  // FASE 5 & FASE 6 (t: 4.2 -> 7.4): Recorrido completo del reel vertical
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
  // FASE 7 (t: 7.5 -> 8.85): Entrada de #awardsSection y escala de imagen (1.7 -> 1)
  // -------------------------------------------------------------------------
  masterTl
    .to(
      awardsSection,
      {
        xPercent: 0,
        duration: 1.35,
        ease: "none",
      },
      7.5
    )
    .to(
      cardData[2].card,
      {
        x: "-35vw",
        duration: 0.45,
        ease: "none",
      },
      8.4
    )
    .to(
      awardsHeroImageWrap,
      {
        xPercent: 0,
        x: 0,
        duration: 1.25,
        ease: "back.out(1.15)",
      },
      7.6
    )
    .to(
      awardsHeroImageWrap,
      {
        scale: 1,
        duration: 1.25,
        ease: "power2.out",
      },
      7.6
    )
    .to(
      awardsHeroImg,
      {
        scale: 1,
        duration: 1.25,
        ease: "power2.out",
      },
      7.6
    );

  // -------------------------------------------------------------------------
  // FASE 8 (t: 8.85 -> 10.65): Subida a la Lista 1 de Premios (-100vh)
  // -------------------------------------------------------------------------
  masterTl.to(
    awardsScrollTrack,
    {
      y: "-100vh",
      duration: 1.8,
      ease: "none",
    },
    8.85
  );

  // -------------------------------------------------------------------------
  // FASE 9 (t: 10.65 -> 12.45): Paso continuo a la Lista 2 de Premios (-200vh)
  // -------------------------------------------------------------------------
  masterTl.to(
    awardsScrollTrack,
    {
      y: "-200vh",
      duration: 1.8,
      ease: "none",
    },
    10.65
  );

  // -------------------------------------------------------------------------
  // FASE 10 (t: 12.45 -> 13.65): Entrada inmediata de Expertise (Slide 01) tras Lista 2
  // -------------------------------------------------------------------------
  masterTl
    .to(
      awardsScrollTrack,
      {
        y: "-300vh",
        duration: 1.2,
        ease: "none",
      },
      12.45
    )
    .to(
      expertiseSection,
      {
        yPercent: 0,
        duration: 1.2,
        ease: "none",
      },
      12.45
    );

  // -------------------------------------------------------------------------
  // FASES 11-14: Expertise Slide 01->02, 02->03, 03->04, 04->05
  // [AJUSTE 8] Duración de cada paso: EXP_DUR (0.9, antes 1.4)
  // [AJUSTE 3] Imagen saliente se reduce (EXP_EXIT_SCALE) mientras la cubre el panel
  //            entrante; la siguiente queda como miniatura grande y la de dos pasos
  //            como franja fina, siempre dentro de la ventana y por encima de la barra.
  // -------------------------------------------------------------------------
  const EXP_NEXT_X = [80, 82, 84]; // xPercent de la miniatura grande tras cada paso
  const EXP_STRIP_X = [95, 95.5]; // xPercent de la franja fina tras cada paso
  const EXP_BAR = [0.4, 0.6, 0.8, 1];

  for (let i = 0; i < 4; i++) {
    const at = EXP_PHASE_START[i];
    const outgoing = i;
    const incoming = i + 1;
    const next = i + 2; // pasa a miniatura grande
    const afterNext = i + 3; // pasa a franja fina

    // Panel entrante cubre al actual
    masterTl.to(expSlides[incoming], { xPercent: 0, duration: EXP_DUR, ease: "none" }, at);

    // Los paneles siguientes avanzan para seguir asomando por la derecha
    if (expSlides[next]) {
      masterTl.to(expSlides[next], { xPercent: EXP_NEXT_X[i], duration: EXP_DUR, ease: "none" }, at);
    }
    if (expSlides[afterNext]) {
      masterTl.to(expSlides[afterNext], { xPercent: EXP_STRIP_X[i], duration: EXP_DUR, ease: "none" }, at);
    }

    // [AJUSTE 3] SALIDA: la imagen del slide que queda cubierto se reduce sutilmente
    masterTl.to(
      expImgWraps[outgoing],
      { scale: EXP_EXIT_SCALE, duration: EXP_DUR, ease: "power1.in" },
      at
    );

    // La imagen entrante crece desde su miniatura hasta tamaño completo
    masterTl
      .to(expImgWraps[incoming], { x: "0vw", y: "0vh", scale: 1, duration: EXP_DUR, ease: "none" }, at)
      .to(expImgs[incoming], { scale: 1, duration: EXP_DUR, ease: "none" }, at);

    // La siguiente pasa de franja fina a miniatura grande
    if (expImgWraps[next]) {
      masterTl.to(expImgWraps[next], { ...EXP_THUMB, duration: EXP_DUR, ease: "none" }, at);
    }

    masterTl.to(expertiseProgressBar, { scaleX: EXP_BAR[i], duration: EXP_DUR, ease: "none" }, at);
  }

  // -------------------------------------------------------------------------
  // FASE 15: Entrada del panel "About" cubriendo Slide 05
  // [AJUSTE 3] La imagen del slide 05 también se reduce al quedar cubierta
  // [AJUSTE 8] Duración 1.0 (antes 1.3)
  // -------------------------------------------------------------------------
  masterTl
    .to(
      aboutSection,
      {
        yPercent: 0,
        duration: ABOUT_ENTER_DUR,
        ease: "none",
      },
      ABOUT_ENTER_START
    )
    .to(
      expImgWraps[4],
      { scale: EXP_EXIT_SCALE, duration: ABOUT_ENTER_DUR, ease: "power1.in" },
      ABOUT_ENTER_START
    );

  // -------------------------------------------------------------------------
  // FASE 16: Recorrido vertical de las 4 imágenes, filosofía y 2023/2026
  // [AJUSTE 8] Duración 1.8 (antes 2.9): el contenido sigue al scroll casi 1:1
  // [AJUSTE 4] Recorrido -148vh (antes -128vh) para mostrar el aire extra final
  // -------------------------------------------------------------------------
  masterTl
    .to(
      aboutScrollTrack,
      {
        y: ABOUT_SCROLL_Y,
        duration: ABOUT_SCROLL_DUR,
        ease: "none",
      },
      ABOUT_SCROLL_START
    )
    .fromTo(
      aboutImages,
      { yPercent: -4 },
      { yPercent: 4, duration: ABOUT_SCROLL_DUR, ease: "none" },
      ABOUT_SCROLL_START
    );

  // -------------------------------------------------------------------------
  // FASE 17: Entrada de Contacto (#0d0d0d) cubriendo About
  // [AJUSTE 4] Empieza tras el aire adicional (-148vh) y sale hasta -235vh
  // -------------------------------------------------------------------------
  masterTl
    .to(
      aboutScrollTrack,
      {
        y: ABOUT_EXIT_Y,
        duration: CONTACT_ENTER_DUR,
        ease: "none",
      },
      CONTACT_ENTER_START
    )
    .to(
      contactSection,
      {
        yPercent: 0,
        duration: CONTACT_ENTER_DUR,
        ease: "none",
      },
      CONTACT_ENTER_START
    );

  // -------------------------------------------------------------------------
  // FASE 18: Ascenso final y revelado colosal de "CELONOR"
  // [AJUSTE 7] El desplazamiento final se calcula con la altura real del track:
  //   y = -(alto del track - alto de ventana)
  //   -> la frase "I challenge you..." queda totalmente fuera por arriba,
  //   -> el borde inferior del logo coincide con el borde inferior de la ventana
  //      (las letras se cortan ahí) y el scroll termina sin franja negra debajo.
  // -------------------------------------------------------------------------
  masterTl
    .to(
      contactScrollTrack,
      {
        y: () => -(contactScrollTrack.offsetHeight - window.innerHeight),
        duration: CONTACT_RISE_DUR,
        ease: "none",
      },
      CONTACT_RISE_START
    )
    .to(
      contactGiantLogo,
      {
        yPercent: 0,
        duration: CONTACT_RISE_DUR,
        ease: "none",
      },
      CONTACT_RISE_START
    );

  // Click en el logo pequeño para volver suavemente al inicio
  smallLogo.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});