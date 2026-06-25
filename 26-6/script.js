(function () {
	const smallScreenQuery = window.matchMedia('(max-width: 900px)');

	function getModeRoots() {
		return Array.from(new Set([
			document.body,
			document.getElementById('body'),
			...document.querySelectorAll('.right.standardview')
		].filter(Boolean)));
	}

	function shouldUseSmallScreen() {
		return smallScreenQuery.matches || window.location.hash === '#mobile';
	}

	function closeSideBar() {
		const sideBarOuter = document.querySelector('.saSideBarOuter');
		const sideBarOverlay = document.getElementById('SideBarSmallScreenOverlay');

		if (!sideBarOuter || !sideBarOverlay) {
			return;
		}

		sideBarOuter.classList.add('saClosed');
		sideBarOverlay.classList.remove('saVisible');
		sideBarOverlay.style.display = 'none';
	}

	function openSideBar() {
		const sideBarOuter = document.querySelector('.saSideBarOuter');
		const sideBarOverlay = document.getElementById('SideBarSmallScreenOverlay');

		if (!sideBarOuter || !sideBarOverlay) {
			return;
		}

		sideBarOuter.classList.remove('saClosed');
		sideBarOverlay.style.display = '';
		sideBarOverlay.classList.add('saVisible');
	}

	function setScreenMode() {
		const isSmallScreen = shouldUseSmallScreen();

		getModeRoots().forEach(function (element) {
			element.classList.toggle('saSmallScreen', isSmallScreen);
			element.classList.toggle('saLargeScreen', !isSmallScreen);
			element.classList.toggle('saPc', !isSmallScreen);
		});

		if (!isSmallScreen) {
			closeSideBar();
		}
	}

	function bindSoftadminChrome() {
		document.addEventListener('click', function (event) {
			const target = event.target instanceof Element ? event.target : event.target.parentElement;
			if (!target) {
				return;
			}

			const favoriteToggle = target.closest('.saFavoriteToggle');
			if (favoriteToggle) {
				const isChecked = favoriteToggle.getAttribute('aria-checked') === 'true';
				favoriteToggle.setAttribute('aria-checked', isChecked ? 'false' : 'true');
				return;
			}

			const warningExpander = target.closest('.saWarningExpander .saWarningButton');
			if (warningExpander) {
				const warningBox = warningExpander.closest('.saWarningBox');
				const expander = warningExpander.closest('.saWarningExpander');
				const isClosed = warningBox.classList.contains('saClosed');

				warningBox.classList.toggle('saClosed', !isClosed);
				warningBox.classList.toggle('saOpen', isClosed);
				expander.classList.toggle('saOpen', isClosed);
				warningExpander.setAttribute('aria-expanded', isClosed ? 'true' : 'false');
				return;
			}

			const warningClose = target.closest('.saClose .saWarningButton');
			if (warningClose) {
				const warningBox = warningClose.closest('.saWarningBox');
				if (warningBox) {
					warningBox.remove();
				}
				return;
			}

			if (target.closest('.saSmallScreenHeader .saNavigator')) {
				openSideBar();
				return;
			}

			if (target.closest('.saSideBarHeaderSmallScreen .saNavigator') || target.closest('#SideBarSmallScreenOverlay')) {
				closeSideBar();
			}
		});

		document.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') {
				closeSideBar();
			}
		});
	}

	if (smallScreenQuery.addEventListener) {
		smallScreenQuery.addEventListener('change', setScreenMode);
	} else {
		smallScreenQuery.addListener(setScreenMode);
	}

	window.addEventListener('hashchange', setScreenMode);
	document.addEventListener('DOMContentLoaded', function () {
		bindSoftadminChrome();
		setScreenMode();
	});
}());
