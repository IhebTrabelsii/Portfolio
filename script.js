(() => {
  "use strict";

  /* =========================================================
     DOM
  ========================================================= */

  const body = document.body;

  const opening = document.getElementById("opening");
  const presentation = document.getElementById("presentation");
  const slides = [...document.querySelectorAll(".slide")];

  const prevButton = document.getElementById("prevSlide");
  const nextButton = document.getElementById("nextSlide");
  const progress = document.getElementById("slideProgress");
  const currentYear = document.getElementById("currentYear");

  const navMenu = document.querySelector(".nav-menu");
  const navLinks = [...document.querySelectorAll(".nav-sections a")];

  /* =========================================================
     KARAOKE CASE STUDY
  ========================================================= */

const karaokeSlides = [
  "assets/work/karaoke/Slide1.JPG",
  "assets/work/karaoke/Slide2.JPG",
  "assets/work/karaoke/Slide3.JPG",
  "assets/work/karaoke/Slide4.JPG",
  "assets/work/karaoke/Slide5.JPG",
  "assets/work/karaoke/Slide6.JPG",
  "assets/work/karaoke/Slide7.JPG",
  "assets/work/karaoke/Slide8.JPG",
  "assets/work/karaoke/Slide9.JPG",
  "assets/work/karaoke/Slide10.JPG",
  "assets/work/karaoke/Slide11.JPG",
  "assets/work/karaoke/Slide12.JPG",
  "assets/work/karaoke/Slide13.JPG",
];

const gymbroSlides = [
  "assets/work/gymbro/Slide1.JPG",
  "assets/work/gymbro/Slide2.JPG",
  "assets/work/gymbro/Slide3.JPG",
  "assets/work/gymbro/Slide4.JPG",
  "assets/work/gymbro/Slide5.JPG",
  "assets/work/gymbro/Slide6.JPG",
  "assets/work/gymbro/Slide7.JPG",
  "assets/work/gymbro/Slide8.JPG",
  "assets/work/gymbro/Slide9.JPG",
  "assets/work/gymbro/Slide10.JPG",
  "assets/work/gymbro/Slide11.JPG",
  "assets/work/gymbro/Slide12.JPG",
  "assets/work/gymbro/Slide13.JPG",
  "assets/work/gymbro/Slide14.JPG",
  "assets/work/gymbro/Slide15.JPG",
  "assets/work/gymbro/Slide16.JPG",
  "assets/work/gymbro/Slide17.JPG",
];
const fusionScreenshot =
  "assets/work/fusion/content.png";

  const karaokeCard =
    document.getElementById("openKaraoke");

  const karaokeCaseStudy =
    document.getElementById("karaokeCaseStudy");

  const closeKaraoke =
    document.getElementById("closeKaraoke");

  const caseStudyViewer =
    document.getElementById("caseStudyViewer");

  let previousBodyOverflow = "";
  let lastFocusedElement = null;

  const gymbroCard =
  document.getElementById("openGymBro");

const gymbroCaseStudy =
  document.getElementById("gymbroCaseStudy");

const closeGymBro =
  document.getElementById("closeGymBro");

const gymbroCaseStudyViewer =
  document.getElementById(
    "gymbroCaseStudyViewer",
  );

const fusionCard =
  document.getElementById("openFusion");

const fusionCaseStudy =
  document.getElementById("fusionCaseStudy");

const closeFusion =
  document.getElementById("closeFusion");

const fusionCaseStudyViewer =
  document.getElementById(
    "fusionCaseStudyViewer",
  );

  function isCaseStudyOpen() {
  return (
    karaokeCaseStudy?.classList.contains("open") ||
    gymbroCaseStudy?.classList.contains("open") ||
    fusionCaseStudy?.classList.contains("open")
  );
}

  /* =========================================================
     OPENING STATE
  ========================================================= */

  let openingDone = false;

  function isOpeningActive() {
    return !openingDone;
  }

  function finishOpening() {
    if (openingDone) return;

    openingDone = true;

    opening?.classList.add("done");
    body.classList.remove("is-loading");
  }

  /* =========================================================
     FOCUS TRAP (shared by all case-study modals)
  ========================================================= */

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, event) {
    if (event.key !== "Tab") return;

    const focusable = [
      ...container.querySelectorAll(FOCUSABLE_SELECTOR),
    ].filter((el) => el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* =========================================================
     PRESENTATION SETTINGS
  ========================================================= */

  const TRANSITION_DURATION = 950;
  const WHEEL_LOCK_DURATION = 1050;

  const transitionMap = [
    "up",     // 0  home
    "up",     // 1  about-intro
    "up",     // 2  about-details
    "left",   // 3  skills-intro
    "left",   // 4  skills / frontend
    "up",     // 5  skills / backend
    "right",  // 6  skills / design
    "up",     // 7  experience
    "up",     // 8  work-intro
    "left",   // 9  gymbro
    "left",   // 10 fusion
    "up",     // 11 karaoke
    "right",  // 12 work-archive
    "up",     // 13 design
    "up",     // 14 contact
  ];

  const reverseTransition = {
    right: "left",
    left: "right",
    up: "down",
    down: "up",
  };

  const navTargets = {
    home: 0,
    about: 1,
    skills: 3,
    work: 8,
    contact: 14,
  };

  /* =========================================================
     PRESENTATION STATE
  ========================================================= */

  let currentSlide = 0;
  let isTransitioning = false;
  let wheelLocked = false;

  let transitionStartedAt = 0;

  let touchStartX = 0;
  let touchStartY = 0;

  /* =========================================================
     PRESENTATION
  ========================================================= */

  function getTransition(oldIndex, newIndex) {
    const movingForward = newIndex > oldIndex;
    const base = transitionMap[oldIndex] || "right";

    if (movingForward) {
      return base;
    }

    return reverseTransition[base] || "right";
  }

  function setSlideState() {
    slides.forEach((slide, index) => {
      slide.classList.remove(
        "active",
        "previous",
        "next",
        "transition-enter",
        "transition-leave",
      );

      if (index === currentSlide) {
        slide.classList.add("active");
      } else if (index < currentSlide) {
        slide.classList.add("previous");
      } else {
        slide.classList.add("next");
      }
    });
  }

  function goToSlide(newIndex) {
    if (isTransitioning) return;
    if (newIndex < 0 || newIndex >= slides.length) return;
    if (newIndex === currentSlide) return;

    const oldIndex = currentSlide;

    const oldSlide = slides[oldIndex];
    const newSlide = slides[newIndex];

    if (!oldSlide || !newSlide || !presentation) return;

    isTransitioning = true;
    transitionStartedAt = Date.now();

    const transition = getTransition(oldIndex, newIndex);

    presentation.dataset.transition = transition;

    slides.forEach((slide) => {
      slide.classList.remove(
        "transition-enter",
        "transition-leave",
      );
    });

    oldSlide.classList.remove("previous", "next");
    oldSlide.classList.add("active");

    newSlide.classList.remove(
      "active",
      "previous",
      "next",
    );

    newSlide.classList.add("transition-enter");

    /* Force layout before starting transition */
    newSlide.getBoundingClientRect();

    requestAnimationFrame(() => {
      newSlide.getBoundingClientRect();

      newSlide.classList.remove("transition-enter");
      newSlide.classList.add("active");

      oldSlide.classList.add("transition-leave");

      currentSlide = newIndex;

      updateProgress();
      updateHash();
      updateNavigation();

      setTimeout(() => {
        setSlideState();

        presentation.dataset.transition =
          transitionMap[currentSlide] || "right";

        isTransitioning = false;
      }, TRANSITION_DURATION + 50);
    });
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  }

  function previousSlide() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }

  function updateProgress() {
    if (!progress) return;

    const value =
      slides.length <= 1
        ? 1
        : currentSlide / (slides.length - 1);

    progress.style.transform = `scaleX(${value})`;
  }

  function updateHash() {
    const id = slides[currentSlide]?.id;

    if (!id) return;

    history.replaceState(
      null,
      "",
      `#${id}`,
    );
  }

  function openHashSlide() {
    const hash =
      window.location.hash.replace("#", "");

    if (!hash) return;

    const index = slides.findIndex(
      (slide) => slide.id === hash,
    );

    if (index !== -1) {
      currentSlide = index;
    }
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function updateNavigation() {
    navLinks.forEach((link) => {
      const target = link.dataset.nav;

      let active = false;

      switch (target) {
        case "home":
          active = currentSlide === 0;
          break;

        case "about":
          active =
            currentSlide >= 1 &&
            currentSlide <= 2;
          break;

        case "skills":
          active =
            currentSlide >= 3 &&
            currentSlide <= 6;
          break;

        case "work":
          active =
            currentSlide >= 8 &&
            currentSlide <= 12;
          break;

        case "contact":
          active = currentSlide === 14;
          break;
      }

      link.classList.toggle(
        "active",
        active,
      );
    });

    const activeSlide =
      slides[currentSlide];

    const dark =
      activeSlide?.classList.contains(
        "dark-slide",
      );

    body.classList.toggle(
      "nav-dark",
      Boolean(dark),
    );
  }

  function initNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          if (isOpeningActive()) return;

          const target = link.dataset.nav;

          if (!(target in navTargets)) return;

          goToSlide(navTargets[target]);

          navMenu?.classList.remove(
            "active",
          );
          navMenu?.setAttribute(
            "aria-expanded",
            "false",
          );
        },
      );
    });
  }

  function initMobileMenu() {
    navMenu?.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        const isActive =
          navMenu.classList.toggle(
            "active",
          );

        navMenu.setAttribute(
          "aria-expanded",
          String(isActive),
        );
      },
    );
  }

  /* =========================================================
     OPENING
  ========================================================= */

  function initOpening() {
    if (!opening) {
      body.classList.remove("is-loading");
      openingDone = true;
      return;
    }

    /*
      The opening is decorative. It must never wait for
      window.load, because on a cold cache window.load can
      take many seconds and the user can already scroll —
      which would start a presentation transition underneath
      the opening and leave the site stuck on the first slide.

      Start the timer as soon as the DOM is ready.
    */
    const begin = () => {
      setTimeout(finishOpening, 2000);
    };

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        begin,
        { once: true },
      );
    } else {
      begin();
    }

    /*
      Absolute failsafe: never let the opening block the
      site, no matter what happens to the load event,
      fonts, images or anything else.
    */
    setTimeout(finishOpening, 4000);
  }

  /* =========================================================
     WHEEL
  ========================================================= */

  function initWheel() {
    window.addEventListener(
      "wheel",
      (event) => {
        if (isOpeningActive()) return;
        if (isCaseStudyOpen()) return;
        if (isTransitioning) return;
        if (wheelLocked) return;

        if (Math.abs(event.deltaY) < 15) {
          return;
        }

        wheelLocked = true;

        if (event.deltaY > 0) {
          nextSlide();
        } else {
          previousSlide();
        }

        setTimeout(() => {
          wheelLocked = false;
        }, WHEEL_LOCK_DURATION);
      },
      {
        passive: true,
      },
    );
  }

  /* =========================================================
     KEYBOARD
  ========================================================= */

  function initKeyboard() {
    window.addEventListener(
      "keydown",
      (event) => {
        if (isOpeningActive()) return;
        if (isCaseStudyOpen()) return;

        const tag =
          document.activeElement?.tagName;

        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT"
        ) {
          return;
        }

        switch (event.key) {
          case "ArrowDown":
          case "ArrowRight":
          case "PageDown":
          case " ":
            event.preventDefault();
            nextSlide();
            break;

          case "ArrowUp":
          case "ArrowLeft":
          case "PageUp":
            event.preventDefault();
            previousSlide();
            break;

          case "Home":
            event.preventDefault();
            goToSlide(0);
            break;

          case "End":
            event.preventDefault();
            goToSlide(
              slides.length - 1,
            );
            break;
        }
      },
    );
  }

  /* =========================================================
     TOUCH
  ========================================================= */

  function initTouch() {
    if (!presentation) return;

    presentation.addEventListener(
      "touchstart",
      (event) => {
        if (isOpeningActive()) return;
        if (isCaseStudyOpen()) return;

        const touch =
          event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      },
      {
        passive: true,
      },
    );

    presentation.addEventListener(
      "touchend",
      (event) => {
        if (isOpeningActive()) return;
        if (isCaseStudyOpen()) return;
        if (isTransitioning) return;

        const touch =
          event.changedTouches[0];

        const deltaX =
          touchStartX - touch.clientX;

        const deltaY =
          touchStartY - touch.clientY;

        if (
          Math.abs(deltaX) < 50 &&
          Math.abs(deltaY) < 50
        ) {
          return;
        }

        if (
          Math.abs(deltaX) >
          Math.abs(deltaY)
        ) {
          if (deltaX > 0) {
            nextSlide();
          } else {
            previousSlide();
          }

          return;
        }

        if (deltaY > 0) {
          nextSlide();
        } else {
          previousSlide();
        }
      },
      {
        passive: true,
      },
    );
  }

  /* =========================================================
     PRESENTATION BUTTONS
  ========================================================= */

  function initButtons() {
    prevButton?.addEventListener(
      "click",
      () => {
        if (isOpeningActive()) return;
        previousSlide();
      },
    );

    nextButton?.addEventListener(
      "click",
      () => {
        if (isOpeningActive()) return;
        nextSlide();
      },
    );
  }

  /* =========================================================
     MAGNETIC ELEMENTS
  ========================================================= */

  function initMagneticElements() {
    const magneticElements =
      document.querySelectorAll(
        ".magnetic",
      );

    magneticElements.forEach(
      (element) => {
        element.addEventListener(
          "mousemove",
          (event) => {
            const rect =
              element.getBoundingClientRect();

            const x =
              event.clientX -
              rect.left -
              rect.width / 2;

            const y =
              event.clientY -
              rect.top -
              rect.height / 2;

            element.style.transform =
              `translate(
                ${x * 0.08}px,
                ${y * 0.08}px
              )`;
          },
        );

        element.addEventListener(
          "mouseleave",
          () => {
            element.style.transform = "";
          },
        );
      },
    );
  }

  /* =========================================================
     CUSTOM CURSOR
  ========================================================= */

  function initCursor() {
    const finePointer =
      window.matchMedia(
        "(pointer: fine)",
      ).matches;

    const cursor =
      document.getElementById(
        "cursor",
      );

    if (!cursor || !finePointer) {
      return;
    }

    let mouseX =
      window.innerWidth / 2;

    let mouseY =
      window.innerHeight / 2;

    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener(
      "mousemove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
      },
      {
        passive: true,
      },
    );

    function animateCursor() {
      cursorX +=
        (mouseX - cursorX) * 0.15;

      cursorY +=
        (mouseY - cursorY) * 0.15;

      cursor.style.left =
        `${cursorX}px`;

      cursor.style.top =
        `${cursorY}px`;

      requestAnimationFrame(
        animateCursor,
      );
    }

    animateCursor();

    const interactiveElements =
      document.querySelectorAll(
        "a, button, .hover-card, .project-card",
      );

    interactiveElements.forEach(
      (element) => {
        element.addEventListener(
          "mouseenter",
          () => {
            body.classList.add(
              "cursor-large",
            );
          },
        );

        element.addEventListener(
          "mouseleave",
          () => {
            body.classList.remove(
              "cursor-large",
            );
          },
        );
      },
    );
  }

  /* =========================================================
     YEAR
  ========================================================= */

  function updateYear() {
    if (currentYear) {
      currentYear.textContent =
        new Date().getFullYear();
    }
  }

  /* =========================================================
     KARAOKE CASE STUDY
     PDF-STYLE CONTINUOUS SCROLL
  ========================================================= */

  function buildKaraokePresentation() {
    if (!caseStudyViewer) return;

    caseStudyViewer.innerHTML = "";

    karaokeSlides.forEach(
      (imagePath, index) => {
        const image =
          document.createElement("img");

        image.src = imagePath;

        image.alt =
          `VOXORA presentation slide ${
            index + 1
          }`;

        /*
          Load the first slide immediately.
          Other slides can load lazily.
        */
        image.loading =
          index === 0
            ? "eager"
            : "lazy";

        image.draggable = false;

        caseStudyViewer.appendChild(
          image,
        );
      },
    );
  }

  function openKaraokeCaseStudy() {
    if (!karaokeCaseStudy) return;

    lastFocusedElement = document.activeElement;

    previousBodyOverflow =
      document.body.style.overflow;

    /*
      Reset to the beginning every time
      the presentation is opened.
    */
    if (caseStudyViewer) {
      caseStudyViewer.scrollTop = 0;
    }

    karaokeCaseStudy.classList.add(
      "open",
    );

    karaokeCaseStudy.setAttribute(
      "aria-hidden",
      "false",
    );

    document.body.style.overflow =
      "hidden";

    closeKaraoke?.focus();
  }

  function closeKaraokeCaseStudy() {
    if (!karaokeCaseStudy) return;

    karaokeCaseStudy.classList.remove(
      "open",
    );

    karaokeCaseStudy.setAttribute(
      "aria-hidden",
      "true",
    );

    document.body.style.overflow =
      previousBodyOverflow;

    (lastFocusedElement ?? karaokeCard)?.focus?.();
  }

  function initKaraokeCaseStudy() {
    if (!karaokeCaseStudy) return;

    buildKaraokePresentation();

    /*
      Mouse click
    */
    karaokeCard?.addEventListener(
      "click",
      openKaraokeCaseStudy,
    );

    /*
      Keyboard accessibility
    */
    karaokeCard?.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openKaraokeCaseStudy();
        }
      },
    );

    /*
      Close button
    */
    closeKaraoke?.addEventListener(
      "click",
      closeKaraokeCaseStudy,
    );

    /*
      Escape closes the case study,
      Tab is trapped inside it while open.
    */
    document.addEventListener(
      "keydown",
      (event) => {
        if (
          !karaokeCaseStudy.classList.contains(
            "open",
          )
        ) {
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();

          closeKaraokeCaseStudy();
          return;
        }

        trapFocus(karaokeCaseStudy, event);
      },
    );
  }

  /* =========================================================
   GYMBRO CASE STUDY
   PDF-STYLE CONTINUOUS SCROLL
========================================================= */

