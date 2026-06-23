# Designguide för Softadmin®

*Senast uppdaterad Juni 2026*

En praktisk guide för att bygga välstrukturerade och användbara lösningar.

*Av Jonathan Kevin, baserad på tidigare material av Oskar Franke och Erik Öberg.*

---

## Del 1. UX-principer

Grundläggande principer som gäller oavsett vilket verktyg du bygger i.

### UX i Softadmin®

I ett Softadmin® skapas användarupplevelsen främst genom hur väl systemet stödjer användarens arbete. Även om visuell design spelar roll är det oftast struktur, informationspresentation och arbetsflöden som har störst påverkan på användbarheten.

För att leverera lösningar med stor kundnytta räcker det inte att uppfylla de funktionella kraven. Vi behöver också presentera rätt information på rätt plats, välja lämpliga komponenter och utforma arbetsflöden som stödjer verksamhetens processer.

Målet är att användaren ska kunna utföra sina arbetsuppgifter effektivt, förstå vad som förväntas i varje steg och känna sig trygg i systemet.

Efter leverans vill vi att kunden ska känna att svaret är ja på båda frågorna:

- **Kan jag använda systemet?** Systemet stödjer verksamheten funktionellt.
- **Vill jag använda systemet?** Systemet har hög användbarhet.

### De fem perspektiven

Genom hela arbetet bör du ha dessa fem perspektiv i åtanke.

#### 1. Förstå användarens arbete

Användaren är inte i systemet för att använda ett system, utan för att utföra en uppgift. Fundera på:

- Vem är användaren?
- Vad försöker användaren göra?
- Vilken information behövs för att lyckas?
- Vad tar onödigt mycket tid idag?
- Var uppstår osäkerhet eller misstag?

#### 2. Gör det enkelt att göra rätt

Systemet ska hjälpa användaren att göra rätt från början, inte rätta fel i efterhand. Fundera på:

- Kan vi minska antal steg?
- Kan vi förifylla information?
- Kan fel förhindras i stället för att hanteras efteråt?
- Är nästa steg alltid tydligt?

#### 3. Strukturera informationen

I Softadmin® styr du främst inte designen med färg och form, men du styr hur information presenteras och grupperas. Fundera på:

- Vad ska användaren se först?
- Vad hör ihop och bör visas tillsammans?
- Hur hittar användaren rätt information snabbt?
- Är grid:ar, NewEdits och vyer logiskt uppbyggda?

#### 4. Kommunicera tydligt

Texter och etiketter är en central del av UX i verksamhetssystem. Fundera på:

- Förstår användaren vad som ska fyllas i?
- Är rubriker och fältbeskrivningar tydliga?
- Är felmeddelanden begripliga och konkreta?
- Undviker vi interna begrepp?

#### 5. Förbättra med fakta

Bra lösningar bygger på hur systemet faktiskt används. Fundera på:

- Var gör användare fel?
- Var fastnar de i processen?
- Vilka funktioner används inte?
- Vad säger support och verksamheten?

### UX-"lagar" och vad de betyder i praktiken

