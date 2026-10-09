(function () {
    'use strict';

    // Container & Style element identifiers for idempotent reinjection
    const CONTAINER_ID = 'auths-bg-mod-container';
    const STYLE_ID = 'auths-bg-mod-styles';
    const OVERRIDE_STYLE_ID = 'auths-bg-mod-override-style';

    // Prevent duplicate DOM elements upon re-execution
    const previousContainer = document.getElementById(CONTAINER_ID);
    if (previousContainer) {
        previousContainer.remove();
    }
    const previousStyles = document.getElementById(STYLE_ID);
    if (previousStyles) {
        previousStyles.remove();
    }

    // Helper to dynamically inject background styling
    function setGameBackground(imageUrl) {
        let styleTag = document.getElementById(OVERRIDE_STYLE_ID);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = OVERRIDE_STYLE_ID;
            document.head.appendChild(styleTag);
        }

        if (imageUrl) {
            styleTag.textContent = `
                body, #app, #root, #game-container, .main-container {
                    background-image: url("${imageUrl}") !important;
                    background-size: cover !important;
                    background-position: center !important;
                    background-repeat: no-repeat !important;
                    background-attachment: fixed !important;
                }
            `;
        } else {
            styleTag.textContent = '';
        }
    }

    // Inject mod UI styles using safe DOM manipulation
    const modStyle = document.createElement('style');
    modStyle.id = STYLE_ID;
    modStyle.textContent = `
        #auths-bg-mod-container, #auths-bg-mod-container * {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        #auths-bg-mod-container {
            position: fixed;
            top: 75px;
            left: 20px;
            z-index: 10;
            color: #ffffff;
            user-select: none;
            transition: filter 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #auths-bg-mod-container.auths-bg-panel-open {
            z-index: 100000;
        }

        #auths-bg-mod-container.auths-bg-dimmed .auths-bg-toggle-btn {
            filter: brightness(0.4) contrast(0.9);
            opacity: 0.7;
        }

        .auths-bg-toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(20, 20, 28, 0.85);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 8px 14px;
            border-radius: 10px;
            cursor: pointer;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1), filter 0.2s ease, opacity 0.2s ease;
        }

        .auths-bg-toggle-btn:hover {
            background: rgba(35, 35, 50, 0.95);
            border-color: rgba(255, 255, 255, 0.35);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        }

        .auths-bg-panel {
            position: absolute;
            top: 45px;
            left: 0;
            width: 320px;
            background: rgba(16, 16, 24, 0.92);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            padding: 18px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
            display: none;
            flex-direction: column;
            gap: 14px;
            animation: authsBgFadeIn 0.2s ease-out;
        }

        @keyframes authsBgFadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .auths-bg-panel.active {
            display: flex;
        }

        .auths-bg-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 10px;
        }

        .auths-bg-title {
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #eceff4;
        }

        .auths-bg-close {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            padding: 2px 6px;
            border-radius: 4px;
        }

        .auths-bg-close:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
        }

        .auths-bg-section {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .auths-bg-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #a0a5b5;
            font-weight: 600;
        }

        .auths-bg-input-group {
            display: flex;
            gap: 6px;
        }

        .auths-bg-input {
            flex: 1;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            padding: 8px 12px;
            color: #ffffff;
            font-size: 12px;
            outline: none;
            transition: border-color 0.2s;
        }

        .auths-bg-input:focus {
            border-color: #7b68ee;
        }

        .auths-bg-btn {
            background: #6c5ce7;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }

        .auths-bg-btn:hover {
            background: #5b4bc4;
        }

        .auths-bg-btn-danger {
            background: rgba(235, 77, 75, 0.2);
            color: #ff6b6b;
            border: 1px solid rgba(235, 77, 75, 0.3);
        }

        .auths-bg-btn-danger:hover {
            background: rgba(235, 77, 75, 0.35);
        }

        .auths-bg-file-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px dashed rgba(255, 255, 255, 0.2);
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            color: #c0c5d0;
            transition: all 0.2s;
        }

        .auths-bg-file-label:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: #7b68ee;
            color: #fff;
        }

        .auths-bg-file-input {
            display: none;
        }

        .auths-bg-status {
            font-size: 11px;
            color: #2ed573;
            min-height: 14px;
        }
    `;
    document.head.appendChild(modStyle);

    // Build container
    const container = document.createElement('div');
    container.id = CONTAINER_ID;

    container.innerHTML = `
        <button class="auths-bg-toggle-btn" id="auths-bg-toggle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            Custom background
        </button>
        <div class="auths-bg-panel" id="auths-bg-panel">
            <div class="auths-bg-header">
                <span class="auths-bg-title">Custom Background</span>
                <button class="auths-bg-close" id="auths-bg-close">&times;</button>
            </div>
            
            <div class="auths-bg-section">
                <span class="auths-bg-label">Image URL</span>
                <div class="auths-bg-input-group">
                    <input type="text" class="auths-bg-input" id="auths-bg-url-input" placeholder="Paste image link here..." />
                    <button class="auths-bg-btn" id="auths-bg-apply-url">Apply</button>
                </div>
            </div>

            <div class="auths-bg-section">
                <span class="auths-bg-label">Upload Local File</span>
                <label class="auths-bg-file-label" for="auths-bg-file-input">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Choose Image File
                </label>
                <input type="file" id="auths-bg-file-input" class="auths-bg-file-input" accept="image/*" />
            </div>

            <div class="auths-bg-status" id="auths-bg-status"></div>

            <div class="auths-bg-section" style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
                <button class="auths-bg-btn auths-bg-btn-danger" id="auths-bg-reset">Reset to Default</button>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    const toggleBtn = document.getElementById('auths-bg-toggle');
    const panel = document.getElementById('auths-bg-panel');
    const closeBtn = document.getElementById('auths-bg-close');
    const urlInput = document.getElementById('auths-bg-url-input');
    const applyUrlBtn = document.getElementById('auths-bg-apply-url');
    const fileInput = document.getElementById('auths-bg-file-input');
    const resetBtn = document.getElementById('auths-bg-reset');
    const statusText = document.getElementById('auths-bg-status');

    function showStatus(msg, isError = false) {
        statusText.style.color = isError ? '#ff4757' : '#2ed573';
        statusText.textContent = msg;
        setTimeout(() => {
            if (statusText.textContent === msg) {
                statusText.textContent = '';
            }
        }, 3000);
    }

    // Toggle menu
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.toggle('active');
        container.classList.toggle('auths-bg-panel-open', isOpen);
    });

    closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
        container.classList.remove('auths-bg-panel-open');
    });

    panel.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
        panel.classList.remove('active');
        container.classList.remove('auths-bg-panel-open');
    });

    // Throttled non-blocking overlay detection
    let overlayCheckScheduled = false;

    const checkGameOverlay = () => {
        overlayCheckScheduled = false;

        const overlays = document.querySelectorAll(
            '[class*="overlay"], [class*="modal"], [class*="backdrop"], [class*="window-bg"], [role="dialog"], .dialog-overlay, .modal-backdrop'
        );
        let isOverlayVisible = false;

        for (let i = 0; i < overlays.length; i++) {
            const el = overlays[i];
            if (el && !container.contains(el) && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
                if (el.style.display !== 'none' && el.style.visibility !== 'hidden') {
                    isOverlayVisible = true;
                    break;
                }
            }
        }

        if (!isOverlayVisible && document.body.classList.toString().match(/(modal|overlay|dialog|window)-open/i)) {
            isOverlayVisible = true;
        }

        // Pause observer during mutation to avoid recursive trigger
        if (typeof observer !== 'undefined') {
            observer.disconnect();
        }

        if (isOverlayVisible && !panel.classList.contains('active')) {
            container.classList.add('auths-bg-dimmed');
        } else {
            container.classList.remove('auths-bg-dimmed');
        }

        if (typeof observer !== 'undefined') {
            observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        }
    };

    const scheduleOverlayCheck = () => {
        if (!overlayCheckScheduled) {
            overlayCheckScheduled = true;
            requestAnimationFrame(checkGameOverlay);
        }
    };

    const observer = new MutationObserver(scheduleOverlayCheck);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    scheduleOverlayCheck();

    // URL Application
    applyUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
            setGameBackground(url);
            showStatus('Background updated!');
        } else {
            showStatus('Please enter a valid URL', true);
        }
    });

    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyUrlBtn.click();
        }
    });

    // Local File Application via FileReader
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            if (file.size > 8 * 1024 * 1024) {
                showStatus('File too large (Max 8MB)', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                const base64Url = event.target.result;
                setGameBackground(base64Url);
                showStatus('Local image loaded!');
            };
            reader.onerror = function () {
                showStatus('Failed to read file', true);
            };
            reader.readAsDataURL(file);
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        setGameBackground(null);
        urlInput.value = '';
        fileInput.value = '';
        showStatus('Background reset!');
    });
})();