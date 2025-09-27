// for-you.js

// Fetch personalized updates from JSON file with fallbacks for file:// scenarios
async function getPersonalizedUpdates() {
    // Primary: fetch API
    try {
        const res = await fetch('personalized.json');
        if (res.ok) {
            try {
                return await res.json();
            } catch (jsonErr) {
                console.error('personalized.json is not valid JSON:', jsonErr);
            }
        } else {
            console.warn('personalized.json fetch returned non-ok status:', res.status);
        }
    } catch (err) {
        console.warn('fetch failed for personalized.json (possibly file://):', err);
    }

    // Fallback: try XMLHttpRequest (may work in some file:// contexts)
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'personalized.json', false); // synchronous fallback
        xhr.send(null);
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
            try {
                return JSON.parse(xhr.responseText);
            } catch (parseErr) {
                console.error('Failed to parse personalized.json via XHR:', parseErr);
            }
        } else {
            console.warn('XHR failed to load personalized.json, status:', xhr.status);
        }
    } catch (xhrErr) {
        console.warn('XHR attempt to load personalized.json failed:', xhrErr);
    }

    // Final fallback: inline default data so UI still shows something
    console.info('Using inline fallback personalized updates');
    return [
        { id: 1, title: 'Welcome back!', message: 'Check out your new dashboard features.' },
        { id: 2, title: 'Project Reminder', message: "Don't forget to review your latest project." },
        { id: 3, title: 'Tips & Tricks', message: 'Try our new shortcut keys for faster navigation.' }
    ];
}

// Hook up "For you" menu
document.addEventListener("DOMContentLoaded", async () => {
    const forYouMenu = document.getElementById("for-you-menu");
    if (!forYouMenu) return;

    forYouMenu.innerHTML = ""; // Clear previous content
    const updates = await getPersonalizedUpdates();

    if (!updates || updates.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'update-item empty-state';
        empty.innerHTML = '<p>No personalized updates available.</p>';
        forYouMenu.appendChild(empty);
        return;
    }

    updates.forEach(update => {
        const item = document.createElement("div");
        item.className = "update-item";
        item.innerHTML = `<h3>${escapeHtml(update.title)}</h3><p>${escapeHtml(update.message)}</p>`;
        forYouMenu.appendChild(item);
    });
});

// small helper to avoid injecting raw HTML from external JSON
function escapeHtml(s) {
    if (typeof s !== 'string') return '' + s;
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// Smooth-scroll behavior: when nav 'For You' link is clicked, focus the for-you section
function bindForYouNav() {
    const navForYou = document.getElementById("nav-for-you");
    const forYouMenu = document.getElementById("for-you-menu");
    if (!navForYou || !forYouMenu) return;

    // Avoid double-binding
    if (navForYou.dataset.bound === 'true') return;
    navForYou.dataset.bound = 'true';

    navForYou.addEventListener("click", (e) => {
        e.preventDefault();
        // When clicked from another page, the browser will navigate to for-you.html.
        // If we're already on for-you.html, scroll smoothly; otherwise allow navigation.
        if (window.location.pathname.endsWith('for-you.html')) {
            forYouMenu.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            // Let the default navigation occur
            window.location.href = navForYou.getAttribute('href');
        }
    });
}

document.addEventListener('navLoaded', bindForYouNav);
document.addEventListener('DOMContentLoaded', bindForYouNav);

// Example HTML structure:
// <div id="for-you-menu"></div>