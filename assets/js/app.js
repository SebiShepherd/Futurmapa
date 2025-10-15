const isoNameMap = {
  USA: "United States of America",
  CAN: "Canada",
  MEX: "Mexico",
  BRA: "Brazil",
  ARG: "Argentina",
  CHL: "Chile",
  DEU: "Germany",
  FRA: "France",
  ESP: "Spain",
  GBR: "United Kingdom",
  ITA: "Italy",
  CHN: "China",
  IND: "India",
  JPN: "Japan",
  SGP: "Singapore",
  AUS: "Australia"
};

const state = {
  level: "world",
  region: null,
  country: null,
  marker: null,
  selectedUnit: "Group"
};

const mapElement = document.getElementById("map");
const tooltip = document.getElementById("tooltip");
const breadcrumbEl = document.getElementById("breadcrumb");
const contextPanel = document.getElementById("contextPanel");
const infoPanel = document.getElementById("infoPanel");
const infoPanelContent = infoPanel.querySelector(".info-panel__content");
const infoPanelClose = document.getElementById("infoPanelClose");
const businessSelector = document.getElementById("businessSelector");
const businessButtons = Array.from(businessSelector.querySelectorAll(".business-selector__option"));

const mapWidth = 1000;
const mapHeight = 600;

const svg = d3
  .select(mapElement)
  .append("svg")
  .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const rootGroup = svg.append("g");
const countriesGroup = rootGroup.append("g").attr("class", "countries");
const markersGroup = rootGroup.append("g").attr("class", "markers");

const projection = d3.geoMercator().scale(160).translate([mapWidth / 2, mapHeight / 1.65]);
const path = d3.geoPath(projection);

const zoom = d3
  .zoom()
  .scaleExtent([1, 12])
  .on("zoom", (event) => {
    rootGroup.attr("transform", event.transform);
  });

svg.call(zoom).on("dblclick.zoom", null).on("wheel.zoom", null);

const nameToIso = new Map(Object.entries(isoNameMap).map(([iso, name]) => [name, iso]));

Promise.all([
  fetch("data/world-110m.json").then((res) => res.json()),
  fetch("data/sample-data.json").then((res) => res.json())
])
  .then(([world, data]) => {
    const countries = topojson.feature(world, world.objects.countries).features;
    const nameToFeature = new Map(countries.map((feature) => [feature.properties.name, feature]));
    const isoToFeature = new Map(
      Object.entries(isoNameMap)
        .map(([iso, name]) => [iso, nameToFeature.get(name)])
        .filter(([, feature]) => feature)
    );

    const preparedRegions = prepareRegions(data.regions, isoToFeature);
    const isoToRegion = new Map();
    const isoToCountryData = new Map();

    preparedRegions.forEach((region) => {
      region.countries.forEach((country) => {
        isoToRegion.set(country.isoCode, region);
        isoToCountryData.set(country.isoCode, country);
      });
    });

    const activeIsoSet = new Set(isoToRegion.keys());

    drawCountries(countries, activeIsoSet, isoToRegion, isoToCountryData, isoToFeature);

    setupUI(preparedRegions, isoToRegion, isoToCountryData, isoToFeature, activeIsoSet);

    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("click", handleOutsideClick);

    resetToWorld();
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Daten:", error);
    contextPanel.innerHTML = `<h2>Fehler</h2><p>Die Kartendaten konnten nicht geladen werden.</p>`;
  });

function prepareRegions(regions, isoToFeature) {
  return regions.map((region) => {
    const countriesByIso = new Map((region.countries || []).map((country) => [country.isoCode, { ...country }]));
    const countries = (region.isoCodes || []).map((iso) => {
      const baseName = countriesByIso.get(iso)?.name || isoNameMap[iso] || iso;
      const country = countriesByIso.get(iso);
      if (country) {
        return {
          ...country,
          name: country.name || baseName,
          markers: Array.isArray(country.markers) ? country.markers : [],
          summary: country.summary || "Weitere Informationen folgen in Kürze."
        };
      }
      return {
        isoCode: iso,
        name: baseName,
        markers: [],
        summary: "Weitere Informationen folgen in Kürze.",
        comingSoon: true
      };
    });

    const hasFeatures = countries.some((country) => isoToFeature.has(country.isoCode));
    return {
      ...region,
      countries,
      isoSet: new Set(region.isoCodes || []),
      hasFeatures
    };
  });
}

