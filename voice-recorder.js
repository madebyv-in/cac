// voice-recorder.js
// Uses the Web Speech API (SpeechRecognition) when available.

document.addEventListener('DOMContentLoaded', () => {
  const recordBtn = document.getElementById('recordBtn');
  const transcriptEl = document.getElementById('transcript');
  const statusEl = document.getElementById('status');

  // Feature detection
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    statusEl.textContent = 'Speech recognition is not supported in this browser.';
    recordBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  // Try a sensible default but prefer the user's browser locale when possible.
  const userLang = (navigator.language || navigator.userLanguage || 'en-US');
  recognition.lang = userLang || 'en-US';
  recognition.interimResults = true;
  recognition.continuous = false; // stop automatically after a pause

  let finalTranscript = '';
  let isRecording = false;
  let pendingFallbackLang = null; // when set, restart with this lang after end

  recognition.addEventListener('start', () => {
    isRecording = true;
    recordBtn.textContent = 'Stop Recording';
    recordBtn.classList.add('recording');
    statusEl.textContent = 'Listening...';
  });

  recognition.addEventListener('end', () => {
    isRecording = false;
    recordBtn.textContent = 'Start Recording';
    recordBtn.classList.remove('recording');
    statusEl.textContent = 'Idle';
    // If we have a pending fallback language (set by an error handler), try to start again now.
    if (pendingFallbackLang) {
      const langToTry = pendingFallbackLang;
      pendingFallbackLang = null;
      try {
        recognition.lang = langToTry;
        recognition.start();
        console.info('Started recognition with fallback language after end:', langToTry);
        statusEl.textContent = 'Listening (fallback language ' + langToTry + ')...';
      } catch (err) {
        console.warn('Fallback start failed after end for', langToTry, err);
        statusEl.textContent = 'Fallback start failed: ' + (err && err.message ? err.message : String(err));
      }
    }
  });

  recognition.addEventListener('result', (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        finalTranscript += res[0].transcript;
      } else {
        interim += res[0].transcript;
      }
    }
    transcriptEl.value = finalTranscript + (interim ? '\n' + interim : '');
  });

  recognition.addEventListener('error', (e) => {
    console.error('SpeechRecognition error', e);
    // If the browser reports the language is not supported, try fallback languages.
    if (e && e.error === 'language-not-supported') {
      statusEl.textContent = 'Language not supported: trying fallback locales...';
      // Try fallback sequence: browser locale -> 'en-US' -> leave as-is
      const fallbacks = [navigator.language, 'en-US'];
      // find the first fallback different from current lang
      let chosen = null;
      for (const lang of fallbacks) {
        if (!lang) continue;
        const normalized = lang.replace('_', '-');
        if (normalized === recognition.lang) continue;
        chosen = normalized;
        break;
      }
      if (chosen) {
        // If recognition is running, schedule restart after end to avoid InvalidStateError.
        pendingFallbackLang = chosen;
        try {
          if (isRecording) {
            recognition.stop();
            console.info('Stopping recognition to apply fallback language', chosen);
          } else {
            recognition.lang = chosen;
            recognition.start();
            console.info('Started recognition with fallback language', chosen);
            statusEl.textContent = 'Listening (fallback language ' + chosen + ')...';
            pendingFallbackLang = null;
          }
        } catch (err) {
          console.warn('Fallback start failed for', chosen, err);
          pendingFallbackLang = null;
          statusEl.textContent = 'Fallback start failed: ' + (err && err.message ? err.message : String(err));
        }
      } else {
        statusEl.textContent = 'Speech recognition language not supported by this browser.';
      }
      return;
    }

    statusEl.textContent = 'Error: ' + (e.error || e.message || 'unknown');
  });

  recordBtn.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
    } else {
      finalTranscript = '';
      transcriptEl.value = '';
      try {
        recognition.start();
      } catch (e) {
        // start can throw if called repeatedly; ensure we handle gracefully
        console.warn('Recognition start error', e);
      }
    }
  });

  // Optional: when nav loads, focus accessibility
  document.addEventListener('navLoaded', () => {
    // nothing for now, placeholder if we want to highlight nav
  });
});
