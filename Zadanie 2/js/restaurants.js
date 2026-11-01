// Each restaurant has its own function that turns the parsed DOM into an array of dishes
// in a unified structure: { day, date, type, name, price, weight, allergens }
// To add a restaurant, write another parse function and add one entry to RESTAURANTS.

const DAYS = ['Pondelok', 'Utorok', 'Streda', 'Štvrtok', 'Piatok'];

const TYPE_SOUP = 'Polievka';
const TYPE_MAIN = 'Hlavné jedlo';
const TYPE_SPECIAL = 'Špecialita';
const TYPE_INFO = 'Info';

const RESTAURANTS = [
  {
    id: 'drag',
    name: 'Reštaurácia DRAG',
    address: 'Staré Grunty 64, Bratislava',
    url: 'https://www.restauracia-drag.sk/denne-menu',
    localFile: 'local/drag.html',
    parse: parseDrag,
  },
  {
    id: 'eatmeet',
    name: 'Eat & Meet',
    address: 'Staré Grunty 36, Átriaky blok AD-U, Bratislava',
    url: 'https://www.eatandmeet.sk/tyzdenne-menu',
    localFile: 'local/eatmeet.html',
    priceNote: 'Cena: bežná / zvýhodnená',
    parse: parseEatMeet,
  },
  {
    id: 'whitedragon',
    name: 'White Dragon',
    address: 'Staré Grunty 18, Bratislava',
    url: 'https://www.whitedragon.sk/denne-menu',
    localFile: 'local/whitedragon.html',
    parse: parseWhiteDragon,
  },
];

function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function sentenceCase(text) {
  const lower = text.toLocaleLowerCase('sk');
  return lower.charAt(0).toLocaleUpperCase('sk') + lower.slice(1);
}

function makeItem(day, type, name, extra = {}) {
  return { day, date: null, type, name, price: '', weight: '', allergens: '', ...extra };
}

// ---- Reštaurácia DRAG: tab panes #pondelok…#piatok, soup as plain text, mains in a table ----

const DRAG_PANEL_IDS = ['pondelok', 'utorok', 'streda', 'stvrtok', 'piatok'];

function parseDrag(doc) {
  const items = [];

  DAYS.forEach((day, i) => {
    const panel = doc.getElementById(DRAG_PANEL_IDS[i]);
    if (!panel) return;

    let section = '';
    let soupText = '';
    const mains = [];

    panel.childNodes.forEach((node) => {
      const heading = node.nodeType === Node.ELEMENT_NODE && node.querySelector('h3');
      if (heading) {
        section = cleanText(heading.textContent).toLowerCase();
      } else if (section === 'polievka') {
        soupText += ' ' + node.textContent;
      } else if (section === 'hlavné jedlo' && node.nodeType === Node.ELEMENT_NODE) {
        node.querySelectorAll('tr').forEach((row) => {
          const cells = row.querySelectorAll('td');
          const price = cells[1] ? cleanText(cells[1].textContent).replace(/\s*EUR$/i, ' €') : '';
          mains.push(dragItem(day, TYPE_MAIN, cells[0]?.textContent ?? '', price));
        });
      }
    });

    items.push(dragItem(day, TYPE_SOUP, soupText, ''), ...mains);
  });

  return items.filter(Boolean);
}

// Dish text in the format "150g/150g  DISH NAME /1,3,7/"
function dragItem(day, type, rawText, price) {
  let name = cleanText(rawText);
  if (!name) return null;

  const allergens = name.match(/\/([\d,\s]+)\/$/);
  if (allergens) name = name.slice(0, allergens.index).trim();

  const weight = name.match(/^(\d+(?:,\d+)?\s?(?:g|l)(?:\/\d+\s?g)?)\s+/i);
  if (weight) name = name.slice(weight[0].length);

  return makeItem(day, type, sentenceCase(name), {
    price,
    weight: weight ? weight[1] : '',
    allergens: allergens ? allergens[1].replace(/\s/g, '') : '',
  });
}

// ---- Eat & Meet: tab panes #day-1…#day-5, each dish is a .menu-body block with price and allergens ----

