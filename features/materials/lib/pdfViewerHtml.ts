/**
 * Self-contained PDF.js viewer HTML for react-native-webview.
 * Uses PDF.js 4.x UMD build from CDN (requires network when opening viewer).
 */
export const PDF_VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0b0b0c; touch-action: pan-x pan-y pinch-zoom; }
    #wrap { width: 100%; height: 100%; overflow: auto; -webkit-overflow-scrolling: touch; display: flex; flex-direction: column; align-items: center; padding: 8px 0 24px; }
    #status { color: #9ca3af; font: 14px system-ui, sans-serif; padding: 24px; text-align: center; }
    canvas.page { display: block; margin: 0 auto 12px; max-width: 100%; height: auto; box-shadow: 0 2px 12px rgba(0,0,0,0.4); background: #fff; }
    .textLayer { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; opacity: 0.25; line-height: 1; }
    .textLayer span { color: transparent; position: absolute; white-space: pre; transform-origin: 0 0; cursor: text; }
    .textLayer ::selection { background: rgba(255, 200, 92, 0.45); }
    .pageWrap { position: relative; margin: 0 auto 12px; }
    .highlightLayer { position: absolute; left: 0; top: 0; pointer-events: none; }
    .hl { position: absolute; background: rgba(255, 200, 92, 0.45); border-radius: 2px; }
    mark.find { background: rgba(255, 200, 92, 0.75); }
    mark.find.current { background: rgba(255, 140, 40, 0.9); }
  </style>
</head>
<body>
  <div id="wrap"><p id="status">Loading viewer…</p></div>
  <script type="module">
    import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

    const wrap = document.getElementById("wrap");
    const statusEl = document.getElementById("status");

    let pdfDoc = null;
    let pdfPassword = undefined;
    let scale = 1.2;
    let currentPage = 1;
    let pageElements = [];
    let highlights = [];
    let findQuery = "";
    let findMatches = [];
    let findIndex = -1;
    let touchStartX = 0;
    let touchStartY = 0;

    function post(msg) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    function setStatus(text) {
      statusEl.textContent = text;
      statusEl.style.display = "block";
    }

    function hideStatus() {
      statusEl.style.display = "none";
    }

    async function renderPage(pageNum) {
      if (!pdfDoc) return;
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      let pageWrap = pageElements[pageNum - 1];
      if (!pageWrap) {
        pageWrap = document.createElement("div");
        pageWrap.className = "pageWrap";
        pageWrap.dataset.page = String(pageNum);
        const canvas = document.createElement("canvas");
        canvas.className = "page";
        const textLayer = document.createElement("div");
        textLayer.className = "textLayer";
        const hlLayer = document.createElement("div");
        hlLayer.className = "highlightLayer";
        pageWrap.appendChild(canvas);
        pageWrap.appendChild(textLayer);
        pageWrap.appendChild(hlLayer);
        wrap.appendChild(pageWrap);
        pageElements[pageNum - 1] = pageWrap;
      }
      const canvas = pageWrap.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";
      pageWrap.style.width = viewport.width + "px";
      pageWrap.style.height = viewport.height + "px";
      await page.render({ canvasContext: ctx, viewport }).promise;
      const textLayer = pageWrap.querySelector(".textLayer");
      textLayer.innerHTML = "";
      textLayer.style.width = viewport.width + "px";
      textLayer.style.height = viewport.height + "px";
      const textContent = await page.getTextContent();
      await pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayer,
        viewport,
        textDivs: [],
      }).promise;
      paintHighlights(pageNum, pageWrap);
      if (findQuery) applyFindToPage(pageNum, pageWrap);
    }

    async function renderAllPages() {
      hideStatus();
      wrap.innerHTML = "";
      statusEl.id = "status";
      wrap.appendChild(statusEl);
      pageElements = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        await renderPage(i);
      }
      post({ type: "loaded", pages: pdfDoc.numPages });
    }

    function paintHighlights(pageNum, pageWrap) {
      const hlLayer = pageWrap.querySelector(".highlightLayer");
      hlLayer.innerHTML = "";
      const pageHl = highlights.filter((h) => h.page === pageNum);
      for (const h of pageHl) {
        for (const r of h.rects) {
          const el = document.createElement("div");
          el.className = "hl";
          el.style.left = r.x + "px";
          el.style.top = r.y + "px";
          el.style.width = r.width + "px";
          el.style.height = r.height + "px";
          hlLayer.appendChild(el);
        }
      }
    }

  function applyFindToPage(pageNum, pageWrap) {
      const textLayer = pageWrap.querySelector(".textLayer");
      if (!textLayer || !findQuery) return;
      const escaped = findQuery.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
      const re = new RegExp(escaped, "gi");
      textLayer.querySelectorAll("span").forEach((span) => {
        const text = span.textContent || "";
        if (!re.test(text)) return;
        re.lastIndex = 0;
        const mark = document.createElement("mark");
        mark.className = "find";
        mark.textContent = text;
        span.textContent = "";
        span.appendChild(mark);
      });
    }

    async function runFind(query, forward) {
      findQuery = query || "";
      findMatches = [];
      findIndex = -1;
      if (!pdfDoc || !findQuery) {
        await renderAllPages();
        post({ type: "findResult", count: 0, index: -1 });
        return;
      }
      for (let p = 1; p <= pdfDoc.numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const tc = await page.getTextContent();
        const text = tc.items.map((it) => it.str).join(" ");
        const escaped = findQuery.replace(/[.*+?^\${}()|[\\]\\\\]/g, "\\\\$&");
        const re = new RegExp(escaped, "gi");
        let m;
        while ((m = re.exec(text))) {
          findMatches.push({ page: p, offset: m.index });
        }
      }
      if (findMatches.length === 0) {
        await renderAllPages();
        post({ type: "findResult", count: 0, index: -1 });
        return;
      }
      findIndex = forward
        ? 0
        : findMatches.length - 1;
      const target = findMatches[findIndex];
      currentPage = target.page;
      await renderAllPages();
      const pageWrap = pageElements[target.page - 1];
      if (pageWrap) {
        pageWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      post({ type: "findResult", count: findMatches.length, index: findIndex });
    }

    function findNext(forward) {
      if (!findMatches.length) return;
      findIndex = forward
        ? (findIndex + 1) % findMatches.length
        : (findIndex - 1 + findMatches.length) % findMatches.length;
      const target = findMatches[findIndex];
      currentPage = target.page;
      const pageWrap = pageElements[target.page - 1];
      if (pageWrap) pageWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      post({ type: "findResult", count: findMatches.length, index: findIndex });
    }

    async function loadPdfFromBase64(base64) {
      try {
        setStatus("Opening PDF…");
        const raw = atob(base64);
        const bytes = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
        const loadingTask = pdfjsLib.getDocument({ data: bytes, password: pdfPassword });
        pdfDoc = await loadingTask.promise;
        await renderAllPages();
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        if (/password/i.test(msg) || err && err.name === "PasswordException") {
          post({ type: "needPassword" });
          setStatus("Password required");
          return;
        }
        post({ type: "error", message: msg });
        setStatus(msg);
      }
    }

    function getSelectionHighlight() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const node = range.commonAncestorContainer;
      let pageWrap = node.nodeType === 1 ? node : node.parentElement;
      while (pageWrap && !pageWrap.classList?.contains("pageWrap")) {
        pageWrap = pageWrap.parentElement;
      }
      if (!pageWrap) return null;
      const page = Number(pageWrap.dataset.page || "1");
      const wrapRect = pageWrap.getBoundingClientRect();
      return {
        page,
        rects: [{
          x: rect.left - wrapRect.left,
          y: rect.top - wrapRect.top,
          width: rect.width,
          height: rect.height,
        }],
        text: sel.toString(),
      };
    }

    document.addEventListener("copy", (e) => {
      const sel = window.getSelection();
      const text = sel ? sel.toString() : "";
      if (text) post({ type: "copy", text });
    });

    wrap.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    wrap.addEventListener("touchend", (e) => {
      if (!pdfDoc || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0 && currentPage < pdfDoc.numPages) {
        currentPage += 1;
        const el = pageElements[currentPage - 1];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        post({ type: "page", page: currentPage, total: pdfDoc.numPages });
      } else if (dx > 0 && currentPage > 1) {
        currentPage -= 1;
        const el = pageElements[currentPage - 1];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        post({ type: "page", page: currentPage, total: pdfDoc.numPages });
      }
    }, { passive: true });

    window.handlePdfMessage = function(raw) {
      try {
        const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (msg.type === "load") {
          highlights = msg.highlights || [];
          loadPdfFromBase64(msg.base64);
        } else if (msg.type === "password") {
          pdfPassword = msg.value || "";
          if (msg.base64) loadPdfFromBase64(msg.base64);
        } else if (msg.type === "find") {
          if (msg.findNext != null) findNext(!!msg.findNext);
          else runFind(msg.query || "", true);
        } else if (msg.type === "highlight") {
          const sel = getSelectionHighlight();
          if (sel && sel.rects[0].width > 2) {
            post({ type: "highlightAdded", highlight: { page: sel.page, rects: sel.rects } });
          }
        } else if (msg.type === "setHighlights") {
          highlights = msg.highlights || [];
          if (pdfDoc) renderAllPages();
        } else if (msg.type === "setScale") {
          scale = msg.scale || 1.2;
          if (pdfDoc) renderAllPages();
        }
      } catch (err) {
        post({ type: "error", message: String(err) });
      }
    };

    function onBridgeMessage(event) {
      const raw = event.data ?? event.nativeEvent?.data;
      if (raw) window.handlePdfMessage(raw);
    }
    document.addEventListener("message", onBridgeMessage);
    window.addEventListener("message", onBridgeMessage);

    post({ type: "ready" });
  </script>
</body>
</html>`;
