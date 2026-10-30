(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const printBtn = document.getElementById("btn-print");
  const clock = document.getElementById("clock");
  const statusEl = document.getElementById("typed-status");
  const termCode = document.querySelector(".term-body code");

  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    if (!clock) return;
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} BRT`;
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

  // Terminal: type plain text, then swap to syntax HTML
  if (termCode && !reduce) {
    const fullHtml = termCode.innerHTML;
    const plain = termCode.textContent || "";
    termCode.textContent = "";
    let i = 0;
    const typeTerm = () => {
      i += 2;
      termCode.textContent = plain.slice(0, i);
      if (i < plain.length) {
        setTimeout(typeTerm, 16);
      } else {
        termCode.innerHTML = fullHtml;
      }
    };
    setTimeout(typeTerm, 500);
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
})();
