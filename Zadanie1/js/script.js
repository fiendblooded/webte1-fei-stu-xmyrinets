// Personal portfolio — shared script for all five pages.
// Every section below guards itself on the elements it needs, so loading
// this one file on any page only runs the parts that apply there.

const SEMESTER_START = new Date("2026-09-21T00:00:00");
const SEMESTER_END = new Date("2026-12-18T23:59:59");

/* ------------------------------------------------------------------ */
/* Hidden AI-tool disclosure (assignment asks for it to be logged but */
/* not obvious at first glance in the source).                        */
/* ------------------------------------------------------------------ */
(function revealCredits() {
  const encoded = "R2VuZXJhdGVkIGJ5IEFJIChDbGF1ZGUgQ29kZSwgQW50aHJvcGljKQ==";
  console.log(atob(encoded));
})();

/* ------------------------------------------------------------------ */
/* Hamburger navigation (shared header, every page)                   */
/* ------------------------------------------------------------------ */
(function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A" && window.innerWidth <= 768) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ------------------------------------------------------------------ */
/* Header background/blur once the page scrolls (matches myri.sk)    */
/* ------------------------------------------------------------------ */
(function initStickyHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-stuck", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ------------------------------------------------------------------ */
/* Workspace hotspots — generated from a plain object array on load.  */
/* All hover/focus interaction is CSS-only (see styles.css); JS here  */
/* is used strictly to build the hotspot markup, per assignment rules.*/
/* ------------------------------------------------------------------ */
(function buildHotspots() {
  const figure = document.querySelector("[data-hotspot-figure]");
  if (!figure) return;

  const hotspots = [
    {
      id: "devops",
      label: "1",
      x: 31.3,
      y: 59,
      title: "DevOps",
      text: "Mal na starosti nasadenie a infraštruktúru — aby demo počas hackathonu bežalo aj pod tlakom a bez výpadkov.",
    },
    {
      id: "backend",
      label: "2",
      x: 39.8,
      y: 59,
      title: "Backend",
      text: "Postavil server a spracovanie dát pre Televate — analýzu starých kódových báz, na ktorej stál celý nápad.",
    },
    {
      id: "me",
      label: "3",
      x: 48.3,
      y: 59,
      title: "Bohdan Myrinets — Fullstack",
      text: "Robil som na frontende aj backende naraz — od rozhrania appky až po napojenie na AI, ktorá vedela oživiť starý kód. Presne to, čo mám na webových technológiách najradšej.",
    },
    {
      id: "fullstack2",
      label: "4",
      x: 58.6,
      y: 59,
      title: "Fullstack",
      text: "Druhý fullstack v tíme — spolu sme za 24 hodín dotiahli appku od nápadu po funkčné demo na pódiu.",
    },
    {
      id: "win",
      label: "5",
      x: 50,
      y: 14,
      title: "Televate — 1. miesto na Hack Kosice 2024",
      text: "Náš projekt: AI platforma, ktorá pomáha oživiť staré, opustené kódové základy. S týmto nápadom sme vyhrali najväčší slovenský hackathon.",
    },
  ];

  const fallback = document.querySelector("[data-hotspot-fallback]");
  const isCompact = () => window.matchMedia("(max-width: 768px)").matches;

  hotspots.forEach((spot) => {
    const wrap = document.createElement("span");
    wrap.className = "hotspot-wrap";
    wrap.style.position = "absolute";
    wrap.style.left = spot.x + "%";
    wrap.style.top = spot.y + "%";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotspot";
    button.style.left = "0";
    button.style.top = "0";
    button.setAttribute("aria-label", spot.title);
    button.textContent = spot.label;
    button.dataset.hotspotId = spot.id;

    const panel = document.createElement("span");
    panel.className = "hotspot-panel";
    panel.setAttribute("role", "tooltip");
    panel.innerHTML = `<h3>${spot.title}</h3><p>${spot.text}</p>`;

    wrap.appendChild(button);
    wrap.appendChild(panel);
    figure.appendChild(wrap);

    if (fallback) {
      button.addEventListener("click", () => {
        if (!isCompact()) return;
        fallback.innerHTML = `<h3>${spot.title}</h3><p>${spot.text}</p>`;
        document
          .querySelectorAll(".hotspot")
          .forEach((h) => h.classList.remove("is-selected"));
        button.classList.add("is-selected");
      });
    }
  });

  if (fallback && hotspots.length) {
    fallback.innerHTML = `<h3>${hotspots[0].title}</h3><p>${hotspots[0].text}</p>`;
    const firstBtn = figure.querySelector(".hotspot");
    if (firstBtn) firstBtn.classList.add("is-selected");
  }
})();

/* ------------------------------------------------------------------ */
/* Schedule: live highlight, filters, empty states, progress bar      */
/* ------------------------------------------------------------------ */
(function initSchedule() {
  const table = document.querySelector("table.schedule");
  if (!table) return;

  const DAY_COLUMNS = ["mon", "tue", "wed", "thu", "fri"];
  const statusBox = document.querySelector("[data-schedule-status]");
  const emptyBox = document.querySelector("[data-schedule-empty]");

  function highlightCurrent() {
    const now = new Date();
    const dayIndex = now.getDay(); // 0 = Sun ... 6 = Sat
    const cells = table.querySelectorAll("td[data-day][data-start][data-end]");
    let current = null;

    cells.forEach((cell) => cell.classList.remove("is-now"));

    if (dayIndex >= 1 && dayIndex <= 5) {
      const dayKey = DAY_COLUMNS[dayIndex - 1];
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      cells.forEach((cell) => {
        if (cell.dataset.day !== dayKey) return;
        const start = toMinutes(cell.dataset.start);
        const end = toMinutes(cell.dataset.end);
        if (nowMinutes >= start && nowMinutes < end) {
          cell.classList.add("is-now");
          current = cell;
        }
      });
    }

    if (!statusBox) return;

    if (current) {
      const subject = current.querySelector(".subject-name")?.textContent ?? current.textContent;
      statusBox.textContent = `Práve prebieha: ${subject.trim()}.`;
    } else {
      const next = findNextLesson(now);
      statusBox.textContent = next
        ? `Teraz nemám výučbu. Najbližšia hodina: ${next}.`
        : "Teraz nemám výučbu a v tomto týždni už žiadna ďalšia hodina nie je naplánovaná.";
    }
  }

  function toMinutes(value) {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }

  function findNextLesson(now) {
    const cells = Array.from(
      table.querySelectorAll("td[data-day][data-start][data-end]")
    );
    const dayIndex = now.getDay();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (let offset = 0; offset < 7; offset += 1) {
      const checkDay = (dayIndex + offset) % 7;
      if (checkDay === 0 || checkDay === 6) continue; // weekend, no lessons
      const dayKey = DAY_COLUMNS[checkDay - 1];

      const dayCells = cells
        .filter((cell) => cell.dataset.day === dayKey)
        .filter((cell) => (offset === 0 ? toMinutes(cell.dataset.start) > nowMinutes : true))
        .sort((a, b) => toMinutes(a.dataset.start) - toMinutes(b.dataset.start));

      if (dayCells.length) {
        const cell = dayCells[0];
        const subject = cell.querySelector(".subject-name")?.textContent ?? cell.textContent;
        const dayLabel = cell.closest("tr")?.querySelector
          ? document.querySelector(`thead th[data-day="${dayKey}"]`)?.textContent
          : dayKey;
        return `${dayLabel ?? dayKey} o ${cell.dataset.start} (${subject.trim()})`;
      }
    }
    return null;
  }

  function initFilters() {
    const buttons = document.querySelectorAll("[data-filter]");
    if (!buttons.length) return;

    const cells = table.querySelectorAll("td[data-type]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");

        const filter = button.dataset.filter;
        let visibleCount = 0;

        cells.forEach((cell) => {
          const matches = filter === "all" || cell.dataset.type === filter;
          cell.classList.toggle("is-hidden", !matches);
          if (matches) visibleCount += 1;
        });

        if (emptyBox) {
          emptyBox.style.display = visibleCount === 0 ? "block" : "none";
        }
      });
    });
  }

  function initProgress() {
    const bar = document.querySelector("[data-semester-progress]");
    const label = document.querySelector("[data-semester-progress-label]");
    if (!bar) return;

    const now = new Date();
    const total = SEMESTER_END - SEMESTER_START;
    const elapsed = now - SEMESTER_START;
    const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    bar.value = percent;
    if (label) {
      label.textContent = now < SEMESTER_START
        ? "Semester ešte nezačal."
        : now > SEMESTER_END
          ? "Semester už skončil."
          : `Uplynulo ${percent} % semestra.`;
    }
  }

  highlightCurrent();
  initFilters();
  initProgress();
  window.setInterval(highlightCurrent, 60 * 1000);
})();

