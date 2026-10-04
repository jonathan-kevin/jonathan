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

Fiktiva tillvalsaktiviteter finns för både vinter och sommar. Gäster väljer dag, tillgänglig tid och deltagare för varje aktivitet och lektion. Tillvalen sparas med bokningen och syns i prisöversikten och administrationen.

1. **Daggäst:** välj SkiPass eller en aktivitet. Ange period och sällskap, fortsätt som gäst eller använd den simulerade inloggningen, fyll i deltagare och välj skidor eller snowboard för dem som lånar. Lägg till boende, aktiviteter eller skidskola. Granska, godkänn exempelvillkor, genomför en simulerad betalning och se bekräftelsen.
2. **Återkommande gäst:** logga in med exempelkonto, öppna **Mina bokningar** och välj **Boka igen**. Ändra eller avboka en befintlig bokning och granska det uppdaterade priset och historiken.
3. **Boende & aktivitet:** byt till **Sommar** medan vinter är vald som utgångsläge. Växla till engelska, välj tre nätter och stuga, lägg till cykelpass, utrustning och aktiviteter i samma bokning. Öppna därefter bokningen och förläng vistelsen eller lägg till en aktivitet.
4. **Gruppbokning:** ange organisation, period och preliminärt deltagarantal. Spara preliminärt och komplettera senare genom att skriva in eller importera deltagare. Markera lärare, som är gratis, och ange varje elevs aktivitet, utrustningstyp, skostorlek, längd och vikt vid lån. Filtrera saknade uppgifter, slutför och skapa ett simulerat fakturaunderlag.
5. **Administration:** öppna **För personal**. Sök och granska bokningar, se betalstatus, kapacitet, ändringshistorik och utrustningsuppgifter per person. Exportera bokningslista och arbetsunderlag som CSV.

Knappen **Rensa sparad data** sitter diskret i sidans nedre hörn och tar bort appens sparade bokningar och varukorg från webbläsaren.

## Prisantaganden

Priser och tillgänglighet i prototypen är exempelvärden. Boenden och flera aktiviteter är fiktiva. Prisberäkningen visar hur kombinationer av period, deltagare och tillval påverkar totalsumman; Flottsbro behöver fastställa riktiga priser, rabatter och kapaciteter före en verklig lansering. Mat ingår inte i bokningsflödet.

Ändringar sparas i webbläsarens `localStorage`. Betalning, fakturering, inloggning och tillgänglighet är simulerade; ingen extern tjänst anropas och inga riktiga transaktioner görs. Gästsidorna har en publik butiksvy medan administrationen har en separat arbetsyta.