function drawCountries(countries, activeIsoSet, isoToRegion, isoToCountryData, isoToFeature) {
  countriesGroup
    .selectAll("path")
    .data(countries)
    .join("path")
    .attr("d", path)
    .attr("class", (feature) => {
      const iso = nameToIso.get(feature.properties.name);
      const baseClasses = ["country"];
      if (iso && activeIsoSet.has(iso)) {
        baseClasses.push("country--active", "country--available");
      } else {
        baseClasses.push("country--inactive");
      }
      return baseClasses.join(" ");
    })
    .on("mouseenter", function (event, feature) {
      const iso = nameToIso.get(feature.properties.name);
      if (!iso || !activeIsoSet.has(iso)) {
        hideTooltip();
        return;
      }
      const region = isoToRegion.get(iso);
      const country = isoToCountryData.get(iso);
      const text = state.level === "world"
        ? `${region?.name || feature.properties.name}`
        : state.level === "region"
        ? `${country?.name || feature.properties.name}`
        : `${country?.name || feature.properties.name}`;
      showTooltip(text, event);
    })
    .on("mousemove", function (event, feature) {
      const iso = nameToIso.get(feature.properties.name);
      if (!iso || !activeIsoSet.has(iso)) {
        return;
      }
      moveTooltip(event);
    })
    .on("mouseleave", hideTooltip)
    .on("click", function (event, feature) {
      const iso = nameToIso.get(feature.properties.name);
      if (!iso || !activeIsoSet.has(iso)) {
        return;
      }
      const region = isoToRegion.get(iso);
      if (!region) return;

      if (state.level === "world") {
        focusRegion(region, { isoToFeature });
      } else if (state.level === "region") {
        if (state.region?.id !== region.id) {
          focusRegion(region, { isoToFeature });
        } else {
          const country = state.region.countries.find((entry) => entry.isoCode === iso);
          if (country) {
            focusCountry(state.region, country, { isoToFeature });
          }
        }
      } else if (state.level === "country") {
        if (state.country?.isoCode === iso) {
          return;
        }
        if (state.region?.isoSet.has(iso)) {
          const country = state.region.countries.find((entry) => entry.isoCode === iso);
          if (country) {
            focusCountry(state.region, country, { isoToFeature });
          }
        } else {
          focusRegion(region, { isoToFeature });
        }
      }
    });
}

function setupUI(regions, isoToRegion, isoToCountryData, isoToFeature, activeIsoSet) {
  infoPanelClose.addEventListener("click", () => {
    hideInfoPanel();
    hideBusinessSelector();
  });

  businessButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.marker) return;
      const unit = button.dataset.unit;
      state.selectedUnit = unit;
      updateBusinessSelectorButtons(state.marker);
      renderMarkerContent(state.marker);
    });
  });

  function focusRegionWrapper(region, options = {}) {
    focusRegion(region, { isoToFeature, ...options });
  }

  function focusCountryWrapper(region, country, options = {}) {
    focusCountry(region, country, { isoToFeature, ...options });
  }

  Object.assign(setupUI, {
    regions,
    isoToRegion,
    isoToCountryData,
    isoToFeature,
    activeIsoSet,
    focusRegion: focusRegionWrapper,
    focusCountry: focusCountryWrapper
  });
}

function focusRegion(region, { isoToFeature }) {
  state.level = "region";
  state.region = region;
  state.country = null;
  state.marker = null;

  hideInfoPanel();
  hideBusinessSelector();
  updateMarkers();
  updateCountryStyles();
  renderBreadcrumb();
  renderContextPanel();

  const bounds = getRegionBounds(region, isoToFeature);
  zoomToBounds(bounds, 0.85);
}

