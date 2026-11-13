// Loaded as a file rather than inlined so the Content-Security-Policy can stay script-src 'self'.
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch {
    // Storage can be blocked in private windows; the OS preference is a fine fallback.
  }
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = stored || (prefersDark ? 'dark' : 'light');
})();
