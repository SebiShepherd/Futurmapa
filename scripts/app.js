(async () => {
  const state = {
    level: "world",
    continent: null,
    country: null,
    selectedPoint: null,
    selectedOrg: ORG_OPTIONS[0]
  };

  // Runtime configuration loader (tries config.json, falls back to config.example.json)
  async function loadRuntimeConfig() {
    async function tryFetch(path) {
      try {
        const res = await fetch(path, { cache: "no-store" });
        if (!res.ok) return null;
        // First try structured JSON parse; if the file contains comments, fall back to stripping them.
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (err) {
          // remove // line comments and /* block comments */ and try again
          const stripped = text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//gm, "");
          try {
            return JSON.parse(stripped);
          } catch (err2) {
            return null;
          }
        }
      } catch (e) {
        // ignore
      }
      return null;
    }

    const fromConfig = await tryFetch("config.json");
    if (fromConfig) {
      fromConfig.__configSource = "config.json";
      return fromConfig;
    }
    const fromExample = await tryFetch("config.example.json");
    if (fromExample) {
      fromExample.__configSource = "config.example.json";
      return fromExample;
    }
    return { __configSource: "none" };
  }

  function applyRuntimeConfig(cfg) {
    if (!cfg) return;
    try {
      if (cfg.documentTitle) {
        const titleEl = document.getElementById("document-title");
        if (titleEl) titleEl.textContent = cfg.documentTitle;
        document.title = cfg.documentTitle;
      } else if (cfg.companyName) {
        const title = `${cfg.companyName} · Interaktive Konzern-Weltkarte`;
        const titleEl = document.getElementById("document-title");
        if (titleEl) titleEl.textContent = title;
        document.title = title;
      }

      if (cfg.favicon) {
        // remove existing icon links to avoid conflicts and caching oddities
        document.querySelectorAll('link[rel~="icon"], link[rel~="shortcut icon"]').forEach((n) => n.parentNode && n.parentNode.removeChild(n));
        const head = document.getElementsByTagName('head')[0] || document.documentElement;
        const href = `${cfg.favicon}${cfg.favicon.includes('?') ? '&' : '?'}v=${Date.now()}`;
        // standard icon
        const newLink = document.createElement('link');
        newLink.id = 'favicon-link';
        newLink.rel = 'icon';
        newLink.type = 'image/x-icon';
        newLink.href = href;
        head.appendChild(newLink);
        // legacy shortcut icon for some platforms/browsers
        const newLink2 = document.createElement('link');
        newLink2.rel = 'shortcut icon';
        newLink2.type = 'image/x-icon';
        newLink2.href = href;
        head.appendChild(newLink2);
      }

      if (cfg.logo) {
        const img = document.getElementById("brand-logo");
        if (img) {
          img.src = cfg.logo;
          img.style.display = "";
        }
      }

      if (cfg.siteTitle) {
        const el = document.getElementById("site-title");
        if (el) el.textContent = cfg.siteTitle;
      }

      if (cfg.subtitle) {
        const el = document.getElementById("site-subtitle");
        if (el) el.textContent = cfg.subtitle;
      }
    } catch (e) {
      console.warn("Applying runtime config failed", e);
    }
  }

  const RUNTIME_CONFIG = await loadRuntimeConfig();
  console.info("Loaded runtime config from:", RUNTIME_CONFIG.__configSource || "unknown", RUNTIME_CONFIG);
  applyRuntimeConfig(RUNTIME_CONFIG);

  const mapContainer = document.getElementById("map");
  const detailPanel = document.getElementById("detail-panel");
  const panelTitle = document.getElementById("panel-title");
  const panelSubtitle = document.getElementById("panel-subtitle");
  const panelBody = document.getElementById("panel-body");
  const orgSelector = document.getElementById("org-selector");
  const resetButton = document.getElementById("reset-view");
  const tooltip = document.getElementById("map-tooltip");
  const continentSummary = document.getElementById("continent-summary");
  const countryList = document.getElementById("country-list");
  const breadcrumb = document.getElementById("breadcrumb");
  const chipsContainer = document.getElementById("continent-chips");

  const svg = d3.select(mapContainer).append("svg");
  const defs = svg.append("defs");
  const dropShadowFilter = defs
    .append("filter")
    .attr("id", "map-drop-shadow")
    .attr("x", "-35%")
    .attr("y", "-35%")
    .attr("width", "170%")
    .attr("height", "170%")
    .attr("color-interpolation-filters", "sRGB");

  dropShadowFilter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", 6)
    .attr("result", "shadow");

  dropShadowFilter
    .append("feOffset")
    .attr("in", "shadow")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("result", "offset-shadow");

  const rootStyles = getComputedStyle(document.documentElement);
  
  // Read glow color from CSS variable, fallback to white
  const glowColor = rootStyles.getPropertyValue('--map-glow-strong')?.trim() || '#ffffff';
  dropShadowFilter
    .append("feFlood")
    .attr("flood-color", glowColor)
    .attr("flood-opacity", 0.85)
    .attr("result", "shadow-color");

  dropShadowFilter
    .append("feComposite")
    .attr("in", "shadow-color")
    .attr("in2", "offset-shadow")
    .attr("operator", "in")
    .attr("result", "glow");

  const dropShadowMerge = dropShadowFilter.append("feMerge");
  dropShadowMerge.append("feMergeNode").attr("in", "glow");
  dropShadowMerge.append("feMergeNode").attr("in", "SourceGraphic");
  const backgroundGlowStrong =
    rootStyles.getPropertyValue("--map-background-glow-strong")?.trim() || "rgba(255, 255, 255, 0.35)";
  const backgroundGlowSoft =
    rootStyles.getPropertyValue("--map-background-glow-soft")?.trim() || "rgba(255, 255, 255, 0.12)";

  const backgroundGradient = defs
    .append("radialGradient")
    .attr("id", "map-background-gradient")
    .attr("cx", "50%")
    .attr("cy", "45%")
    .attr("r", "65%");
  backgroundGradient.append("stop").attr("offset", "0%").attr("stop-color", backgroundGlowStrong);
  backgroundGradient.append("stop").attr("offset", "60%").attr("stop-color", backgroundGlowSoft);
  backgroundGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255, 255, 255, 0)");

  const clipPath = defs.append("clipPath").attr("id", "map-clip");
  const clipPathRect = clipPath.append("rect");

  const projection = d3.geoNaturalEarth1();
  const geoPath = d3.geoPath(projection);

  const backgroundRect = svg
    .append("rect")
    .attr("class", "map-background")
    .attr("fill", "url(#map-background-gradient)");

  const mapLayer = svg.append("g").attr("class", "map-layer").attr("clip-path", "url(#map-clip)");
  const countriesLayer = mapLayer.append("g").attr("class", "countries-layer");

  const pointsLayer = svg.append("g").attr("class", "points-layer").attr("clip-path", "url(#map-clip)");

  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", handleZoom);

  svg.call(zoom);
  svg.on("dblclick.zoom", null);
  svg.on("dblclick", () => {
    resetView();
  });

  let currentTransform = d3.zoomIdentity;
  let width = mapContainer.clientWidth || 800;
  let height = mapContainer.clientHeight || 600;

  function normalizeFeatureOrientation(feature) {
    if (!feature?.geometry) {
      return feature;
    }

    const area = d3.geoArea(feature);
    if (!Number.isFinite(area) || area <= 2 * Math.PI) {
      return feature;
    }

    const flipRing = (ring) => (Array.isArray(ring) ? ring.slice().reverse() : ring);
    const geometry = feature.geometry;

    if (geometry.type === "Polygon") {
      geometry.coordinates = geometry.coordinates.map(flipRing);
    } else if (geometry.type === "MultiPolygon") {
      geometry.coordinates = geometry.coordinates.map((polygon) => polygon.map(flipRing));
    }

    return feature;
  }

  const worldFeatures = WORLD_GEOJSON.features
    .filter((feature) => feature.id !== "ATA")
    .map(normalizeFeatureOrientation);
  const worldView = { type: "FeatureCollection", features: worldFeatures };
  const featureByIso = new Map(worldFeatures.map((feature) => [feature.id, feature]));

  function isCountryActive(iso) {
    const config = COUNTRY_BY_ISO.get(iso);
    return !!(config && config.active);
  }

  function updateProjection() {
    width = mapContainer.clientWidth || mapContainer.offsetWidth || 800;
    height = mapContainer.clientHeight || mapContainer.offsetHeight || 600;
    svg.attr("width", width).attr("height", height);

    projection.fitExtent(
      [
        [40, 40],
        [width - 40, height - 40]
      ],
      worldView
    );

    backgroundRect.attr("width", width).attr("height", height).attr("x", 0).attr("y", 0);
    clipPathRect.attr("width", width).attr("height", height).attr("x", 0).attr("y", 0);

    const bounds = geoPath.bounds(worldView);
    if (bounds && bounds.length === 2) {
      const padding = 20;
      const [[x0, y0], [x1, y1]] = bounds;
      if ([x0, y0, x1, y1].every((value) => Number.isFinite(value))) {
        zoom
          .extent([
            [0, 0],
            [width, height]
          ])
          .translateExtent([
            [x0 - padding, y0 - padding],
            [x1 + padding, y1 + padding]
          ]);
      }
    }

    countriesLayer.selectAll("path").attr("d", geoPath);
    updatePointPositions();
    svg.call(zoom.transform, currentTransform);
  }

  function drawCountries() {
    const countrySelection = countriesLayer.selectAll("path").data(worldFeatures, (d) => d.id);

    const entered = countrySelection
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", geoPath)
      .on("mousemove", handleMouseMove)
      .on("mouseleave", handleMouseLeave)
      .on("click", handleCountryClick);

    countrySelection.exit().remove();

    countrySelection.merge(entered).attr("d", geoPath);
    updateCountryClasses();
    updateStrokeWidths();
  }

  function handleMouseMove(event, feature) {
    const iso = feature.id;
    const countryConfig = COUNTRY_BY_ISO.get(iso);
    const [x, y] = d3.pointer(event, mapContainer);

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    if (countryConfig) {
      tooltip.textContent = `${countryConfig.name}${countryConfig.active ? " · aktiv" : " · in Vorbereitung"}`;
    } else {
      tooltip.textContent = feature.properties?.name || iso;
    }
    tooltip.classList.add("is-visible");
  }

  function handleMouseLeave() {
    tooltip.classList.remove("is-visible");
  }

  function handleCountryClick(event, feature) {
    event.stopPropagation();
    const iso = feature.id;
    const config = COUNTRY_BY_ISO.get(iso);
    if (!config || !config.active) {
      return;
    }

    if (state.level === "world") {
      focusContinent(config.continent, { highlightCountry: iso });
    } else {
      focusCountry(iso);
    }
  }

  function handleZoom(event) {
    currentTransform = event.transform;
    mapLayer.attr("transform", currentTransform);
    updatePointTransforms();
    updateStrokeWidths();
  }

  function updateStrokeWidths() {
    const scaleFactor = Math.sqrt(currentTransform.k || 1);
    countriesLayer.selectAll("path").style("stroke-width", 0.6 / scaleFactor);
  }

  function updateCountryClasses() {
    countriesLayer.selectAll("path").each(function (feature) {
      const iso = feature.id;
      const selection = d3.select(this);
      const config = COUNTRY_BY_ISO.get(iso);
      const isActive = !!(config && config.active);
      const highlight = state.country
        ? iso === state.country
        : state.continent
        ? isActive && config && config.continent === state.continent
        : false;

      selection.classed("is-active", isActive);
      selection.classed("is-inactive", !isActive);
      selection.classed("is-highlighted", highlight);
    });
  }

  function focusContinent(continentName, options = {}) {
    const continent = DATA_CONFIG.continents[continentName];
    if (!continent) return;

    state.level = "continent";
    state.continent = continentName;
    state.country = null;
    state.selectedPoint = null;

    hideDetailPanel();
    updateBreadcrumb();
    renderContinentSummary();
    renderCountryList(options.highlightCountry);
    updateContinentChips();
    updateCountryClasses();
    updatePoints(null);

    const features = continent.countries
      .map((iso) => featureByIso.get(iso))
      .filter(Boolean);

    const shouldAnimate = options.animate !== false;

    if (features.length) {
      zoomToCollection({ type: "FeatureCollection", features }, shouldAnimate);
    } else {
      zoomToWorld(shouldAnimate);
    }
  }

  function focusCountry(iso, options = {}) {
    const config = COUNTRY_BY_ISO.get(iso);
    if (!config || !config.active) return;

    state.level = "country";
    state.continent = config.continent;
    state.country = iso;
    state.selectedPoint = null;
    state.selectedOrg = ORG_OPTIONS[0];

    hideDetailPanel();
    updateBreadcrumb();
    renderContinentSummary();
    renderCountryList();
    updateContinentChips();
    updateCountryClasses();

    updatePoints(iso);

    const feature = featureByIso.get(iso);
    if (feature) {
      zoomToCollection({ type: "FeatureCollection", features: [feature] }, options.animate !== false);
    }
  }

  function zoomToWorld(animate = true) {
    if (animate) {
      svg.transition().duration(900).call(zoom.transform, d3.zoomIdentity);
    } else {
      svg.call(zoom.transform, d3.zoomIdentity);
    }
  }

  function zoomToCollection(collection, animate = true) {
    const bounds = geoPath.bounds(collection);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;

    if (!dx || !dy) {
      zoomToWorld(animate);
      return;
    }

    const [minScale, maxScale] = zoom.scaleExtent();
    const targetScale = Math.min(8, 0.9 / Math.max(dx / width, dy / height));
    const scale = Math.max(minScale, Math.min(maxScale, targetScale));
    const translate = [width / 2 - scale * x, height / 2 - scale * y];
    const transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

    if (animate) {
      svg.transition().duration(900).call(zoom.transform, transform);
    } else {
      svg.call(zoom.transform, transform);
    }
  }

  function updatePoints(countryIso) {
    const dataPoints = countryIso ? COUNTRY_BY_ISO.get(countryIso)?.points || [] : [];

    const selection = pointsLayer.selectAll(".data-point").data(dataPoints, (d) => d.id);

    selection
      .exit()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();

    const entered = selection
      .enter()
      .append("g")
      .attr("class", "data-point")
      .style("opacity", 0)
      .on("click", function (event, d) {
        event.stopPropagation();
        const countryConfig = COUNTRY_BY_ISO.get(countryIso);
        openDetailPanel(d, countryConfig);
      });

    entered.append("circle").attr("class", "point-ring").attr("r", 32);
    entered.append("circle").attr("class", "point-core").attr("r", 20);
    
    // Add SVG icon instead of text
    const iconGroup = entered.append("g").attr("class", "point-icon");
    iconGroup
      .append("path")
      .attr("d", (d) => SVG_ICONS[DATA_CONFIG.categories[d.category]?.icon] || "")
      .attr("transform", "translate(-10, -10) scale(0.83)")
      .attr("fill", "#0b162f");
    
    entered.append("title").text((d) => d.title);

    const merged = entered.merge(selection);

    merged.each(function (d) {
      d.countryIso = countryIso;
      if (!Array.isArray(d.coordinates) || d.coordinates.length !== 2) return;
      d.projected = projection(d.coordinates);
      const [px, py] = currentTransform.apply(d.projected);
      const category = DATA_CONFIG.categories[d.category];
      const color = category?.color || "#ffffff";
      d3.select(this)
        .classed("coming-soon", !!d.comingSoon)
        .attr("transform", `translate(${px},${py})`)
        .style("opacity", 1)
        .select("circle.point-core")
        .attr("fill", color);
    });

    highlightSelectedPoint(null);
  }

  function updatePointPositions() {
    pointsLayer.selectAll(".data-point").each(function (d) {
      if (!Array.isArray(d.coordinates)) return;
      d.projected = projection(d.coordinates);
    });
  }

  function updatePointTransforms() {
    pointsLayer.selectAll(".data-point").each(function (d) {
      if (!d.projected) return;
      const [x, y] = currentTransform.apply(d.projected);
      d3.select(this).attr("transform", `translate(${x},${y})`);
    });
  }

  function renderContinentSummary() {
    continentSummary.innerHTML = "";

    if (state.country) {
      const countryConfig = COUNTRY_BY_ISO.get(state.country);
      if (!countryConfig) return;
      const title = document.createElement("h2");
      title.textContent = countryConfig.name;
      const paragraph = document.createElement("p");
      paragraph.textContent = countryConfig.overview || "Keine Übersicht verfügbar.";
      continentSummary.appendChild(title);
      continentSummary.appendChild(paragraph);
    } else if (state.continent) {
      const info = DATA_CONFIG.continents[state.continent];
      const title = document.createElement("h2");
      title.textContent = state.continent;
      const paragraph = document.createElement("p");
      paragraph.textContent = info?.description || "Keine Beschreibung verfügbar.";
      continentSummary.appendChild(title);
      continentSummary.appendChild(paragraph);
    } else {
      const title = document.createElement("h2");
      title.textContent = "So funktioniert es";
      const paragraph = document.createElement("p");
      paragraph.innerHTML =
        "<strong>1.</strong> Kontinent auswählen · <strong>2.</strong> Land fokussieren · <strong>3.</strong> Themenpunkt öffnen.";
      const info = document.createElement("p");
      info.textContent = "Alle Kennzahlen lassen sich direkt ohne Backend anpassen (siehe scripts/data.js).";
      continentSummary.appendChild(title);
      continentSummary.appendChild(paragraph);
      continentSummary.appendChild(info);
    }
  }

  function renderCountryList(highlightCountry) {
    countryList.innerHTML = "";

    if (!state.continent) {
      const title = document.createElement("h2");
      title.textContent = "Kontinente";
      const text = document.createElement("p");
      text.textContent = "Nutze die Chips oder klicke auf die Karte, um zu einer Region zu springen.";
      countryList.appendChild(title);
      countryList.appendChild(text);
      return;
    }

     const continent = DATA_CONFIG.continents[state.continent];
    const title = document.createElement("h2");
    title.textContent = `${state.continent} · Länder`;
    countryList.appendChild(title);

    const list = document.createElement("div");
    list.className = "country-buttons";

    continent.countries.forEach((iso) => {
      const config = COUNTRY_BY_ISO.get(iso);
      const button = document.createElement("button");
      button.className = "country-button";
      button.type = "button";

      const name = config?.name || featureByIso.get(iso)?.properties?.name || iso;
      const label = document.createElement("span");
      label.textContent = name;
      const status = document.createElement("small");
      if (config?.active) {
        status.textContent = "Aktiv";
      } else {
        status.textContent = "In Vorbereitung";
      }

      button.appendChild(label);
      button.appendChild(status);

      if (!config || !config.active) {
        button.classList.add("is-disabled");
        button.disabled = true;
      } else {
        button.addEventListener("click", () => {
          focusCountry(iso);
        });
      }

      if (state.country === iso) {
        button.classList.add("is-active");
      } else if (highlightCountry && highlightCountry === iso) {
        button.classList.add("is-active");
      }

      list.appendChild(button);
    });

    countryList.appendChild(list);
  }

  function renderLegend() {
    const legend = document.getElementById("legend");
    legend.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "Legende";
    legend.appendChild(title);

    Object.values(DATA_CONFIG.categories).forEach((value) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = value.color;
      const textWrapper = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = value.label;
      const description = document.createElement("div");
      description.textContent = value.description;
      textWrapper.appendChild(label);
      textWrapper.appendChild(description);
      item.appendChild(swatch);
      item.appendChild(textWrapper);
      legend.appendChild(item);
    });
  }

  function renderContinentChips() {
    chipsContainer.innerHTML = "";

    CONTINENT_LIST.forEach((name) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
    const activeCount = DATA_CONFIG.continents[name].countries.filter((iso) => isCountryActive(iso)).length;
    chip.innerHTML = `<span>${name}</span><small>${activeCount} Standorte</small>`;
    chip.addEventListener("click", () => {
      focusContinent(name);
    });
    chipsContainer.appendChild(chip);
  });

    updateContinentChips();
  }

  function updateContinentChips() {
    const chipNodes = chipsContainer.querySelectorAll(".chip");
    chipNodes.forEach((chip) => {
      const label = chip.querySelector("span")?.textContent || "";
      chip.classList.toggle("is-active", !!state.continent && label === state.continent);
    });
  }

  function updateBreadcrumb() {
    breadcrumb.innerHTML = "";

    const items = [];
    items.push({ label: "Welt", action: () => resetView(), clickable: state.level !== "world" });
    if (state.continent) {
      items.push({
        label: state.continent,
        action: () => focusContinent(state.continent),
        clickable: state.level === "country"
      });
    }
    if (state.country) {
      const countryName = COUNTRY_BY_ISO.get(state.country)?.name || state.country;
      items.push({ label: countryName, clickable: false });
    }

    items.forEach((item, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.textContent = "›";
        separator.className = "breadcrumb-separator";
        breadcrumb.appendChild(separator);
      }

      const wrapper = document.createElement("span");
      wrapper.className = "breadcrumb-item";

      if (item.clickable) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = item.label;
        button.addEventListener("click", item.action);
        wrapper.appendChild(button);
      } else {
        const label = document.createElement("span");
        label.textContent = item.label;
        wrapper.appendChild(label);
      }

      breadcrumb.appendChild(wrapper);
    });
  }

  function highlightSelectedPoint(pointId) {
    pointsLayer.selectAll(".data-point").classed("is-selected", (d) => d.id === pointId);
    state.selectedPoint = pointId;
  }

  function renderOrgSelector(point) {
    orgSelector.innerHTML = "";

    if (point?.comingSoon) {
      orgSelector.style.display = "none";
      return;
    }

    orgSelector.style.display = "flex";

    ORG_OPTIONS.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "org-option";
      button.textContent = option;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", option === state.selectedOrg ? "true" : "false");
      button.addEventListener("click", () => {
        state.selectedOrg = option;
        updateOrgSelector(point);
        updatePanelContent(point);
      });
      if (option === state.selectedOrg) {
        button.classList.add("is-active");
      }
      orgSelector.appendChild(button);
    });
  }

  function updateOrgSelector(point) {
    orgSelector.querySelectorAll(".org-option").forEach((button) => {
      const isActive = button.textContent === state.selectedOrg;
      button.setAttribute("aria-checked", isActive ? "true" : "false");
      button.classList.toggle("is-active", isActive);
      button.disabled = !!point?.comingSoon;
    });
  }

  function createMetricCard(metric) {
    const card = document.createElement("div");
    card.className = "metric-card";
    const title = document.createElement("h3");
    title.textContent = metric.label;
    const value = document.createElement("div");
    value.className = "metric-value";
    value.textContent = metric.value;
    card.appendChild(title);
    card.appendChild(value);
    if (metric.trend) {
      const trend = document.createElement("div");
      trend.className = "metric-trend";
      trend.textContent = metric.trend;
      if (/^\+/.test(metric.trend)) {
        trend.classList.add("is-positive");
      } else if (/^−|-/.test(metric.trend)) {
        trend.classList.add("is-negative");
      }
      card.appendChild(trend);
    }
    return card;
  }

  function renderProgressList(items) {
    const wrapper = document.createElement("div");
    wrapper.className = "progress-list";
    items.forEach((item) => {
      const block = document.createElement("div");
      block.className = "progress-item";
      const label = document.createElement("span");
      label.textContent = item.label;
      const bar = document.createElement("div");
      bar.className = "progress-bar";
      const fill = document.createElement("div");
      fill.className = "fill";
      const value = Math.max(0, Math.min(100, item.value ?? 0));
      fill.style.width = `${value}%`;
      bar.appendChild(fill);
      block.appendChild(label);
      block.appendChild(bar);
      wrapper.appendChild(block);
    });
    return wrapper;
  }

  function renderCompareGrid(dataset) {
    const grid = document.createElement("div");
    grid.className = "compare-grid";

    const left = document.createElement("div");
    left.className = "compare-column";
    const leftTitle = document.createElement("h3");
    leftTitle.textContent = dataset.leftLabel || "CVS";
    left.appendChild(leftTitle);
    const leftList = document.createElement("ul");

    const right = document.createElement("div");
    right.className = "compare-column";
    const rightTitle = document.createElement("h3");
    rightTitle.textContent = dataset.rightLabel || "RVS";
    right.appendChild(rightTitle);
    const rightList = document.createElement("ul");

    (dataset.metrics || []).forEach((metric) => {
      const leftItem = document.createElement("li");
      const leftLabel = document.createElement("span");
      leftLabel.textContent = metric.label;
      const leftValue = document.createElement("span");
      leftValue.className = "value";
      leftValue.textContent = metric.left ?? "—";
      leftItem.appendChild(leftLabel);
      leftItem.appendChild(leftValue);
      leftList.appendChild(leftItem);

      const rightItem = document.createElement("li");
      const rightLabel = document.createElement("span");
      rightLabel.textContent = metric.label;
      const rightValue = document.createElement("span");
      rightValue.className = "value";
      rightValue.textContent = metric.right ?? "—";
      rightItem.appendChild(rightLabel);
      rightItem.appendChild(rightValue);
      rightList.appendChild(rightItem);
    });

    left.appendChild(leftList);
    right.appendChild(rightList);
    grid.appendChild(left);
    grid.appendChild(right);
    return grid;
  }

  function updatePanelContent(point) {
    panelBody.innerHTML = "";

    if (!point) return;

    if (point.comingSoon) {
      const info = document.createElement("div");
      info.className = "coming-soon";
      info.textContent = "Coming Soon: Datensatz befindet sich in Vorbereitung.";
      panelBody.appendChild(info);
      return;
    }

    let dataset;
    if (state.selectedOrg === "CVS vs RVS") {
      dataset = point.data?.compare;
    } else {
      dataset = point.data?.[state.selectedOrg];
    }

    if (!dataset) {
      const message = document.createElement("div");
      message.className = "no-data";
      message.textContent = "Kein Datensatz verfügbar.";
      panelBody.appendChild(message);
      return;
    }

    if (dataset.summary) {
      const summary = document.createElement("div");
      summary.className = "dataset-summary";
      summary.textContent = dataset.summary;
      panelBody.appendChild(summary);
    }

    if (state.selectedOrg === "CVS vs RVS") {
      panelBody.appendChild(renderCompareGrid(dataset));
    } else {
      if (dataset.metrics?.length) {
        const grid = document.createElement("div");
        grid.className = "metric-grid";
        dataset.metrics.forEach((metric) => {
          grid.appendChild(createMetricCard(metric));
        });
        panelBody.appendChild(grid);
      }

      if (dataset.progress?.length) {
        panelBody.appendChild(renderProgressList(dataset.progress));
      }
    }
  }

  function openDetailPanel(point, countryConfig) {
    highlightSelectedPoint(point.id);
    state.selectedOrg = ORG_OPTIONS[0];

    panelTitle.textContent = point.title;
    const category = DATA_CONFIG.categories[point.category];
    panelSubtitle.textContent = `${countryConfig?.name || ""} · ${category?.label || ""}`;

    renderOrgSelector(point);
    updatePanelContent(point);

    detailPanel.classList.add("is-visible");
    detailPanel.setAttribute("aria-hidden", "false");
  }

  function hideDetailPanel() {
    detailPanel.classList.remove("is-visible");
    detailPanel.setAttribute("aria-hidden", "true");
    highlightSelectedPoint(null);
  }

  function resetView() {
    state.level = "world";
    state.continent = null;
    state.country = null;
    state.selectedPoint = null;
    state.selectedOrg = ORG_OPTIONS[0];
    hideDetailPanel();
    updateBreadcrumb();
    renderContinentSummary();
    renderCountryList();
    updateContinentChips();
    updateCountryClasses();
    updatePoints(null);
    zoomToWorld(true);
  }

  function restoreCurrentView() {
    if (state.level === "country" && state.country) {
      focusCountry(state.country, { animate: false });
    } else if (state.level === "continent" && state.continent) {
      focusContinent(state.continent, { highlightCountry: state.country, animate: false });
    } else {
      zoomToWorld(false);
    }
  }

  function handleResize() {
    updateProjection();
    drawCountries();
    updatePointPositions();
    updatePointTransforms();
    restoreCurrentView();
  }

  document.querySelector(".close-detail").addEventListener("click", hideDetailPanel);
  detailPanel.addEventListener("click", (event) => {
    if (event.target === detailPanel) {
      hideDetailPanel();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideDetailPanel();
    }
  });

  resetButton.addEventListener("click", () => resetView());

  renderLegend();
  renderContinentChips();
  updateProjection();
  drawCountries();
  renderContinentSummary();
  renderCountryList();
  updateBreadcrumb();
  updateCountryClasses();
  zoomToWorld(false);

  window.addEventListener("resize", handleResize);
})();
