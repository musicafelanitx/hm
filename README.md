# Història de la música · Conservatori de Felanitx

Web estàtica (HTML, CSS i JavaScript, sense frameworks) per a l'alumnat de 4t, 5è i 6è d'EP.

## On és cada cosa

| Vull canviar…                         | Fitxer                     |
|---------------------------------------|----------------------------|
| Sessions, apunts i diapositives       | `dades/sessions.json`      |
| Les obres de la setmana               | `dades/obra-setmana.json`  |
| Els recursos (Spotify, vídeos…)       | `dades/recursos.json`      |
| Els textos de la línia del temps      | `dades/periodes.json`      |
| Colors i tipografia                   | `css/estils.css`           |

## Afegir l'enllaç d'una sessió

A `dades/sessions.json`, cerca la sessió i enganxa l'enllaç de la presentació entre les cometes d'`"enllac"`:

```json
{ "numero": 12, "data": "2027-01-13", "titol": "Títol de la sessió", "subtitol": "Frase curta de sota", "periode": "renaixement", "enllac": "https://docs.google.com/presentation/d/…/view" }
```

- Cada trimestre té el seu `"diapositives"` (la carpeta de Drive del trimestre), que surt com a botó al costat del títol.
- A la web surt el número gran (12), el títol al costat i, a sota, el `subtitol`.
- `titol` és opcional: si el deixes buit (`""`), es mostra el nom del període.
- Cada trimestre té un `"tema"` (per exemple, «El Romanticisme»), que surt al costat del títol del trimestre.
- Les sessions del 2n i el 3r trimestre ja hi són, amb la data, però sense títol ni enllaç: surten com a «Pròximament». Quan tenguis la presentació, omple `titol`, `subtitol` i `enllac`.
- `data` és el dimecres de la sessió (any-mes-dia). Les sessions d'abans d'avui surten en gris amb un ✓, i la següent surt destacada com a «Pròxima classe» (o «Avui»). Si un dimecres no hi ha classe, canvia les dates de les sessions que venen darrere.
- Les línies amb `"activitat": true` són dies especials sense presentació (exposicions, presentacions de treballs): surten amb una estrella i sense número.
- Per afegir una sessió nova, copia una línia, canvia el número i posa una coma entre línies.
- Valors de `periode`: `introduccio`, `antiguitat`, `edat-mitjana`, `renaixement`, `barroc`, `classicisme`, `romanticisme`, `xx-xxi`.

Compte amb les comes: l'última sessió d'una llista **no** du coma al final. Si després d'un canvi la pàgina diu «No s'han pogut carregar les dades», segurament hi falta o hi sobra una coma (pots comprovar el fitxer a https://jsonlint.com).

## Obra de la setmana

A `dades/obra-setmana.json` hi ha una llista d'obres. Cada dilluns surt la següent, comptant des de la data d'`"inici"`; quan s'acaba la llista, torna a començar.

- Per afegir-ne una, copia un bloc i canvia'n les dades. A `"youtube"` hi va només el codi del vídeo: de `https://www.youtube.com/watch?v=YIbYCOiETx0`, posa `YIbYCOiETx0`.
- Per fixar una obra concreta (per exemple, la que treballau a classe), posa la seva posició a `"fixa"` (la primera és 1). Torna-ho a `0` perquè torni a anar sola.
- Per canviar l'ordre, canvia l'ordre dels blocs a la llista.

## Provar-la a l'ordinador

Les dades es carreguen amb JavaScript, per això no funciona fent doble clic a `index.html`. Obre un terminal dins la carpeta i executa:

```
python3 -m http.server 8765
```

i ves a http://localhost:8765.

## Quan pugis canvis de disseny

Si canvies `css/estils.css` o `js/app.js`, augmenta el número de versió (`?v=2` → `?v=3`) a tots els fitxers `.html`. Així els navegadors dels alumnes carregaran la versió nova i no una còpia antiga. Si només canvies fitxers de `dades/`, no cal.

## App al mòbil

La web es pot instal·lar al mòbil com una app (PWA). A la portada, al mòbil, surt el botó «Instal·la l'app al mòbil»: a Android obre l'avís d'instal·lació i a l'iPhone mostra els passos (Compartir → Afegeix a la pantalla d'inici).

- `manifest.webmanifest`: nom, colors i icones de l'app.
- `sw.js`: guarda una còpia de les pàgines per si no hi ha connexió. Sempre prova primer la xarxa, així els canvis es veuen de seguida.
- `icones/`: icones fetes amb el logo del conservatori. Per canviar-les, substitueix els PNG mantenint el nom i la mida.
