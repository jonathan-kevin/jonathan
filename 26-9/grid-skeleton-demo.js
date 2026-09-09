(() => {
	const gridTemplate = document.querySelector("#GridPageTemplate");
	const status = document.querySelector("#GridLoadingStatus");

	if (!gridTemplate || !status) {
		return;
	}

	const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
	const getFrame = () => document.querySelector(".saRightFrameRoot");

	function setSkeletonState(frame, enabled) {
		frame.classList.toggle("saPageSkeleton", enabled);
		frame.toggleAttribute("aria-hidden", enabled);
		frame.toggleAttribute("inert", enabled);

		const trigger = frame.querySelector("#ReplaySkeleton");
		if (trigger) trigger.disabled = enabled;
	}

	function prepareGridPage(frame) {
		const content = frame.querySelector(".scrollcontent-inner");
		const title = frame.querySelectorAll(".saHeaderText");
		const breadcrumbs = frame.querySelector(".saBreadcrumbs");
		const triggerLabel = frame.querySelector("#ReplaySkeleton .saButtonText");

		content.replaceChildren(gridTemplate.content.cloneNode(true));
		title.forEach(element => {
			element.textContent = "Grid";
		});

		if (breadcrumbs) {
			breadcrumbs.innerHTML = `
				<div class="saBackButtonWrapper">
					<button class="saBackButton" type="button" aria-label="Close Grid">
						<i class="far fa-arrow-left saBack saIcon" aria-hidden="true"></i>
					</button>
				</div>
				<span class="saBreadcrumb" style="display: none;">
					<a tabindex="0">…</a>
					<div>
						<ul class="saContextMenu">
							<li class="saOptionWrapper" style="display: none;">
								<a tabindex="0"><div class="saOption"><span class="saOptionText">Menu items</span></div></a>
							</li>
						</ul>
					</div>
				</span>
				<span class="saBreadcrumb">
					<a tabindex="0">Menu items</a>
				</span>`;
		}

		if (triggerLabel) {
			triggerLabel.textContent = "Replay skeleton loading";
		}
	}

	async function transition(update) {
		if (!document.startViewTransition) {
			update();
			return;
		}

		const viewTransition = document.startViewTransition(update);

		try {
			await viewTransition.finished;
		} catch {
			// A skipped animation must never prevent the page update.
		}
	}

	async function revealGrid(frame) {
		await wait(1400);
		await transition(() => setSkeletonState(frame, false));
		status.textContent = "Grid loaded";
	}

	async function openGrid() {
		const frame = getFrame();

		if (!frame || frame.classList.contains("saPageSkeleton")) {
			return;
		}

		status.textContent = "Loading Grid…";

		await transition(() => {
			prepareGridPage(frame);
			setSkeletonState(frame, true);
		});

		await revealGrid(frame);
	}

	async function replayLoading() {
		const frame = getFrame();

		if (!frame || frame.classList.contains("saPageSkeleton")) {
			return;
		}

		status.textContent = "Loading Grid…";
		await transition(() => setSkeletonState(frame, true));
		await revealGrid(frame);
	}

	document.addEventListener("click", event => {
		if (event.target.closest("#OpenGridDemo")) {
			event.preventDefault();
			openGrid();
			return;
		}

		if (event.target.closest("#ReplaySkeleton")) {
			replayLoading();
		}
	});

	document.addEventListener("keydown", event => {
		if ((event.key === "Enter" || event.key === " ") && event.target.closest("#OpenGridDemo")) {
			event.preventDefault();
			openGrid();
		}
	});
})();

