# WEBTE1 — Zadanie č. 2

**ZS 2026/2027**

## 1. Technické pokyny

- V zadaní používajte HTML, CSS a JavaScript. Na rozdiel od prvého zadania **JE POTREBNÉ** používať CSS knižnice a pomocné JavaScriptové knižnice (napr. Tailwind CSS, Bootstrap, jQuery, ikonové sady a pod.). Aspoň 1 CSS a jednu JS. **NEPOUŽÍVAJTE** JavaScriptové frameworky (napr. React, Vue, Angular, Svelte) ani knižnice určené na scrapovanie. Použité knižnice uveďte v pätičke alebo na podstránke „O projekte“.
- **Validita:** HTML overte na <https://validator.w3.org/>, CSS na <https://jigsaw.w3.org/css-validator/>. Vlastnosti s vendor prefixami môžu byť nevalidné; ostatné pravidlá musia byť validné. **Výpis z oboch validátorov** (screenshot alebo text) priložte do priečinka `docs/`.
- Nepoužívajte predvolený systémový font. Zvoľte iný (napr. Roboto, Poppins) a priložte ho **lokálne** pomocou `@font-face` (`.woff2`). Licenciu fontu uveďte v `README.md`.
- Stránky optimalizujte pre posledné verzie prehliadačov **Chrome** a **Firefox**.
- **Obsah stránky je v slovenčine** (s diakritikou), kódovanie **UTF-8**.

### Odovzdanie

- Na vypracovanie zadania máte čas do: **1.11.2026 23:59**.
- Zadania sa odovzdávajú vždy **do polnoci dňa, ktorý predchádza cvičeniu**. Neskoré odovzdanie: **0 bodov**.
- Odovzdajte **ZIP** vo formáte `Z1_priezvisko.zip`. V koreňovom adresári musí byť `index.html` a `README.md`.
- K odovzdaniu priložte aj **odkaz** na stránku umiestnenú na školskom serveri.
- **Plagiátorstvo bude sankcionované.** Použitie AI nástrojov je povolené, ale musí byť uvedené v `README.md`; za obsah a funkčnosť odovzdaného riešenia zodpovedáte vy a musíte ho vedieť vysvetliť.
- **Obhajoba riešenia:** súčasťou hodnotenia je vaša schopnosť odpovedať na otázky cvičiaceho k implementácii odovzdaného kódu. Ak na otázky k vlastnému riešeniu nedokážete odpovedať, zadanie je hodnotené **0 bodmi**.

## 2. Zadanie cvičenia

Vytvorte webovú stránku **„Obedové menu v okolí fakulty“**, ktorá bude načítavať webové stránky reštaurácií a jedální v okolí FEI STU, spracuje z nich denné menu a prehľadne ho zobrazí podľa jednotlivých dní v týždni. Celé zadanie sa rieši výlučne na strane klienta (HTML, CSS, JavaScript). Je potrebné, aby zadanie spĺňalo nasledovné požiadavky:

1. Dokument zostavte podľa odporúčaní HTML 5 (nesmie chýbať `DOCTYPE`), maximálne využívajte sémantické značky (`header`, `nav`, `main`, `section`, `article`, `footer`, `time`, ...). Celá stránka bude v slovenskom jazyku s diakritikou a v kódovaní UTF-8.

2. Vyberte si **minimálne 3 reštaurácie (jedálne, bufety)** v okolí fakulty, ktoré zverejňujú svoje denné alebo týždenné menu na svojej webovej stránke priamo v HTML (nie ako obrázok alebo PDF). Každá z nich by mala mať inú štruktúru stránky. Konkrétny výber reštaurácií si nechajte schváliť cvičiacim.

