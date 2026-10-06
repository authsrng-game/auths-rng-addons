(function () {
  const PANEL_ID = "addon-session-stats-panel";
  if (document.getElementById(PANEL_ID)) return;

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.style.cssText = [
    "position:fixed",
    "top:10px",
    "left:10px",
    "background:var(--panel-bg, #131313)",
    "border:1px solid var(--border-color, #303030)",
    "border-radius:4px",
    "padding:10px 12px",
    "font-family:monospace",
    "font-size:11px",
    "color:var(--text-color, #dcdcdc)",
    "z-index:9990",
    "min-width:150px",
    "opacity:0.9",
    "user-select:none",
  ].join(";");

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;opacity:0.6;";
  header.innerHTML = "<span>session stats</span>";

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "_";
  toggleBtn.style.cssText =
    "background:none;border:none;color:inherit;cursor:pointer;font-family:monospace;font-size:11px;opacity:0.7;padding:0 4px;";
  header.appendChild(toggleBtn);

  const body = document.createElement("div");
  body.style.lineHeight = "1.6";

  panel.appendChild(header);
  panel.appendChild(body);
  document.body.appendChild(panel);

  let collapsed = false;
  toggleBtn.addEventListener("click", () => {
    collapsed = !collapsed;
    body.style.display = collapsed ? "none" : "block";
    toggleBtn.textContent = collapsed ? "+" : "_";
  });

  function fmt(n) {
    if (typeof window.formatNum === "function") return window.formatNum(n);
    return String(Math.round(n));
  }

  function safeRead(fn, fallback) {
    try {
      const v = fn();
      return v === undefined ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }

  function update() {
    const pts = safeRead(() => points, 0);
    const rolls = safeRead(() => totalRolls, 0);
    const luck = safeRead(() => globalLuckMultiplier, 1);
    const collected = safeRead(() => inventoryData.size, 0);
    const total = safeRead(() => rarities.length, 0);

    body.innerHTML =
      "points: " +
      fmt(pts) +
      "<br>" +
      "rolls: " +
      fmt(rolls) +
      "<br>" +
      "luck: " +
      luck.toFixed(1) +
      "x<br>" +
      "collected: " +
      collected +
      "/" +
      total;
  }

  update();
  setInterval(update, 1000);
})();
