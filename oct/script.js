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

});