function parseEatMeet(doc) {
  const items = [];

  DAYS.forEach((day, i) => {
    doc.querySelectorAll(`#day-${i + 1} .menu-body`).forEach((meal) => {
      const description = meal.querySelector('.desc');
      if (!description) return;

      const allergens = cleanText(description.querySelector('span')?.textContent ?? '').replace(/[()\s]/g, '');
      description.querySelector('span')?.remove();
      const name = cleanText(description.textContent);
      if (!name) return;

      const title = cleanText(meal.querySelector('h4')?.textContent ?? '');
      items.push(makeItem(day, eatMealType(title), name, {
        price: eatMealPrice(meal.querySelector('.price')),
        allergens,
      }));
    });
  });

  return items;
}

function eatMealType(title) {
  if (/^polievka/i.test(title)) return TYPE_SOUP;
  if (/^menu/i.test(title)) return TYPE_MAIN;
  return sentenceCase(title);
}

// "4,50 € / 2,10 €"; if both prices are equal, only one is shown
function eatMealPrice(priceElement) {
  if (!priceElement) return '';
  const prices = cleanText(priceElement.textContent).split('/').map((p) => p.trim()).filter(Boolean);
  return [...new Set(prices)].join(' / ');
}

// ---- White Dragon: free text in paragraphs, lines separated by <br>, one shared price ----

function parseWhiteDragon(doc) {
  const main = doc.querySelector('main');
  if (!main) return [];

  const text = main.textContent;
  const mainPrice = priceFromText(text, /Cena menu\s*[–-]\s*([\d,]+)\s*eur/i);
  const specialPrice = priceFromText(text, /špeciál\s*[–-]\s*([\d,]+)\s*eur/i);
  const dates = whiteDragonDates(text);

  const items = [];
  let dayIndex = -1;

  main.querySelectorAll('p').forEach((paragraph) => {
    const lines = paragraphLines(paragraph);
    if (!lines.length) return;

    const startsDay = DAYS.findIndex((day) => day.toLowerCase() === lines[0].toLowerCase());
    if (startsDay !== -1) {
      dayIndex = startsDay;
      const dishes = lines.slice(1);
      const closed = dishes.some((line) => /zatvoren/i.test(line));
      dishes.forEach((line, i) => {
        const type = closed ? TYPE_INFO : i < 2 ? TYPE_SOUP : TYPE_MAIN;
        items.push(whiteDragonItem(dayIndex, type, line, type === TYPE_MAIN ? mainPrice : '', dates));
      });
    } else if (dayIndex !== -1 && /^špeciál:/i.test(lines[0])) {
      const name = lines[0].replace(/^špeciál:\s*/i, '');
      items.push(whiteDragonItem(dayIndex, TYPE_SPECIAL, name, specialPrice, dates));
    }
  });

  return items;
}

function whiteDragonItem(dayIndex, type, line, price, dates) {
  const allergens = line.match(/\s((?:\d{1,2}[,\s]+)*\d{1,2})$/);
  const name = allergens ? line.slice(0, allergens.index) : line;
  return makeItem(DAYS[dayIndex], type, name, {
    date: dates[dayIndex] ?? null,
    price,
    allergens: allergens ? allergens[1].replace(/[,\s]+/g, ',') : '',
  });
}

// Turn <br> into line breaks and split the text into lines
function paragraphLines(paragraph) {
  const copy = paragraph.cloneNode(true);
  copy.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return copy.textContent.split('\n').map(cleanText).filter(Boolean);
}

function priceFromText(text, pattern) {
  const match = text.match(pattern);
  return match ? `${match[1]} €` : '';
}

// Week heading "2.- 6.11.2026" -> dates of Monday to Friday
function whiteDragonDates(text) {
  const range = text.match(/(\d{1,2})\.\s*-\s*(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!range) return [];

  const [, , lastDay, month, year] = range.map(Number);
  return DAYS.map((_, i) => toIsoDate(new Date(year, month - 1, lastDay - (DAYS.length - 1 - i))));
}

function toIsoDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
