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
  // 1. Dividir los títulos ("Archidomo", "Orlinski", "Pikko") en caracteres individuales
  splitTextIntoChars('[data-split="chars"]');

  const cards = gsap.utils.toArray(".project-card");
  const cardData = cards.map((card) => ({
    card,
    imgWrap: card.querySelector(".project-card__image-wrap"),
    chars: card.querySelectorAll(".char"),
    metaItems: card.querySelectorAll(".meta-item"),
    btn: card.querySelector(".project-card__btn"),
    revealed: false,
  }));

  // Estado inicial controlado 100% por GSAP (debajo de su "piso" con overflow: hidden)
  cardData.forEach(({ chars, metaItems, btn }) => {
    gsap.set(chars, { yPercent: 115, y: 0 });
    gsap.set(metaItems, { yPercent: 120, y: 0 });
    gsap.set(btn, { opacity: 0, scale: 0.85 });
  });

  // Estado inicial del Logo Pequeño y Píldora de Menú
  const smallLogo = document.getElementById("smallAkaruLogo");
  const smallChars = gsap.utils.toArray(".small-char");
  const menuBtn = document.getElementById("menuBtn");
  const menuText = document.getElementById("menuText");
  const menuCircle = document.getElementById("menuCircle");

  gsap.set(smallChars, { yPercent: 125, y: 0, opacity: 0 });
  gsap.set(menuBtn, { opacity: 0, width: 56, scale: 0.5 });
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
  // 2. REVELADO Y SALIDA DE TÍTULOS, METADATA Y UI FIJA SUPERIOR
  // =========================================================================
  /**
   * Entrada del proyecto:
   * - Título: sube letra por letra simulando una "ola" o "gusanito" (stagger + sine.out).
   * - Metadata: sube suavemente desde su piso con overflow: hidden.
   */
  function revealProjectText(index) {
    const item = cardData[index];
    if (item.revealed) return;
    item.revealed = true;

    gsap.killTweensOf([item.chars, item.metaItems, item.btn]);

    // Ola / gusanito letra por letra de izquierda a derecha (A -> R -> C...)
    gsap.to(item.chars, {
      yPercent: 0,
      y: 0,
      duration: 0.6,
      stagger: 0.045,
      ease: "sine.out",
      overwrite: "auto",
    });

    // Metadata subiendo desde su contenedor con overflow: hidden
    gsap.to(item.metaItems, {
      yPercent: 0,
      y: 0,
      duration: 0.55,
      ease: "sine.out",
      overwrite: "auto",
    });

    // Botón circular
    gsap.to(item.btn, {
      opacity: 1,
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  /**
   * Salida (retroceso):
   * - NO sale letra por letra: todas las letras del título bajan al unísono (stagger: 0)
   *   hacia el piso compartiendo la misma animación de salida que la metadata.
   */
  function hideProjectTextDrop(index) {
    const item = cardData[index];
    if (!item.revealed) return;
    item.revealed = false;

    gsap.killTweensOf([item.chars, item.metaItems, item.btn]);

    gsap.to([item.chars, item.metaItems], {
      yPercent: 120,
      y: 0,
      duration: 0.38,
      stagger: 0,
      ease: "sine.inOut",
      overwrite: "auto",
    });

    gsap.to(item.btn, {
      opacity: 0,
      scale: 0.85,
      duration: 0.3,
      ease: "power2.in",
      overwrite: "auto",
    });
  }

  // Control del Logo Pequeño "AKARU" y Píldora "MENU"
  let headerUIActive = false;

  function showHeaderUI() {
    if (headerUIActive) return;
    headerUIActive = true;

    // A) Logo Pequeño "AKARU": entra de atrás hacia adelante (U -> R -> A -> K -> A) y queda fijo
    smallLogo.style.pointerEvents = "auto";
    gsap.killTweensOf(smallChars);
    gsap.to(smallChars, {
      yPercent: 0,
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
      stagger: {
        each: 0.05,
        from: "end", // Primero la U, luego R, A, K, A
      },
      overwrite: "auto",
    });

    // B) Botón Píldora MENÚ: se expande y muestra el círculo con las 2 líneas verticales
    menuBtn.style.pointerEvents = "auto";
    gsap.killTweensOf([menuBtn, menuText, menuCircle]);

    const pillTl = gsap.timeline();
    pillTl
      .to(menuBtn, {
        opacity: 1,
        scale: 1,
        width: 56,
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
    // Salida HACIA ARRIBA (U -> R -> A -> K -> A)
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
      overwrite: "auto",
      onComplete: () => {
        // Reposiciona debajo del "piso" para que la próxima entrada vuelva a subir desde abajo
        gsap.set(smallChars, { yPercent: 125, y: 0, opacity: 0 });
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
          width: 56,
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
  // 3. FAKE HORIZONTAL SCROLL & EXPANSIÓN DE COLUMNAS (TIMELINE MAESTRO)
  // =========================================================================
  const track = document.getElementById("horizontalTrack");
  const mainWrapper = document.getElementById("mainWrapper");

  /**
   * El logo pequeño y el menú SOLO aparecen cuando el hero (50vw) ha salido
   * COMPLETAMENTE del viewport. Se mide con la posición real (suavizada por el scrub)
   * del track, no con el progreso crudo del scroll, para que nunca coexistan
   * el AKARU gigante y el pequeño.
   */
  const masterTl = gsap.timeline({
    scrollTrigger: {
      trigger: mainWrapper,
      pin: true,
      scrub: 1.2,
      start: "top top",
      end: () => `+=${window.innerWidth * 2.8}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;

        // El AKARU gigante termina de salir exactamente en p = 0.35 (Fase 1 completada).
        // Solo a partir de ahí entra el pequeño; si retrocedes y p baja de 0.35, desaparece.
        if (p >= 0.35) {
          showHeaderUI();
        } else {
          hideHeaderUI();
        }

        // (El logo pequeño / menú se controlan en syncHeaderUI, ligado a la posición real del track)

        // 2) Tarjeta 1 ("Archidomo")
        if (p >= 0.08) {
          revealProjectText(0);
        } else {
          hideProjectTextDrop(0);
        }

        // 3) Tarjeta 2 ("Orlinski")
        if (p >= 0.42) {
          revealProjectText(1);
        } else {
          hideProjectTextDrop(1);
        }

        // 4) Tarjeta 3 ("Pikko")
        if (p >= 0.76) {
          revealProjectText(2);
        } else {
          hideProjectTextDrop(2);
        }
      },
    },
  });

  // -------------------------------------------------------------------------
  // FASE 1: Sale el Hero (-50vw) y se expande Archidomo (Tarjeta 1) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(
      track,
      {
        x: "-50vw",
        ease: "none",
        duration: 1,
      },
      0
    )
    .to(
      cardData[0].card,
      {
        width: "66vw",
        ease: "power2.out",
        duration: 1,
      },
      0
    )
    .to(
      cardData[0].imgWrap,
      {
        height: "66vh",
        marginTop: "0vh",
        ease: "power2.out",
        duration: 1,
      },
      0
    )
    .to(
      cardData[1].card,
      {
        width: "44vw",
        ease: "power2.out",
        duration: 1,
      },
      0
    )
    .to(
      cardData[1].imgWrap,
      {
        height: "46vh",
        marginTop: "13vh",
        ease: "power2.out",
        duration: 1,
      },
      0
    )
    .to(
      cardData[2].card,
      {
        width: "12vw",
        ease: "none",
        duration: 1,
      },
      0
    );

  // -------------------------------------------------------------------------
  // FASE 2: Sale Archidomo (-116vw) y se expande Orlinski (Tarjeta 2) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(
      track,
      {
        x: "-116vw",
        ease: "none",
        duration: 1,
      },
      1
    )
    .to(
      cardData[1].card,
      {
        width: "66vw",
        ease: "power2.out",
        duration: 1,
      },
      1
    )
    .to(
      cardData[1].imgWrap,
      {
        height: "66vh",
        marginTop: "0vh",
        ease: "power2.out",
        duration: 1,
      },
      1
    )
    .to(
      cardData[2].card,
      {
        width: "44vw",
        ease: "power2.out",
        duration: 1,
      },
      1
    )
    .to(
      cardData[2].imgWrap,
      {
        height: "54vh",
        marginTop: "11vh",
        ease: "power2.out",
        duration: 1,
      },
      1
    );

  // -------------------------------------------------------------------------
  // FASE 3: Sale Orlinski (-182vw) y se expande Pikko (Tarjeta 3) a 66vw
  // -------------------------------------------------------------------------
  masterTl
    .to(
      track,
      {
        x: "-182vw",
        ease: "none",
        duration: 1,
      },
      2
    )
    .to(
      cardData[2].card,
      {
        width: "66vw",
        ease: "power2.out",
        duration: 1,
      },
      2
    )
    .to(
      cardData[2].imgWrap,
      {
        height: "66vh",
        marginTop: "0vh",
        ease: "power2.out",
        duration: 1,
      },
      2
    );

  // Click en el logo pequeño de AKARU para volver suavemente al inicio
  smallLogo.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});