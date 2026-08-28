(function () {
	let stage = 1;
	let matchingTimer = null;

	function syncViewport() {
		const small = window.innerWidth < 760;
		[document.body, document.getElementById('body')].forEach(element => {
			if (!element) return;
			element.classList.toggle('saSmallScreen', small);
			element.classList.toggle('saLargeScreen', !small);
		});
	}

	function setStage(nextStage) {
		stage = nextStage;
		document.querySelectorAll('[data-stage]').forEach(button => {
			const buttonStage = Number(button.dataset.stage);
			button.classList.toggle('is-active', buttonStage === stage);
			button.classList.toggle('is-complete', buttonStage < stage);
		});
		document.querySelector('[data-results]')?.classList.toggle('is-visible', stage >= 2);
		document.querySelector('[data-confirmation]')?.classList.toggle('is-visible', stage >= 3);
	}

	function resetMatch() {
		window.clearInterval(matchingTimer);
		document.querySelectorAll('[data-criterion]').forEach(criterion => {
			criterion.classList.remove('is-running', 'is-complete');
			criterion.querySelector('b').textContent = '–';
		});
		document.querySelector('[data-match-summary]').textContent = 'Redo att scanna resurspoolen';
		document.querySelector('[data-match-time]').textContent = '00 sek';
		document.querySelectorAll('[data-candidate]').forEach(row => row.classList.remove('is-dispatched'));
		setStage(1);
	}

	function runMatch() {
		resetMatch();
		setStage(2);
		const criteria = Array.from(document.querySelectorAll('[data-criterion]'));
		let index = 0;
		document.querySelector('[data-match-summary]').textContent = 'Scannar 27 certifierade tekniker';
		matchingTimer = window.setInterval(() => {
			if (index > 0) {
				criteria[index - 1].classList.remove('is-running');
				criteria[index - 1].classList.add('is-complete');
				criteria[index - 1].querySelector('b').textContent = '✓';
			}
			if (index < criteria.length) {
				criteria[index].classList.add('is-running');
				criteria[index].querySelector('b').textContent = '…';
				index += 1;
				return;
			}
			window.clearInterval(matchingTimer);
			document.querySelector('[data-match-summary]').textContent = 'Behörighet ✓  Geografi ✓  Tillgänglighet ✓ → Match';
			document.querySelector('[data-match-time]').textContent = '8 sek';
		}, 500);
	}

	function dispatch(row) {
		document.querySelectorAll('[data-candidate]').forEach(candidate => candidate.classList.remove('is-dispatched'));
		row.classList.add('is-dispatched');
		document.querySelector('[data-dispatched-name]').textContent = row.dataset.candidate;
		setStage(3);
		document.querySelector('[data-confirmation]').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	function setSidebar(open) {
		const outer = document.querySelector('.saSideBarOuter');
		const sidebar = document.querySelector('.saSideBar');
		outer?.classList.toggle('saClosed', !open);
		sidebar?.classList.toggle('saExpanded', open || window.innerWidth >= 760);
		sidebar?.classList.toggle('saMinimized', !open && window.innerWidth < 760);
		document.querySelector('[data-sidebar-overlay]')?.classList.toggle('saVisible', open);
	}

	document.addEventListener('DOMContentLoaded', function () {
		syncViewport();
		setStage(1);
		document.querySelectorAll('[data-run-match]').forEach(button => button.addEventListener('click', runMatch));
		document.querySelectorAll('[data-reset-demo]').forEach(button => button.addEventListener('click', resetMatch));
		document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
			const requested = Number(button.dataset.stage);
			if (requested === 1) resetMatch();
			if (requested === 2) runMatch();
			if (requested === 3) dispatch(document.querySelector('[data-candidate]'));
		}));
		document.querySelectorAll('[data-dispatch]').forEach(button => button.addEventListener('click', () => dispatch(button.closest('tr'))));
		document.querySelector('[data-sidebar-toggle]')?.addEventListener('click', () => document.querySelector('.saSideBarOuter')?.classList.toggle('saClosed'));
		document.querySelector('[data-sidebar-open]')?.addEventListener('click', () => setSidebar(true));
		document.querySelector('[data-sidebar-close]')?.addEventListener('click', () => setSidebar(false));
		document.querySelector('[data-sidebar-overlay]')?.addEventListener('click', () => setSidebar(false));
		window.addEventListener('resize', syncViewport);
	});
}());
