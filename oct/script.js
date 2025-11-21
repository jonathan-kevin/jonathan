$(document).ready(function () {
	var slug = window.location.pathname + window.location.search + window.location.hash;
	var path = slug.toLowerCase()
	console.log(path);

	var theToggler = $("<button>", {
		id: "theToggler",
		class: "saButton saDefaultButtonSecondary",
		style: "position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; color: white; background-color: black; border: none;",
		text: "Compact",
		title: "Toggle between saStandard, saCompact and saSmallScreen"
	});

	const $body = $(".right.standardview, body");
	const $sideBar = $(".saSideBarJs");

	$($body).addClass("saPc saLargeScreen saCompact");
	$('body').append(theToggler);

	setTimeout(() => {
		if (path.includes("smallscreen")) {
			$($body).removeClass().addClass("saSmallScreen smallscreen saSmallscreensidebar saMobile");
			$('.saPopupOverlay.saBottomSheetOverlay').show();
			$("#theToggler").text("SmallScreen");
		} else if (path.includes("standard")) {
			$($body).removeClass().addClass("saStandard saPc saLargeScreen");
			$("#theToggler").text("Standard");
			$('.saPopupOverlay.saBottomSheetOverlay').hide();
		} else if (path.includes("compact")) {
			$($body).removeClass().addClass("saCompact saPc saLargeScreen");
			$("#theToggler").text("Compact");
			$('.saPopupOverlay.saBottomSheetOverlay').hide();
		}
	}, 200);

	function toggleClasses() {
		if ($($body).hasClass("saStandard")) {
			$($body).removeClass("saStandard").addClass("saCompact saPc saLargeScreen");
			$("#theToggler").text("Compact");
		} else if ($($body).hasClass("saCompact")) {
			$($body).removeClass("saCompact saPc saLargeScreen").addClass("saSmallScreen smallscreen saSmallscreensidebar saMobile");
			$($sideBar).removeClass("saMinimized");
			$("#theToggler").text("SmallScreen");
			$('.saPopupOverlay.saBottomSheetOverlay').show();
		} else {
			$($body).removeClass("saSmallScreen saSmallscreensidebar saMobile smallscreen").addClass("saStandard saPc saLargeScreen");
			$("#theToggler").text("Standard");
		}
		updateResponsiveClasses();
	}

	$("#theToggler").click(function () {
		toggleClasses();
	});

	$('.saExpander').click(function (e) {
		e.preventDefault();
		$('.saExpanded').toggleClass('saMinimized');
		// Toggle aria-expanded on the button
		const $btn = $(this);
		const expanded = $btn.attr('aria-expanded') === 'true';
		$btn.attr('aria-expanded', !expanded);
	});

	// Toggle responsive classes on <body> based on screen width
	function updateResponsiveClasses() {
		const width = window.innerWidth;
		const $body = $("body");
		$body.removeClass("saSm saMd saLg saXl sa2xl");

		if (width >= 1536) {
			$body.addClass("sa2xl");
		} else if (width >= 1280) {
			$body.addClass("saXl");
		} else if (width >= 1024) {
			$body.addClass("saLg");
		} else if (width >= 768) {
			$body.addClass("saMd");
		} else if (width >= 640 || width <= 640) {
			$body.addClass("saSm");
		}
	}

	$(window).resize(function () {
		updateResponsiveClasses();
	});


	// Shared elements
	const $overlay = $('.saPopupOverlay');
	const $html = $('html');

	let dragging = false;
	let startX = 0;
	let startY = 0;
	let currentX = 0;          // positive when dragged left
	let activePanel = null;

	const DISMISS_THRESHOLD = 120;
	const VERTICAL_TOLERANCE = 15;

	function getClientX(e) {
		const ev = e.originalEvent || e;
		return (ev.touches?.[0] || ev.changedTouches?.[0] || ev).clientX;
	}
	function getClientY(e) {
		const ev = e.originalEvent || e;
		return (ev.touches?.[0] || ev.changedTouches?.[0] || ev).clientY;
	}

	// Open any panel
	function openPanel($panel) {
		// Important: clear any leftover inline right from previous drag
		$panel.css({
			right: 0,
			transition: 'right 0.2s ease, transform 0.2s ease, visibility 0.2s ease'
		});
		$panel.removeClass('saClosed');
		$html.css('overflow', 'hidden');
		$overlay.show();
	}

	// Close both panels without resetting inline styles
	function closePanels() {
		$('.saSideBarOuter, .saNotificationsWrapper')
			.addClass('saClosed');   // <-- let CSS handle the final position + transition

		$html.css('overflow', 'auto');
		$overlay.hide();
	}

	// Click handlers
	$('.saNotifications').on('click', () => openPanel($('.saNotificationsWrapper')));
	$('.saNavigator').on('click', () => openPanel($('.saSideBarOuter')));

	$overlay.on('click', closePanels);

	// ------------------ Drag-to-dismiss ------------------
	$('.saSideBarOuter, .saNotificationsWrapper').on('mousedown touchstart', function (e) {
		if ($(this).hasClass('saClosed')) return;

		activePanel = $(this);
		dragging = true;
		currentX = 0;

		startX = getClientX(e);
		startY = getClientY(e);

		// Force open position + remove transition for smooth dragging
		activePanel.css({
			right: 0,
			transition: 'none'
		});
	});

	$(document).on('mousemove touchmove', function (e) {
		if (!dragging || !activePanel) return;

		const deltaX = getClientX(e) - startX;
		const deltaY = getClientY(e) - startY;

		// Cancel if user is scrolling vertically
		if (Math.abs(deltaY) > VERTICAL_TOLERANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
			dragging = false;
			activePanel = null;
			return;
		}

		currentX = Math.max(0, deltaX);  // only allow dragging left
		activePanel.css('right', -currentX + 'px');
	});

	$(document).on('mouseup touchend touchcancel', function () {
		if (!dragging || !activePanel) {
			dragging = false;
			activePanel = null;
			return;
		}

		const shouldDismiss = currentX > DISMISS_THRESHOLD;

		if (shouldDismiss) {
			// Keep the current inline "right: -xxxpx" and just add the closed class
			// → the panel continues sliding out smoothly with CSS transition
			activePanel.css({
				transition: 'right 0s ease, transform 0.2s ease, visibility 0.2s ease'
			});
			closePanels();
		} else {
			// Snap back to open
			activePanel.css({
				right: 0,
				transition: 'right 0.2s ease, transform 0.2s ease, visibility 0.2s ease'
			});
		}

		dragging = false;
		activePanel = null;
		currentX = 0;
	});

	$('.saCloseModal').on('click', closePanels);


	let $lastScrollTop = 0;
	let $header = $('#pageheader');
	let $headerHeight = 88; //$header.outerHeight();
	let $isScrolling = false;

	$(window).on('scroll', function () {
		if (!$isScrolling) {
			$isScrolling = true;
			requestAnimationFrame(handleScroll);
		}
	});

	function handleScroll() {
		let scrollTop = $(window).scrollTop();
		let delta = scrollTop - $lastScrollTop; // Scroll direction (+ = down, - = up)

		let currentTransform = $header.css('transform');
		let currentTranslateY = 0;
		if (currentTransform && currentTransform !== 'none') {
			// matrix(a, b, c, d, tx, ty) -> ty is at index 5
			let parts = currentTransform.split(',');
			currentTranslateY = parseFloat(parts[5]) || 0;
		}

		let newTranslateY;

		if (scrollTop <= $headerHeight) {
			newTranslateY = 0;
		} else {
			if (delta > 0) {
				newTranslateY = Math.max(-$headerHeight, currentTranslateY - delta);
			} else {
				newTranslateY = Math.min(0, currentTranslateY - delta);
			}
		}

		// apply translate
		$header.css('transform', 'translateY(' + newTranslateY + 'px)');

		// Add/remove class when header is fully hidden
		if (newTranslateY <= -$headerHeight) {
			$header.addClass('saHidden');
			$header.css('pointer-events', 'none');
		} else {
			$header.removeClass('saHidden');
			$header.css('pointer-events', '');
		}

		$lastScrollTop = scrollTop;
		$isScrolling = false;
	}
});
