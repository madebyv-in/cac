// nav-loader.js
// Loads the shared nav fragment into an element with id `site-nav`.

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('site-nav');
  if (!container) return;

  fetch('nav.html')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load nav fragment');
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;
      // notify that nav has been loaded so other scripts can bind to it
      document.dispatchEvent(new Event('navLoaded'));
    })
    .catch(err => {
      console.error('nav-loader error:', err);
      // Fallback: inject a full nav so pages still have navigation when fetch fails
      container.innerHTML = `
        <nav>
          <a href="for-you.html" id="nav-for-you">For You</a>
          <a href="take-action.html">Take Action</a>
          <a href="get-help.html">Get Help</a>
        </nav>
      `;
      document.dispatchEvent(new Event('navLoaded'));
    });
});
