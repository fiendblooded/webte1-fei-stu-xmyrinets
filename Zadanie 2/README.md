# Obedové menu v okolí fakulty

WEBTE1, Zadanie 2. Bohdan Myrinets, FEI STU.

Odkaz na školský server: <https://webte1.fei.stuba.sk/~xmyrinets/Zadanie2/>

Stránka zobrazuje denné menu troch reštaurácií na Starých Gruntoch (Reštaurácia DRAG, Eat & Meet,
White Dragon) podľa dní v týždni. Beží výlučne na strane klienta.

## Spustenie

Stránka načítava lokálne kópie reštaurácií cez Fetch API, preto ju treba otvoriť cez HTTP server
(na školskom serveri to funguje priamo, lokálne napr. `python3 -m http.server`). Priamy súbor
`file://` prehliadač zablokuje.

## Štruktúra

- `index.html`, `pages/o-projekte.html`: stránky
- `css/styles.css`: vlastné štýly, `js/`: logika
  - `restaurants.js`: parser pre každú reštauráciu a zoznam `RESTAURANTS` (novú reštauráciu
    pridáte jednou funkciou a jedným záznamom)
  - `data.js`: načítanie, `DOMParser`, ukladanie do `localStorage`
  - `app.js`: zobrazenie (dni, týždeň, filter, chyby)
- `local/`: uložené kópie stránok reštaurácií (zdroj dát)
- `docs/`: výpisy z HTML a CSS validátora

## Knižnice a zdroje

- [Bootstrap 5.3.3](https://getbootstrap.com/) (CSS aj JS bundle) a [jQuery 3.7.1](https://jquery.com/),
  obe uložené lokálne v `vendor/`
- **Fonty:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (text) a
  [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) (nadpisy), obe
  self-hosted vo `fonts/` ako `.woff2`, licencia SIL Open Font License 1.1
  (`fonts/OFL-SpaceGrotesk.txt`, `fonts/OFL-BricolageGrotesque.txt`)
- Dáta v `local/` pochádzajú zo stránok reštaurácií, na ktoré odkazuje každá karta.

## AI nástroje

Časti kódu a obsahu tejto stránky som vytvoril s pomocou nástroja **Claude Code (Anthropic)**.
Za výsledný obsah a funkčnosť riešenia zodpovedám a vedel by som ho vysvetliť.
