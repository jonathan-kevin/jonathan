var title = $("<title>Jonathan</title>");

var style = $("<link>", {
	rel: "stylesheet",
	href: "./src/style/screen.template.css",
});

var fontawesome = $("<link>", {
	rel: "stylesheet",
	href: "./src/fontawesome/css/all.css",
});

var favicon = $("<link>", {
	rel: "icon",
	type: "image/png",
	size: "16x16",
	href: "./src/img/favicon.png",
});

$("head").append(style, fontawesome, favicon, title);


$(document).ready(function () {
	var slug = window.location.pathname + window.location.search + window.location.hash;
	var path = slug.toLowerCase()
	console.log(path);

	var theToggler = $("<button>", {
		id: "theToggler",
		text: "Compact",
		title: "Toggle between saStandard, saCompact and saSmallScreen"
	});

	const $body = $(".right.standardview, body");
	const $sideBar = $(".saSideBar");

	$($body).addClass("saPc saLargeScreen saCompact");
	$('body').append(theToggler);

	setTimeout(() => {
		if (path.includes("smallscreen")) {
			$($body).removeClass().addClass("saSmallScreen smallscreen");
			$("#theToggler").text("SmallScreen");
		} else if (path.includes("standard")) {
			$($body).removeClass().addClass("saStandard saPc saLargeScreen");
			$("#theToggler").text("Standard");
		} else if (path.includes("compact")) {
			$($body).removeClass().addClass("saCompact saPc saLargeScreen");
			$("#theToggler").text("Compact");
		}
	}, 200);

	function toggleClasses() {
		if ($($body).hasClass("saStandard")) {
			$($body).removeClass("saStandard").addClass("saCompact saPc saLargeScreen");
			$("#theToggler").text("Compact");
		} else if ($($body).hasClass("saCompact")) {
			$($body).removeClass("saCompact saPc saLargeScreen").addClass("saSmallScreen smallscreen");
			$("#theToggler").text("SmallScreen");
		} else {
			$($body).removeClass("saSmallScreen smallscreen").addClass("saStandard saPc saLargeScreen");
			$("#theToggler").text("Standard");
		}
	}

	$("#theToggler").click(function () {
		toggleClasses();
	});

	$('.saExpander').click(function (e) {
		e.preventDefault();
		if ($sideBar.hasClass("saExpanded")) {
			$sideBar.removeClass("saExpanded").addClass("saMinimized");
		} else {
			$sideBar.removeClass("saMinimized").addClass("saExpanded");
		}
	});
});

