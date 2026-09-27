/**
 * ATLAS Smart Board — Master Application Orchestrator
 * 
 * Features:
 * - Strict Lock-Screen Authentication Gate (Guarded by Hardware Robot ID: 0353)
 * - Verifies real-time online status of ATLAS Robot before unlocking
 * - Zero scripted fake mockups — purely live WebSocket driven by 'python online.py'
 * - Google & Educational Image & Diagram Search & Sticker Insertion
 * - Multi-Subject Dynamic Viewport Switcher (Notes, Math KaTeX, Science, Social Science)
 * - Digital Chalkboard Drawing Engine with Touch/Stylus Bezier Smoothing
 * - Reverse Student Touch Doubt Forwarding to NonVerbalInputQueue
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Engines
  const canvas = new SmartBoardCanvas('interactive-drawing-canvas');
  const wsClient = new SmartBoardWSClient();
  const mathEngine = new MathBoardEngine('math-cartesian-canvas', 'math-steps-container');
  const scienceEngine = new ScienceDiagramsEngine('science-svg-stage');
  const socialEngine = new SocialScienceEngine('geography-globe-canvas', 'timeline-container');

  // Initial Science Model Render
  scienceEngine.render('photosynthesis');

  // -------------------------------------------------------------------------
  // 2. Strict Lock-Screen PIN Authentication Gate (Robot ID: 0353)
  // -------------------------------------------------------------------------
  const lockModal = document.getElementById('modal-settings');
  const closeLockBtn = document.getElementById('btn-close-modal');
  const connectBtn = document.getElementById('btn-connect-robot');
  const statusBox = document.getElementById('pin-status-message');
  const statusText = document.getElementById('pin-status-text');
  const wsUrlInput = document.getElementById('input-ws-url');
  const connPill = document.getElementById('btn-connection-status');
  const connLabel = document.getElementById('connection-status-text');

  const pinDigits = [
    document.getElementById('pin-1'),
    document.getElementById('pin-2'),
    document.getElementById('pin-3'),
    document.getElementById('pin-4'),
  ];

  // Default address
  const defaultWsHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'ws://localhost:8765'
    : `ws://${window.location.hostname}:8765`;
  if (wsUrlInput) wsUrlInput.value = defaultWsHost;

  // Auto-advance PIN inputs
  pinDigits.forEach((input, idx) => {
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.value.length >= 1) {
        input.value = input.value.slice(0, 1);
        if (idx < pinDigits.length - 1) {
          pinDigits[idx + 1].focus();
        } else {
          // If all 4 digits typed, auto-trigger connect
          setTimeout(handleAuthenticateAndUnlock, 150);
        }
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value.length === 0 && idx > 0) {
        pinDigits[idx - 1].focus();
      } else if (e.key === 'Enter') {
        handleAuthenticateAndUnlock();
      }
    });
  });

  // Focus first digit immediately
  setTimeout(() => {
    if (pinDigits[0]) pinDigits[0].focus();
  }, 200);

  function getEnteredPin() {
    return pinDigits.map(d => d ? d.value.trim() : '').join('');
  }

  function setStatusFeedback(state, text) {
    if (!statusBox || !statusText) return;
    statusBox.className = `pin-status-box ${state}`;
    statusText.textContent = text;
  }

  function clearPinInputs() {
    pinDigits.forEach(d => { if (d) d.value = ''; });
    if (pinDigits[0]) pinDigits[0].focus();
  }

  function handleAuthenticateAndUnlock() {
    const pin = getEnteredPin();
    const url = wsUrlInput ? wsUrlInput.value.trim() : 'ws://localhost:8765';

    if (pin.length < 4) {
      setStatusFeedback('error', 'Please enter all 4 digits of the Robot Hardware ID.');
      return;
    }

    setStatusFeedback('loading', `Connecting to ATLAS Robot at ${url}...`);
    connectBtn.disabled = true;

    // Connect WebSocket with entered PIN
    wsClient.connect(url, pin);
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', handleAuthenticateAndUnlock);
  }

  // Handle Authentication Success from Robot
  wsClient.on('onAuthSuccess', (payload) => {
    const robotId = payload.robot_id || '0353';
    setStatusFeedback('success', `Authenticated with Robot ID ${robotId}! Unlocking Smart Board...`);
    connectBtn.disabled = false;

    // Smoothly dissolve lock screen
    setTimeout(() => {
      lockModal.classList.remove('lock-screen');
      lockModal.classList.remove('active');
      if (closeLockBtn) closeLockBtn.style.display = 'block';

      if (connPill && connLabel) {
        connPill.className = 'status-pill connected';
        connLabel.textContent = `LIVE SYNC: ATLAS V3 (${robotId})`;
      }
    }, 400);
  });

  // Handle Authentication Failure from Robot
  wsClient.on('onAuthFailure', (payload) => {
    connectBtn.disabled = false;
    const err = payload.error || 'Invalid 4-digit PIN';
    setStatusFeedback('error', `❌ ${err}! Robot ID is incorrect.`);
    clearPinInputs();
  });

  // Handle Connection Errors (Robot Offline)
  wsClient.on('onConnectionChange', (isConnected, label) => {
    if (!isConnected) {
      connectBtn.disabled = false;
      if (lockModal.classList.contains('lock-screen')) {
        setStatusFeedback('error', '❌ ATLAS Robot is OFFLINE! Start \'python online.py\' to connect.');
      } else {
        if (connPill && connLabel) {
          connPill.className = 'status-pill disconnected';
          connLabel.textContent = 'OFFLINE (RECONNECTING...)';
        }
      }
    }
  });

  // Settings Gear Button (after unlocked)
  const settingsBtn = document.getElementById('btn-settings');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      lockModal.classList.add('active');
    });
  }
  if (closeLockBtn) {
    closeLockBtn.addEventListener('click', () => {
      if (!lockModal.classList.contains('lock-screen')) {
        lockModal.classList.remove('active');
      }
    });
  }

  // -------------------------------------------------------------------------
  // 3. Google & Educational Image & Diagram Search & Insert Tool
  // -------------------------------------------------------------------------
  const imageModal = document.getElementById('modal-image-search');
  const openImagesBtn = document.getElementById('btn-open-images');
  const closeImagesBtn = document.getElementById('btn-close-images');
  const imageSearchInput = document.getElementById('input-image-search');
  const imageGalleryGrid = document.getElementById('image-gallery-grid');
  const customUrlInput = document.getElementById('input-custom-image-url');
  const insertCustomUrlBtn = document.getElementById('btn-insert-custom-url');
  const boardImageOverlay = document.getElementById('board-image-overlay');

  // Curated Educational Visuals Library
  const EDUCATIONAL_VISUALS = [
    // Science Diagrams
    { title: "Human Heart Anatomy", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Diagram_of_the_human_heart_%28cropped%29.svg/800px-Diagram_of_the_human_heart_%28cropped%29.svg.png" },
    { title: "Plant Cell Structure", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Plant_cell_structure_svg.svg/800px-Plant_cell_structure_svg.svg.png" },
    { title: "Animal Cell Anatomy", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Animal_cell_structure_en.svg/800px-Animal_cell_structure_en.svg.png" },
    { title: "Photosynthesis Leaf Cycle", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Photosynthesis.svg/800px-Photosynthesis.svg.png" },
    { title: "Solar System Planetary Scale", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Planets2013.svg/800px-Planets2013.svg.png" },
    { title: "Hydrological Water Cycle", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Water_cycle.png/800px-Water_cycle.png" },
    { title: "Electric Circuit Schematic", category: "science", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Circuit_elements.svg/800px-Circuit_elements.svg.png" },
    
    // Mathematics
    { title: "Cartesian Coordinate Grid", category: "math", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Cartesian-coordinate-system.svg/800px-Cartesian-coordinate-system.svg.png" },
    { title: "Quadratic Parabola Geometry", category: "math", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Parabola.svg/800px-Parabola.svg.png" },
    { title: "Pythagorean Theorem Proof", category: "math", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pythagorean.svg/800px-Pythagorean.svg.png" },
    { title: "Trigonometric Unit Circle", category: "math", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sinus_und_Kosinus_am_Einheitskreis_1.svg/800px-Sinus_und_Kosinus_am_Einheitskreis_1.svg.png" },

    // Social Science & History
    { title: "Political Map of India", category: "social", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/India_states_and_union_territories_map.svg/800px-India_states_and_union_territories_map.svg.png" },
    { title: "World Physical Geography", category: "social", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/800px-World_map_-_low_resolution.svg.png" },
    { title: "Indus Valley Civilization Sites", category: "social", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Indus_Valley_Civilization%2C_Mature_Phase_%282600-1900_BCE%29.png/800px-Indus_Valley_Civilization%2C_Mature_Phase_%282600-1900_BCE%29.png" },
    { title: "Earth Climate & Solar Zones", category: "social", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/World_Koppen_Classification_%28with_counties%29.svg/800px-World_Koppen_Classification_%28with_counties%29.svg.png" },
  ];

  function renderImageGallery(filter = 'all', query = '') {
    if (!imageGalleryGrid) return;
    imageGalleryGrid.innerHTML = '';

    const cleanQuery = query.toLowerCase().trim();
    const filtered = EDUCATIONAL_VISUALS.filter(item => {
      const matchCat = filter === 'all' || item.category === filter;
      const matchQ = !cleanQuery || item.title.toLowerCase().includes(cleanQuery);
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      imageGalleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No diagrams found. Paste a custom image URL below!</div>';
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${item.url}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x150?text=Educational+Diagram'">
        <span>${item.title}</span>
      `;
      card.addEventListener('click', () => {
        insertImageSticker(item.url, item.title);
        imageModal.classList.remove('active');
      });
      imageGalleryGrid.appendChild(card);
    });
  }

  function insertImageSticker(imageUrl, title = 'Educational Visual') {
    if (!boardImageOverlay) return;

    const sticker = document.createElement('div');
    sticker.className = 'board-image-sticker';
    sticker.style.left = '20%';
    sticker.style.top = '15%';

    sticker.innerHTML = `
      <div class="sticker-header">
        <span class="sticker-title">📌 ${title}</span>
        <button class="sticker-close" title="Remove visual">&times;</button>
      </div>
      <img src="${imageUrl}" alt="${title}">
      <div class="sticker-caption">${title}</div>
    `;

    // Close button removes image sticker
    sticker.querySelector('.sticker-close').addEventListener('click', (e) => {
      e.stopPropagation();
      sticker.remove();
    });

    // Make sticker draggable across the canvas
    let isDragging = false;
    let startX, startY, origX, origY;

    sticker.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('sticker-close')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      origX = sticker.offsetLeft;
      origY = sticker.offsetTop;
      sticker.setPointerCapture(e.pointerId);
    });

    sticker.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      sticker.style.left = `${origX + dx}px`;
      sticker.style.top = `${origY + dy}px`;
    });

    sticker.addEventListener('pointerup', () => {
      isDragging = false;
    });

    boardImageOverlay.appendChild(sticker);
  }

  // Bind Image Search Modal Handlers
  if (openImagesBtn) {
    openImagesBtn.addEventListener('click', () => {
      imageModal.classList.add('active');
      renderImageGallery();
    });
  }
  if (closeImagesBtn) {
    closeImagesBtn.addEventListener('click', () => {
      imageModal.classList.remove('active');
    });
  }

  if (imageSearchInput) {
    imageSearchInput.addEventListener('input', (e) => {
      const activeTab = document.querySelector('.img-tab.active');
      const filter = activeTab ? activeTab.dataset.filter : 'all';
      renderImageGallery(filter, e.target.value);
    });
  }

  const imgTabs = document.querySelectorAll('.img-tab');
  imgTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      imgTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderImageGallery(tab.dataset.filter, imageSearchInput ? imageSearchInput.value : '');
    });
  });

  if (insertCustomUrlBtn && customUrlInput) {
    insertCustomUrlBtn.addEventListener('click', () => {
      const url = customUrlInput.value.trim();
      if (url) {
        insertImageSticker(url, 'Web Diagram');
        customUrlInput.value = '';
        imageModal.classList.remove('active');
      }
    });
  }

  // Receive Remote Images pushed from 'python online.py'
  wsClient.on('onImageUpdate', (payload) => {
    if (payload && payload.image_url) {
      insertImageSticker(payload.image_url, payload.caption || 'Educational Diagram');
    }
  });

  // -------------------------------------------------------------------------
  // 4. Subject View Switcher
  // -------------------------------------------------------------------------
  const subjectBtns = document.querySelectorAll('.subj-btn');
  const viewPanes = {
    notes: document.getElementById('view-notes'),
    math: document.getElementById('view-math'),
    science: document.getElementById('view-science'),
    social: document.getElementById('view-social'),
  };

  function switchSubject(subjectKey) {
    subjectBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.subject === subjectKey);
    });

    Object.keys(viewPanes).forEach(key => {
      if (viewPanes[key]) {
        viewPanes[key].classList.toggle('active', key === subjectKey);
      }
    });

    // Update Top Subject Badge
    const badge = document.getElementById('badge-subject');
    if (badge) {
      badge.className = `subject-tag ${subjectKey}`;
      badge.textContent = subjectKey.toUpperCase();
    }
  }

  subjectBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSubject(btn.dataset.subject));
  });

  // Science Diagram Tabs
  const diagTabs = document.querySelectorAll('.diag-tab');
  diagTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      diagTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const diagType = tab.dataset.diagram;
      scienceEngine.render(diagType);
    });
  });

  // Social Science View Mode Tabs
  const socTabs = document.querySelectorAll('.soc-tab');
  socTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      socTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const mode = tab.dataset.mode;
      document.getElementById('timeline-container').classList.toggle('active', mode === 'timeline');
      document.getElementById('geography-map-container').classList.toggle('active', mode === 'geography');
      if (mode === 'geography') {
        socialEngine._drawGlobeGrid();
      }
    });
  });

  // -------------------------------------------------------------------------
  // 5. Drawing Tools & Dock Controls
  // -------------------------------------------------------------------------
  const toolBtns = {
    pen: document.getElementById('tool-pen'),
    highlighter: document.getElementById('tool-highlighter'),
    laser: document.getElementById('tool-laser'),
    eraser: document.getElementById('tool-eraser'),
  };

  Object.keys(toolBtns).forEach(tool => {
    const btn = toolBtns[tool];
    if (btn) {
      btn.addEventListener('click', () => {
        Object.values(toolBtns).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        canvas.setTool(tool);
      });
    }
  });

  // Clear Canvas (Wipe)
  const clearBtn = document.getElementById('tool-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => canvas.clearCanvas());
  }

  // Color Swatches
  const colorDots = document.querySelectorAll('.color-palette .color-dot');
  colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
      colorDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      canvas.setColor(dot.dataset.color);
    });
  });

  // Stroke Width Slider
  const sizeSlider = document.getElementById('brush-size-slider');
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => canvas.setStrokeWidth(e.target.value));
  }

  // Grid Background Pattern Toggle (Clean -> Ruled -> Graph)
  const gridBtn = document.getElementById('btn-grid-toggle');
  const gridOverlay = document.getElementById('grid-overlay');
  const gridPatterns = ['pattern-clean', 'pattern-ruled', 'pattern-graph'];
  let currentGridIndex = 0;

  if (gridBtn && gridOverlay) {
    gridBtn.addEventListener('click', () => {
      gridOverlay.classList.remove(gridPatterns[currentGridIndex]);
      currentGridIndex = (currentGridIndex + 1) % gridPatterns.length;
      gridOverlay.classList.add(gridPatterns[currentGridIndex]);
    });
  }

  // Theme Toggle (Obsidian Dark -> Chalkboard Green -> Whiteboard)
  const themeBtn = document.getElementById('btn-theme-toggle');
  const themes = ['theme-dark', 'theme-chalkboard', 'theme-whiteboard'];
  let currentThemeIdx = 0;

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.remove(themes[currentThemeIdx]);
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      document.body.classList.add(themes[currentThemeIdx]);
    });
  }

  // Fullscreen Toggle
  const fsBtn = document.getElementById('btn-fullscreen');
  if (fsBtn) {
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Save / Export Snapshot PNG
  const saveBtn = document.getElementById('btn-save-board');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => canvas.exportToPNG());
  }

  // -------------------------------------------------------------------------
  // 6. Student Reverse Touch Interaction (Ask Doubt / Raise Hand)
  // -------------------------------------------------------------------------
  const doubtInput = document.getElementById('input-student-doubt');
  const doubtSubmitBtn = document.getElementById('btn-submit-doubt');
  const raiseHandBtn = document.getElementById('btn-raise-hand');

  function submitStudentDoubt() {
    if (!doubtInput) return;
    const query = doubtInput.value.trim();
    if (!query) return;

    wsClient.sendStudentDoubt(query);
    doubtInput.value = '';
    doubtInput.placeholder = 'Doubt sent to ATLAS! Listening...';
    setTimeout(() => {
      doubtInput.placeholder = 'Touch here to ask ATLAS a question...';
    }, 4000);
  }

  if (doubtSubmitBtn) doubtSubmitBtn.addEventListener('click', submitStudentDoubt);
  if (doubtInput) {
    doubtInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitStudentDoubt();
    });
  }

  if (raiseHandBtn) {
    raiseHandBtn.addEventListener('click', () => {
      wsClient.sendStudentHandRaise();
      raiseHandBtn.innerHTML = '<span>✋ Hand Raised!</span>';
      raiseHandBtn.style.background = 'rgba(16, 185, 129, 0.3)';
      setTimeout(() => {
        raiseHandBtn.innerHTML = '<span>✋ Raise Hand</span>';
        raiseHandBtn.style.background = '';
      }, 3000);
    });
  }

  // -------------------------------------------------------------------------
  // 7. WebSocket Live Broadcast Event Handlers (From python online.py)
  // -------------------------------------------------------------------------
  wsClient.on('onHeaderUpdate', (h) => {
    const classBadge = document.getElementById('badge-board-class');
    if (classBadge) classBadge.textContent = `${h.board} • CLASS ${h.class_level}`;

    const chTitle = document.getElementById('header-chapter-title');
    if (chTitle) chTitle.textContent = `Chapter ${h.chapter_num}: ${h.chapter_title || ''}`;

    const topTitle = document.getElementById('header-topic-title');
    if (topTitle) topTitle.textContent = h.current_subtopic || h.current_topic || '';

    // Auto-switch subject tab if matched
    const s = (h.subject || '').toLowerCase();
    if (s.includes('math')) switchSubject('math');
    else if (s.includes('sci')) switchSubject('science');
    else if (s.includes('soc') || s.includes('geo') || s.includes('hist')) switchSubject('social');
    else switchSubject('notes');
  });

  wsClient.on('onNotesUpdate', (payload) => {
    switchSubject('notes');
    const titleEl = document.getElementById('notes-title');
    if (titleEl) titleEl.textContent = payload.title || 'Classroom Notes';

    const subEl = document.getElementById('notes-summary');
    if (subEl) subEl.textContent = payload.summary || '';

    // Definitions
    const defsBox = document.getElementById('notes-definitions-list');
    if (defsBox && payload.definitions) {
      defsBox.innerHTML = '';
      Object.keys(payload.definitions).forEach(term => {
        const dCard = document.createElement('div');
        dCard.className = 'def-card';
        dCard.innerHTML = `<span class="def-term">${term}:</span><span class="def-body">${payload.definitions[term]}</span>`;
        defsBox.appendChild(dCard);
      });
    }

    // Bullets
    const bulletList = document.getElementById('notes-bullet-list');
    if (bulletList && payload.bullet_points) {
      bulletList.innerHTML = '';
      payload.bullet_points.forEach(bp => {
        const li = document.createElement('li');
        li.textContent = bp;
        bulletList.appendChild(li);
      });
    }

    // Key Takeaways
    const takeEl = document.getElementById('notes-takeaways');
    if (takeEl && payload.key_takeaways && payload.key_takeaways.length > 0) {
      takeEl.innerHTML = `💡 ${payload.key_takeaways.join(' • ')}`;
    }
  });

  wsClient.on('onMathUpdate', (payload) => {
    switchSubject('math');
    mathEngine.setMathPayload(payload);
  });

  wsClient.on('onHighlightStep', (stepId) => {
    mathEngine.highlightStep(stepId);
  });

  wsClient.on('onScienceDiagram', (payload) => {
    switchSubject('science');
    scienceEngine.render(payload.diagram_type, payload.active_component);
    const titleEl = document.getElementById('science-diagram-title');
    const descEl = document.getElementById('science-diagram-desc');
    if (titleEl) titleEl.textContent = payload.diagram_title;
    if (descEl) descEl.textContent = payload.description;
  });

  wsClient.on('onSocialScience', (payload) => {
    switchSubject('social');
    if (payload.mode === 'timeline') {
      socialEngine.renderTimeline(payload.title, payload.timeline_events);
      document.getElementById('timeline-container').classList.add('active');
      document.getElementById('geography-map-container').classList.remove('active');
    } else {
      document.getElementById('timeline-container').classList.remove('active');
      document.getElementById('geography-map-container').classList.add('active');
      socialEngine._drawGlobeGrid();
    }
  });

  wsClient.on('onLaserPointer', (normX, normY, isVisible) => {
    canvas.showRemoteLaser(normX, normY, isVisible);
  });

  wsClient.on('onClearBoard', () => {
    canvas.clearCanvas();
  });
});
