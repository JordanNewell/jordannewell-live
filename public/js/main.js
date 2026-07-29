// Copyright (c) 2026 Jordan Newell. Licensed under MIT.
// Source: https://github.com/JordanNewell/jordannewell-com
//
// Site-wide JS — relative time formatting + status badge fetch.
// Extracted to external file so CSP (which blocks inline scripts) allows it to run.

(function () {
  'use strict';

  // === Relative time formatting =============================================

  function formatRelative(iso) {
    var then = new Date(iso).getTime();
    var now = Date.now();
    var diff = Math.max(0, now - then);
    var sec = Math.floor(diff / 1000);
    var min = Math.floor(sec / 60);
    var hr = Math.floor(min / 60);
    var day = Math.floor(hr / 24);
    if (sec < 60) return 'just now';
    if (min < 60) return min + 'm ago';
    if (hr < 24) return hr + 'h ago';
    if (day === 1) return 'yesterday';
    if (day < 30) return day + 'd ago';
    var date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function updateRelativeTimes() {
    var els = document.querySelectorAll('.live-relative[data-timestamp]');
    els.forEach(function (el) {
      var ts = el.getAttribute('data-timestamp');
      if (ts) el.textContent = formatRelative(ts);
    });
  }

  // === Status badge =========================================================

  var STATUS_URL = 'https://status.jordannewell.com/api/status-page/heartbeat/public';
  var STATUS_TIMEOUT_MS = 3000;

  function setStatus(badge, dot, text, state, label) {
    badge.classList.remove('is-up', 'is-down');
    if (state) badge.classList.add('is-' + state);
    text.textContent = label;
  }

  function updateStatusBadge(badge) {
    var dot = badge.querySelector('[data-status-dot]');
    var text = badge.querySelector('[data-status-text]');
    if (!dot || !text) return;

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, STATUS_TIMEOUT_MS);

    fetch(STATUS_URL, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(function (r) {
        clearTimeout(timeoutId);
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        var lists = Object.values(data.heartbeatList || {});
        if (!lists.length) {
          setStatus(badge, dot, text, null, 'Status unavailable');
          return;
        }
        var latest = lists.map(function (arr) {
          return arr[arr.length - 1] && arr[arr.length - 1].status;
        });
        var down = latest.filter(function (s) { return s !== 1; }).length;
        if (down === 0) {
          setStatus(badge, dot, text, 'up', 'All systems operational');
        } else if (down < latest.length) {
          setStatus(badge, dot, text, 'down', down + ' of ' + latest.length + ' services degraded');
        } else {
          setStatus(badge, dot, text, 'down', 'Major outage');
        }
      })
      .catch(function () {
        clearTimeout(timeoutId);
        setStatus(badge, dot, text, null, 'Status unknown');
      });
  }

  // === Init =================================================================

  updateRelativeTimes();
  setInterval(updateRelativeTimes, 60000);

  var badges = document.querySelectorAll('[data-status-badge]');
  badges.forEach(function (badge) {
    updateStatusBadge(badge);
    setInterval(function () { updateStatusBadge(badge); }, 60000);
  });
})();
