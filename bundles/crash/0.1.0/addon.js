(function () {
  const SHEET_ID = "addon-crash-sheet";
  if (document.getElementById(SHEET_ID)) return;

  // a round reaches multiplier m with chance (1 - HOUSE_EDGE) / m
  const HOUSE_EDGE = 0.03;
  const MAX_MULT = 1000;
  // multiplier = e^(GROWTH * ms): 2x at ~5.8s, 10x at ~19s, 100x at ~38s
  const GROWTH = 0.00012;
  // keeps bet * MAX_MULT a safe integer so awardPoints never rejects a payout
  const MAX_BET = Math.floor(Number.MAX_SAFE_INTEGER / MAX_MULT);
  const WAIT_MS = 5000;
  const CRASHED_MS = 2500;
  // matches the game's page slide
  const SLIDE_MS = 300;
  const HISTORY_SIZE = 12;
  const CHART_H = 220;
  const M_LEFT = 36;
  const M_RIGHT = 10;
  const M_TOP = 10;
  const M_BOTTOM = 18;
  const LINE_COLOR = "#f5b942";
  const WIN_COLOR = "#4caf50";
  const LOSE_COLOR = "#e05252";

  let phase = "waiting";
  let phaseStart = performance.now();
  let crashAt = 1;
  // the player's bet in the current round: { amount, auto, cashedAt }
  let bet = null;
  // already paid for, joins when the next round starts: { amount, auto }
  let nextBet = null;
  let looping = false;
  const history = [];

  function rollCrashPoint() {
    const r = Math.random();
    const m = Math.floor((100 * (1 - HOUSE_EDGE)) / (1 - r)) / 100;
    return Math.min(MAX_MULT, Math.max(1, m));
  }

  function rawMultAt(ms) {
    return Math.min(MAX_MULT, Math.exp(GROWTH * ms));
  }

  // floored so the payout always matches the multiplier shown
  function multAt(ms) {
    return Math.floor(rawMultAt(ms) * 100) / 100;
  }

  function msAt(mult) {
    return Math.log(mult) / GROWTH;
  }

  function currentMult() {
    return phase === "running" ? multAt(performance.now() - phaseStart) : 1;
  }

  function hasLiveBet() {
    return phase === "running" && bet !== null && bet.cashedAt === null;
  }

  function fmt(n) {
    if (typeof window.formatNum === "function") return window.formatNum(n);
    return String(Math.round(n));
  }

  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ui
  // addons can't register a real page yet, so this is a see-through sheet laid exactly over the game's
  // page area (below its header) and padded like a .page
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pageWrapper = document.querySelector(".page-wrapper");
  const dotsBar = document.querySelector(".page-dots");

  const sheet = el(
    "div",
    [
      pageWrapper
        ? "position:absolute"
        : "position:fixed;top:0;left:0;right:0;margin:0 auto;width:min(540px, 100vw);height:100vh;overflow-y:auto;background:var(--bg-color, #0e0e0e)",
      "display:none",
      "box-sizing:border-box",
      "padding:56px 24px 140px",
      "color:var(--text-color, #dcdcdc)",
      "z-index:9995",
      "opacity:0",
      "transform:translateY(-16px)",
    ].join(";"),
  );
  sheet.id = SHEET_ID;
  sheet.inert = true;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-label", "tazl's crash");

  const closeBtn = el(
    "button",
    "position:absolute;top:12px;right:12px;background:none;border:none;font-size:1.4rem;padding:6px 10px;opacity:0.6;",
    "×",
  );
  closeBtn.setAttribute("aria-label", "close crash");

  const content = el("div", "max-width:420px;margin:0 auto;display:flex;flex-direction:column;");
  const title = el("h2", "margin-top:0;text-align:center;", "tazl's crash");
  const SUBTITLES = [
    "gamble gamble gamble GAMBLE!!!",
    "the line only goes up!",
    "99% of gamblers quit right before they WIN BIG",
    "just one more game",
    "it was going to 50x i could feel it",
    "cashing out at 1.01x is a valid strategy",
    "your points miss you",
    "never back down never what?!?!??!",
    "#1 mistake slot players make: playing slots in the first place",
    "LINE GO UP!"
  ];
  const SUBTITLE_MS = 6000;
  const subtitle = el(
    "p",
    "font-size:0.8em;opacity:0.5;margin:-6px 0 16px;text-align:center;min-height:1.85em;" +
      (reducedMotion ? "" : "transition:opacity 0.4s ease;"),
    SUBTITLES[0],
  );
  let subtitleIndex = 0;
  let subtitleTimer = 0;

  function nextSubtitle() {
    subtitleIndex = (subtitleIndex + 1 + Math.floor(Math.random() * (SUBTITLES.length - 1))) % SUBTITLES.length;
    if (reducedMotion) {
      subtitle.textContent = SUBTITLES[subtitleIndex];
      return;
    }
    subtitle.style.opacity = "0";
    setTimeout(() => {
      subtitle.textContent = SUBTITLES[subtitleIndex];
      subtitle.style.opacity = "0.5";
    }, 400);
  }

  const canvas = el("canvas", "display:block;width:100%;height:" + CHART_H + "px;margin-bottom:12px;");
  const ctx = canvas.getContext("2d");
  let chartW = 0;

  const historyEl = el(
    "div",
    "display:flex;flex-wrap:wrap;justify-content:center;gap:8px;font-size:0.85em;min-height:1.85em;margin-bottom:8px;",
  );
  const balanceEl = el("div", "opacity:0.7;margin-bottom:10px;text-align:center;");

  const inputCss =
    "width:100%;box-sizing:border-box;background:var(--input-bg, #1a1a1a);color:var(--text-color, #dcdcdc);" +
    "border:1px solid var(--border-color, #303030);border-radius:2px;font-family:monospace;padding:6px 8px;margin-top:4px;";

  const betLabel = el("label", "display:block;margin-bottom:6px;font-size:0.9em;", "bet");
  const betInput = el("input", inputCss);
  betInput.type = "number";
  betInput.min = "1";
  betInput.step = "1";
  betInput.value = "100";
  betLabel.appendChild(betInput);

  const quickRow = el("div", "display:flex;gap:6px;margin-bottom:12px;");
  const halfBtn = el("button", "flex:1;", "½");
  const doubleBtn = el("button", "flex:1;", "2×");
  const maxBtn = el("button", "flex:1;", "max");
  for (const b of [halfBtn, doubleBtn, maxBtn]) b.className = "small";
  quickRow.append(halfBtn, doubleBtn, maxBtn);

  const autoLabel = el("label", "display:block;margin-bottom:12px;font-size:0.9em;", "auto cash out at (blank = off)");
  const autoInput = el("input", inputCss);
  autoInput.type = "number";
  autoInput.min = "1.01";
  autoInput.step = "0.01";
  autoInput.placeholder = "e.g. 2.00";
  autoLabel.appendChild(autoInput);

  const actionBtn = el("button", "width:100%;", "bet");
  const statusEl = el("div", "min-height:1.85em;margin-top:8px;opacity:0.85;text-align:center;", "");

  content.append(title, subtitle, canvas, historyEl, balanceEl, betLabel, quickRow, autoLabel, actionBtn, statusEl);
  sheet.append(closeBtn, content);
  document.body.appendChild(sheet);

  const launcher = el("button", "position:fixed;bottom:20px;left:20px;z-index:9997;", "crash");
  launcher.className = "small";
  launcher.setAttribute("aria-expanded", "false");
  document.body.appendChild(launcher);

  // the dots bar is centred and changes width as pages unlock, so the button is kept beside it by hand.
  // the game's notification bell is fixed in the bottom-left corner, so on narrow screens where the button
  // would land on it, it goes above the bar instead
  const notifBell = document.getElementById("notifBell");
  function placeLauncher() {
    if (!dotsBar) return;
    const bar = dotsBar.getBoundingClientRect();
    if (!bar.width) return;
    const left = bar.left - launcher.offsetWidth - 8;
    const minLeft = notifBell && notifBell.offsetWidth ? notifBell.getBoundingClientRect().right + 8 : 8;
    if (left >= minLeft) {
      launcher.style.left = left + "px";
      launcher.style.top = bar.top + (bar.height - launcher.offsetHeight) / 2 + "px";
    } else {
      launcher.style.left = bar.left + (bar.width - launcher.offsetWidth) / 2 + "px";
      launcher.style.top = bar.top - launcher.offsetHeight - 8 + "px";
    }
    launcher.style.bottom = "auto";
  }

  function placeSheet() {
    if (!pageWrapper) return;
    const page = pageWrapper.getBoundingClientRect();
    const body = document.body.getBoundingClientRect();
    sheet.style.top = page.top - body.top + "px";
    sheet.style.left = page.left - body.left + "px";
    sheet.style.width = page.width + "px";
  }

  let open = false;
  let dimmedDot = null;
  let closeTimer = 0;

  function setOpen(next, instant) {
    if (next === open) return;
    open = next;
    clearTimeout(closeTimer);
    const animate = !instant && !reducedMotion;
    sheet.style.transition = animate
      ? "opacity " + SLIDE_MS + "ms ease, transform " + SLIDE_MS + "ms cubic-bezier(0.4, 0, 0.2, 1)"
      : "none";
    sheet.inert = !open;
    launcher.setAttribute("aria-expanded", String(open));

    if (open) {
      placeSheet();
      sheet.style.display = "block";
      if (pageWrapper) pageWrapper.style.visibility = "hidden";
      // reading layout here makes the browser start the transition from the hidden state
      void sheet.offsetWidth;
      sheet.style.opacity = "1";
      sheet.style.transform = "translateY(0)";
      dimmedDot = dotsBar ? dotsBar.querySelector(".page-dot.active") : null;
      if (dimmedDot) dimmedDot.style.opacity = "0.35";
      sizeCanvas();
      ensureLoop();
      subtitleTimer = setInterval(nextSubtitle, SUBTITLE_MS);
    } else {
      sheet.style.opacity = "0";
      sheet.style.transform = "translateY(-16px)";
      if (dimmedDot) dimmedDot.style.opacity = "";
      dimmedDot = null;
      clearInterval(subtitleTimer);
      closeTimer = setTimeout(
        () => {
          sheet.style.display = "none";
          if (pageWrapper) pageWrapper.style.visibility = "";
        },
        animate ? SLIDE_MS : 0,
      );
    }
    render();
  }

  launcher.addEventListener("click", () => setOpen(!open));
  closeBtn.addEventListener("click", () => setOpen(false));

  // any page switch closes the sheet: arrows, dots, arrow keys, swipes and the right-click menu
  // all end in the game moving the active class between dots
  if (dotsBar) {
    new MutationObserver(() => {
      if (open && dotsBar.querySelector(".page-dot.active") !== dimmedDot) setOpen(false, true);
    }).observe(dotsBar, { subtree: true, attributes: true, attributeFilter: ["class"] });
  }
  document.addEventListener(
    "click",
    (e) => {
      if (open && e.target.closest && e.target.closest(".page-arrow, .page-dot")) setOpen(false, true);
    },
    true,
  );
  document.addEventListener("keydown", (e) => {
    if (open && e.key === "Escape") setOpen(false);
  });
  // stops the game's arrow-key page switching while typing in the bet boxes
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.stopPropagation();
  });
  window.addEventListener("resize", () => {
    placeLauncher();
    if (!open) return;
    placeSheet();
    sizeCanvas();
    render();
  });
  new ResizeObserver(() => {
    if (open) placeSheet();
  }).observe(document.body);
  if (dotsBar) new ResizeObserver(placeLauncher).observe(dotsBar);

  function sizeCanvas() {
    const w = canvas.clientWidth;
    if (!w) return;
    const dpr = window.devicePixelRatio || 1;
    chartW = w;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(CHART_H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateBalance(pts) {
    balanceEl.textContent = "balance: " + fmt(pts);
  }

  function renderHistory() {
    historyEl.textContent = "";
    for (const m of history) {
      historyEl.appendChild(el("span", "color:" + (m >= 2 ? WIN_COLOR : LOSE_COLOR) + ";", m.toFixed(2) + "x"));
    }
  }

  function renderLauncher() {
    const label = open ? "close crash" : "crash";
    const text = hasLiveBet() ? label + " " + currentMult().toFixed(2) + "x" : label;
    if (launcher.textContent === text) return;
    launcher.textContent = text;
    placeLauncher();
  }

  function renderControls() {
    const live = hasLiveBet();
    if (live) {
      actionBtn.textContent = "cash out (" + fmt(Math.floor(bet.amount * currentMult())) + ")";
    } else if (nextBet) {
      actionBtn.textContent = "cancel bet (" + fmt(nextBet.amount) + ")";
    } else {
      actionBtn.textContent = phase === "waiting" ? "bet" : "bet on next round";
    }
    const locked = live || nextBet !== null;
    betInput.disabled = locked;
    autoInput.disabled = locked;
    halfBtn.disabled = locked;
    doubleBtn.disabled = locked;
    maxBtn.disabled = locked;
  }

  function render() {
    renderLauncher();
    renderControls();
    if (open) drawChart();
  }

  // graph
  // picks a 1/2/5 x 10^n step so the axis gets roughly `count` gridlines
  function niceStep(range, count) {
    const raw = range / count;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / pow;
    return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * pow;
  }

  function multLabel(v) {
    return (v >= 10 ? String(Math.round(v)) : String(Math.round(v * 10) / 10)) + "x";
  }

  function drawChart() {
    if (!chartW) return;
    const w = chartW;
    const h = CHART_H;
    const textColor = getComputedStyle(sheet).color;
    ctx.clearRect(0, 0, w, h);

    let ms = 0;
    if (phase === "running") ms = performance.now() - phaseStart;
    else if (phase === "crashed") ms = msAt(crashAt);
    const head = rawMultAt(ms);

    // axes grow ahead of the line so the tip stays near the top-right corner
    const xMax = Math.max(10000, ms * 1.08);
    const yTop = Math.max(2, 1 + (head - 1) * 1.25);
    const px = (t) => M_LEFT + (t / xMax) * (w - M_LEFT - M_RIGHT);
    const py = (v) => h - M_BOTTOM - ((v - 1) / (yTop - 1)) * (h - M_TOP - M_BOTTOM);

    ctx.font = "10px monospace";
    ctx.lineWidth = 1;
    ctx.strokeStyle = textColor;
    ctx.fillStyle = textColor;

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const yStep = niceStep(yTop - 1, 4);
    for (let v = Math.floor(1 / yStep) * yStep + yStep; v < yTop - yStep / 100; v += yStep) {
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.moveTo(M_LEFT, py(v));
      ctx.lineTo(w - M_RIGHT, py(v));
      ctx.stroke();
      ctx.globalAlpha = 0.5;
      ctx.fillText(multLabel(v), M_LEFT - 4, py(v));
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const secMax = xMax / 1000;
    const xStep = niceStep(secMax, 4);
    for (let s = xStep; s <= secMax; s += xStep) {
      ctx.globalAlpha = 0.5;
      ctx.fillText(Math.round(s) + "s", px(s * 1000), h - M_BOTTOM + 4);
    }

    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(M_LEFT, M_TOP);
    ctx.lineTo(M_LEFT, h - M_BOTTOM);
    ctx.lineTo(w - M_RIGHT, h - M_BOTTOM);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (ms > 0) {
      const color = phase === "crashed" ? LOSE_COLOR : LINE_COLOR;
      const steps = 120;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = (ms * i) / steps;
        if (i === 0) ctx.moveTo(px(t), py(rawMultAt(t)));
        else ctx.lineTo(px(t), py(rawMultAt(t)));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.lineTo(px(ms), py(1));
      ctx.lineTo(px(0), py(1));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(px(ms), py(head), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (phase !== "waiting" && bet && bet.cashedAt !== null) {
      const cx = px(msAt(bet.cashedAt));
      const cy = py(bet.cashedAt);
      ctx.fillStyle = WIN_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.font = "bold 10px monospace";
      const labelX = Math.min(Math.max(cx, M_LEFT + 30), w - M_RIGHT - 30);
      ctx.fillText("you " + bet.cashedAt.toFixed(2) + "x", labelX, Math.max(cy - 7, M_TOP + 10));
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const midX = M_LEFT + (w - M_LEFT - M_RIGHT) / 2;
    const midY = M_TOP + (h - M_TOP - M_BOTTOM) / 2;
    if (phase === "waiting") {
      const left = Math.max(0, WAIT_MS - (performance.now() - phaseStart)) / 1000;
      ctx.fillStyle = textColor;
      ctx.font = "bold 20px monospace";
      ctx.fillText("starting in " + left.toFixed(1) + "s", midX, midY - 8);
      ctx.globalAlpha = 0.6;
      ctx.font = "11px monospace";
      ctx.fillText(nextBet ? "your bet: " + fmt(nextBet.amount) : "place your bet", midX, midY + 16);
      ctx.globalAlpha = 1;
    } else if (phase === "crashed") {
      ctx.fillStyle = LOSE_COLOR;
      ctx.font = "bold 22px monospace";
      ctx.fillText("crashed @ " + crashAt.toFixed(2) + "x", midX, midY);
    } else {
      ctx.fillStyle = bet && bet.cashedAt !== null ? WIN_COLOR : textColor;
      ctx.font = "bold 30px monospace";
      ctx.fillText(multAt(ms).toFixed(2) + "x", midX, midY);
    }
  }

  // vidja games
  function startWaiting(now) {
    phase = "waiting";
    phaseStart = now;
    bet = null;
  }

  function startRound(now) {
    phase = "running";
    phaseStart = now;
    crashAt = rollCrashPoint();
    bet = nextBet ? { amount: nextBet.amount, auto: nextBet.auto, cashedAt: null } : null;
    nextBet = null;
    if (bet) statusEl.textContent = "you're in for " + fmt(bet.amount);
  }

  function crash(now) {
    phase = "crashed";
    phaseStart = now;
    if (bet && bet.cashedAt === null) {
      statusEl.textContent = "crashed at " + crashAt.toFixed(2) + "x: -" + fmt(bet.amount);
    }
    history.unshift(crashAt);
    if (history.length > HISTORY_SIZE) history.pop();
    renderHistory();
  }

  function update(manual) {
    const m = currentMult();
    if (hasLiveBet()) {
      // check auto before the crash: a backgrounded tab can wake up past both
      if (bet.auto !== null && bet.auto < crashAt && m >= bet.auto) cashOut(bet.auto);
      else if (manual && m < crashAt) cashOut(m);
    }
    if (m >= crashAt) crash(performance.now());
  }

  function cashOut(m) {
    bet.cashedAt = m;
    const payout = Math.floor(bet.amount * m);
    if (window.awardPoints(payout)) {
      statusEl.textContent = "cashed out at " + m.toFixed(2) + "x: +" + fmt(payout - bet.amount);
      if (m >= 10) window.addNotification("crash: cashed out at " + m.toFixed(2) + "x for " + fmt(payout) + " points");
    } else {
      statusEl.textContent = "payout failed, please report this";
    }
  }

  function frame() {
    const now = performance.now();
    if (phase === "waiting" && now - phaseStart >= WAIT_MS) startRound(now);
    else if (phase === "running") update(false);
    else if (phase === "crashed" && now - phaseStart >= CRASHED_MS) startWaiting(now);
    render();
    if (open || nextBet || hasLiveBet()) {
      requestAnimationFrame(frame);
    } else {
      looping = false;
    }
  }

  function ensureLoop() {
    if (looping) return;
    looping = true;
    startWaiting(performance.now());
    requestAnimationFrame(frame);
  }

  function readBet() {
    const amount = Number(betInput.value);
    if (!Number.isSafeInteger(amount) || amount < 1) return { error: "bet must be a whole number of at least 1" };
    if (amount > MAX_BET) return { error: "bet can't be more than " + fmt(MAX_BET) };
    return { amount };
  }

  function readAuto() {
    if (autoInput.value.trim() === "") return { auto: null };
    const auto = Math.floor(Number(autoInput.value) * 100) / 100;
    if (!Number.isFinite(auto) || auto < 1.01) return { error: "auto cash out must be at least 1.01" };
    return { auto: Math.min(auto, MAX_MULT) };
  }

  function placeBet() {
    const b = readBet();
    if (b.error) return (statusEl.textContent = b.error);
    const a = readAuto();
    if (a.error) return (statusEl.textContent = a.error);

    // spendPoints saves immediately, so refreshing before the round ends can't undo a bet :3
    if (!window.spendPoints(b.amount)) return (statusEl.textContent = "not enough points");

    nextBet = { amount: b.amount, auto: a.auto };
    statusEl.textContent = phase === "waiting" ? "bet placed" : "bet placed for the next round";
  }

  function cancelBet() {
    const { amount } = nextBet;
    nextBet = null;
    statusEl.textContent = window.awardPoints(amount) ? "bet cancelled, refunded " + fmt(amount) : "refund failed, please report this";
  }

  actionBtn.addEventListener("click", () => {
    if (hasLiveBet()) update(true);
    else if (nextBet) cancelBet();
    else placeBet();
    render();
  });

  halfBtn.addEventListener("click", () => {
    const amount = Number(betInput.value) || 1;
    betInput.value = String(Math.max(1, Math.floor(amount / 2)));
  });
  doubleBtn.addEventListener("click", () => {
    const amount = Number(betInput.value) || 1;
    betInput.value = String(Math.max(1, Math.min(Math.floor(amount * 2), window.getPoints(), MAX_BET)));
  });
  maxBtn.addEventListener("click", () => {
    betInput.value = String(Math.max(1, Math.min(window.getPoints(), MAX_BET)));
  });

  document.addEventListener("pointsChanged", (e) => updateBalance(e.detail.points));
  updateBalance(window.getPoints());
  render();
})();
