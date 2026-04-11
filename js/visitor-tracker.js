/* ═══════════════════════════════════════════════════════════
   VISITOR TRACKER  —  Portfolio Analytics
   Captures: IP, City, Region, Country, ISP, Timezone,
             Lat/Lng, Browser, Screen Size, Referrer
   Logs to  : Google Sheets via Apps Script Web App
   ═══════════════════════════════════════════════════════════ */

(function () {
  /* ─── CONFIGURATION ──────────────────────────────────────
     Paste your Google Apps Script Web App URL below.
     Leave it empty to disable logging to Google Sheets.
  ─────────────────────────────────────────────────────────── */
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzN6Lh904vOj1JMNo4-NCCTzD5MTvxsSv9GAHCh_bW9omoT9xLqT6RTmnSGhoI02lmLDg/exec"; // 👈 PASTE YOUR APPS SCRIPT URL HERE

  /* ─── SKIP BOTS & CRAWLERS ───────────────────────────── */
  const uaLower = navigator.userAgent.toLowerCase();
  const botPatterns = ["bot", "crawl", "spider", "slurp", "facebookexternalhit", "preview"];
  if (botPatterns.some((p) => uaLower.includes(p))) return;

  /* ─── FETCH GEO DATA FROM ipapi.co ──────────────────── */
  fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .then((geo) => {
      const payload = {
        ip: geo.ip || "unknown",
        city: geo.city || "unknown",
        region: geo.region || "unknown",
        country_name: geo.country_name || "unknown",
        org: geo.org || "unknown",            // ISP / Organization
        timezone: geo.timezone || "unknown",
        latitude: geo.latitude || "",
        longitude: geo.longitude || "",
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
        screenSize: `${screen.width}x${screen.height}`,
      };

      /* ─── LOG TO CONSOLE (always visible for debugging) ─ */
      console.groupCollapsed("📍 Visitor Info Captured");
      console.table({
        "IP Address":  payload.ip,
        "City":        payload.city,
        "Region":      payload.region,
        "Country":     payload.country_name,
        "ISP / Org":   payload.org,
        "Timezone":    payload.timezone,
        "Coordinates": `${payload.latitude}, ${payload.longitude}`,
        "Screen":      payload.screenSize,
        "Referrer":    payload.referrer,
      });
      console.groupEnd();

      /* ─── SEND TO GOOGLE SHEETS ─────────────────────── */
      if (!APPS_SCRIPT_URL) {
        console.warn("⚠️ Visitor Tracker: No Apps Script URL set. Data not logged to Google Sheets.");
        return;
      }

      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",          // Apps Script needs no-cors
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error("Visitor Tracker: Failed to send data.", err);
      });
    })
    .catch((err) => {
      console.warn("Visitor Tracker: Geo lookup failed.", err);
    });
})();
