$(document).ready(function () {
	// Get current URL path
	const path = (window.location.pathname + window.location.search + window.location.hash).toLowerCase();

	// Create toggle button
	const $toggler = $('<button>', {
		id: 'theToggler',
		class: 'saButton saDefaultButtonSecondary',
		style: 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; color: white; background-color: black; border: none;',
		text: 'Compact',
		title: 'Toggle between Standard, Compact, and SmallScreen views'
	});

	// Cache DOM elements
	const $body = $('body');
	$body.attr('id', 'rootBody');
	const $sideBar = $('.saSideBar');

	// View configurations
	const views = [
		{
			name: 'Standard',
			classes: 'saStandard saPc saLargeScreen',
			url: 'standard'
		},
		{
			name: 'Compact',
			classes: 'saCompact saPc saLargeScreen',
			url: 'compact'
		},
		{
			name: 'SmallScreen',
			classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile',
			url: 'smallscreen'
		}
	];

	// Initialize view based on URL
	function initializeView() {
		const currentView = views.find(view => path.includes(view.url)) || views[1]; // Default to Compact
		$body.addClass(currentView.classes);
		$toggler.text(currentView.name);
	}

	// Toggle between views
	function toggleView() {
		const currentClasses = $body.attr('class').split(' ').filter(cls => cls.startsWith('sa') || cls === 'smallscreen');
		const currentViewIndex = views.findIndex(view => currentClasses.includes(view.classes.split(' ')[0]));
		const nextView = views[(currentViewIndex + 1) % views.length];

		$body.removeClass(currentClasses.join(' ')).addClass(nextView.classes);
		$toggler.text(nextView.name);
	}

	// Handle sidebar expansion
	function toggleSidebar(e) {
		e.preventDefault();
		$sideBar.toggleClass('saExpanded saMinimized');
	}

	// Update responsive classes based on screen width
	function updateResponsiveClasses() {
		$body.removeAttr('style');

		const width = window.innerWidth;
		const responsiveClasses = [
			{ minWidth: 1536, classes: 'sa2xl saCompact saPc saLargeScreen saRootBody', id: '2xl' },
			{ minWidth: 1280, classes: 'saXl saCompact saPc saLargeScreen saRootBody', id: 'xl' },
			{ minWidth: 1024, classes: 'saLg saCompact saPc saLargeScreen saRootBody', id: 'lg' },
			{ minWidth: 768, classes: 'saMd saCompact saPc saLargeScreen saRootBody', id: 'md' },
			{ minWidth: 640, classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile', id: 'sm' },
			{ minWidth: 0, classes: 'saXs saSmallScreen smallscreen saSmallscreensidebar saMobile', id: 'xs' }
		];

		const currentClasses = $body.attr('class').split(' ').filter(cls => !cls.startsWith('sa') && cls !== 'smallscreen');
		$body.removeClass().addClass(currentClasses.join(' '));

		const matchingView = responsiveClasses.find(view => width >= view.minWidth);

		if (matchingView) {
			$body.addClass(matchingView.classes);

			// ✅ also update fieldset radio
			$('input[name="size"]').prop('checked', false);
			$('#' + matchingView.id).prop('checked', true);
		}
	}


	$body.append(`
		<popover class="saSizer" open>
			<fieldset>
				<label>xs	<input tabindex="-1" type="radio" name="size" value="xs" id="xs"></label>
				<label>sm	<input tabindex="-1" type="radio" name="size" value="sm" id="sm"></label>
				<label>md	<input tabindex="-1" type="radio" name="size" value="md" id="md"></label>
				<label>lg	<input tabindex="-1" type="radio" name="size" value="lg" id="lg"></label>
				<label>xl	<input tabindex="-1" type="radio" name="size" value="xl" id="xl"></label>
				<label>2xl	<input tabindex="-1" type="radio" name="size" value="2xl" id="2xl"></label>
			</fieldset>
		</popover>
	`);

	// Append toggler and set initial state
	$body.append($toggler);
	setTimeout(initializeView, 200);

	// Event listeners
	$toggler.on('click', toggleView);
	$('.saExpander').on('click', toggleSidebar);
	$(window).on('resize', updateResponsiveClasses);
	updateResponsiveClasses();
});