function focusCountry(region, country, { isoToFeature }) {
  state.level = "country";
  state.region = region;
  state.country = country;
  state.marker = null;

  hideInfoPanel();
  updateMarkers();
  updateCountryStyles();
  renderBreadcrumb();
  renderContextPanel();

  const feature = isoToFeature.get(country.isoCode);
  if (feature) {
    const bounds = path.bounds(feature);
    zoomToBounds(bounds, 0.6);
  }
}

function resetToWorld() {
  state.level = "world";
  state.region = null;
  state.country = null;
  state.marker = null;

  hideInfoPanel();
  hideBusinessSelector();
  updateMarkers();
  updateCountryStyles();
  renderBreadcrumb();
  renderContextPanel();

  svg.transition().duration(900).call(zoom.transform, d3.zoomIdentity);
}

function updateMarkers() {
  const markers = state.level === "country" && state.country ? state.country.markers || [] : [];
  const selection = markersGroup
    .selectAll("circle.marker")
    .data(markers, (marker) => marker.id);

  selection
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "marker")
          .attr("r", 0)
          .attr("cx", (marker) => projection(marker.coordinates)[0])
          .attr("cy", (marker) => projection(marker.coordinates)[1])
          .style("color", (marker) => marker.color || "#ffffff")
          .on("mouseenter", (event, marker) => {
            showTooltip(`${marker.topic}`, event);
          })
          .on("mousemove", (event) => moveTooltip(event))
          .on("mouseleave", hideTooltip)
          .on("click", (_, marker) => {
            openMarker(marker);
          })
          .call((enter) =>
            enter
              .transition()
              .duration(600)
              .attr("r", 11)
              .style("opacity", 1)
          ),
      (update) =>
        update
          .transition()
          .duration(400)
          .attr("cx", (marker) => projection(marker.coordinates)[0])
          .attr("cy", (marker) => projection(marker.coordinates)[1])
          .style("color", (marker) => marker.color || "#ffffff"),
      (exit) => exit.transition().duration(300).style("opacity", 0).attr("r", 0).remove()
    );
}

function openMarker(marker) {
  state.marker = marker;

  const availableUnits = getAvailableUnits(marker);
  if (!availableUnits.includes(state.selectedUnit)) {
    state.selectedUnit = availableUnits[0] || "Group";
  }

  updateBusinessSelectorButtons(marker);
  renderMarkerContent(marker);
  showInfoPanel();
  showBusinessSelector();
}

function renderMarkerContent(marker) {
  const unit = state.selectedUnit;
  const dataset = marker.datasets ? marker.datasets[unit] : null;

  const title = marker.title || marker.topic;
  const description = marker.description || "";

  let body = "";

  if (!dataset) {
    body = `<div class="highlight-card">Kein Datensatz für <strong>${unitLabel(unit)}</strong> verfügbar.</div>`;
  } else if (unit === "Compare") {
    body = renderCompareDataset(dataset);
  } else {
    body = renderHighlightGrid(dataset.highlights || []);
  }

  infoPanelContent.innerHTML = `
    <h3>${marker.topic}</h3>
    <h2>${title}</h2>
    ${description ? `<p>${description}</p>` : ""}
    <p><strong>Ansicht:</strong> ${unitLabel(unit)}</p>
    ${body}
  `;
}

function renderCompareDataset(dataset) {
  return `
    <div class="highlight-grid highlight-grid--compare">
      <div class="highlight-card">
        <h4>CVS</h4>
        ${renderSimpleList(dataset.CVS?.highlights || [])}
      </div>
      <div class="highlight-card">
        <h4>RVS</h4>
        ${renderSimpleList(dataset.RVS?.highlights || [])}
      </div>
    </div>
  `;
}

function renderHighlightGrid(highlights) {
  if (!highlights.length) {
    return `<p>Keine Daten verfügbar.</p>`;
  }
  return `<ul class="highlight-grid">${highlights.map((item) => `<li class="highlight-card">${item}</li>`).join("")}</ul>`;
}

