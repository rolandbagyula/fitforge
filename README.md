# FitForge

Egyszerű, statikus weboldal személyi edzés és online coaching szolgáltatáshoz. A projekt mobil-first felépítésű, WCAG 2.1 AA szintű hozzáférhetőségre törekszik, és tartalmaz SEO, közösségi megosztás, valamint teljesítmény-optimalizációs beállításokat.

## Fő funkciók
- Interaktív hero és CTA-k
- Szolgáltatások kártyákkal
- Előtte–utána összehasonlító csúszka
- Árazás (alkalmi ↔ havi) váltó
- BMI + napi kalória kalkulátor
- Időpontfoglaló űrlap kliens oldali validációval
- GYIK harmonika (ARIA támogatással)
- SEO meta, Open Graph, Twitter kártya, JSON-LD (LocalBusiness, FAQ)
- Reduced motion támogatás (prefers-reduced-motion)

## Technológiák
- HTML5, CSS (egyedi + Tailwind CDN utilok), JavaScript (vanilla)
- Nincs build folyamat: azonnal publikálható statikus oldal

## Projektstruktúra
```
fitforge/
├─ index.html
├─ css/
│  └─ style.css
└─ js/
   └─ script.js
```

## Helyi futtatás
Mivel statikus oldalról van szó, elég a `index.html` fájlt megnyitni böngészőben. Ha helyi szerveren szeretnéd futtatni (ajánlott a relatív útvonalak és gyorsítótárazás teszteléséhez), használhatod a beépített Python szervert:

```bash
# Python 3
python -m http.server 5500
# majd böngészőben: http://localhost:5500/
```

Windows alatt PowerShellben a fenti parancs ugyanígy működik, ha a Python telepítve van.

## SEO és teljesítmény
- `index.html` tartalmazza: `canonical`, `robots`, `theme-color`, `color-scheme`, OG/Twitter meta tagok.
- LCP javítás: hero kép `fetchpriority="high"`, `preload` és explicit `width/height`.
- CLS csökkentés: képeknél méretek és `aspect-ratio`.
- Reduced motion: CSS/JS figyelembe veszi a felhasználói beállítást.

## Deploy GitHubra
1) Hozz létre egy új, üres GitHub repót (pl. `fitforge`).
2) Helyben inicializáld a Gitet és töltsd fel:

```bash
git init
git add .
git commit -m "chore: initial commit (FitForge)"
# Az URL-t cseréld a sajátodra
git remote add origin https://github.com/<felhasznalonev>/fitforge.git
git branch -M main
git push -u origin main
```

## GitHub Pages publikálás
- A repo beállításainál (Settings → Pages) válaszd a forrást: `Deploy from a branch` → Branch: `main` és `/ (root)` mappa.
- Mentés után 1-2 perc múlva elérhető lesz: `https://<felhasznalonev>.github.io/fitforge/`

Megjegyzés: Ha saját domainre (pl. `fitforge.hu`) akarod tenni, állíts be CNAME-et a GitHub Pages-hez.

## Licenc
A projekt licencét a felhasználástól függően add hozzá (MIT, Apache-2.0, stb.). Ha szeretnéd, készítek `LICENSE` fájlt is.
