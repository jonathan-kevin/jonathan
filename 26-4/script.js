$(document).ready(function () {

	function updateClasses() {
		const isSmall = $(window).width() <= 640;

		const $body = $('body');
		const $bodyAlt = $('#body');

		if (isSmall) {
			$body
				.removeClass('saLargeScreen saPc')
				.addClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile');

			$bodyAlt
				.removeClass('saLargeScreen saCompact saPc') // assuming this exists on large
				.addClass('smallscreen saSmallScreen saSmallScreenJs saMobile');
		} else {
			$body
				.removeClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile')
				.addClass('saLargeScreen saPc');

			$bodyAlt
				.removeClass('smallscreen saSmallScreen saSmallScreenJs saMobile')
				.addClass('saLargeScreen saCompact saPc');
		}
	}

	updateClasses();

	$(window).on('resize', function () {
		updateClasses();
	});

	$('button.saExpander').on('click', function () {
		$('#SideBar').toggleClass('saMinimized');
	});

	$('button.saNavigator').on('click', function () {
		$('.saSideBarOuter').toggleClass('saClosed')
		$('.saSideBarSmallScreenOverlay').toggle();
	});

	const $select = $('<select>', {
		id: 'theme-select',
		class: 'saInputText saDropdown saButton',
		style: 'position: fixed; top: 0.5rem; right: 0.5rem; z-index: 1000;',
		name: 'theme',
		'aria-label': 'Theme'
	});

	$select.append(
		$('<option>', { value: 'system', text: 'System' }),
		$('<option>', { value: 'light', text: 'Light' }),
		$('<option>', { value: 'dark', text: 'Dark' })
	);

	$('body').append($select);

	const saved = localStorage.getItem('theme') || 'system';
	$('#theme-select').val(saved);
	applyTheme(saved);

	$('#theme-select').on('change', function () {
		const value = $(this).val();
		localStorage.setItem('theme', value);
		applyTheme(value);
	});

	function applyTheme(theme) {
		const root = document.documentElement;

		if (theme === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', theme);
		}
	}

});