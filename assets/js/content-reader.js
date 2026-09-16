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

  let pages = [];
  let currentIndex = 0;
  let touchStartX = null;
  let touchStartY = null;

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
    nextButton.disabled = currentIndex === pages.length - 1;

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
  nextButton.addEventListener("click", goNext);

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "Escape" && document.fullscreenElement) {
      document.exitFullscreen();
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

  if (document.fullscreenEnabled) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (!document.fullscreenElement) await readerShell.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) {
        // Fullscreen can be denied by the browser or device; the reader remains usable.
      }
    });

    document.addEventListener("fullscreenchange", () => {
      fullscreenButton.textContent = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
    });
  } else {
    fullscreenButton.hidden = true;
  }

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

  initializeReader();
})();
