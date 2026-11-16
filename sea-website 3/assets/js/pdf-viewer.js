/* Guidebook page viewer, built on PDF.js (Apache-2.0, self-hosted).
   The cover image shows immediately; PDF.js and the PDF only load
   when the viewer scrolls into view, and pages are fetched on demand. */
const viewer = document.querySelector("[data-pdf]");

if (viewer) {
  const url = viewer.getAttribute("data-pdf");
  const total = Number(viewer.getAttribute("data-pages")) || 1;
  const stage = viewer.querySelector(".pdf-stage");
  const prev = viewer.querySelector(".pdf-prev");
  const next = viewer.querySelector(".pdf-next");
  const counter = viewer.querySelector(".pdf-count");
  const libBase = new URL("../vendor/pdfjs/", import.meta.url);

  let page = 1;
  let pages = total;
  let docPromise = null;
  let canvas = null;
  let rendering = null;

  const loading = document.createElement("div");
  loading.className = "pdf-loading";
  loading.setAttribute("role", "status");

  function updateControls() {
    counter.textContent = page + " / " + pages;
    prev.disabled = page <= 1;
    next.disabled = page >= pages;
  }

  function loadDoc() {
    if (!docPromise) {
      docPromise = import(new URL("pdf.min.js", libBase).href).then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.js", libBase).href;
        return pdfjs.getDocument({ url, disableAutoFetch: true, disableStream: true, rangeChunkSize: 262144 }).promise;
      }).then((doc) => {
        pages = doc.numPages;
        updateControls();
        return doc;
      });
    }
    return docPromise;
  }

  async function render(n) {
    const doc = await loadDoc();
    const p = await doc.getPage(n);
    const width = stage.clientWidth;
    const base = p.getViewport({ scale: 1 });
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const vp = p.getViewport({ scale: (width / base.width) * ratio });
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      stage.appendChild(canvas);
    }
    canvas.width = vp.width;
    canvas.height = vp.height;
    if (rendering) rendering.cancel();
    rendering = p.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
    try { await rendering.promise; } catch (e) { /* cancelled by a newer render */ }
  }

  async function go(n) {
    if (n < 1 || n > pages) return;
    page = n;
    updateControls();
    loading.textContent = "Loading page " + page + "…";
    stage.appendChild(loading);
    try {
      if (page === 1 && !canvas) { loading.remove(); return; } // cover image already shown
      await render(page);
      loading.remove();
    } catch (err) {
      loading.textContent = "This page couldn’t load. Use “Download PDF” to read the guidebook.";
    }
  }

  prev.addEventListener("click", () => go(page - 1));
  next.addEventListener("click", () => go(page + 1));
  viewer.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") go(page - 1);
    if (e.key === "ArrowRight") go(page + 1);
  });

  // Warm up the library once the viewer is near the screen.
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { io.disconnect(); loadDoc().catch(() => {}); }
    }, { rootMargin: "300px" });
    io.observe(viewer);
  }

  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => { if (canvas) render(page); }, 200);
  });

  updateControls();
}
