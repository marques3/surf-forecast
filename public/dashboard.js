const daysSelect = document.querySelector("#days");
const refreshButton = document.querySelector("#refresh");
const dayTabs = document.querySelector("#day-tabs");
const cards = document.querySelector("#cards");
const selectedDate = document.querySelector("#selected-date");
const updated = document.querySelector("#updated");
const forecast = document.querySelector(".forecast");
const empty = document.querySelector("#empty");

let forecastDays = [];
let activeIndex = 0;

const dateFormatter = new Intl.DateTimeFormat("pt-PT", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Lisbon" });
const timeFormatter = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" });
const updatedFormatter = new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Lisbon" });

function asDate(value) {
  return new Date(`${value}T12:00:00Z`);
}

function render() {
  const day = forecastDays[activeIndex];
  dayTabs.replaceChildren(...forecastDays.map((item, index) => {
    const button = document.createElement("button");
    const date = asDate(item.date);
    button.type = "button";
    button.className = "day-tab";
    button.role = "tab";
    button.ariaSelected = String(index === activeIndex);
    button.innerHTML = `<strong>${dateFormatter.format(date)}</strong><span>${item.recommendations.length} spots</span>`;
    button.addEventListener("click", () => { activeIndex = index; render(); });
    return button;
  }));

  if (!day) {
    selectedDate.textContent = "Sem previsão";
    cards.replaceChildren();
    empty.hidden = false;
    return;
  }
  selectedDate.textContent = dateFormatter.format(asDate(day.date));
  empty.hidden = day.recommendations.length > 0;
  cards.replaceChildren(...day.recommendations.map((item, index) => card(item, index)));
}

function card(item, index) {
  const { spot, bestWindow, board } = item;
  const element = document.createElement("article");
  element.className = "card";
  element.innerHTML = `
    <div class="rank">#${index + 1} recomendado</div>
    <div class="score">${bestWindow.score}<span>/100</span></div>
    <p class="time">Melhor janela: ${timeFormatter.format(new Date(bestWindow.timestamp))}</p>
    <h3 class="spot">${spot.name}</h3>
    <p class="region">${spot.region}</p>
    <div class="board"><span>Prancha recomendada</span><strong>${board.label}</strong><small>${board.reason}</small></div>
    <div class="metrics">
      <div class="metric"><strong>${bestWindow.waveHeightM.toFixed(1)} m</strong>Swell · ${bestWindow.swellDirection}</div>
      <div class="metric"><strong>${bestWindow.swellPeriodS.toFixed(1)} s</strong>Período</div>
      <div class="metric"><strong>${bestWindow.windSpeedKmh.toFixed(0)} km/h</strong>Vento · ${bestWindow.windDirection}</div>
      <div class="metric"><strong>${spot.coast === "west" ? "Costa oeste" : "Costa sul"}</strong>Exposição</div>
    </div>`;
  return element;
}

async function load() {
  forecast.setAttribute("aria-busy", "true");
  refreshButton.disabled = true;
  updated.textContent = "A atualizar previsão…";
  try {
    const response = await fetch(`/api/recommendations?days=${encodeURIComponent(daysSelect.value)}`);
    if (!response.ok) throw new Error("Não foi possível obter a previsão.");
    const payload = await response.json();
    forecastDays = payload.days;
    activeIndex = 0;
    updated.textContent = `Atualizado ${updatedFormatter.format(new Date(payload.generatedAt))}`;
    render();
  } catch (error) {
    forecastDays = [];
    render();
    updated.textContent = error instanceof Error ? error.message : "Não foi possível obter a previsão.";
  } finally {
    refreshButton.disabled = false;
    forecast.setAttribute("aria-busy", "false");
  }
}

daysSelect.addEventListener("change", load);
refreshButton.addEventListener("click", load);
load();