/* ------------------------------------------------------------------ */
/* Map: fixed points, add-your-own points, Haversine distance,        */
/* localStorage persistence.                                          */
/* ------------------------------------------------------------------ */
(function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  const SCHOOL = { id: "school", name: "FEI STU Bratislava", lat: 48.15088, lng: 17.07186 };
  const HOME = { id: "home", name: "Domov (Petržalka)", lat: 48.12246, lng: 17.10860 };
  const STORAGE_KEY = "vizitka-map-points";

  const map = L.map("map", { scrollWheelZoom: false }).setView(
    [(SCHOOL.lat + HOME.lat) / 2, (SCHOOL.lng + HOME.lng) / 2],
    12
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const fixedIcon = (color) =>
    L.divIcon({
      className: "",
      html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 2px rgba(0,0,0,.25);"></span>`,
      iconSize: [16, 16],
    });

  const markers = new Map();
  let userPoints = loadPoints();
  let line = null;

  function loadPoints() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function savePoints() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userPoints));
  }

  function haversineDistanceKm(a, b) {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  }

  function allPoints() {
    return [SCHOOL, HOME, ...userPoints];
  }

  function pointById(id) {
    return allPoints().find((point) => point.id === id);
  }

  function renderMarkers() {
    markers.forEach((marker) => map.removeLayer(marker));
    markers.clear();

    L.marker([SCHOOL.lat, SCHOOL.lng], { icon: fixedIcon("#ff7848") })
      .addTo(map)
      .bindPopup(`<strong>${SCHOOL.name}</strong><br>škola`);
    L.marker([HOME.lat, HOME.lng], { icon: fixedIcon("#101010") })
      .addTo(map)
      .bindPopup(`<strong>${HOME.name}</strong><br>bydlisko`);

    userPoints.forEach((point) => {
      const marker = L.marker([point.lat, point.lng]).addTo(map);
      const popupContent = document.createElement("strong");
      popupContent.textContent = point.name;
      marker.bindPopup(popupContent);
      markers.set(point.id, marker);
    });
  }

  function renderList() {
    const list = document.querySelector("[data-point-list]");
    const emptyState = document.querySelector("[data-map-empty]");
    if (!list) return;

    list.innerHTML = "";

    if (!userPoints.length && emptyState) {
      emptyState.style.display = "block";
    } else if (emptyState) {
      emptyState.style.display = "none";
    }

    userPoints.forEach((point) => {
      const item = document.createElement("li");
      const nameSpan = document.createElement("span");
      nameSpan.textContent = point.name;
      item.appendChild(nameSpan);
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "odstrániť";
      removeBtn.addEventListener("click", () => {
        userPoints = userPoints.filter((p) => p.id !== point.id);
        savePoints();
        renderMarkers();
        renderList();
        refreshSelects();
      });
      item.appendChild(removeBtn);
      list.appendChild(item);
    });
  }

  function refreshSelects() {
    const fromSelect = document.querySelector("[data-select-from]");
    const toSelect = document.querySelector("[data-select-to]");
    if (!fromSelect || !toSelect) return;

    const options = allPoints()
      .map((point) => `<option value="${point.id}">${point.name}</option>`)
      .join("");

    const previousFrom = fromSelect.value;
    fromSelect.innerHTML = options;
    toSelect.innerHTML = `<option value="school">${SCHOOL.name}</option><option value="home">${HOME.name}</option>`;

    if (previousFrom && pointById(previousFrom)) {
      fromSelect.value = previousFrom;
    } else {
      fromSelect.value = "home";
    }
    toSelect.value = "school";
  }

  function updateDistance() {
    const fromSelect = document.querySelector("[data-select-from]");
    const toSelect = document.querySelector("[data-select-to]");
    const resultBox = document.querySelector("[data-distance-result]");
    if (!fromSelect || !toSelect || !resultBox) return;

    const from = pointById(fromSelect.value);
    const to = pointById(toSelect.value);

    if (!from || !to || from.id === to.id) {
      resultBox.textContent = "Vyberte dva rôzne body na porovnanie.";
      if (line) {
        map.removeLayer(line);
        line = null;
      }
      return;
    }

    const distance = haversineDistanceKm(from, to);
    resultBox.textContent = `${from.name} → ${to.name}: ${distance.toFixed(2)} km vzdušnou čiarou.`;

    if (line) map.removeLayer(line);
    line = L.polyline(
      [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
      { color: "#ff7848", weight: 3, dashArray: "6 6" }
    ).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [40, 40] });
  }

  map.on("click", (event) => {
    const name = window.prompt("Zadajte názov nového bodu:");
    if (!name) return;

    const point = {
      id: `point-${Date.now()}`,
      name: name.trim(),
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };

    userPoints.push(point);
    savePoints();
    renderMarkers();
    renderList();
    refreshSelects();
  });

  const fromSelect = document.querySelector("[data-select-from]");
  const toSelect = document.querySelector("[data-select-to]");
  [fromSelect, toSelect].forEach((select) => {
    select?.addEventListener("change", updateDistance);
  });

  renderMarkers();
  renderList();
  refreshSelects();
  updateDistance();
})();