3. **Načítanie a spracovanie dát.**

   - Prehliadač z bezpečnostných dôvodov (politika CORS) neumožňuje priamo načítať obsah cudzích stránok. Stránky reštaurácií preto načítavajte prostredníctvom proxy, ktorého adresa bude oznámená na cvičení. Nepoužívajte iné verejné CORS proxy služby.
   - Pre ladenie si uložte aj lokálne kópie stránok reštaurácií do priečinka projektu a umožnite prepnúť načítanie medzi živou stránkou a lokálnou kópiou.
   - Stránky načítavajte asynchrónne pomocou Fetch API alebo jQuery AJAX.
   - Načítaný HTML kód spracujte pomocou `DOMParser` a vyhľadávania v DOM strome (`querySelector`, `querySelectorAll`, prípadne jQuery selektory). Spracovanie iba pomocou regulárnych výrazov nad celým HTML dokumentom nie je prípustné. Načítaný cudzí HTML kód nikdy nevkladajte do vašej stránky priamo (napr. cez `innerHTML`), vkladajte iba vami vybrané a spracované údaje.
   - Z každej reštaurácie získajte pre jednotlivé dni v týždni minimálne: deň (a dátum, ak je dostupný), typ položky (polievka, hlavné jedlo, ...), názov jedla a cenu. Ak stránka uvádza aj alergény či hmotnosť, spracujte ich tiež.
   - Dáta zo všetkých reštaurácií preveďte do jednotnej štruktúry (pole JavaScriptových objektov), aby ich bolo možné zobrazovať rovnakým spôsobom bez ohľadu na zdroj.

4. **Ukladanie dát a ohľaduplnosť voči zdrojom.**

   - Spracované dáta ukladajte v prehliadači pomocou `localStorage`. Stránky reštaurácií sa **nesmú** načítavať pri každom otvorení vašej stránky, ak sú uložené dáta z aktuálneho dňa.
   - Stránka bude obsahovať tlačidlo **„Aktualizovať menu“**, ktoré spustí nové načítanie a spracovanie dát, a tlačidlo na vymazanie uložených dát.
   - Na stránke zobrazte dátum a čas poslednej aktualizácie pre každú reštauráciu.
   - Počas načítavania zobrazte používateľovi indikátor načítania.

5. **Zobrazenie menu.**

   - Používateľ si bude môcť zvoliť deň v týždni (pondelok – piatok) pomocou záložiek, tlačidiel alebo podobného prvku, pričom prepínanie dní prebehne bez opätovného načítania stránky. Pri otvorení stránky bude predvolene zvolený aktuálny deň (cez víkend informácia, že menu nie je k dispozícii, prípadne pondelok).
   - Okrem zobrazenia jedného dňa umožnite aj zobrazenie celého týždňa naraz.
   - Umožnite filtrovanie podľa reštaurácie (zobraziť/skryť jednotlivé reštaurácie).
   - Menu každej reštaurácie zobrazte v samostatnom bloku (karta, tabuľka, ...) s názvom reštaurácie, klikateľným odkazom na jej pôvodnú stránku a prípadne adresou. Polievky, hlavné jedlá a ceny graficky odlíšte.

6. **Ošetrenie chýb.** Stránka musí zvládnuť situácie, keď je stránka reštaurácie nedostupná, zmení sa jej štruktúra alebo menu na daný deň chýba. V takom prípade sa stránka nesmie „rozbiť“, ale používateľovi zobrazí zrozumiteľnú informáciu (napr. „Menu na tento deň nie je k dispozícii“). Chyba pri jednej reštaurácii nesmie zabrániť zobrazeniu ostatných.

7. Stránka bude obsahovať aj podstránku (alebo samostatnú sekciu) **„O projekte“**, kde stručne popíšete, z ktorých stránok sa dáta načítavajú, akým spôsobom sa spracovávajú a aké knižnice ste použili. Navigácia medzi časťami stránky bude riešená pomocou nečíslovaného zoznamu a všetky odkazy musia byť funkčné.

8. Nezabudnite na názov celej stránky a na zmenu názvu jednotlivých podstránok. Pridajte aj ikonu stránky (favicon).

9. Zdrojový kód udržujte prehľadný. HTML, CSS a JavaScript umiestnite do samostatných súborov. Kód pre spracovanie jednotlivých reštaurácií navrhnite tak, aby bolo možné jednoducho pridať ďalšiu reštauráciu (napr. samostatná funkcia pre každú reštauráciu vracajúca dáta v jednotnej štruktúre).

10. Dajte si záležať na vzhľade. Nezabudnite na to, že vzhľad predáva. V tomto zadaní sa na vzhľad aj na použiteľnosť kladie veľký dôraz aj pri hodnotení.

11. **Dajte si pozor na to, že stránka, jej hlavné menu a jednotlivé časti môžu byť zobrazované na rôznych veľkostiach monitorov, t. j. stránka musí byť responzívna a nemala by byť optimalizovaná iba pre vami používané zobrazovacie zariadenie.** Stránky, ktoré nebudú spĺňať predpoklady responzívnosti, budú automaticky penalizované o 50 %.
