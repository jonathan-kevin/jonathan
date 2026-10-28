(() => {
	const root = document.querySelector('#magicbox-experiment');
	const original = document.querySelector('softadmin-magicbox .saBoxGrid');
	if (!root || !original) return;
	const rows = [];
	for (const child of original.children) {
		if (child.classList.contains('saBoxRow')) rows.push([]);
		if (child.classList.contains('saContainersWrapper') && rows.length) {
			rows.at(-1).push([...child.querySelectorAll('.saBoxContainer')].map(container => ({
				heading: container.querySelector('.saBoxContainerHeading').innerText.trim(),
				staff: [...container.querySelectorAll('.saBox')].map(box => box.textContent.trim())
			})));
		}
	}
	const count = cell => Number(cell.heading.match(/(?:^|\s)(\d+)\s*$/)?.[1] ?? 0);
	const rowIndex = label => rows.findIndex(row => row[0][0].heading === label);
	const totalRow = rows[rowIndex('Station total')];
	const roleRows = ['Styrkeledare (Stf. och Ord.)', 'Brandman', 'Kompetens saknas', 'Semester/Komp', 'Ledig övrigt', 'Frånvarande', 'Ansöker om ledigt'].map(rowIndex);
	const skillsRow = roleRows[2];
	const staffing = cell => {
		const values = cell.heading.match(/(\d+)\s*\/\s*(\d+)/);
		return { total: Number(values[1]), minimum: Number(values[2]) };
	};
	const labels = Object.fromEntries(roleRows.map(index => [index, rows[index][0][0].heading]));
	const initial = rows[0].slice(2).map((heading, station) => ({
		name: heading[0].heading.split(/\s+/)[0],
		shifts: [0, 1].map(shift => ({
			...staffing(totalRow[station + 2][shift]),
			skills: count(rows[skillsRow][station + 2][shift]) || rows[skillsRow][station + 2][shift].staff.length,
			team: rows[1][station + 2][shift].heading.match(/\((\d+)\)/)?.[1] ?? '',
			roles: Object.fromEntries(roleRows.map(index => [index, [...rows[index][station + 2][shift].staff]]))
		}))
	}));
	let stations = structuredClone(initial);
	let history = [];
	let selected = null;
	const shiftNames = ['Dag', 'Natt'];
	const shiftHours = [11, 13];
	const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	const state = shift => shift.total < shift.minimum ? 'short' : shift.total > shift.minimum ? 'extra' : 'minimum';
	const status = shift => {
		const difference = shift.total - shift.minimum;
		return difference < 0 ? `Saknas ${-difference}` : difference > 0 ? `+${difference} över minimum` : 'Minimum uppnått';
	};
	const grid = root.querySelector('.mbStations');
	const search = root.querySelector('#mb-search');
	const filter = root.querySelector('#mb-short-only');
	const shiftFilter = root.querySelector('#mb-shift');
	const dialog = root.querySelector('dialog');
	const moveStation = root.querySelector('#mb-move-station');
	const moveShift = root.querySelector('#mb-move-shift');
	const moveRole = root.querySelector('#mb-move-role');
	moveStation.innerHTML = stations.map((station, index) => `<option value="${index}">${escape(station.name)}</option>`).join('');
	moveRole.innerHTML = roleRows.map(role => `<option value="${role}">${escape(labels[role])}</option>`).join('');
	function staffCell(stationIndex, shiftIndex, role) {
		const shift = stations[stationIndex].shifts[shiftIndex];
		const staff = shift.roles[role];
		const query = search.value.trim().toLowerCase();
		return `<div class="saBoxContainer mbShiftCell" data-shift="${shiftIndex}"><div class="saBoxesWrapper">${staff.length ? staff.map((id, index) => `<button type="button" class="saBox mbStaff${query && id.toLowerCase().includes(query) ? ' mbMatch' : ''}" data-station="${stationIndex}" data-shift="${shiftIndex}" data-role="${role}" data-index="${index}" aria-label="Flytta personal ${escape(id)}, ${escape(stations[stationIndex].name)}, ${shiftNames[shiftIndex]}, ${escape(labels[role])}">${escape(id)}</button>`).join('') : '<span class="mbEmpty">—</span>'}</div></div>`;
	}
	function render() {
		root.dataset.shift = shiftFilter.value;
		const visibleShifts = shiftFilter.value === 'both' ? [0, 1] : [Number(shiftFilter.value)];
		const query = search.value.trim().toLowerCase();
		let shown = 0;
		grid.innerHTML = stations.map((station, index) => {
			const matchingStaff = visibleShifts.some(s => Object.values(station.shifts[s].roles).flat().some(id => id.toLowerCase().includes(query)));
			if (query && !station.name.toLowerCase().includes(query) && !matchingStaff) return '';
			if (filter.checked && !visibleShifts.some(s => state(station.shifts[s]) === 'short')) return '';
			shown++;
			const absent = station.shifts.reduce((sum, shift) => sum + roleRows.slice(2).reduce((n, role) => n + shift.roles[role].length, 0), 0);
			return `<article class="mbStation" aria-label="Station ${escape(station.name)}"><header class="mbStationHeader"><h3>${escape(station.name)}</h3><span>Station</span></header>
			<div class="saContainersWrapper mbShiftPair">${station.shifts.map((shift, s) => `<div class="saBoxContainer mbShiftHeading" data-shift="${s}"><div><strong>${shiftNames[s]}</strong><span>${shiftHours[s]} h${shift.team ? ` · Team ${escape(shift.team)}` : ''}</span></div><div class="mbStaffing"><strong>${shift.total}</strong><span>/ ${shift.minimum} minimum</span></div><span class="mbStatus" data-status="${state(shift)}">${status(shift)}</span>${shift.skills ? `<span class="mbSkillWarning">Kompetens saknas: ${shift.skills}</span>` : ''}</div>`).join('')}</div>
			${[1, 2].map(role => `<section class="mbRole"><h4>${escape(labels[role])}</h4><div class="saContainersWrapper mbShiftPair">${[0, 1].map(s => staffCell(index, s, role)).join('')}</div></section>`).join('')}
			<details class="mbAbsence"${query && matchingStaff ? ' open' : ''}><summary>Kompetens, frånvaro & ledighet <span>${absent}</span></summary>${roleRows.slice(2).map(role => `<section class="mbRole"><h4>${escape(labels[role])}</h4><div class="saContainersWrapper mbShiftPair">${[0, 1].map(s => staffCell(index, s, role)).join('')}</div></section>`).join('')}</details></article>`;
		}).join('');
		root.querySelector('.mbResults').textContent = `${shown} av ${stations.length} stationer`;
		root.querySelector('.mbNoResults').hidden = shown !== 0;
		root.querySelector('#mb-undo').disabled = history.length === 0;
		root.querySelector('.mbChangeCount').textContent = history.length ? `${history.length} ändring${history.length === 1 ? '' : 'ar'} i förslaget` : 'Klicka på ett personal-ID för att flytta det.';
		root.querySelector('.mbTotals').innerHTML = [0, 1].map(s => {
			const aggregate = staffing(totalRow[1][s]);
			aggregate.total += stations.reduce((sum, station, i) => sum + station.shifts[s].total - initial[i].shifts[s].total, 0);
			const short = stations.filter(station => state(station.shifts[s]) === 'short').length;
			return `<div class="mbTotal" data-shift="${s}"><span>${shiftNames[s]} · ${shiftHours[s]} timmar</span><div><strong>${aggregate.total}</strong><span>/ ${aggregate.minimum} minimum</span><span class="mbStatus" data-status="${state(aggregate)}">${status(aggregate)}</span></div><small>${short} station${short === 1 ? '' : 'er'} under minimum</small></div>`;
		}).join('');
	}
	search.addEventListener('input', render);
	search.addEventListener('keydown', event => { if (event.key === 'Enter') event.preventDefault(); });
	filter.addEventListener('change', render);
	shiftFilter.addEventListener('change', render);
	grid.addEventListener('click', event => {
		const button = event.target.closest('.mbStaff');
		if (!button) return;
		selected = { station: Number(button.dataset.station), shift: Number(button.dataset.shift), role: Number(button.dataset.role), index: Number(button.dataset.index), id: button.textContent };
		root.querySelector('#mb-move-title').textContent = `Flytta personal ${selected.id}`;
		root.querySelector('.mbMoveFrom').textContent = `${stations[selected.station].name} · ${shiftNames[selected.shift]} · ${labels[selected.role]}`;
		moveStation.value = selected.station;
		moveShift.value = selected.shift;
		moveRole.value = selected.role;
		root.querySelector('.mbMoveError').textContent = '';
		dialog.showModal();
	});
	root.querySelector('#mb-cancel').addEventListener('click', () => dialog.close());
	root.querySelector('#mb-confirm').addEventListener('click', () => {
		if (!selected) return;
		const target = { station: Number(moveStation.value), shift: Number(moveShift.value), role: Number(moveRole.value) };
		if (target.station === selected.station && target.shift === selected.shift && target.role === selected.role) {
			root.querySelector('.mbMoveError').textContent = 'Välj en annan station, ett annat pass eller en annan placering.';
			return;
		}
		const destination = stations[target.station].shifts[target.shift];
		if (Object.values(destination.roles).flat().includes(selected.id)) {
			root.querySelector('.mbMoveError').textContent = 'Personalen finns redan på den stationen och det passet.';
			return;
		}
		history.push(structuredClone(stations));
		const source = stations[selected.station].shifts[selected.shift];
		source.roles[selected.role].splice(selected.index, 1);
		destination.roles[target.role].push(selected.id);
		if ([1, 2].includes(selected.role)) source.total--;
		if ([1, 2].includes(target.role)) destination.total++;
		if (selected.role === skillsRow) source.skills--;
		if (target.role === skillsRow) destination.skills++;
		dialog.close();
		render();
		const moved = [...grid.querySelectorAll('.mbStaff')].find(button => Number(button.dataset.station) === target.station && Number(button.dataset.shift) === target.shift && Number(button.dataset.role) === target.role && button.textContent === selected.id);
		if (moved) { moved.closest('details')?.setAttribute('open', ''); moved.focus(); }
		else root.querySelector('#mb-undo').focus();
		root.querySelector('.mbAnnouncement').textContent = `Personal ${selected.id} flyttad till ${stations[target.station].name}, ${shiftNames[target.shift]}, ${labels[target.role]}.`;
	});
	root.querySelector('#mb-undo').addEventListener('click', () => {
		if (!history.length) return;
		stations = history.pop();
		render();
		root.querySelector('.mbAnnouncement').textContent = 'Senaste flytten ångrad.';
	});
	render();
})();
