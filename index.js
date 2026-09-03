(function () {
  const typedLine = document.getElementById('typed-line');
  const cursor = document.getElementById('cursor');
  if (!typedLine || !cursor) return;

  const text = 'OS Its ready ! you can reboot it.';
  let i = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function type() {
    if (i < text.length) {
      typedLine.textContent += text.charAt(i);
      i++;
      setTimeout(type, prefersReducedMotion ? 0 : 60);
    } else {
      setTimeout(() => {
        cursor.style.display = 'none';
      }, prefersReducedMotion ? 0 : 1200);
    }
  }

  setTimeout(type, prefersReducedMotion ? 0 : 600);
})();
