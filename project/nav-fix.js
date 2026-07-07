// Forces in-project page navigation even when the host editor intercepts anchor clicks,
// and shows a branded loader overlay during the page change.
(function () {
  function showLoader() {
    if (document.getElementById('mt-loader')) return;
    var o = document.createElement('div');
    o.id = 'mt-loader';
    o.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#edf2fa;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;opacity:0;transition:opacity .25s ease;';
    o.innerHTML =
      '<svg width="46" height="46" viewBox="0 0 32 32" fill="none" style="animation:mtspin .9s linear infinite;">' +
      '<circle cx="16" cy="16" r="11" stroke="var(--accent, #69c7b9)" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-dasharray="53.5 15.6" transform="rotate(-52 16 16)"></circle>' +
      '<circle cx="16" cy="16" r="3.9" fill="#0e0d12"></circle></svg>' +
      '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:.2em;color:#44424d;">LOADING</div>';
    var st = document.createElement('style');
    st.textContent = '@keyframes mtspin{to{transform:rotate(360deg)}}';
    o.appendChild(st);
    document.body.appendChild(o);
    requestAnimationFrame(function () { o.style.opacity = '1'; });
  }
  function handler(e) {
    var el = e.target;
    while (el && el.nodeType === 1 && el.tagName !== 'A') el = el.parentNode;
    if (!el || el.nodeType !== 1 || !el.getAttribute) return;
    var href = el.getAttribute('href') || '';
    if (href.indexOf('.dc.html') === -1) return;
    e.preventDefault();
    e.stopPropagation();
    showLoader();
    setTimeout(function () { window.location.assign(href); }, 240);
  }
  window.addEventListener('click', handler, true);
  // remove the loader if the page is restored from the back/forward cache
  window.addEventListener('pageshow', function () {
    var o = document.getElementById('mt-loader');
    if (o && o.parentNode) o.parentNode.removeChild(o);
  });
})();
