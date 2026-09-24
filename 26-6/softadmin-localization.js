(function (root, factory) {
	const api = factory();

	if (typeof module === 'object' && module.exports) {
		module.exports = api;
	}

	root.SoftadminLocalization = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
	const messages = {
		renameProject: { en: 'Rename project', sv: 'Byt namn på projekt' },
		projectName: { en: 'Project name', sv: 'Projektnamn' },
		rename: { en: 'Rename', sv: 'Byt namn' },
		projectNameRequired: { en: 'Enter a project name.', sv: 'Ange ett projektnamn.' },
		projectRenameFailed: { en: 'Could not rename project. Your saved project is unchanged.', sv: 'Det gick inte att byta namn på projektet. Ditt sparade projekt är oförändrat.' },
		componentSelection: { en: 'Component selection', sv: 'Komponentval' },
		manualSelection: { en: 'Manual selection', sv: 'Manuellt val' },
		aiSelection: { en: 'AI decides', sv: 'AI väljer' },
		chooseComponent: { en: 'Choose a component', sv: 'Välj en komponent' },
		goToContent: { en: 'Go to content', sv: 'Gå till innehåll' },
		goToMenu: { en: 'Go to menu', sv: 'Gå till meny' },
		search: { en: 'Search...', sv: 'Sök...' },
		user: { en: 'User', sv: 'Användare' },
		favorites: { en: 'Favorites', sv: 'Favoriter' },
		edit: { en: 'Edit', sv: 'Redigera' },
		todaysBookings: { en: "Today's bookings", sv: 'Dagens bokningar' },
		invoicesToApprove: { en: 'Invoices to approve', sv: 'Fakturor att attestera' },
		bookingConflicts: { en: 'Booking conflicts', sv: 'Bokningskonflikter' },
		economy: { en: 'Economy', sv: 'Ekonomi' },
		overview: { en: 'Overview', sv: 'Översikt' },
		customerInvoices: { en: 'Customer invoices', sv: 'Kundfakturor' },
		supplierInvoices: { en: 'Supplier invoices', sv: 'Leverantörsfakturor' },
		payments: { en: 'Payments', sv: 'Betalningar' },
		bookings: { en: 'Bookings', sv: 'Bokningar' },
		bookingCalendar: { en: 'Booking calendar', sv: 'Bokningskalender' },
		bookingRequests: { en: 'Booking requests', sv: 'Bokningsförfrågningar' },
		participants: { en: 'Participants', sv: 'Deltagare' },
		priceRules: { en: 'Price rules', sv: 'Prisregler' },
		resources: { en: 'Resources', sv: 'Resurser' },
		rooms: { en: 'Rooms', sv: 'Rum' },
		instructors: { en: 'Instructors', sv: 'Instruktörer' },
		equipment: { en: 'Equipment', sv: 'Utrustning' },
		reports: { en: 'Reports', sv: 'Rapporter' },
		revenueReport: { en: 'Revenue report', sv: 'Intäktsrapport' },
		occupancyReport: { en: 'Occupancy report', sv: 'Beläggningsrapport' },
		settings: { en: 'Settings', sv: 'Inställningar' },
		economySetup: { en: 'Economy setup', sv: 'Ekonomiinställningar' },
		newTab: { en: 'New tab', sv: 'Ny flik' },
		help: { en: 'Help', sv: 'Hjälp' },
		home: { en: 'Home', sv: 'Hem' },
		searchContacts: { en: 'Search contacts', sv: 'Sök kontakter' },
		createCase: { en: 'Create case', sv: 'Skapa ärende' },
		showAddresses: { en: 'Show addresses', sv: 'Visa adresser' },
		identityCheck: { en: 'Identity check', sv: 'Identitetskontroll' },
		openMenu: { en: 'Open menu', sv: 'Öppna meny' },
		breadcrumbs: { en: 'Breadcrumbs', sv: 'Brödsmulor' },
		contactLogo: { en: 'Contact details logo', sv: 'Logotyp för kontaktuppgifter' },
		formBuilder: { en: 'Form builder', sv: 'Formulärbyggare' },
		dragIntoNewEdit: { en: 'Drag into NewEdit', sv: 'Dra till NewEdit' },
		fieldPalette: { en: 'NewEdit field palette', sv: 'Fältpalett för NewEdit' },
		aiMockupPrompt: { en: 'AI mockup prompt', sv: 'Prompt för AI-mockup' },
		promptToSoftadmin: { en: 'Prompt to Softadmin', sv: 'Prompt till Softadmin' },
		promptHistory: { en: 'Prompt history', sv: 'Prompthistorik' },
		you: { en: 'You', sv: 'Du' },
		describeMockup: { en: 'Describe the Softadmin mockup you want to create.', sv: 'Beskriv Softadmin-mockupen du vill skapa.' },
		restoreVersion: { en: 'Restore this version', sv: 'Återställ den här versionen' },
		currentVersion: { en: 'Current version', sv: 'Aktuell version' },
		versionRestored: { en: 'Version restored.', sv: 'Versionen har återställts.' },
		component: { en: 'Component', sv: 'Komponent' },
		calendarLayout: { en: 'Calendar layout', sv: 'Kalenderlayout' },
		weekdays: { en: 'Weekdays', sv: 'Veckodagar' },
		weekdaysWithTimeScale: { en: 'Weekdays with time scale', sv: 'Veckodagar med tidsskala' },
		resourcesWithTimeScale: { en: 'Resources with time scale', sv: 'Resurser med tidsskala' },
		language: { en: 'Language', sv: 'Språk' },
		examplePrompts: { en: 'Example prompts', sv: 'Exempelprompter' },
		english: { en: 'English', sv: 'Engelska' },
		swedish: { en: 'Swedish', sv: 'Svenska' },
		generate: { en: 'Generate', sv: 'Generera' },
		projectHistory: { en: 'Project history', sv: 'Projekthistorik' },
		newProject: { en: 'New project', sv: 'Nytt projekt' },
		autosaveReady: { en: 'Autosave ready', sv: 'Autosparning redo' },
		autosaving: { en: 'Saving automatically...', sv: 'Sparar automatiskt...' },
		autosaved: { en: 'Saved automatically', sv: 'Sparat automatiskt' },
		notSaved: { en: 'Not saved', sv: 'Inte sparat' },
		storageFull: { en: 'Browser storage is full. Recent changes are not saved. Keep this tab open.', sv: 'Webbläsarlagringen är full. De senaste ändringarna är inte sparade. Behåll fliken öppen.' },
		selected: { en: 'Selected', sv: 'Markerad' },
		ready: { en: 'Ready.', sv: 'Redo.' },
		undone: { en: 'Undone.', sv: 'Ångrat.' },
		redone: { en: 'Redone.', sv: 'Gjort om.' },
		save: { en: 'Save', sv: 'Spara' },
		cancel: { en: 'Cancel', sv: 'Avbryt' },
		add: { en: 'Add', sv: 'Lägg till' },
		newActivity: { en: 'New activity', sv: 'Ny aktivitet' },
		title: { en: 'Title', sv: 'Titel' },
		description: { en: 'Description', sv: 'Beskrivning' },
		start: { en: 'Start', sv: 'Start' },
		end: { en: 'End', sv: 'Slut' },
		calendarActivityAdded: { en: 'Calendar activity added.', sv: 'Kalenderaktiviteten har lagts till.' },
		calendarActivityMoved: { en: 'Calendar activity moved.', sv: 'Kalenderaktiviteten har flyttats.' },
		delete: { en: 'Delete', sv: 'Ta bort' },
		download: { en: 'Download', sv: 'Ladda ner' },
		today: { en: 'Today', sv: 'Idag' },
		groupBy: { en: 'Group by', sv: 'Gruppera efter' },
		nothing: { en: '(Nothing)', sv: '(Inget)' },
		noValue: { en: '(No value)', sv: '(Inget värde)' },
		loadPreviousMessages: { en: 'Load previous messages', sv: 'Visa tidigare meddelanden' },
		writeMessage: { en: 'Write a message...', sv: 'Skriv ett meddelande...' },
		sendMessage: { en: 'Send message', sv: 'Skicka meddelande' },
		aiDisclaimer: { en: 'AI-generated content may be incorrect', sv: 'AI-genererat innehåll kan vara inkorrekt' },
		document: { en: 'Document', sv: 'Dokument' },
		previousDocument: { en: 'Previous document', sv: 'Föregående dokument' },
		nextDocument: { en: 'Next document', sv: 'Nästa dokument' },
		personForm: { en: 'Person form', sv: 'Personformulär' },
		customerDetail: { en: 'Customer detail', sv: 'Kunddetaljer' },
		invoiceGrid: { en: 'Invoice grid', sv: 'Fakturarutnät' },
		sidebarFavorites: { en: 'Sidebar favorites', sv: 'Favoriter i sidomenyn' },
		sidebarPatch: { en: 'Sidebar patch', sv: 'Ändra sidomeny' },
		employeeGallery: { en: 'Employee gallery', sv: 'Medarbetargalleri' },
		bankIdSigning: { en: 'BankID signing', sv: 'BankID-signering' },
		supportChat: { en: 'Support chat', sv: 'Supportchatt' },
		recentDocuments: { en: 'Recent documents', sv: 'Senaste dokument' },
		customerAgreement: { en: 'Customer agreement', sv: 'Kundavtal' },
		onboardingProcess: { en: 'Onboarding process', sv: 'Introduktionsprocess' },
		roomPlanner: { en: 'Room planner', sv: 'Rumsplanerare' },
		knowledgeTree: { en: 'Knowledge tree', sv: 'Kunskapsträd' },
		revenuePivot: { en: 'Revenue pivot', sv: 'Intäktspivot' },
		invoicePdf: { en: 'Invoice PDF', sv: 'Faktura-PDF' },
		bookingForm: { en: 'Booking form', sv: 'Bokningsformulär' },
		economyMenu: { en: 'Economy menu', sv: 'Ekonomimeny' },
		specDebug: { en: 'Spec debug', sv: 'Specifikation' },
		softadminMockup: { en: 'Softadmin mockup', sv: 'Softadmin-mockup' },
		undoLastChange: { en: 'Undo last change', sv: 'Ångra senaste ändringen' },
		redoLastChange: { en: 'Redo last change', sv: 'Gör om senaste ändringen' },
		saveScreenshot: { en: 'Save as screenshot', sv: 'Spara som skärmbild' },
		viewSpec: { en: 'View spec', sv: 'Visa spec' },
		hideSpec: { en: 'Hide spec', sv: 'Dölj spec' },
		estimatedProgress: { en: 'Estimated generation progress', sv: 'Uppskattad genereringsstatus' },
		moveUp: { en: 'Move up', sv: 'Flytta upp' },
		moveDown: { en: 'Move down', sv: 'Flytta ned' },
		makeSibling: { en: 'Make sibling row', sv: 'Skapa syskonrad' },
		addSibling: { en: 'Add sibling', sv: 'Lägg till syskonfält' },
		duplicate: { en: 'Duplicate', sv: 'Duplicera' }
	};

	const examplePrompts = [
		{ en: "Create a NewEdit form for entering a person's contact information.", sv: 'Skapa ett NewEdit-formulär för att ange en persons kontaktuppgifter.' },
		{ en: 'Create a customer details page with contact info boxes, overdue invoice warning, related cases tabs, invoices, payments, and realistic action buttons.', sv: 'Skapa en kunddetaljsida med infoboxar för kontaktuppgifter, en varning för förfallna fakturor, flikar för relaterade ärenden, fakturor och betalningar samt realistiska åtgärdsknappar.' },
		{ en: 'Create a 15-row invoice grid for an economy system with customer, invoice number, due date, status, amount, and realistic row actions.', sv: 'Skapa en fakturatabell med 15 rader för ett ekonomisystem, med kund, fakturanummer, förfallodatum, status, belopp och realistiska radåtgärder.' },
		{ en: 'Add five more random favorites in the sidebar.', sv: 'Lägg till fem nya slumpmässiga favoriter i sidomenyn.' },
		{ en: "Remove item 'Rooms' in sidebar and add five more menu items in that group about economy.", sv: "Ta bort menyvalet 'Rum' i sidomenyn och lägg till fem nya menyval om ekonomi i samma grupp." },
		{ en: 'Create an employee image gallery grouped by department with names and job titles.', sv: 'Skapa ett bildgalleri med medarbetare, grupperat efter avdelning, med namn och befattningar.' },
		{ en: 'Create a BankID signing screen for approving a customer agreement.', sv: 'Skapa en BankID-signeringssida för att godkänna ett kundavtal.' },
		{ en: 'Create a support chat where a customer asks about changing a booking and the AI assistant explains the available options.', sv: 'Skapa en supportchatt där en kund frågar om att ändra en bokning och AI-assistenten förklarar de tillgängliga alternativen.' },
		{ en: 'Create a Link List of recent project documents with dates, including two unread documents.', sv: 'Skapa en Link List med de senaste projektdokumenten och deras datum, inklusive två olästa dokument.' },
		{ en: 'Create an Inline Document viewer with a selected customer agreement PDF that cannot be previewed and must be downloaded, plus a second supporting document.', sv: 'Skapa en Inline Document-visare med ett valt kundavtal i PDF-format som inte kan förhandsvisas utan måste laddas ner, samt ett andra kompletterande dokument.' },
		{ en: 'Create a wrapped Linear Process for an onboarding flow with the steps Application received, Review, Agreement, and Activated.', sv: 'Skapa en radbruten Linear Process för ett introduktionsflöde med stegen Ansökan mottagen, Granskning, Avtal och Aktiverad.' },
		{ en: 'Create a weekly Planner with a timescale for five meeting rooms, office and online meeting filters, two unbooked requests, all-day maintenance, and realistic bookings from 08 to 18.', sv: 'Skapa en veckoplanering med Planner och tidsskala för fem mötesrum, filter för kontorsmöten och onlinemöten, två obokade förfrågningar, heldagsunderhåll och realistiska bokningar från 08:00 till 18:00.' },
		{ en: 'Create a Treeview for a company knowledge base with expandable sections for Operations, Sales, HR, and R & D. Expand R & D to show AI, internal documentation, routines, and roadmap pages.', sv: 'Skapa en Treeview för företagets kunskapsbas med expanderbara avsnitt för Drift, Försäljning, HR och Forskning och utveckling. Expandera Forskning och utveckling så att AI, intern dokumentation, rutiner och utvecklingsplaner visas.' },
		{ en: 'Create a Pivot Grid showing revenue by service area and month, with totals and realistic numeric values.', sv: 'Skapa en Pivot Grid som visar intäkter per tjänsteområde och månad, med totalsummor och realistiska numeriska värden.' },
		{ en: 'Create a PDF template editor for an invoice with customer, invoice number, due date, total amount, and company logo fields. Place the invoice number and total amount on the first page.', sv: 'Skapa en PDF-mallredigerare för en faktura med fält för kund, fakturanummer, förfallodatum, totalbelopp och företagslogotyp. Placera fakturanumret och totalbeloppet på första sidan.' },
		{ en: 'Create a NewEdit booking form with customer autosearch, room dropdown, date range, start and end time, participants, and notes.', sv: 'Skapa ett NewEdit-bokningsformulär med autosökning för kund, en rullista för rum, datumintervall, start- och sluttid, deltagare och anteckningar.' },
		{ en: 'Create a menu page for an economy system with groups for invoicing, payments, accounting, and reports.', sv: 'Skapa en menysida för ett ekonomisystem med grupper för fakturering, betalningar, bokföring och rapporter.' }
	];

	function translateExamplePrompt(value, language) {
		const example = examplePrompts.find(example => example.en === value || example.sv === value);
		return example?.[language] || value;
	}

	const phraseIndex = Object.values(messages).reduce((index, translations) => {
		Object.values(translations).forEach(phrase => index.set(phrase, translations));
		return index;
	}, new Map());

	function translateText(value, language) {
		const source = String(value ?? '');
		const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
		const phrase = match ? match[2] : source;
		const translation = phraseIndex.get(phrase)?.[language];

		if (translation) {
			return `${match[1]}${translation}${match[3]}`;
		}

		const generatingMatch = phrase.match(/^(Generating\.\.\.|Genererar\.\.\.)\s*(\d+)\s*s?$/);
		if (generatingMatch) {
			return language === 'sv' ? `${match[1]}Genererar... ${generatingMatch[2]} s${match[3]}` : `${match[1]}Generating... ${generatingMatch[2]}s${match[3]}`;
		}

		const hitsMatch = phrase.match(/^(\d+)\s+(?:of|av)\s+(\d+)\s+(?:hits|träffar)$/);
		if (hitsMatch) {
			return language === 'sv'
				? `${match[1]}${hitsMatch[1]} av ${hitsMatch[2]} träffar${match[3]}`
				: `${match[1]}${hitsMatch[1]} of ${hitsMatch[2]} hits${match[3]}`;
		}

		const titleMatch = phrase.match(/^(.*?) - (?:Softadmin mockup|Softadmin-mockup)$/);
		if (titleMatch) {
			return `${match[1]}${titleMatch[1]} - ${language === 'sv' ? 'Softadmin-mockup' : 'Softadmin mockup'}${match[3]}`;
		}

		const readyMatch = phrase.match(/^(.*?) (?:ready|klar)\.$/);
		if (readyMatch) {
			return language === 'sv'
				? `${match[1]}${readyMatch[1]} klar.${match[3]}`
				: `${match[1]}${readyMatch[1]} ready.${match[3]}`;
		}

		return source;
	}

	function shouldSkip(element) {
		return !element
			|| element.closest('script, style, [data-softadmin-no-localize]')
			|| element.closest('[data-softadmin-user-edited="true"]');
	}

	function localize(rootNode, language) {
		if (!rootNode || !['en', 'sv'].includes(language)) {
			return;
		}

		const documentNode = rootNode.nodeType === 9 ? rootNode : rootNode.ownerDocument;
		const view = documentNode?.defaultView;
		const nodeFilter = view?.NodeFilter || globalThis.NodeFilter;

		if (documentNode?.createTreeWalker && nodeFilter) {
			const walker = documentNode.createTreeWalker(rootNode, nodeFilter.SHOW_TEXT);
			let node = walker.nextNode();
			while (node) {
				if (!shouldSkip(node.parentElement)) {
					node.nodeValue = translateText(node.nodeValue, language);
				}
				node = walker.nextNode();
			}
		}

		const elements = rootNode.querySelectorAll ? rootNode.querySelectorAll('[placeholder], [aria-label], [title], [data-tooltip], [alt]') : [];
		elements.forEach(element => {
			if (shouldSkip(element)) {
				return;
			}

			['placeholder', 'aria-label', 'title', 'data-tooltip', 'alt'].forEach(attribute => {
				if (element.hasAttribute(attribute)) {
					element.setAttribute(attribute, translateText(element.getAttribute(attribute), language));
				}
			});
		});
	}

	return { localize, messages, translateText, translateExamplePrompt };
}));
