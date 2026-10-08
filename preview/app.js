/* ==========================================================================
   GlassOS - Interactive Engine & Native Android Bridge
   ========================================================================== */

(function() {
  'use strict';

  // --- Audio Synthesis for Glass Click Haptics ---
  let audioCtx = null;
  function playGlassClick(pitch = 1200, decay = 0.08) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.4, audioCtx.currentTime + decay);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + decay);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + decay);
    } catch (e) {}

    // Android Hardware Vibration
    if (window.Android && window.Android.vibrate) {
      window.Android.vibrate(25);
    }
  }

  // --- State ---
  const state = {
    currentView: 'home',
    isPlaying: true,
    trackProgress: 48,
    volumeLevel: 75,
    brightnessLevel: 80,
    currentTrack: {
      title: "Psychedelic",
      artist: "D3m0n X Diablo",
      duration: "3:42",
      remaining: "-3:06"
    },
    toggles: {
      wifi: true,
      bluetooth: true,
      data: true,
      flashlight: false,
      airplane: false,
      rotate: true
    }
  };

  // --- DOM Elements ---
  const views = {
    home: document.getElementById('view-home'),
    controlcenter: document.getElementById('view-controlcenter'),
    appdrawer: document.getElementById('view-appdrawer'),
    lockscreen: document.getElementById('view-lockscreen')
  };

  const dockButtons = document.querySelectorAll('.dock-tab-btn');
  const volumePopup = document.getElementById('volume-popup');
  const volFill = document.getElementById('vol-fill');
  const volPercent = document.getElementById('vol-percent');
  const clockText = document.getElementById('status-clock');
  const lockClockText = document.getElementById('lock-clock');
  const lockDateText = document.getElementById('lock-date');

  // --- Clock updater ---
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (clockText) clockText.textContent = timeStr;
    if (lockClockText) lockClockText.textContent = timeStr;

    if (lockDateText) {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      lockDateText.textContent = now.toLocaleDateString('en-US', options);
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- Navigation & Views ---
  function switchView(viewName) {
    if (!views[viewName]) return;
    playGlassClick(1400);

    Object.keys(views).forEach(key => {
      if (views[key]) views[key].classList.remove('active');
    });

    views[viewName].classList.add('active');
    state.currentView = viewName;

    // Update bottom dock indicator
    dockButtons.forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Close volume popup if open
    if (volumePopup) volumePopup.classList.remove('open');
  }

  window.switchView = switchView;

  dockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      if (targetView === 'volume') {
        toggleVolumePopup();
      } else {
        switchView(targetView);
      }
    });
  });

  // --- Volume Popup Overlay ---
  let volumeTimeout = null;
  function showVolumePopup() {
    playGlassClick(1100);
    if (!volumePopup) return;
    volumePopup.classList.add('open');
    if (volFill) volFill.style.height = state.volumeLevel + '%';
    if (volPercent) volPercent.textContent = state.volumeLevel + '%';

    clearTimeout(volumeTimeout);
    volumeTimeout = setTimeout(() => {
      volumePopup.classList.remove('open');
    }, 2800);
  }

  function toggleVolumePopup() {
    if (volumePopup.classList.contains('open')) {
      volumePopup.classList.remove('open');
    } else {
      showVolumePopup();
    }
  }

  window.toggleVolumePopup = toggleVolumePopup;

  // Intercept Hardware Volume Keys from Android
  window.onHardwareVolumeChange = function(direction) {
    if (direction === 'up') {
      state.volumeLevel = Math.min(100, state.volumeLevel + 5);
    } else {
      state.volumeLevel = Math.max(0, state.volumeLevel - 5);
    }
    if (window.Android && window.Android.setVolume) {
      window.Android.setVolume(state.volumeLevel);
    }
    showVolumePopup();
  };

  // Hardware Back Key Handler
  window.handleHardwareBack = function() {
    if (volumePopup && volumePopup.classList.contains('open')) {
      volumePopup.classList.remove('open');
      return true;
    }
    if (state.currentView !== 'home') {
      switchView('home');
      return true;
    }
    return false;
  };

  // --- Music Player Controller ---
  const playBtnMain = document.getElementById('play-btn-main');
  const miniPlayBtn = document.getElementById('mini-play-btn');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');
  const trackSliderFill = document.getElementById('track-slider-fill');
  const trackSliderThumb = document.getElementById('track-slider-thumb');
  const trackTimeRem = document.getElementById('track-time-remaining');

  function togglePlayState() {
    playGlassClick(950);
    state.isPlaying = !state.isPlaying;
    const icon = state.isPlaying ? '❚❚' : '▶';
    if (playBtnMain) playBtnMain.textContent = icon;
    if (miniPlayBtn) miniPlayBtn.textContent = icon;
  }

  if (playBtnMain) playBtnMain.addEventListener('click', togglePlayState);
  if (miniPlayBtn) miniPlayBtn.addEventListener('click', togglePlayState);

  // Song progress tick
  setInterval(() => {
    if (state.isPlaying) {
      state.trackProgress = (state.trackProgress + 0.3) % 100;
      if (trackSliderFill) trackSliderFill.style.width = state.trackProgress + '%';
      if (trackSliderThumb) trackSliderThumb.style.left = state.trackProgress + '%';
    }
  }, 1000);

  // Song selection from Recommended
  const songRows = document.querySelectorAll('.song-row');
  songRows.forEach(row => {
    row.addEventListener('click', () => {
      playGlassClick(1300);
      const title = row.querySelector('.song-name').textContent;
      const artist = row.querySelector('.song-by').textContent;
      state.currentTrack.title = title;
      state.currentTrack.artist = artist;
      state.isPlaying = true;
      state.trackProgress = 0;

      if (trackTitle) trackTitle.textContent = title;
      if (trackArtist) trackArtist.textContent = artist;
      if (playBtnMain) playBtnMain.textContent = '❚❚';
      if (miniPlayBtn) miniPlayBtn.textContent = '❚❚';

      const miniTitle = document.getElementById('mini-title');
      const miniSub = document.getElementById('mini-sub');
      if (miniTitle) miniTitle.textContent = title;
      if (miniSub) miniSub.textContent = artist;
    });
  });

  // --- Control Center Toggles ---
  const ccTiles = document.querySelectorAll('.cc-tile');
  ccTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      playGlassClick(1250);
      const toggleKey = tile.dataset.toggle;
      tile.classList.toggle('active');
      const isActive = tile.classList.contains('active');

      if (toggleKey === 'flashlight' && window.Android && window.Android.toggleFlashlight) {
        window.Android.toggleFlashlight();
      } else if (toggleKey === 'wifi' && window.Android && window.Android.openWifiSettings) {
        window.Android.openWifiSettings();
      } else if (toggleKey === 'bluetooth' && window.Android && window.Android.openBluetoothSettings) {
        window.Android.openBluetoothSettings();
      }
    });
  });

  // Control Center Sliders
  const briCard = document.getElementById('cc-brightness-card');
  const briLevel = document.getElementById('cc-bri-level');
  const briVal = document.getElementById('cc-bri-val');

  if (briCard) {
    briCard.addEventListener('click', (e) => {
      const rect = briCard.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percent = Math.round(100 - (clickY / rect.height * 100));
      state.brightnessLevel = Math.max(10, Math.min(100, percent));
      if (briLevel) briLevel.style.height = state.brightnessLevel + '%';
      if (briVal) briVal.textContent = state.brightnessLevel + '%';
      playGlassClick(1500);
    });
  }

  const volCard = document.getElementById('cc-volume-card');
  const volLevel = document.getElementById('cc-vol-level');
  const volVal = document.getElementById('cc-vol-val');

  if (volCard) {
    volCard.addEventListener('click', (e) => {
      const rect = volCard.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percent = Math.round(100 - (clickY / rect.height * 100));
      state.volumeLevel = Math.max(0, Math.min(100, percent));
      if (volLevel) volLevel.style.height = state.volumeLevel + '%';
      if (volVal) volVal.textContent = state.volumeLevel + '%';
      if (volFill) volFill.style.height = state.volumeLevel + '%';
      if (volPercent) volPercent.textContent = state.volumeLevel + '%';
      if (window.Android && window.Android.setVolume) {
        window.Android.setVolume(state.volumeLevel);
      }
      playGlassClick(1300);
    });
  }

  // --- App Drawer & Real Android Apps ---
  const appGrid = document.getElementById('app-grid');
  const searchInput = document.getElementById('app-search-input');

  const defaultSampleApps = [
    { name: "Phone", icon: "📞", pkg: "com.android.dialer" },
    { name: "Messages", icon: "💬", pkg: "com.android.mms" },
    { name: "Chrome", icon: "🌐", pkg: "com.android.chrome" },
    { name: "Camera", icon: "📷", pkg: "com.android.camera" },
    { name: "WhatsApp", icon: "🟢", pkg: "com.whatsapp" },
    { name: "YouTube", icon: "▶️", pkg: "com.google.android.youtube" },
    { name: "Instagram", icon: "📸", pkg: "com.instagram.android" },
    { name: "Spotify", icon: "🎵", pkg: "com.spotify.music" },
    { name: "Settings", icon: "⚙️", pkg: "com.android.settings" },
    { name: "Photos", icon: "🖼️", pkg: "com.google.android.apps.photos" },
    { name: "Maps", icon: "🗺️", pkg: "com.google.android.apps.maps" },
    { name: "Gmail", icon: "✉️", pkg: "com.google.android.gm" },
    { name: "Clock", icon: "⏰", pkg: "com.android.deskclock" },
    { name: "Calculator", icon: "🔢", pkg: "com.android.calculator2" },
    { name: "Files", icon: "📁", pkg: "com.android.documentsui" },
    { name: "Play Store", icon: "🛍️", pkg: "com.android.vending" }
  ];

  let loadedApps = [...defaultSampleApps];

  function loadInstalledApps() {
    if (window.Android && window.Android.getInstalledApps) {
      try {
        const raw = window.Android.getInstalledApps();
        const parsed = JSON.parse(raw);
        if (parsed && parsed.length > 0) {
          loadedApps = parsed;
        }
      } catch (e) {}
    }
    renderApps(loadedApps);
  }

  function renderApps(list) {
    if (!appGrid) return;
    appGrid.innerHTML = '';
    list.forEach(app => {
      const item = document.createElement('div');
      item.className = 'app-item';
      
      let iconHtml = '';
      if (app.icon && app.icon.startsWith('data:image')) {
        iconHtml = `<img class="app-icon-img" src="${app.icon}" alt="${app.name}" />`;
      } else {
        iconHtml = `<span>${app.icon || '📱'}</span>`;
      }

      item.innerHTML = `
        <div class="app-icon-wrap">
          ${iconHtml}
        </div>
        <div class="app-label">${app.name}</div>
      `;

      item.addEventListener('click', () => {
        playGlassClick(1500);
        if (window.Android && window.Android.launchApp && app.packageName) {
          window.Android.launchApp(app.packageName);
        } else if (window.Android && window.Android.launchApp && app.pkg) {
          window.Android.launchApp(app.pkg);
        } else {
          showFloatingToast(`Launching ${app.name}...`);
        }
      });

      appGrid.appendChild(item);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = loadedApps.filter(a => a.name.toLowerCase().includes(query));
      renderApps(filtered);
    });
  }

  // --- Lock Screen Unlock Interaction ---
  const unlockThumb = document.getElementById('unlock-thumb');
  const unlockTrack = document.getElementById('unlock-track');

  if (unlockThumb && unlockTrack) {
    let isDragging = false;
    let startX = 0;

    const onStart = (clientX) => {
      isDragging = true;
      startX = clientX;
    };

    const onMove = (clientX) => {
      if (!isDragging) return;
      const trackWidth = unlockTrack.offsetWidth - 64;
      const deltaX = Math.max(0, Math.min(trackWidth, clientX - startX));
      unlockThumb.style.transform = `translateX(${deltaX}px)`;

      if (deltaX >= trackWidth * 0.85) {
        isDragging = false;
        unlockThumb.style.transform = `translateX(0px)`;
        playGlassClick(1800, 0.15);
        showFloatingToast("✨ Screen Unlocked!");
        switchView('home');
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      unlockThumb.style.transform = `translateX(0px)`;
    };

    unlockThumb.addEventListener('mousedown', (e) => onStart(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onEnd);

    unlockThumb.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX));
    window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX));
    window.addEventListener('touchend', onEnd);
  }

  // Floating Toast Notification
  function showFloatingToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '60px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(255, 255, 255, 0.55)';
    toast.style.backdropFilter = 'blur(20px)';
    toast.style.border = '1.5px solid rgba(255, 255, 255, 0.8)';
    toast.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
    toast.style.padding = '10px 22px';
    toast.style.borderRadius = '24px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '700';
    toast.style.color = '#251648';
    toast.style.zIndex = '999';
    toast.style.pointerEvents = 'none';
    toast.textContent = msg;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  // Status Bar Notch / Pull Down Swipe
  const statusNotch = document.getElementById('status-notch');
  if (statusNotch) {
    statusNotch.addEventListener('click', () => {
      if (state.currentView === 'controlcenter') {
        switchView('home');
      } else {
        switchView('controlcenter');
      }
    });
  }

  // Initialize
  loadInstalledApps();

  // Check URL query params for initial mode
  const urlParams = new URLSearchParams(window.location.search);
  const initialMode = urlParams.get('mode');
  if (initialMode && views[initialMode]) {
    switchView(initialMode);
  }

})();