function buildGymBroPresentation() {
  if (!gymbroCaseStudyViewer) return;

  gymbroCaseStudyViewer.innerHTML = "";

  gymbroSlides.forEach((imagePath, index) => {
    const image = document.createElement("img");

    image.src = imagePath;

    image.alt =
      `GymBro presentation slide ${index + 1}`;

    image.loading =
      index === 0 ? "eager" : "lazy";

    image.draggable = false;

    gymbroCaseStudyViewer.appendChild(image);
  });
}

function openGymBroCaseStudy() {
  if (!gymbroCaseStudy) return;

  lastFocusedElement = document.activeElement;

  previousBodyOverflow =
    document.body.style.overflow;

  gymbroCaseStudyViewer.scrollTop = 0;

  gymbroCaseStudy.classList.add("open");

  gymbroCaseStudy.setAttribute(
    "aria-hidden",
    "false",
  );

  document.body.style.overflow = "hidden";

  closeGymBro?.focus();
}

function closeGymBroCaseStudy() {
  if (!gymbroCaseStudy) return;

  gymbroCaseStudy.classList.remove("open");

  gymbroCaseStudy.setAttribute(
    "aria-hidden",
    "true",
  );

  document.body.style.overflow =
    previousBodyOverflow;

  (lastFocusedElement ?? gymbroCard)?.focus?.();
}

