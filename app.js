(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = document.getElementById("clock");
  const statusEl = document.getElementById("typed-status");
  const progress = document.getElementById("scroll-progress");
  const palette = document.getElementById("command-palette");
  const commandTrigger = document.getElementById("command-trigger");

  // Tema claro/escuro: padrão escuro, escolha salva em localStorage
  const themeToggle = document.getElementById("theme-toggle");
  const syncThemeToggle = () => {
    if (!themeToggle) return;
    const isLight = document.documentElement.dataset.theme === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", isLight ? "Alternar para tema escuro" : "Alternar para tema claro");
    themeToggle.querySelector(".theme-icon").textContent = isLight ? "☾" : "☀";
    themeToggle.querySelector(".theme-label").textContent = isLight ? "Tema escuro" : "Tema claro";
  };
  syncThemeToggle();
  themeToggle?.addEventListener("click", () => {
    const isLight = document.documentElement.dataset.theme === "light";
    if (isLight) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = "light";
    try {
      localStorage.setItem("portfolio-theme", isLight ? "dark" : "light");
    } catch { /* sem localStorage: tema vale só nesta visita */ }
    syncThemeToggle();
  });

  // Tiro de Guerra: texto "servindo" até 28/11/2026; depois, concluído
  const tiroCard = document.getElementById("tiro-de-guerra");
  const tiroTag = document.getElementById("tiro-tag");
  const tiroCopy = document.getElementById("tiro-copy");
  if (tiroCard && tiroTag && tiroCopy) {
    const end = tiroCard.dataset.end || "2026-11-28";
    const [y, m, d] = end.split("-").map(Number);
    const cutoff = new Date(y, m - 1, d + 1); // a partir do dia seguinte ao fim
    if (new Date() >= cutoff) {
      tiroTag.textContent = "CONCLUÍDO · NOV/2026";
      tiroCopy.textContent =
        "Finalizei o serviço no Exército Brasileiro — um ano de dificuldades e superações, com aprimoramento da responsabilidade e do cumprimento do dever.";
    }
  }

  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    if (!clock) return;
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} BRT`;
  };
  tick();
  setInterval(tick, 1000);

  // Split the name (h1) into animated words
  const h1 = document.querySelector(".hero-name");
  if (h1 && !reduce) {
    const html = h1.innerHTML;
    h1.innerHTML = html
      .split(/<br\s*\/?>/i)
      .map((line, lineIndex) =>
        line
          .replace(/<[^>]+>/g, "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((w, i, arr) => {
            const delay = 0.06 + (lineIndex * 3 + i) * 0.08;
            const accent = lineIndex > 0 ? " accent" : "";
            return `<span class="word${accent}" style="animation-delay:${delay}s">${w}</span>${i < arr.length - 1 ? " " : ""}`;
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
        setTimeout(type, 24);
      }
    };
    setTimeout(type, 300);
  }

  // Copy email button
  document.querySelectorAll(".copy-email").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-copy") || "phelohim@gmail.com";
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(email);
        btn.textContent = "E-mail copiado ✓";
      } catch {
        window.location.href = `mailto:${email}`;
      }
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    });
  });

  // Scrollspy: highlight current project in the sticky index
  const spyLinks = [...document.querySelectorAll(".spy-link")];
  const spyPanels = [...document.querySelectorAll(".spy-panel")];
  const spyNav = document.querySelector(".spy-nav");
  if (spyLinks.length && spyPanels.length) {
    const byId = new Map(spyLinks.map((l) => [l.getAttribute("href").slice(1), l]));
    const setActive = (id) => {
      spyLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
      spyPanels.forEach((p) => p.classList.toggle("is-current", p.id === id));
      const link = byId.get(id);
      if (link && spyNav && spyNav.scrollWidth > spyNav.clientWidth) {
        spyNav.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
      }
    };
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );
    spyPanels.forEach((p) => spy.observe(p));
  }

  // Scroll reveal
  document
    .querySelectorAll(".spy-panel, .timeline-card, .stack-layer, .stack-monitor, .contact-panel")
    .forEach((el, idx) => {
      el.classList.add("reveal");
      el.style.transitionDelay = `${(idx % 4) * 0.06}s`;
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
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
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
      const frames = 24;
      let f = 0;
      const run = () => {
        f += 1;
        const n = Math.round((target * f) / frames);
        el.textContent = `${n}${suffix}`;
        if (f < frames) requestAnimationFrame(run);
      };
      setTimeout(() => requestAnimationFrame(run), 400);
    });
  }

  // Soft parallax on orb + cursor spotlight + reading progress
  const orb = document.querySelector(".orb");
  window.addEventListener(
    "pointermove",
    (e) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
      document.documentElement.style.setProperty("--my", `${e.clientY}px`);
      if (orb && !reduce) {
        const x = (e.clientX / window.innerWidth - 0.5) * 28;
        const y = (e.clientY / window.innerHeight - 0.5) * 18;
        orb.style.translate = `${x}px ${y}px`;
      }
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
