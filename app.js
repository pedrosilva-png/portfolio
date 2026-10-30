(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const printBtn = document.getElementById("btn-print");
  const clock = document.getElementById("clock");
  const mapTime = document.getElementById("map-time");
  const statusEl = document.getElementById("typed-status");
  const progress = document.getElementById("scroll-progress");
  const palette = document.getElementById("command-palette");
  const commandTrigger = document.getElementById("command-trigger");

  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    if (!clock) return;
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} BRT`;
    if (mapTime) mapTime.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
  printBtn?.addEventListener("click", () => window.print());

  // Split hero headline into animated words
  const h1 = document.querySelector(".hero h1");
  if (h1 && !reduce) {
    const html = h1.innerHTML;
    h1.innerHTML = html
      .split(/<br\s*\/?>/i)
      .map((line) =>
        line
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((w, i, arr) => {
            const delay = 0.08 + i * 0.06;
            return `<span class="word" style="animation-delay:${delay}s">${w}</span>${i < arr.length - 1 ? " " : ""}`;
          })
          .join("")
      )
      .join("<br />");
  }

  // Status typewriter
  if (statusEl && !reduce) {
    const full = statusEl.textContent || "";
    statusEl.textContent = "";
    let i = 0;
    const type = () => {
      if (i <= full.length) {
        statusEl.textContent = full.slice(0, i);
        i += 1;
        setTimeout(type, 28);
      }
    };
    setTimeout(type, 400);
  }

  // Scroll reveal
  document.querySelectorAll(".project, .genai-card, .stack-grid > div, .contact-panel").forEach((el, idx) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${(idx % 4) * 0.07}s`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Count-up for numeric stats
  if (!reduce) {
    document.querySelectorAll(".quick-stats strong").forEach((el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)/);
      if (!match) return;
      const target = Number(match[1]);
      const suffix = raw.slice(match[1].length);
      let n = 0;
      const frames = 28;
      let f = 0;
      const run = () => {
        f += 1;
        n = Math.round((target * f) / frames);
        el.textContent = `${n}${suffix}`;
        if (f < frames) requestAnimationFrame(run);
      };
      setTimeout(() => requestAnimationFrame(run), 500);
    });
  }

  // Soft parallax on orb following pointer
  const orb = document.querySelector(".orb");
  if (orb && !reduce) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        orb.style.translate = `${x}px ${y}px`;
      },
      { passive: true }
    );
  }

  // Cursor spotlight + reading progress
  window.addEventListener(
    "pointermove",
    (e) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
    },
    { passive: true }
  );
  const updateProgress = () => {
    if (!progress) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });

  // Command palette: Ctrl/Cmd + K
  const openPalette = () => {
    if (palette && !palette.open) palette.showModal();
  };
  commandTrigger?.addEventListener("click", openPalette);
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openPalette();
    }
  });
  palette?.addEventListener("click", (e) => {
    if (e.target === palette || e.target.closest("a")) palette.close();
  });
})();
