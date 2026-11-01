// Loading of the local page copies, parsing, and caching in localStorage.

const STORAGE_PREFIX = 'obedove-menu:';

function isToday(isoTimestamp) {
  return new Date(isoTimestamp).toDateString() === new Date().toDateString();
}

function readCache(id) {
  try {
    const entry = JSON.parse(localStorage.getItem(STORAGE_PREFIX + id));
    return entry && Array.isArray(entry.items) && isToday(entry.updatedAt) ? entry : null;
  } catch {
    return null;
  }
}

function writeCache(id, entry) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(entry));
  } catch {
    // storage is full or disabled; the page keeps working without caching
  }
}

function clearCache() {
  RESTAURANTS.forEach((restaurant) => localStorage.removeItem(STORAGE_PREFIX + restaurant.id));
}

// A parser that throws on an unexpected page structure is treated like an empty result
function parseSafely(restaurant, doc) {
  try {
    return restaurant.parse(doc);
  } catch {
    return [];
  }
}

async function fetchRestaurant(restaurant) {
  const response = await fetch(restaurant.localFile).catch(() => {
    throw new Error('Stránka nie je dostupná.');
  });
  if (!response.ok) throw new Error(`Stránku sa nepodarilo načítať (HTTP ${response.status}).`);

  const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
  const items = parseSafely(restaurant, doc);
  if (!items.length) throw new Error('V stránke sa nenašlo žiadne menu, pravdepodobne sa zmenila jej štruktúra.');

  return { updatedAt: new Date().toISOString(), items };
}

async function loadRestaurant(restaurant, force) {
  const cached = force ? null : readCache(restaurant.id);
  if (cached) return cached;

  const entry = await fetchRestaurant(restaurant);
  writeCache(restaurant.id, entry);
  return entry;
}

// Returns a result per restaurant; a failure of one does not affect the others.
async function loadAll(force) {
  const settled = await Promise.allSettled(RESTAURANTS.map((r) => loadRestaurant(r, force)));
  return settled.map((result, i) => ({
    restaurant: RESTAURANTS[i],
    entry: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null,
  }));
}