function renderSimpleList(highlights) {
  if (!highlights.length) {
    return `<p>Keine Daten verfügbar.</p>`;
  }
  const items = highlights.map((item) => `<li>${item}</li>`).join("");
  return `<ul>${items}</ul>`;
}

function getAvailableUnits(marker) {
  if (!marker.datasets) return [];
  return ["Group", "CVS", "RVS", "Compare"].filter((unit) => {
    const entry = marker.datasets[unit];
    if (!entry) return false;
    if (unit === "Compare") {
      return (entry.CVS?.highlights?.length || 0) > 0 || (entry.RVS?.highlights?.length || 0) > 0;
    }
    return Array.isArray(entry.highlights) ? entry.highlights.length > 0 : false;
  });
}

function unitLabel(unit) {
  return unit === "Compare" ? "CVS vs. RVS" : unit;
}

function showInfoPanel() {
  infoPanel.classList.add("info-panel--visible");
  infoPanel.setAttribute("aria-hidden", "false");
}

function hideInfoPanel() {
  infoPanel.classList.remove("info-panel--visible");
  infoPanel.setAttribute("aria-hidden", "true");
  infoPanelContent.innerHTML = "";
}

function showBusinessSelector() {
  businessSelector.classList.add("business-selector--visible");
  businessSelector.setAttribute("aria-hidden", "false");
}

function hideBusinessSelector() {
  businessSelector.classList.remove("business-selector--visible");
  businessSelector.setAttribute("aria-hidden", "true");
}

function updateBusinessSelectorButtons(marker) {
  const availableUnits = new Set(getAvailableUnits(marker));
  businessButtons.forEach((button) => {
    const unit = button.dataset.unit;
    button.disabled = !availableUnits.has(unit);
    button.classList.toggle("business-selector__option--active", state.selectedUnit === unit && !button.disabled);
  });
}

function renderBreadcrumb() {
  const crumbs = [
    {
      label: "Welt",
      action: () => resetToWorld(),
      isCurrent: state.level === "world"
    }
  ];

  if (state.region) {
    crumbs.push({
      label: state.region.name,
      action: () => focusRegion(state.region, { isoToFeature: setupUI.isoToFeature }),
      isCurrent: state.level === "region" && !state.country
    });
  }

  if (state.country) {
    crumbs.push({ label: state.country.name, isCurrent: true });
  }

  breadcrumbEl.innerHTML = crumbs
    .map((crumb, index) => {
      const classes = ["breadcrumb__item"];
      if (crumb.isCurrent || index === crumbs.length - 1) {
        classes.push("breadcrumb__item--current");
      }
      return `<span class="${classes.join(" ")}" data-index="${index}">${crumb.label}</span>${
        index < crumbs.length - 1 ? "<span>›</span>" : ""
      }`;
    })
    .join("");

  Array.from(breadcrumbEl.querySelectorAll(".breadcrumb__item")).forEach((element) => {
    const index = Number(element.dataset.index);
    const crumb = crumbs[index];
    if (!crumb) return;
    if (crumb.isCurrent || index === crumbs.length - 1) {
      return;
    }
    element.addEventListener("click", () => {
      crumb.action?.();
    });
  });
}

function renderContextPanel() {
  if (state.level === "world") {
    const regions = (setupUI.regions || []).map((region) => `<li>${region.name}</li>`).join("");
    contextPanel.innerHTML = `
      <h2>Globale Ansicht</h2>
      <p>Wähle einen eingefärbten Kontinent, um in regionale Details zu zoomen.</p>
      <ul>${regions}</ul>
    `;
    return;
  }

  if (state.level === "region" && state.region) {
    const countryItems = state.region.countries
      .map((country) => {
        const status = country.markers?.length
          ? `${country.markers.length} Datenpunkt${country.markers.length > 1 ? "e" : ""}`
          : "Coming soon";
        return `<li>${country.name} – ${status}</li>`;
      })
      .join("");
    contextPanel.innerHTML = `
      <h2>${state.region.name}</h2>
      <p>Wähle ein Land innerhalb der Region für spezifische Einblicke.</p>
      <ul>${countryItems}</ul>
    `;
    return;
  }

  if (state.level === "country" && state.country) {
    const markerInfo = state.country.markers?.length
      ? `${state.country.markers.length} thematische Datenpunkt${state.country.markers.length > 1 ? "e" : ""}`
      : "Datenpunkte in Vorbereitung";
    contextPanel.innerHTML = `
      <h2>${state.country.name}</h2>
      <p>${state.country.summary || "Weitere Informationen folgen in Kürze."}</p>
      <p><strong>Status:</strong> ${markerInfo}</p>
    `;
  }
}

