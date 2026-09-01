(function (root, factory) {
	const api = factory();

	if (typeof module === 'object' && module.exports) {
		module.exports = api;
	}

	root.SoftadminLocalization = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
	const messages = {
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
		component: { en: 'Component', sv: 'Komponent' },
		language: { en: 'Language', sv: 'Språk' },
		examplePrompts: { en: 'Example prompts', sv: 'Exempelprompter' },
		english: { en: 'English', sv: 'Engelska' },
		swedish: { en: 'Swedish', sv: 'Svenska' },
		generate: { en: 'Generate', sv: 'Generera' },
		savedPages: { en: 'Saved pages', sv: 'Sparade sidor' },
		selected: { en: 'Selected', sv: 'Markerad' },
		ready: { en: 'Ready.', sv: 'Redo.' },
		undone: { en: 'Undone.', sv: 'Ångrat.' },
		redone: { en: 'Redone.', sv: 'Gjort om.' },
		save: { en: 'Save', sv: 'Spara' },
		cancel: { en: 'Cancel', sv: 'Avbryt' },
		add: { en: 'Add', sv: 'Lägg till' },
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
		savePage: { en: 'Save page for later', sv: 'Spara sidan till senare' },
		openPage: { en: 'Open saved page', sv: 'Öppna sparad sida' },
		saveScreenshot: { en: 'Save as screenshot', sv: 'Spara som skärmbild' },
		openDebug: { en: 'Open developer debug drawer', sv: 'Öppna utvecklarpanelen' },
		closeDebug: { en: 'Close developer debug drawer', sv: 'Stäng utvecklarpanelen' },
		estimatedProgress: { en: 'Estimated generation progress', sv: 'Uppskattad genereringsstatus' },
		moveUp: { en: 'Move up', sv: 'Flytta upp' },
		moveDown: { en: 'Move down', sv: 'Flytta ned' },
		makeSibling: { en: 'Make sibling row', sv: 'Skapa syskonrad' },
		addSibling: { en: 'Add sibling', sv: 'Lägg till syskonfält' },
		duplicate: { en: 'Duplicate', sv: 'Duplicera' }
	};

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

	return { localize, messages, translateText };
}));
