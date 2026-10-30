(() => {
  const coords = document.getElementById("hud-coords");
  const sectionEl = document.getElementById("hud-section");
  const clock = document.getElementById("hud-clock");
  const printBtn = document.getElementById("btn-print");
  const rail = document.getElementById("genai-rail");

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const d = new Date();
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} · BRT`;
  };
  tick();
  setInterval(tick, 1000);

  window.addEventListener(
    "pointermove",
    (e) => {
      const x = ((e.clientX / window.innerWidth) * 100).toFixed(1);
      const y = ((e.clientY / window.innerHeight) * 100).toFixed(1);
      coords.textContent = `${x} · ${y}`;
    },
    { passive: true }
  );

  const sections = [...document.querySelectorAll("[data-section]")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionEl.textContent = entry.target.getAttribute("data-section");
        }
      });
    },
    { threshold: 0.35 }
  );
  sections.forEach((s) => io.observe(s));

  printBtn?.addEventListener("click", () => window.print());

  // Drag-to-scroll on GenAI rail
  if (rail) {
    let down = false;
    let startX = 0;
    let scrollLeft = 0;
    rail.addEventListener("pointerdown", (e) => {
      down = true;
      rail.setPointerCapture(e.pointerId);
      startX = e.clientX;
      scrollLeft = rail.scrollLeft;
      rail.style.cursor = "grabbing";
    });
    rail.addEventListener("pointerup", () => {
      down = false;
      rail.style.cursor = "grab";
    });
    rail.addEventListener("pointermove", (e) => {
      if (!down) return;
      rail.scrollLeft = scrollLeft - (e.clientX - startX);
    });
    rail.style.cursor = "grab";
  }
})();