function initGymBroCaseStudy() {
  if (!gymbroCaseStudy) return;

  buildGymBroPresentation();

  /* Mouse click */
  gymbroCard?.addEventListener(
    "click",
    openGymBroCaseStudy,
  );

  /* Keyboard accessibility */
  gymbroCard?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();

        openGymBroCaseStudy();
      }
    },
  );

  /* Close button */
  closeGymBro?.addEventListener(
    "click",
    closeGymBroCaseStudy,
  );

  /* Escape + focus trap */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        !gymbroCaseStudy.classList.contains(
          "open",
        )
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        closeGymBroCaseStudy();
        return;
      }

      trapFocus(gymbroCaseStudy, event);
    },
  );
}


/* =========================================================
   FUSION CASE STUDY
   SINGLE LONG SCREENSHOT
========================================================= */

function buildFusionPresentation() {
  if (!fusionCaseStudyViewer) return;

  fusionCaseStudyViewer.innerHTML = "";

  const image = document.createElement("img");

  image.src = fusionScreenshot;

  image.alt = "FUSION portfolio website";

  image.loading = "eager";

  image.draggable = false;

  fusionCaseStudyViewer.appendChild(image);
}

function openFusionCaseStudy() {
  if (!fusionCaseStudy) return;

  lastFocusedElement = document.activeElement;

  previousBodyOverflow =
    document.body.style.overflow;

  fusionCaseStudyViewer.scrollTop = 0;

  fusionCaseStudy.classList.add("open");

  fusionCaseStudy.setAttribute(
    "aria-hidden",
    "false",
  );

  document.body.style.overflow = "hidden";

  closeFusion?.focus();
}

