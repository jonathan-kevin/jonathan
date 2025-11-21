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
	const $dlg = $(".saSideBarOuter");
	let startX = 0;
	let currentX = 0;
	let dragging = false;


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

	$(".saNotifications").click(function () {
		$('.saPopupOverlay').show();
		$('.saNotificationsWrapper').removeClass('saClosed');
		$('html').css('overflow', 'hidden');
		$('.saNotificationsWrapper').css({
			right: "0",
			transition: "ease right 0s, ease transform 0.2s, ease visibility 0.2s"
		});

	});

	$(".saCloseModal").click(function () {
		$('.saPopupOverlay').hide();
		$('.saNotificationsWrapper').addClass('saClosed');
		$('html').css('overflow', 'auto');
	});

	$(".saNavigator").click(function () {
		$dlg.toggleClass("saClosed");

		if (!$dlg.hasClass("saClosed")) {
			$dlg.css({
				right: "0",
				transition: "ease right 0s, ease transform 0.2s, ease visibility 0.2s"
			});
			$('html').css('overflow', 'hidden');
			$('.saPopupOverlay').show();
		} else {
			$('html').css('overflow', 'auto');
			$('.saPopupOverlay').hide();
		}
	});

	function getClientX(e) {
		const ev = e.originalEvent || e;
		if (ev.touches && ev.touches.length) {
			return ev.touches[0].clientX;
		}
		if (ev.changedTouches && ev.changedTouches.length) {
			return ev.changedTouches[0].clientX;
		}
		return ev.clientX;
	}

	$dlg.on("mousedown touchstart", function (e) {
		dragging = true;
		startX = getClientX(e);
	});
	$('.saNotificationsWrapper').on("mousedown touchstart", function (e) {
		dragging = true;
		startX = getClientX(e);
	});

	$(document).on("mousemove touchmove", function (e) {
		if (!dragging) return;

		currentX = getClientX(e) - startX;

		if (currentX > 0) {
			$dlg.css("right", `-${currentX}px`);
			$('.saNotificationsWrapper').css("right", `-${currentX}px`);
		}
	});

	$(document).on("mouseup touchend", function () {
		if (!dragging) return;
		dragging = false;

		// threshold before dismissing
		if (currentX > 120) {
			$dlg.addClass("saClosed");
			$('.saNotificationsWrapper').addClass('saClosed');

			$('html').css('overflow', 'auto');
			$('.saPopupOverlay').hide();

		} else {
			// snap back
			$dlg.css({
				right: "0",
				transition: "ease right 0.2s, ease transform 0.2s, ease visibility 0.2s"
			});
			$('.saNotificationsWrapper').css({
				right: "0",
				transition: "ease right 0.2s, ease transform 0.2s, ease visibility 0.2s"
			});
		}

		currentX = 0;
	});


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
