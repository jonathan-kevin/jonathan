# Flottsbro bokningsdemo

Körbar, lokal prototyp för de tre demonstrationsfallen i underlaget. Byggd med React, Vite och ett gränssnitt inspirerat av shadcn/ui.

## Starta

```bash
npm install
npm run dev
```

Öppna adressen som Vite visar (normalt `http://localhost:5173`). `npm run build` skapar produktionsfiler i `dist/`.

## Prova flödena

Välj **Vinter** eller **Sommar** under toppmenyn. Vinter visar skidpass och gruppbesök; sommar visar cykling och boende. Varukorgen uppe till höger sparar pågående bokningar i webbläsaren. Där kan du återuppta eller ta bort dem; varje bokning slutförs i sitt eget flöde.

Period väljs i en gemensam kalender: klicka på startdatum och därefter slutdatum. Klicka på **Från och med/Till och med** eller **Ankomst/Avresa** för att ändra bara den delen av perioden. Datum före dagens datum går inte att välja. Antal dagar eller nätter och pris uppdateras direkt.

Fiktiva tillvalsaktiviteter i prototypen: snöskovandring (149 kr/person), pulkäventyr (89 kr/person), kanottur (189 kr/person) och äventyrsbana (249 kr/person). För dags- och gruppbokning gäller priset per person och dag i vald period; i boendebokning gäller det en gång under vistelsen. Tillvalen sparas med bokningen och syns i prisöversikten och gruppens fakturaunderlag.

1. **Aktiviteter:** välj Aktiviteter → Skidpass, lägg till vuxna och barn samt ange barnens åldrar. Välj period från och med/till och med, pass, eventuell utrustning, boende och mat. Öppna Mina bokningar för att prova ombokning eller avbokning.
2. **Boende & aktivitet:** välj ankomst och avresa samt gäster (högst fyra i stugan), välj boende för sommaren 2027, lägg till cykling, cyklar och mat, slutför och prova sedan att förlänga resan.
3. **Gruppbokning:** ange organisation, period, preliminärt antal samt behov av boende och mat i steg ett. Skapa den preliminära bokningen och komplettera deltagarna i steg två. Lärare är gratis och behöver inget födelsedatum. Markera checkboxen för elever som lånar skidutrustning. Flottsbro hyr inte ut snowboard till skolans friluftsdagar. Knappen **Slutför & skapa fakturaunderlag** öppnar steg tre med pris och saknade uppgifter. När alla deltagare är kompletta kan underlaget skapas, skrivas ut och laddas ned som CSV. CSV-import stöder `namn,roll,födelsedatum,aktivitet,lånar utrustning,skostorlek,längd,vikt`.
4. **Administration:** öppna För personal från den publika toppmenyn. Sök och granska bokningar, se kapacitet, ändringshistorik och exportera CSV.

Knappen **Rensa sparad data** sitter diskret i sidans nedre hörn och tar bort appens sparade bokningar och varukorg från webbläsaren.

## Prisantaganden

Publicerade priser från [Flottsbros SkiPass](https://www.flottsbro.se/gora/skidakning/skipass/), [friluftsdag](https://www.flottsbro.se/friluftsdag/) och [stugor](https://www.flottsbro.se/stugor/) används där de finns. Vanliga SkiPass: heldag 370 kr vuxen, 320 kr barn 8–15 år och 170 kr knatte; tre timmar 240/190/100 kr. Skolgrupper med minst 20 elever: 200 kr per elev och dag för SkiPass samt 200 kr per elev och dag för lånad utrustning. Lärare är gratis för SkiPass och utrustning. Stuga B visas från 895 kr/natt och stuga C från 725 kr/natt. Periodpriset är en förenklad uppskattning; verkliga flerdagarsrabatter, tillgänglighet och slutligt stugpris bekräftas separat. [Värdshuset](https://www.flottsbro.se/ata/) publicerar ingen fast måltidsprislista. Prototypen använder därför påhittade men konsekventa matpriser: 159 kr per vuxen och 99 kr per barn för lunch eller middag, och 115 kr per person för grupplunch. Mat räknas in i summa och fakturaunderlag.

Ändringar sparas i webbläsarens `localStorage`. Betalning, fakturering, inloggning och tillgänglighet är simulerade; ingen extern tjänst anropas och inga riktiga transaktioner görs. Gästsidorna har en publik butiksvy medan administrationen har en separat arbetsyta.
