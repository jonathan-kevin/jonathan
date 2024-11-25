var title = $("<title>Jonathan</title>");

var style = $("<link>", {
	rel: "stylesheet",
	href: "./src/style/screen.template.css?version=#",
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
function reloadCSS() {
	const links = document.getElementsByTagName("link");

	Array.from(links)
		.filter((link) => link.rel.toLowerCase() === "stylesheet" && link.href)
		.forEach((link) => {
			const url = new URL(link.href, location.href);
			url.searchParams.set("forceReload", Date.now());
			link.href = url.href;
		});
}

$(document).keydown(function (event) {
	if (event.altKey && event.keyCode === 82) {
		event.preventDefault();
		reloadCSS();
	}
});

$(document).ready(function () {
	var theToggler = $("<button>", {
		id: "theToggler",
		text: "Compact",
	});

	$("body").addClass("saPc saLargeScreen saCompact").append(theToggler);

	function toggleClasses() {
		if ($("body").hasClass("saStandard")) {
			$("body").removeClass("saStandard").addClass("saCompact saPc saLargeScreen");
			$("#theToggler").text("Compact");
		}
		else if ($("body").hasClass("saCompact")) {
			$("body").removeClass("saCompact saPc saLargeScreen").addClass("saSmallScreen");
			$("#theToggler").text("SmallScreen");
		}
		else {
			$("body").removeClass("saSmallScreen").addClass("saStandard saPc saLargeScreen");
			$("#theToggler").text("Standard");
		}
	}

	$("#theToggler").click(function () {
		toggleClasses();
	});
});
