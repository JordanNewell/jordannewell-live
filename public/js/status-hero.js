// status-hero.js — live GitHub activity feed for the coming-soon terminal.
// Polls api.github.com/users/JordanNewell/events/public every 60s.
// CSP-safe: external script, no inline code.

(function () {
  const USER = "JordanNewell";
  // Hit GitHub directly — the old Worker proxy at /api/activity.json died
  // when DNS swapped to GitHub Pages. Unauthenticated rate limit is 60/hr
  // per visitor IP, which is plenty for a splash.
  const EVENTS_URL = `https://api.github.com/users/${USER}/events/public`;
  const POLL_MS = 60_000;
  const MAX_COMMITS = 10;
  const MAX_RELEASES = 2;

  const terminal = document.querySelector("[data-terminal]");
  if (!terminal) return;
  const body = terminal.querySelector("[data-terminal-body]");
  const statusEl = terminal.querySelector("[data-terminal-status]");
  if (!body) return;

  let firstRender = true;

  async function fetchEvents() {
    const isProxy = EVENTS_URL.startsWith("/") || EVENTS_URL.includes("/api/activity");
    // 5-minute-bucket cache-bust: URL stays stable within a 5-min window so
    // the edge cache actually hits. New bucket every 5 min forces a fresh
    // Worker call (and fresh GitHub fetch). Aligned with the Worker's 300s TTL.
    const url = isProxy
      ? `${EVENTS_URL}?t=${Math.floor(Date.now() / 300_000)}`
      : EVENTS_URL;
    const res = await fetch(url, isProxy ? {} : {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.status === 403 || res.status === 429) {
      throw new Error("rate-limited");
    }
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    const data = await res.json();
    // Worker proxy returns { commits, releases } directly. Dev direct-GitHub
    // returns an array of event objects that need parsing.
    if (isProxy) {
      if (data.error) throw new Error(data.error);
      return {
        parsed: true,
        commits: (data.commits || []).map((c) => ({ ...c, time: new Date(c.time) })),
        releases: (data.releases || []).map((r) => ({ ...r, time: new Date(r.time) })),
      };
    }
    return { parsed: false, raw: data };
  }

  function parseEvents(events) {
    const commits = [];
    const releases = [];
    const seenCommit = new Set();
    const seenRelease = new Set();

    for (const ev of events) {
      if (ev.type === "PushEvent" && commits.length < MAX_COMMITS) {
        const repo = ev.repo?.name?.replace(/^JordanNewell\//, "") ?? "?";
        for (const c of ev.payload?.commits || []) {
          if (commits.length >= MAX_COMMITS) break;
          const key = `${repo}:${c.sha}`;
          if (seenCommit.has(key)) continue;
          seenCommit.add(key);
          commits.push({
            sha: c.sha.slice(0, 7),
            repo,
            message: firstLine(c.message),
            url: `https://github.com/JordanNewell/${repo}/commit/${c.sha}`,
            time: new Date(ev.created_at),
          });
        }
      } else if (ev.type === "ReleaseEvent" && releases.length < MAX_RELEASES) {
        const repo = ev.repo?.name?.replace(/^JordanNewell\//, "") ?? "?";
        const key = `${repo}:${ev.payload?.release?.tag_name}`;
        if (key && !seenRelease.has(key)) {
          seenRelease.add(key);
          releases.push({
            tag: ev.payload?.release?.tag_name ?? "?",
            repo,
            url: ev.payload?.release?.html_url,
            time: new Date(ev.created_at),
          });
        }
      }
    }
    return { commits, releases };
  }

  function firstLine(msg) {
    return (msg || "").split("\n")[0].trim().slice(0, 80);
  }

  function timeAgo(date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return `${Math.floor(s / 604800)}w`;
  }

  function escape(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function row(comm) {
    return `<div class="terminal-row">
      <span class="terminal-row-sha"><a href="${escape(comm.url)}" target="_blank" rel="noopener">${escape(comm.sha)}</a></span>
      <span class="terminal-row-repo">${escape(comm.repo)}</span>
      <span class="terminal-row-msg">${escape(comm.message)}</span>
      <span class="terminal-row-time">${timeAgo(comm.time)} ago</span>
    </div>`;
  }

  function releaseRow(rel) {
    return `<div class="terminal-row">
      <span class="terminal-row-sha"><a href="${escape(rel.url)}" target="_blank" rel="noopener">${escape(rel.tag)}</a></span>
      <span class="terminal-row-repo">${escape(rel.repo)}</span>
      <span class="terminal-row-time">${timeAgo(rel.time)} ago</span>
    </div>`;
  }

  function render({ commits, releases }) {
    // Clear placeholder lines but keep the prompt line.
    const promptLine = body.querySelector(".terminal-line");
    body.innerHTML = "";
    if (promptLine) body.appendChild(promptLine);

    if (commits.length) {
      body.insertAdjacentHTML("beforeend", `<div class="terminal-section-label">commits</div>`);
      commits.forEach((c) => body.insertAdjacentHTML("beforeend", row(c)));
    }
    if (releases.length) {
      body.insertAdjacentHTML("beforeend", `<div class="terminal-section-label">releases</div>`);
      releases.forEach((r) => body.insertAdjacentHTML("beforeend", releaseRow(r)));
    }
    if (!commits.length && !releases.length) {
      body.insertAdjacentHTML("beforeend", `<div class="terminal-line terminal-muted">feed quiet</div>`);
    }
  }

  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function typeRow(rowEl, html, charDelay = 12) {
    // Type plain text content first; for elements with anchor tags we render
    // in one go (can't partially-type a link cleanly). Used for commit messages.
    rowEl.innerHTML = "";
    // Tokenize: split into safe chunks (tags vs text). Each tag chunk renders
    // atomically; text chunks type char-by-char.
    const tokens = html.split(/(<[^>]+>)/).filter(Boolean);
    for (const tok of tokens) {
      if (tok.startsWith("<")) {
        rowEl.insertAdjacentHTML("beforeend", tok);
      } else {
        for (const ch of tok) {
          rowEl.insertAdjacentHTML("beforeend", escape(ch));
          if (charDelay && !document.hidden) await sleep(charDelay);
        }
      }
    }
  }

  async function renderWithTyping({ commits, releases }) {
    const promptLine = body.querySelector(".terminal-line");
    body.innerHTML = "";
    if (promptLine) body.appendChild(promptLine);

    if (commits.length) {
      const label = document.createElement("div");
      label.className = "terminal-section-label";
      label.textContent = "commits";
      body.appendChild(label);
      for (const c of commits) {
        const rowEl = document.createElement("div");
        rowEl.className = "terminal-row";
        body.appendChild(rowEl);
        await typeRow(rowEl, row(c), 8);
        await sleep(40);
      }
    }
    if (releases.length) {
      const label = document.createElement("div");
      label.className = "terminal-section-label";
      label.textContent = "releases";
      body.appendChild(label);
      for (const r of releases) {
        const rowEl = document.createElement("div");
        rowEl.className = "terminal-row";
        body.appendChild(rowEl);
        await typeRow(rowEl, releaseRow(r), 10);
        await sleep(40);
      }
    }
    if (!commits.length && !releases.length) {
      const empty = document.createElement("div");
      empty.className = "terminal-line terminal-muted";
      empty.textContent = "feed quiet";
      body.appendChild(empty);
    }
  }

  async function refresh() {
    try {
      setStatus(firstRender ? "connecting to github…" : "refreshing…");
      const result = await fetchEvents();
      const parsed = result.parsed
        ? { commits: result.commits, releases: result.releases }
        : parseEvents(result.raw);
      if (firstRender) {
        await renderWithTyping(parsed);
      } else {
        render(parsed);
      }
      const total = parsed.commits.length + parsed.releases.length;
      setStatus(`ok · ${total} items · next refresh in 60s`);
    } catch (err) {
      setStatus(`error: ${err.message}`);
    } finally {
      firstRender = false;
    }
  }

  // Kick off after a short beat so the prompt + cursor render first.
  setTimeout(refresh, 600);
  setInterval(refresh, POLL_MS);
})();
