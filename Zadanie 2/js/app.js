// Menu display: day tabs, week view, restaurant filter, buttons and error states.

const WEEK_VIEW = 'week';

const state = {
  view: defaultView(),
  results: [],
  hidden: new Set(),
};

function isWeekend() {
  return [0, 6].includes(new Date().getDay());
}

// Day index 0–4 (Monday–Friday); Monday on weekends
function defaultView() {
  return isWeekend() ? 0 : new Date().getDay() - 1;
}

// Date of a weekday (0 = Monday) in the displayed week; on weekends the next week
function dayDate(index) {
  const today = new Date();
  const weekday = today.getDay();
  const mondayShift = weekday === 0 ? 1 : weekday === 6 ? 2 : 1 - weekday;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayShift + index);
}

function formatDate(date) {
  return date.toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' });
}

function formatTimestamp(iso) {
  return new Date(iso).toLocaleString('sk-SK', { dateStyle: 'medium', timeStyle: 'short' });
}

function typeClass(type) {
  const classes = { [TYPE_SOUP]: 'soup', [TYPE_MAIN]: 'main', [TYPE_SPECIAL]: 'special', [TYPE_INFO]: 'info' };
  return classes[type] ?? 'other';
}

// ---- Controls ----

function renderDayTabs() {
  const $tabs = $('#day-tabs').empty();
  const today = toIsoDate(new Date());

  DAYS.forEach((day, i) => {
    const date = dayDate(i);
    const isToday = toIsoDate(date) === today;
    const $label = $('<span>').append(
      $('<span>', { class: 'd-sm-none', text: day.slice(0, 2) }),
      $('<span>', { class: 'd-none d-sm-inline', text: day }),
      $('<time>', { class: 'day-date', datetime: toIsoDate(date), text: formatDate(date) }),
    );
    if (isToday) $label.append($('<span>', { class: 'visually-hidden', text: ' (dnes)' }));
    $tabs.append(tabItem($label, state.view === i, isToday ? 'is-today' : '', () => setView(i)));
  });

  $tabs.append(tabItem($('<span>', { text: 'Celý týždeň' }), state.view === WEEK_VIEW, 'week-tab', () => setView(WEEK_VIEW)));
}

function tabItem($content, active, extraClass, onClick) {
  const $button = $('<button>', { type: 'button', class: 'nav-link' })
    .addClass(extraClass)
    .toggleClass('active', active)
    .attr('aria-pressed', active)
    .append($content)
    .on('click', onClick);
  return $('<li>', { class: 'nav-item' }).append($button);
}

function renderFilter() {
  const $filter = $('#restaurant-filter').empty();

  RESTAURANTS.forEach((restaurant) => {
    const id = `filter-${restaurant.id}`;
    const $input = $('<input>', { type: 'checkbox', class: 'btn-check', id, autocomplete: 'off' })
      .prop('checked', !state.hidden.has(restaurant.id))
      .on('change', (event) => {
        if (event.target.checked) state.hidden.delete(restaurant.id);
        else state.hidden.add(restaurant.id);
        renderCards();
      });
    const $label = $('<label>', { class: 'btn btn-outline-red', for: id, text: restaurant.name });
    $filter.append($input, $label);
  });
}

function setView(view) {
  state.view = view;
  renderDayTabs();
  renderCards();
}

function setLoading(loading) {
  $('#loading').prop('hidden', !loading);
  $('#menu').prop('hidden', loading);
  $('#btn-refresh, #btn-clear').prop('disabled', loading);
}

// ---- Restaurant cards ----

function renderCards() {
  const $menu = $('#menu').empty();

  if (!state.results.length) {
    $menu.append($('<p>', { class: 'empty-state', text: 'Uložené dáta sú vymazané. Kliknutím na „Aktualizovať menu“ ich načítate znova.' }));
    return;
  }

  const visible = state.results.filter(({ restaurant }) => !state.hidden.has(restaurant.id));
  if (!visible.length) {
    $menu.append($('<p>', { class: 'empty-state', text: 'Žiadna reštaurácia nie je zvolená. Vyberte aspoň jednu vo filtri.' }));
    return;
  }

  visible.forEach((result) => $menu.append($('<div>', { class: 'col-12 col-md-6 col-xl-4' }).append(renderCard(result))));
}

function renderCard({ restaurant, entry, error }) {
  const $card = $('<article>', { class: 'restaurant-card' });

  const $header = $('<header>', { class: 'restaurant-header' }).append(
    $('<h2>', { class: 'restaurant-name' }).append(
      $('<a>', { href: restaurant.url, target: '_blank', rel: 'noopener', text: restaurant.name }),
    ),
    $('<p>', { class: 'restaurant-address', text: restaurant.address }),
  );
  if (entry) {
    $header.append($('<p>', { class: 'restaurant-updated', text: 'Aktualizované: ' }).append(
      $('<time>', { datetime: entry.updatedAt, text: formatTimestamp(entry.updatedAt) }),
    ));
  }
  $card.append($header);

  const $body = $('<div>', { class: 'restaurant-body' });
  if (error) {
    $body.append($('<p>', { class: 'card-error', role: 'alert' }).append(
      $('<strong>', { text: 'Menu sa nepodarilo načítať. ' }),
      document.createTextNode(error),
    ));
  } else {
    const days = state.view === WEEK_VIEW ? DAYS : [DAYS[state.view]];
    days.forEach((day) => $body.append(renderDay(day, entry.items, state.view === WEEK_VIEW)));
    if (restaurant.priceNote) $body.append($('<p>', { class: 'price-note', text: restaurant.priceNote }));
  }
  return $card.append($body);
}

function renderDay(day, allItems, showHeading) {
  const items = allItems.filter((item) => item.day === day);
  const $section = $('<section>', { class: 'day-section' });

  if (showHeading) {
    const date = items.find((item) => item.date)?.date ?? toIsoDate(dayDate(DAYS.indexOf(day)));
    $section.append($('<h3>', { class: 'day-heading', text: day + ' ' }).append(
      $('<time>', { datetime: date, text: formatDate(new Date(`${date}T00:00`)) }),
    ));
  }

  if (!items.length) {
    return $section.append($('<p>', { class: 'no-menu', text: 'Menu na tento deň nie je k dispozícii.' }));
  }
  return $section.append($('<ul>', { class: 'dish-list' }).append(items.map(renderDish)));
}

function renderDish(item) {
  const kind = typeClass(item.type);
  const details = [item.weight, item.allergens && `Alergény: ${item.allergens}`].filter(Boolean).join(' · ');

  const $text = $('<div>', { class: 'dish-text' }).append(
    $('<span>', { class: 'dish-type', text: item.type }),
    $('<span>', { class: 'dish-name', text: item.name }),
  );
  if (details) $text.append($('<small>', { class: 'dish-details', text: details }));

  const $dish = $('<li>', { class: `dish dish-${kind}` }).append($text);
  if (item.price) $dish.append($('<span>', { class: 'dish-price', text: item.price }));
  return $dish;
}

// ---- Data loading ----

async function refresh(force) {
  setLoading(true);
  state.results = await loadAll(force);
  setLoading(false);
  renderCards();
}

$(function () {
  $('#notice').prop('hidden', !isWeekend());
  renderDayTabs();
  renderFilter();

  $('#btn-refresh').on('click', () => refresh(true));
  $('#btn-clear').on('click', () => {
    clearCache();
    state.results = [];
    renderCards();
  });

  refresh(false);
});
