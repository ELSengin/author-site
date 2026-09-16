(() => {
  "use strict";

  const config = window.READER_CONFIG;
  if (!config) return;

  const pageImage = document.getElementById("reader-page");
  const previousButton = document.getElementById("reader-previous");
  const nextButton = document.getElementById("reader-next");
  const fullscreenButton = document.getElementById("reader-fullscreen");
  const pageIndicator = document.getElementById("reader-indicator");
  const readerShell = document.getElementById("reader-shell");
  const readerStage = document.getElementById("reader-stage");
  const feedbackPanel = document.getElementById("reader-feedback");
  const feedbackForm = document.getElementById("reader-feedback-form");
  const feedbackCancel = document.getElementById("reader-feedback-cancel");
  const feedbackStatus = document.getElementById("reader-feedback-status");

  let pages = [];
  let currentIndex = 0;
  let touchStartX = null;
  let touchStartY = null;
  let fallbackFullscreen = false;

  function setImmersive(active) {
    fallbackFullscreen = active;
    readerShell.classList.toggle("reader-immersive", active);
    document.documentElement.classList.toggle("reader-immersive-root", active);
    document.body.classList.toggle("reader-immersive-root", active);
    setFullscreenLabel(active);
    // iOS Safari may retain browser chrome, but scrolling to the top prevents
    // any document content outside the reader from occupying the viewport.
    if (active) window.scrollTo(0, 0);
  }

  function padPageNumber(number, width) {
    return String(number).padStart(width, "0");
  }

  function buildSequentialUrl(number) {
    return `${config.folder}${config.prefix}${padPageNumber(number, config.numberWidth || 3)}${config.extension || ".webp"}`;
  }

  function imageExists(url) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
  }

  async function discoverSequentialPages() {
    const discovered = [];
    const firstPage = Number.isInteger(config.firstPage) ? config.firstPage : 1;
    const safetyLimit = Number.isInteger(config.safetyLimit) ? config.safetyLimit : 999;

    for (let pageNumber = firstPage; pageNumber < firstPage + safetyLimit; pageNumber += 1) {
      const url = buildSequentialUrl(pageNumber);
      if (!(await imageExists(url))) break;
      discovered.push(url);
    }

    return discovered;
  }

  function preload(index) {
    if (index < 0 || index >= pages.length) return;
    const image = new Image();
    image.src = pages[index];
  }

  function updateReader() {
    if (pages.length === 0) {
      pageImage.removeAttribute("src");
      pageImage.alt = "No reader pages are currently available.";
      pageIndicator.textContent = "No pages available";
      previousButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    pageImage.src = pages[currentIndex];
    pageImage.alt = `${config.title || "Reader"}, page ${currentIndex + 1} of ${pages.length}`;
    pageIndicator.textContent = `${currentIndex + 1} / ${pages.length}`;
    previousButton.disabled = currentIndex === 0;

    const isLastPage = currentIndex === pages.length - 1;
    if (config.feedback && isLastPage) {
      nextButton.disabled = false;
      nextButton.classList.add("reader-share-thought");
      nextButton.innerHTML = '<span class="wide-label">Share a thought</span><span class="narrow-label">Thought</span> →';
      nextButton.setAttribute("aria-label", "Share a thought");
    } else {
      nextButton.disabled = isLastPage;
      nextButton.classList.remove("reader-share-thought");
      nextButton.innerHTML = '<span class="wide-label">Next</span> →';
      nextButton.setAttribute("aria-label", "Next page");
      if (feedbackPanel) feedbackPanel.hidden = true;
    }

    preload(currentIndex - 1);
    preload(currentIndex + 1);
  }

  function goPrevious() {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateReader();
    }
  }

  function goNext() {
    if (currentIndex < pages.length - 1) {
      currentIndex += 1;
      updateReader();
    }
  }

  previousButton.addEventListener("click", goPrevious);
  nextButton.addEventListener("click", () => {
    const isLastPage = pages.length > 0 && currentIndex === pages.length - 1;
    if (config.feedback && isLastPage && feedbackPanel) {
      feedbackPanel.hidden = false;
      const textarea = feedbackPanel.querySelector("textarea");
      if (textarea) textarea.focus();
      return;
    }
    goNext();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen();
    } else if (event.key === "Escape" && fallbackFullscreen) {
      setImmersive(false);
    }
  });

  readerStage.addEventListener("touchstart", event => {
    if (event.touches.length !== 1) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  readerStage.addEventListener("touchend", event => {
    if (touchStartX === null || touchStartY === null || event.changedTouches.length !== 1) return;

    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    touchStartY = null;

    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX < 0) goNext();
    else goPrevious();
  }, { passive: true });

  function setFullscreenLabel(active) {
    fullscreenButton.textContent = active ? "Exit Full Screen" : "Full Screen";
    fullscreenButton.setAttribute("aria-label", active ? "Exit full screen" : "Full screen");
  }

  fullscreenButton.addEventListener("click", async () => {
    // Use the browser Fullscreen API where available. iPhone Safari may not expose it
    // for ordinary page elements, so keep the control visible and provide an immersive
    // fallback that hides the reader chrome and maximizes the page within Safari.
    if (document.fullscreenEnabled && readerShell.requestFullscreen) {
      try {
        if (!document.fullscreenElement) await readerShell.requestFullscreen();
        else await document.exitFullscreen();
        return;
      } catch (_) {
        // Fall through to the CSS immersive mode.
      }
    }

    setImmersive(!fallbackFullscreen);
  });

  document.addEventListener("fullscreenchange", () => {
    setFullscreenLabel(Boolean(document.fullscreenElement));
  });

  pageImage.addEventListener("dragstart", event => event.preventDefault());
  readerStage.addEventListener("contextmenu", event => event.preventDefault());

  async function initializeReader() {
    pageIndicator.textContent = "Loading…";
    previousButton.disabled = true;
    nextButton.disabled = true;

    if (Array.isArray(config.pages) && config.pages.length > 0) {
      pages = config.pages.slice();
    } else if (config.folder && config.prefix) {
      pages = await discoverSequentialPages();
    }

    currentIndex = 0;
    updateReader();
  }

  if (feedbackCancel && feedbackPanel) {
    feedbackCancel.addEventListener("click", () => {
      feedbackPanel.hidden = true;
      nextButton.focus();
    });
  }

  if (feedbackForm && feedbackStatus) {
    feedbackForm.addEventListener("submit", async event => {
      event.preventDefault();
      const message = feedbackForm.querySelector('textarea[name="message"]');
      if (!message || !message.value.trim()) {
        feedbackStatus.textContent = "Please write a thought before sending.";
        if (message) message.focus();
        return;
      }

      const submitButton = feedbackForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      feedbackStatus.textContent = "Sending…";

      try {
        const endpoint = feedbackForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(feedbackForm)
        });
        if (!response.ok) throw new Error("Submission failed");

        feedbackForm.reset();
        feedbackStatus.textContent = "Thank you. Your thought has been sent.";
        submitButton.textContent = "Sent";
      } catch (_) {
        feedbackStatus.textContent = "The message could not be sent. Please try again.";
        submitButton.disabled = false;
      }
    });
  }

  initializeReader();
})();
