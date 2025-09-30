// nav-loader.js
// Loads the shared nav fragment into an element with id `site-nav`.

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('site-nav');
  if (!container) return;
  // If the page is opened using the file:// protocol, many browsers block fetch() for local files.
  // In that case inject the fallback nav directly to avoid console errors.
  if (location.protocol === 'file:') {
    container.innerHTML = `
      <nav>
        <a href="for-you.html" id="nav-for-you">For You</a>
        <a href="take-action.html">Take Action</a>
        <a href="get-help.html">Get Help</a>
        <a href="voice-recorder.html">Voice Recorder</a>
      </nav>
    `;
    document.dispatchEvent(new Event('navLoaded'));
    return;
  }

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
      // Log a warning (not an error) — fallback nav will be injected so the page still works.
      console.warn('nav-loader warning: failed to fetch nav fragment; using fallback nav.', err);
      // Fallback: inject a full nav so pages still have navigation when fetch fails
      container.innerHTML = `
        <nav>
          <a href="for-you.html" id="nav-for-you">For You</a>
          <a href="take-action.html">Take Action</a>
          <a href="get-help.html">Get Help</a>
          <a href="voice-recorder.html">Voice Recorder</a>
        </nav>
      `;
      document.dispatchEvent(new Event('navLoaded'));
    });
});