function updateCountryStyles() {
  const activeIsoSet = setupUI.activeIsoSet || new Set();
  countriesGroup.selectAll("path").each(function (feature) {
    const element = d3.select(this);
    const iso = nameToIso.get(feature.properties.name);
    const isActive = iso && activeIsoSet.has(iso);
    element.classed("country--active", isActive);
    element.classed("country--inactive", !isActive);

    const isDimmed = (() => {
      if (!isActive) return false;
      if (state.level === "world") return false;
      if (state.level === "region" && state.region) {
        return !state.region.isoSet.has(iso);
      }
      if (state.level === "country" && state.country) {
        return state.country.isoCode !== iso;
      }
      return false;
    })();

    const isFocused = (() => {
      if (!isActive) return false;
      if (state.level === "country" && state.country) {
        return state.country.isoCode === iso;
      }
      if (state.level === "region" && state.region) {
        return state.region.isoSet.has(iso);
      }
      return false;
    })();

    element.classed("country--dimmed", isDimmed);
    element.classed("country--focused", isFocused);
  });
}

function getRegionBounds(region, isoToFeature) {
  const features = region.isoCodes
    .map((iso) => isoToFeature.get(iso))
    .filter((feature) => feature);
  if (!features.length) {
    return [[0, 0], [mapWidth, mapHeight]];
  }
  const initial = [[Infinity, Infinity], [-Infinity, -Infinity]];
  return features.reduce((bounds, feature) => {
    const featureBounds = path.bounds(feature);
    return [
      [Math.min(bounds[0][0], featureBounds[0][0]), Math.min(bounds[0][1], featureBounds[0][1])],
      [Math.max(bounds[1][0], featureBounds[1][0]), Math.max(bounds[1][1], featureBounds[1][1])]
    ];
  }, initial);
}

function zoomToBounds(bounds, paddingFactor = 0.9) {
  const [[x0, y0], [x1, y1]] = bounds;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const x = (x0 + x1) / 2;
  const y = (y0 + y1) / 2;

  const scale = Math.max(
    1,
    Math.min(12, paddingFactor / Math.max(dx / mapWidth, dy / mapHeight))
  );
  const translate = [mapWidth / 2 - scale * x, mapHeight / 2 - scale * y];

  svg.transition().duration(900).call(
    zoom.transform,
    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
  );
}

function showTooltip(text, event) {
  tooltip.textContent = text;
  tooltip.style.opacity = 1;
  moveTooltip(event);
}

function moveTooltip(event) {
  const rect = mapElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTooltip() {
  tooltip.style.opacity = 0;
}

function handleKeydown(event) {
  if (event.key !== "Escape") return;

  if (state.marker) {
    hideInfoPanel();
    hideBusinessSelector();
    state.marker = null;
    return;
  }

  if (state.level === "country" && state.region) {
    focusRegion(state.region, { isoToFeature: setupUI.isoToFeature });
    return;
  }

  if (state.level === "region") {
    resetToWorld();
  }
}

function handleOutsideClick(event) {
  const target = event.target;
  if (!target) return;
  if (infoPanel.contains(target) || businessSelector.contains(target)) {
    return;
  }
  if (typeof target.closest === "function" && target.closest(".marker")) {
    return;
  }
  if (infoPanel.classList.contains("info-panel--visible")) {
    hideInfoPanel();
    hideBusinessSelector();
    state.marker = null;
  }
}

export { resetToWorld };