function closeFusionCaseStudy() {
  if (!fusionCaseStudy) return;

  fusionCaseStudy.classList.remove("open");

  fusionCaseStudy.setAttribute(
    "aria-hidden",
    "true",
  );

  document.body.style.overflow =
    previousBodyOverflow;

  (lastFocusedElement ?? fusionCard)?.focus?.();
}

function initFusionCaseStudy() {
  if (!fusionCaseStudy) return;

  buildFusionPresentation();

  /* Mouse click */
  fusionCard?.addEventListener(
    "click",
    openFusionCaseStudy,
  );

  /* Keyboard accessibility */
  fusionCard?.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();

        openFusionCaseStudy();
      }
    },
  );

  /* Close button */
  closeFusion?.addEventListener(
    "click",
    closeFusionCaseStudy,
  );

  /* Escape + focus trap */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        !fusionCaseStudy.classList.contains(
          "open",
        )
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();

        closeFusionCaseStudy();
        return;
      }

      trapFocus(fusionCaseStudy, event);
    },
  );
}

  /* =========================================================
     TRANSITION WATCHDOG

     Protects against a transition getting stuck "in progress"
     if the tab is backgrounded, the machine sleeps, or an
     exception occurs mid-transition. Without this, a stuck
     isTransitioning flag silently disables all navigation.
  ========================================================= */

  function initTransitionWatchdog() {
    setInterval(() => {
      if (
        isTransitioning &&
        Date.now() - transitionStartedAt >
          TRANSITION_DURATION + 500
      ) {
        isTransitioning = false;
        setSlideState();
      }
    }, 1000);
  }

  /* =========================================================
     INIT
  ========================================================= */

  function init() {
    openHashSlide();

    setSlideState();

    if (presentation) {
      presentation.dataset.transition =
        transitionMap[currentSlide] ||
        "right";
    }

    updateProgress();
    updateHash();
    updateNavigation();

    initOpening();
    initNavigation();
    initMobileMenu();
    initWheel();
    initKeyboard();
    initTouch();
    initButtons();
    initMagneticElements();
    initCursor();
    initKaraokeCaseStudy();
    initGymBroCaseStudy();
    initFusionCaseStudy();
    initTransitionWatchdog();
    updateYear();
  }

  init();
})();