[Laws of UX](https://lawsofux.com/) är en samling välbelagda UX-principer som beskriver hur människor uppfattar och interagerar med gränssnitt. Nedan finns de "lagar" som är mest relevanta för Softadmin®-system med en direkt koppling till vad de betyder när du bygger.

#### [Millers lag](https://lawsofux.com/millers-law/)

> *Den genomsnittliga personen kan bara hålla 7 ± 2 informationsenheter i arbetsminnet samtidigt.*

Strukturera NewEdit, parametersidor och menyvalsgrupper i mindre, logiska sektioner med tydliga rubriker. Om användaren möts av en lång lista med fält eller val blir det svårare att skanna innehållet och hitta rätt. Sikta på högst cirka sju fält eller val per sektion.

#### [Kognitiv belastning](https://lawsofux.com/cognitive-load/)

> *Ju mer mental kapacitet som krävs för att förstå och använda ett gränssnitt, desto sämre blir upplevelsen.*

Minska onödig kognitiv belastning genom att dölja irrelevanta fält, använda förvalda värden, tydlig gruppering och självförklarande flöden. Särskilt viktigt för sällananvändare och nyanställda.

#### [Hicks lag](https://lawsofux.com/hicks-law/)

> *Tiden det tar att fatta ett beslut ökar med antalet och komplexiteten av valen.*

Begränsa antalet synliga radknappar till max två. Håll parametersidor fokuserade. Undvik att visa fält som inte är relevanta för användarens nuvarande uppgift eftersom varje extra alternativ kostar beslutskraft.

#### [Jakobs lag](https://lawsofux.com/jakobs-law/)

> *Användare tillbringar mest tid i andra system. De förväntar sig att ditt system ska fungera på samma sätt som de system de redan känner till.*

Använd Softadmin®s standardmönster för ikoner, namngivning och navigation. Avvik inte utan starka skäl — det skapar en inlärningskurva som saknar motsvarighet i värdet av avvikelsen.

#### [Fitts lag](https://lawsofux.com/fittss-law/)

> *Tiden att nå ett mål beror på avståndet till det och dess storlek.*

Placera de viktigaste knapparna nära det innehåll de gäller. Den mest frekventa radknappen ska vara lättast att klicka på.

#### [Von Restorff-effekten](https://lawsofux.com/von-restorff-effect/)

> *När flera liknande objekt visas är det det som avviker som uppmärksammas och minns.*

Undantaget bekräftar regeln — markera bara det som avviker från normen. Om allt är godkänt, markera bara det som är underkänt. Använd visuell avvikelse sparsamt, annars förlorar den sin effekt.

#### [Peak-End-regeln](https://lawsofux.com/peak-end-rule/)

> *Människor bedömer en upplevelse utifrån hur det kändes vid höjdpunkten och vid slutet, inte som ett genomsnitt av hela upplevelsen.*

De mest kritiska ögonblicken i ett arbetsflöde är när något går fel (höjdpunkt) och när uppgiften är klar (slutet). Ett tydligt, hjälpsamt felmeddelande och en tydlig bekräftelse på att en åtgärd lyckades väger tungt i hur användaren upplever systemet som helhet.

#### [Närhetsprincipen](https://lawsofux.com/law-of-proximity/)

> *Objekt som är nära varandra uppfattas som hörande ihop.*

Gruppera relaterade fält visuellt nära varandra i NewEdit och vyer. En rubrik som hänger ihop med sina fält, med tydligt avstånd till nästa grupp, kommunicerar struktur utan att ett enda ord behöver sägas.

#### [Teslers lag](https://lawsofux.com/teslers-law/)

> *För varje system finns en viss mängd komplexitet som inte kan elimineras utan bara förflyttas.*

Komplexitet försvinner inte när du döljer fält eller förenklar en NewEdit. Den förflyttas antingen till ett annat steg, till ett annat menyval, eller till användaren själv. Var medveten om var du placerar komplexiteten och se till att den hamnar hos den som har bäst förutsättningar att hantera den.

#### [Paradoxen med den aktive användaren](https://lawsofux.com/paradox-of-the-active-user/)

> *Användare läser aldrig manualer utan de börjar använda systemet direkt.*

Bygg system som är självförklarande. Labels, hjälptexter och logisk struktur är din dokumentation. Hjälpsidor är ett komplement, inte en ersättning för ett välbyggt gränssnitt.

### Navigation: Djup eller platt struktur

I verksamhetssystem kan navigationen i praktiken bara optimeras i två riktningar:

- **Platt struktur:** fler menyer/sektioner, färre klick till funktion
- **Djup struktur:** färre menyalternativ, fler steg in till funktion

Att försöka kombinera båda leder ofta till ett rörigt system.

#### Platt struktur

Fler val direkt i menyn. Bra när användaren ofta hoppar mellan funktioner. Nackdelen är att menyn kan växa snabbt och bli oöverskådlig i komplexa system. Typiskt för system där användaren jobbar brett och rör sig mellan många olika objekt.

#### Djup struktur

Färre val i menyn, mer stegvis navigation. Ger enklare och renare navigation men kräver att användaren alltid vet var hen befinner sig. Vanligt i system med mycket data per område, t.ex. ärenden, kunder och orderflöden.

#### Antal klick är inte problemet

Det är en gammal UX-regel att allt ska vara max 3 klick bort. Det stämmer inte i verksamhetssystem. Problemet är inte antal klick — problemet är att användaren inte förstår var de är, att strukturen inte matchar deras arbetsflöde, eller att navigationen inte speglar hur arbetet faktiskt är organiserat. Om navigationen är tydlig spelar antalet steg mindre roll.

#### Direktlänkar mellan relaterade objekt

Användaren ska inte behöva gå till huvudmenyn för att t.ex. ta sig från en specifik faktura till fakturamottagaren. Bygg direktlänkar mellan relaterade objekt — det är en av de enklaste och mest uppskattade sakerna du kan göra för användbarheten.

### Informationsstruktur

#### Dela upp information i mindre bitar

Enligt Millers lag kan vi bara hålla ungefär 7 ± 2 informationsenheter i arbetsminnet samtidigt. När för mycket information visas på en gång blir det svårare att förstå, jämföra och komma ihåg. Hur det kan göras i praktiken:

- Dela upp NewEdit i sektioner med tydliga rubriker
- Gruppera relaterade fält tillsammans
- Använd stegvisa flöden i stället för långa sidor
- Visa sammanfattningar i stället för rå data i stora block

> ⚡ Om användaren måste leta efter den viktiga informationen behöver innehållet organiseras bättre.

#### Extended description

Extended description kan vara lockande för att städa upp gränssnittet, men riskerar att dölja viktig information bakom ett extra steg. För sällananvändaren blir det snabbt en fallgrop eftersom de lätt kan missa sammanhanget.

**Använd extended description när:**

- ✅ Informationen är ett tillägg snarare än kritisk kontext
- ✅ Det gäller ett menyval som dagliga användare arbetar med regelbundet

**Undvik extended description när:**

- ❌ Informationen är kritisk för att fatta rätt beslut
- ❌ Det gäller sällananvändare som kanske inte ens ser att det finns mer att läsa

> ⚡ Om information är nödvändig för att fatta rätt beslut ska den inte döljas.

### Kommunicera tydligt

#### Labels

Label är det viktigaste textfältet i ett formulär. Den ska alltid förklara vad användaren ska fylla i, inte hur eller varför. En bra label är kort, konkret och entydig.

**Bra exempel:**
- ✅ Förnamn
- ✅ E-postadress
- ✅ Ordernummer

**Dåliga exempel:**
- ❌ Ange ditt förnamn här *(det är en instruktion, inte en label)*
- ❌ Information om kund *(alldeles för otydligt)*

> ⚡ Om en label behöver en förklaring för att förstås är den dålig. Lös det med bättre label, inte mer text.

#### Hjälptexter

Hjälptext används för att förtydliga krav eller konsekvenser och inte för att förklara det som redan borde vara tydligt i labeln. En bra hjälptext är en mening som svarar på en konkret fråga: Vilket format gäller? Varför behövs det här? Vad används datan till?

**Bra exempel:**
- ✅ Ange i formatet ÅÅÅÅ-MM-DD, t.ex. 2029-09-02
- ✅ Används för att skicka orderbekräftelse.

**Dåliga exempel:**
- ❌ Här skriver du ditt förnamn
- ❌ Upprepning av labeln

> ⚡ Om hjälptexten inte tillför ny information ska du ta bort den.

#### Placeholders

Placeholder är inte en ersättning för en label eller annan beständig vägledning. Eftersom placeholdertext försvinner när användaren börjar skriva ska viktig information, som obligatoriska format eller instruktioner, finnas kvar utanför fältet som hjälptext. Placeholder kan användas för att visa ett exempel, t.ex. `070-123 45 67` eller `YYYY-MM-DD`, men ska inte vara den enda plats där formatkravet kommuniceras.

> ⚡ Om användaren måste komma ihåg något från placeholdern är det fel lösning.

#### Knappar

Knappar ska alltid säga exakt vad som händer när användaren klickar. Undvik generiska knappar som *OK* och *Skicka* — de säger för lite om vad som faktiskt sker. Använd alltid **verb + objekt**.

**Bra exempel:**
- ✅ Spara projekt
- ✅ Acceptera ansökan
- ✅ Skapa kund
- ✅ Avvisa beställning

**Dåliga exempel:**
- ❌ OK
- ❌ Skicka

> ⚡ Om en knapptext kan användas i vilket system som helst är den för vag.

#### Konsekvent namngivning

När samma sak kallas olika i olika delar av systemet skapas onödig förvirring. Om ett menyval heter *Uppdrag* ska samma term användas genom hela systemet: i knappar, länkar, flikar och rubriker.

| Element | Exempel |
|---------|---------|
| Meny | Uppdrag |
| Flik | Uppdrag |
| Knapp | Skapa uppdrag |
| Länk | Uppdrag |

> ⚡ Olika ord för samma sak skapar osäkerhet. Samma ord överallt skapar flyt.

### Feedback till användaren

#### Felmeddelanden

Ett bra felmeddelande gör mer än att säga att något gått fel. Det hjälper användaren att förstå situationen och komma vidare direkt. Ett effektivt felmeddelande innehåller tre delar:

1. **Att något har gått fel** — var tydlig med att åtgärden inte lyckades
2. **Varför det hände** — förklara orsaken utan tekniska detaljer som inte hjälper
3. **Nästa steg** — berätta vad användaren kan göra för att lösa problemet

**Bra exempel:**
- ✅ Kunden kan inte tas bort eftersom den har aktiva uppdrag. Avsluta eller flytta uppdragen först.
- ✅ Bokningen kan inte genomföras eftersom tiden redan är upptagen. Välj en annan tid och försök igen.

**Dåliga exempel:**
- ❌ Error 500
- ❌ Något gick fel
- ❌ Fel vid sparning

> ⚡ Ett bra felmeddelande hjälper användaren vidare.

#### Varningar

Varningar handlar inte om att stoppa användaren, utan om att göra dem uppmärksamma på något som kan vara ovanligt eller värt att dubbelkolla. En bra varning berättar vad som är avvikande, vad det kan innebära i praktiken, och hur användaren kan bedöma om det är okej att fortsätta.

**Bra exempel:**
- ✅ Det finns redan en kund med samma namn. Kontrollera om det är en dubblett innan du fortsätter.
- ✅ Det angivna värdet är ovanligt högt jämfört med tidigare poster. Dubbelkolla att det stämmer.

**Dåliga exempel:**
- ❌ Varning!
- ❌ Är du säker?
- ❌ Detta kan orsaka problem

> ⚡ En varning ska kännas som en kunnig kollega som säger "Det här ser lite ovanligt ut, kolla en gång till."

#### Alerts

Alerts är bra verktyg, men bara när de tillför något. Användaren slutar läsa alerts som dyker upp för ofta och klickar igenom dem reflexmässigt — då tappar de sin varningseffekt när de verkligen behövs.

**Fråga bara när:**
- Konsekvensen är svår eller omöjlig att återställa
- Risken för misstag är reell, t.ex. om åtgärden ser ut som en annan
- Åtgärden påverkar data utanför den nuvarande vyn

**Fråga inte när:**
- Åtgärden är enkel att ångra
- Det är ett rutinsteg i ett dagligt arbetsflöde

> ⚡ Om användaren behöver läsa mycket för att förstå vad som ska göras är det inte en alert, utan en informationssida.

### Visuell design

#### Använd inte eget tema

Softadmin® har ett etablerat färgsystem designat för att fungera konsekvent över hela gränssnittet. Att införa egna färger eller teman bryter den helheten och leder till inkonsekvent design. Konsekvenser:

- Förlorad visuell enhetlighet i systemet
- Ökad risk för låg kontrast och WCAG-problem
- Svårare att underhålla och vidareutveckla
- Otydligare visuella signaler för status, fel och varningar

#### Använd inte färg som enda signal

Färg tolkas inte konsekvent av alla användare. Färgblindhet och varierande skärmar påverkar hur nyanser upplevs. Använd färg som förstärkning av en redan tydlig signal — men aldrig som enda signal.

**Bra exempel:**
- ✅ Grön ikon + text *Godkänd*
- ✅ Röd status + text *Fel i inmatning*

**Dåliga exempel:**
- ❌ Enbart grön färg = godkänd, utan text eller ikon
- ❌ Färgskillnad mellan statusar utan text

> ⚡ En design är bristfällig om den förutsätter att användaren måste se färgen på ett visst sätt för att förstå den.

---

## Del 2. Softadmin®-specifika regler

Hur du tillämpar principerna konkret i Softadmin®.

### Namngivning

#### Menyvalsgrupper och menyval

Namnge alltid menyer och menyval utifrån hur verksamheten pratar om sina egna processer, inte utifrån hur du som konsult strukturerat databasen.

| ✅ Verksamhetsbegrepp | ❌ Databasnamn |
|----------------------|---------------|
| Kunder | Kundregister |
| Beställningar | OrderHeader |

**Regler för menyvalsgrupper:**

- Menyvalsgrupper som samlar menyval inom en systemdel namnges som objektet i plural: *Ärenden*, *Ansökningar*, *Inbetalningar*.
- Menyvalsgrupper med ett standardmenyval namnges med samma namn som menyvalet.

**Regler för menyval:**

- Grid med fler än 50 rader: namnges *Sök \<objekt\>* i plural och har alltid parametersida.
- Statiska uppslagstabeller med få rader: namnges direkt som objektet i plural, t.ex. *Artikeltyper*, och behöver inte parametersida.
- Namngivning ska vara enhetlig i hela systemet — använd inte synonymer för samma handling.

> ⚡ Om ett menyvalsnamn kräver en förklaring till användaren borde du byta ut det.

#### Länkar

Länkar ska i regel ha samma namn som menyvalet de länkar till. Undantagen är:

- **Arvsstrukturer:** om ett menyval används för olika typer av samma entitet ska länken tydliggöra typen. T.ex. *Visa person* och *Visa företag* i stället för bara *Visa kontakt*.
- **Statusväxling:** två länkar som leder till samma menyval kan namnges *Aktivera \<objekt\>* och *Inaktivera \<objekt\>*.
- **Kedjehandelser:** om en länk triggar två handlingar ska båda framgå av länknamnet.

#### Ikoner

För menyval av de vanligaste typerna (Sök, Ny, Ändra, Ta bort) ska standardikoner användas. Regler:

- Samma ikon ska inte användas för två olika radlänkar från samma menyval.
- Om ett menyval kan nås från flera ställen ska samma ikon användas för alla länkar till det menyvalet.
- Använd inte Ta bort-standardikonen för snarlika handlingar som *Inaktivera* eller *Makulera*.
- Ikonvalen ska vara enhetliga i hela systemet.

#### Kryssrutor

Kryssrutor ska beskriva ett tillstånd som gäller när rutan är markerad. Undvik namn som bygger på negationer.

| ✅ Bra | ❌ Dåligt |
|--------|----------|
| Aktiv | Inaktiv |
| Avslutad | Ej avslutad |
| Publicerad | Opublicerad |

### Svarstider och användarupplevelse

Hur snabbt ett system svarar påverkar användarupplevelsen minst lika mycket som gränssnittets utformning.

#### Svarstider påverkar användarupplevelsen

| Tid | Upplevelse |
|-----|------------|
| ≤ 0,1 s | Upplevs som omedelbar respons. |
| ≤ 1 s | Känns snabbt och stör inte arbetsflödet. |
| > 1 s | Visa att systemet arbetar. |
| > 10 s | Visa förlopp och ge möjlighet att avbryta. |

##### Direkt respons (≤ 0,1 s):
Åtgärder som markerar ett val eller ger omedelbar visuell återkoppling. Upplevs som att användaren manipulerar gränssnittet direkt.

##### Snabb respons (≤ 1 s):
De flesta vanliga åtgärder — sökningar, sorteringar och navigering. Arbetsflödet känns naturligt och flödar utan avbrott.

##### Längre operationer (> 10 s):
Användaren behöver kontinuerlig återkoppling. Visa en progressbar och ge möjlighet att avbryta processen.

#### Testa med realistiska datamängder

Testa alltid systemets svarstider efter att data migrerats. Ett menyval som är snabbt med 100 testposter kan vara oacceptabelt långsamt med 50 000 produktionsposter. Sökningar och menyval med hög användningsfrekvens ska aldrig upplevas långsamma.

#### Gör tunga processer asynkrona

Om en hantering tar lång tid bör du överväga att göra den asynkron så att användaren inte behöver vänta. I nyare versioner av Softadmin® kan du informera användaren om hur långt processen kommit via en progressbar.

> ⚡ Om ett menyval är snabbt under utveckling men långsamt i produktion beror det oftast på att det saknas indexering eller parameterbegränsning.

### NewEdit

#### Användningsfrekvens avgör var "Nytt \<objekt\>" finns

Menyval av typen *Nytt \<objekt\>* ska alltid finnas tillgängligt direkt i menyvalsgruppen om systemanvändaren förväntas skapa nya objekt dagligen, t.ex. ordrar eller ärenden.

Undantaget är administrativa register där man först vill kontrollera om posten redan finns. I de fallen ska Ny-menyvalet bara finnas tillgängligt via topplänk från söksidan.

#### Fältordning och gruppering

De mest centrala fälten (de som alltid måste fyllas i) ska komma först. Fält av mer perifer karaktär placeras längre ned. Grundantagandet är att användaren fyller i en NewEdit uppifrån och ned.

Dela upp långa NewEdit:ar i tydliga, logiska grupper med rubriker. Samla relaterade fält, håll varje grupp fokuserad på ett delområde, och följ en naturlig arbetsordning snarare än intern datastruktur.

**Bra exempel på grupper:**
- ✅ Kundinformation
- ✅ Kontaktuppgifter
- ✅ Leveransinformation
- ✅ Betalningsinställningar

> ⚡ Om användaren måste hoppa runt i en NewEdit för att förstå det behöver du dela upp det i grupper.

#### Överväg separat NewEdit för objekt av olika typ

Om systemet lagrar objekt som kan vara av olika typ, t.ex. både privatpersoner och företag, kan det vara lämpligt att skapa två separata NewEdit-menyval, ett per typ. Det håller nere antalet fält per NewEdit och gör det enklare att styra behörigheter per användargrupp.

#### Fältberoenden

När ett fält påverkar ett annat ska riktningen vara konsekvent: det som väljs högre upp styr det som visas längre ned. Fältberoenden ska aldrig gå baklänges.

I Softadmin® görs detta med *default value dependencies*, inte med Onchange. Exekveringsordningen för Onchange är inte definierad och kan skapa timing-problem. Kombineras Onchange med cirkulära beroenden riskerar det att överbelasta servern.

**Undvik:**
- Fält som ändrar värden ovanför sig själva
- Cirkulära beroenden mellan fält
- Bakåtstyrning där senare val påverkar tidigare struktur

> ⚡ Informationsflödet ska kännas som att man fyller i något, inte som att systemet ändrar vad man redan sett.

#### Dölj fält baserat på kontext

Visa bara fält som är relevanta för den nuvarande uppgiften. Att tvinga användaren att ta in irrelevant information ökar den kognitiva belastningen i onödan.

**Exempel:**
- Visa *Företagsnamn* först när Typ = Företag är valt
- Visa betalningsfält först när *Faktura* är valt
- Dölj avancerade inställningar tills de faktiskt behövs

> ⚡ Om ett fält inte hjälper användaren att lösa sin nuvarande uppgift behöver det inte visas än.

#### Val av inmatningskontroll

Rätt kontrolltyp gör NewEdit enklare att fylla i och minskar risken för felinmatning.

**Välja ett alternativ:**

| Situation | Kontroll |
|-----------|----------|
| 2–5 alternativ, jämförelse viktigt | Radio Buttons eller Radio Cards |
| Upp till ~20 alternativ | Dropdown |
| Ja/Nej/Ej angivet | Boolean Dropdown |
| Många alternativ | Textbox with Autosearch |

**Välja flera alternativ:**

| Situation | Kontroll |
|-----------|----------|
| Få alternativ (upp till ~10) | Checkbox Cards |
| Hierarkisk data | Checkbox Tree |
| Många alternativ | Multi-autosearch |

**Fritext:** Använd Textbox för korta svar på en rad. Använd Textarea när användaren förväntas skriva mer än en mening. Använd HTML Editor bara när formatering faktiskt behövs — det är en tung kontroll som sällan är nödvändig.

**Datum:** Använd Date Range istället för två separata Date-kontroller när användaren ska ange ett intervall — det är tydligare och minskar risken för att from-datum sätts efter to-datum.

> ⚡ Om du väljer kontroll utifrån vad som är enklast att konfigurera, snarare än vad som är enklast att använda, är det fel utgångspunkt.

#### Förvalda värden

Förvalda värden effektiviserar inmatning och minskar fel. Ange förvalda värden i så stor utsträckning som möjligt — men bara när det finns ett uppenbart lämpligt värde.

**Vanliga fall:**
- Datumfält vid inmatning: oftast dagens datum
- Datumfält på parametersidor: oftast dagens datum minus tre månader
- Antal-fält: ofta förvalt värde 1
- Dropdowns där systemanvändare anges ska nästan alltid ha inloggad användare som förvalt värde

> ⚡ För obligatoriska fält där användaren kan förväntas välja olika värden vid nästan varje tillfälle bör förvalda värdet vara *(inget värde)*. Det förhindrar att användaren oavsiktligt sparar fel värde.

#### Förvalda värden från sökparametrar

När användaren gått via en sökning till ett *Nytt \<objekt\>*-menyval ska de angivna sökparametervärdena följa med som förvalda värden. Söker man på ärenden med Ärendetyp = Juridiskt ärende ska detta vara förifyllt när användaren väljer Nytt ärende.

> ⚡ Varje fält användaren slipper fylla i manuellt är ett fält där det inte kan bli fel.

#### Validering

Inmatad data ska alltid valideras i så stor utsträckning som möjligt. Softadmin® stödjer tre typer:

| Typ | Beteende | Användning |
|-----|----------|------------|
| **Error** | Blockerar sparning | Ogiltig data, obligatoriska krav |
| **Warning** | Tillåter sparning | Avvikande värden som kan vara korrekta |
| **Info** | Informerar utan blockering | Kompletterande kontext |

#### Inmatning av relaterade objekt

Ofta vill man kunna mata in ett nytt objekt och samtidigt koppla andra objekt till det. Två lösningar i Softadmin®:

1. **Javascript-knapp** bredvid fältet som öppnar befintligt menyval i ett popupfönster.
2. **Inline-utfällning** — en kryssruta som fäller ut extra fält för att mata in det nya objektet direkt i NewEdit.

#### Tillåt inte att objekt skapas som inaktiva

Om det finns en inställning motsvarande *Aktiv* eller *Status* ska denna normalt sett bara visas i *Ändra \<objekt\>*-menyval, inte i *Nytt \<objekt\>*. Objekt ska skapas med standardinställningar, vilket i de flesta fall innebär Aktiv = Ja.

#### Visa kontext vid inmatning

När en länk från en Detailview leder till en NewEdit ska sammanhanget framgå tydligt. Användaren ska när som helst kunna svara på: *"Var är jag och vad är jag på väg att göra?"*

### Typiska inmatningsmönster

Hur du vidaresänder användaren efter en sparning påverkar arbetsflödet lika mycket som NewEdit:en i sig.

#### Objekt som skapas sällan

Bygg NewEdit-menyvalet så att det vidaresänder användaren till Detailview för den nyss skapade posten. Användaren ser direkt vad som skapades och kan fortsätta därifrån.

#### Objekt som skapas ofta

Om systemet till stor del används för att mata in data, t.ex. ordrar eller ärenden, vidaresänd användaren tillbaka till samma NewEdit-menyval direkt efter sparning. Användaren kan börja mata in nästa post utan extra klick.

#### Avvikelse och manuell genomgång av grid

För flöden där användaren ska gå igenom en grid med poster som behöver hanteras manuellt, skicka användaren vidare till nästa post i grid:en efter att en post hanterats. Komplettera med en InfoSQL-låda som visar hur många poster som återstår att hantera.

### Parametersidor

#### Grundregler

Ha aldrig fler än sju synliga parametrar när parametersidan laddas. Om antalet överskrids bör de grupperas och gömmas under rubriker med kryssrutor, placerade i användningsfrekvensordning.

#### Fritextparameter först

Om det finns en fritextparameter som söker i flera databasfält bör den placeras högst upp. Den kraftigaste filtreringen görs oftast via fritext och det är också det användare oftast börjar med.

#### Slå ihop liknande fält

Om man vill fritextsöka på flera kolumner ska dessa slås ihop till en enda parameter. T.ex. kan sökning på namn och e-postadress göras i en och samma fritextparameter.

#### Aldrig ensam kryssruta som parameter

En parametersida ska aldrig bestå av en ensam kryssruta. Om en grid ska visa objekt med olika status ska grid:en i stället visas direkt med aktiva objekt. Via en toppknapp kan användaren sedan välja att visa alla.

#### Inloggad användare som defaultvärde

Om en parameter söker i loggningskolumner (skapad av, ändrad av) ska inloggad användare vara förvald. Användaren vill oftast hitta sina egna poster.

### Grid

#### Kolumnordning

En grid ska vara organiserad utifrån hur användaren faktiskt läser och arbetar med datan, inte efter hur datan är lagrad i systemet.

**Naturligt läsmönster:**
1. Identifiering först (namn, nummer, primärnyckel)
2. Kontextnära information därefter (status, typ, kategori)
3. Detaljer och sekundär data sist
4. Loggningsinformation (Skapad av, Skapad datum) längst till höger

> ⚡ Om användaren måste scrolla långt åt sidan för att förstå vad raden är, är kolumnordningen fel.

#### Standardsortering

En grid ska alltid ha en förvald sorteringsordning. Den naturliga standardsorteringen är på första kolumnen från vänster — i normalfallet den mänskliga primärnyckeln, t.ex. Artikelnamn.

När en rapport grupperas på t.ex. år, månad eller vecka ska rapporten också sorteras på denna kolumn.

#### Radknappar

I normalfallet ska maximalt två radknappar vara synliga. Övriga blir tillgängliga i radens kontextmeny. Radlänkar för att ta bort eller inaktivera poster kan med fördel placeras i kontextmenyn för att minska risken för felklick.

Sorteringsordning för radlänkar följer användningsfrekvens fallande. **Ta bort-länken ska alltid vara sist.**

#### Automatisk navigering vid exakt en träff

Om sökningen ger exakt en träff är det oftast lämpligt att ställa in radlänken till detaljvyn så att den aktiveras automatiskt.

#### Bläddra i grid

Genom att aktivera bläddringsfunktionen på radlänken till detaljvyn ges användaren möjlighet att bläddra mellan posterna direkt från detaljsidan. Praktiskt när grid visar objekt som ska gås igenom för manuell åtgärd.

#### Alltid drilldown på rapporter

Grid-komponenten används ofta för att visualisera rapporter med aggregerade data. Det ska alltid finnas drilldown-menyval som listar de transaktioner som ligger till grund för den aggregerade siffran. Dokumentera också syfte och definition för rapporter direkt i systemet, förslagsvis som InfoSQL.

#### Undantaget bekräftar regeln

När nästan allt har samma status är det onödigt att markera allt. Markera i stället bara det som avviker: om allt är godkänt, markera bara det som är underkänt. Det gör det enklare att se det som faktiskt kräver uppmärksamhet, utan visuellt brus.

### Detailview

#### Infoboxar

Använd infoboxar för att gruppera sammanhörande detaljinformation. För infoboxars inbördes ordning gäller löpsedelsprincipen: den viktigaste informationen presenteras först.

*Exempel:* I Visa individ är det lämpligt att individuppgifter visas i en infobox *Personuppgifter* längst upp till vänster. Nedanför eller till höger visas sedan infoboxar med t.ex. medlemskap och fakturor.

#### Flikar för relaterade objekt

Använd flikar för att visa information om kopplade objekt till huvudobjektet. Sortera alltid flikar i användningsfrekvensordning fallande.

**Undvik:**
- Grid som kan förväntas innehålla väldigt många rader (bör ha parametersida och visas i fullskärm)
- NewEdit-menyval i flikar (det blir otydligt när användaren klickar bort en flik med pågående inmatning)
- En nästlad Detailview i en flik

#### Kontextberoende förvald flik

Den flik som visas längst till vänster visas som förvald. I vissa fall är det lämpligt att en annan flik visas som förvald beroende på varifrån användaren navigerade.

*Exempel:* Om en Grid visar fakturor och användaren klickar till Visa kontakt, ska Fakturor-fliken visas som förvald — det speglar vad användaren just arbetade med.

#### Alltid länk till Ändra-menyvalet

När Detailview-komponenten används för ett *Visa \<objekt\>*-menyval ska det alltid finnas en länk till objektets Ändra-menyval. Användaren ska alltid kunna ta sig till redigering utan att gå via huvudmenyn.

### Execute och Delete

#### Execute: Informera om vad som händer

När ett Execute-menyval genomför en handling som bara påverkar objekt som uppfyller vissa villkor ska det tydligt framgå vilka objekt som kommer påverkas. Användaren ska inte bli överraskad av att vissa poster inte behandlades.

*Exempel:* Om en avisering bara kan skickas till medlemmar som markerats som fakturamottagare ska en infobox förklara detta förekrav.

När ett Execute-menyval körs och resultatet kan anses dolt för användaren bör de informeras om vad som utfördes och hur många poster som behandlades — respektive inte behandlades och varför.

#### Delete: bekräftelse och felhantering

Använd alltid Delete-komponentens *Confirmation text* när användaren tar bort ett objekt. Om borttagning av flera objekt genomförs som en dold process ska ett bekräftelsemeddelande visas efteråt.

Om en borttagning inte kan genomföras ska ett informativt felmeddelande visas — förlita dig inte på plattformens generiska felmeddelande om kopplingar i databasen. Användaren ska av meddelandet kunna förstå varför borttagningen inte kunde genomföras.

### RTF, PDF och nedladdning

#### Markera aldrig automatiskt som hanterat

När en fil laddas ned från systemet för utskrift eller manuell hantering ska den aldrig automatiskt markeras som utskriven eller hanterad. Det finns inget sätt att säkerställa att filen verkligen skrevs ut eller importerades i ett externt system.

Användaren ska alltid själv sätta ett dokument som hanterat genom ett separat menyval, lämpligen namngivet *Markera \<dokumentobjekt\> som utskrivet*.

#### Dokumentera taggar i mallar

När systemet innehåller dokument- eller e-postmallar med taggar som hämtar datafält från databasen ska taggarna dokumenteras med namn och innehåll i anslutning till det menyval där mallen laddas upp.

### Disabled state och knappar

#### Förklara varför

Om användaren inte kan klicka på en knapp eller välja ett alternativ är det bra om systemet förklarar varför. I Softadmin® görs detta via fältets *Disabled reason*-egenskap — den ska alltid användas när ett element är inaktivt.

**Bra exempel:**
- ✅ Kräver att kund är sparad först.
- ✅ Kan inte skickas förrän alla fält är ifyllda.
- ✅ Endast tillgänglig för aktiva uppdrag.

**Dåliga exempel:**
- ❌ Ingen förklaring alls.
- ❌ Inte tillgänglig.
- ❌ Disabled.

> ⚡ Om något går att se men inte klicka på, förklara varför direkt i gränssnittet.

### Behörighet och kontext

UX handlar inte bara om hur saker ser ut, utan om att rätt information visas för rätt person. En vanlig miss är att konsulter bygger gränssnittet för en superuser och glömmer att nyanställda eller sällananvändare ser exakt samma vy.

**Fundera på:**
- Ska känsliga fält döljas baserat på roll?
- Ska vissa åtgärder bara synas när de är relevanta för den inloggade användaren?
- Kan standardvärden sättas automatiskt beroende på vem som är inloggad?
- Ser en nyanställd samma vy som en van användare, och är det lämpligt?

Softadmin® visar automatiskt bara menyval som användaren har rätt till. Men det räcker inte — länkar till menyval som inte är relevanta i ett visst tillstånd ska döljas tills de faktiskt är det.

#### Tänk också på sällananvändaren

Den som bara använder en viss funktion ett par gånger i månaden har inte lärt sig systemets logik. För dem är tydliga labels, synliga hjälptexter och enkla flöden extra viktiga.

> ⚡ Bygg för den minst erfarna användaren av en viss funktion.

### Användaranpassning och hjälp

#### Samla användarens inställningar på ett ställe

Samla all information som knyts till användaren i systemet på ett och samma menyval.

#### Enterprise Search

Indexera centrala entiteter i Softadmin® Enterprise Search. Ofta finns ett relativt litet antal centrala objekt som ofta söks fram med olika sökbegrepp och dessa bör indexeras för att göra systemet smidigare att arbeta i.

#### Senast visade poster

För centrala objekt kan en lista över de X senast öppnade posterna vara väldigt praktisk. T.ex. 20 senast öppnade kunder. Listan kan placeras på användarens startsida.

#### Tangentbordsnavigering

Man kan ofta arbeta snabbare med ett system om man inte behöver använda pekdonet. För användningsfall med hög förväntad användningsfrekvens bör du överväga att tilldela menyval och länkar tangentbordsgenvägar.

### Sammanfattning

I verksamhetssystem handlar UX sällan om visuell design. Det handlar om att göra arbetet enklare, snabbare och säkrare.

#### Del 1. UX-principer
- Förstå användarens arbete och verksamhetens processer
- Låt UX-"lagar" guida dina beslut — Millers lag, Hicks lag etc.
- Strukturera information så att användaren ser det viktigaste först
- Kommunicera tydligt med bra labels, hjälptexter och knappar
- Ge användaren rätt feedback: felmeddelanden som leder vidare, varningar som inte skrämmer
- Använd färg som förstärkning, aldrig som enda signal

#### Del 2. Softadmin®-specifikt
- Namnge utifrån verksamheten, inte databasen
- Testa svarstider med realistiska datamängder
- Fältordning, beroenden och validering i NewEdit
- Kolumnordning, sortering och drilldown i Grid
- Infoboxar, flikar och kontextvisning i Detailview
- Förklara alltid disabled state och visa länkar bara när de är relevanta
- Alerts bara när konsekvensen är svår att återställa

Tack för att du tog dig tid att läsa vår guide. Om du har några frågor eller synpunkter på innehållet, tveka inte att höra av dig till [ux@multisoft.se](mailto:ux@multisoft.se).