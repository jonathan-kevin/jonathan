(() => {
	const grid = document.querySelector(".saGrid");
	if (!grid) return;

	const headings = Array.from(grid.querySelectorAll("thead .saGridHeadingRow th")).slice(1);
	const rows = Array.from(grid.querySelectorAll("tbody > tr.saGridRow"));
	const tbody = grid.tBodies[0];
	const hitCounter = document.querySelector(".saGridHitCounter");
	const originalCount = hitCounter?.firstChild?.nodeValue;
	const filters = new Map();
	const conditions = new Map();
	let sortColumn = -1;
	let sortDirection = 1;
	let activeTrigger = null;
	let menu = null;

	const cellValue = (row, column) => row.cells[column + 1]?.textContent.trim() ?? "";
	const labels = headings.map((heading) => heading.querySelector(".saGridHeadingLabel")?.textContent.trim() ?? "Column");
	const columnKind = (column) => /date/i.test(labels[column]) ? "date" : ["Age", "Weight"].includes(labels[column]) ? "number" : "text";
	const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
	const operators = {
		text: [["contains", "Contains"], ["notContains", "Does not contain"], ["equals", "Is exactly"], ["notEquals", "Is not exactly"], ["startsWith", "Starts with"], ["endsWith", "Ends with"], ["blank", "Is empty"], ["notBlank", "Is not empty"]],
		number: [["equals", "Is equal to"], ["notEquals", "Is not equal to"], ["greaterThan", "Is greater than"], ["atLeast", "Is at least"], ["lessThan", "Is less than"], ["atMost", "Is at most"], ["between", "Is between"], ["blank", "Is empty"], ["notBlank", "Is not empty"]],
		date: [["equals", "Is on"], ["notEquals", "Is not on"], ["greaterThan", "Is after"], ["lessThan", "Is before"], ["between", "Is between"], ["blank", "Is empty"], ["notBlank", "Is not empty"]]
	};

	function matchesCondition(column, value, condition) {
		const kind = columnKind(column);
		const parsed = kind === "date" ? Date.parse(value) : kind === "number"
			? parseFloat(value) * (labels[column] === "Age" && value.includes("year") ? 12 : labels[column] === "Weight" && value.includes("kg") ? 1000 : 1)
			: value.trim().toLocaleLowerCase();
		const blank = kind === "text" ? parsed === "" : Number.isNaN(parsed);
		if (condition.operator === "blank") return blank;
		if (condition.operator === "notBlank") return !blank;
		if (blank) return false;
		const entered = kind === "date" ? Date.parse(condition.value) : kind === "number"
			? Number(condition.value) * (labels[column] === "Age" ? 12 : 1)
			: condition.value.trim().toLocaleLowerCase();
		const second = kind === "date" ? Date.parse(condition.second) : kind === "number"
			? Number(condition.second) * (labels[column] === "Age" ? 12 : 1)
			: condition.second.trim().toLocaleLowerCase();
		switch (condition.operator) {
			case "contains": return parsed.includes(entered);
			case "notContains": return !parsed.includes(entered);
			case "startsWith": return parsed.startsWith(entered);
			case "endsWith": return parsed.endsWith(entered);
			case "equals": return parsed === entered;
			case "notEquals": return parsed !== entered;
			case "greaterThan": return parsed > entered;
			case "atLeast": return parsed >= entered;
			case "lessThan": return parsed < entered;
			case "atMost": return parsed <= entered;
			case "between": return parsed >= Math.min(entered, second) && parsed <= Math.max(entered, second);
			default: return true;
		}
	}
	function compareValues(column, first, second) {
		if (/date/i.test(labels[column])) {
			const firstDate = Date.parse(first);
			const secondDate = Date.parse(second);
			if (Number.isNaN(firstDate)) return Number.isNaN(secondDate) ? 0 : 1;
			if (Number.isNaN(secondDate)) return -1;
			return firstDate - secondDate;
		}
		if (labels[column] === "Age") return parseFloat(first) * (first.includes("year") ? 12 : 1) - parseFloat(second) * (second.includes("year") ? 12 : 1);
		if (labels[column] === "Weight") return parseFloat(first) * (first.includes("kg") ? 1000 : 1) - parseFloat(second) * (second.includes("kg") ? 1000 : 1);
		return collator.compare(first, second);
	}
	const values = headings.map((_, column) => [...new Set(rows.map((row) => cellValue(row, column)))].sort((a, b) => compareValues(column, a, b)));

	const emptyRow = document.createElement("tr");
	emptyRow.className = "saGridFilterEmpty";
	emptyRow.innerHTML = `<td colspan="${headings.length + 1}">No birds match the current filters.</td>`;
	emptyRow.hidden = true;
	tbody.append(emptyRow);

	function refresh() {
		let visibleCount = 0;
		for (const row of rows) {
			row.hidden = [...filters].some(([column, allowed]) => !allowed.has(cellValue(row, column)))
				|| [...conditions].some(([column, condition]) => !matchesCondition(column, cellValue(row, column), condition));
			if (!row.hidden) visibleCount++;
		}
		emptyRow.hidden = visibleCount !== 0;
		if (hitCounter && originalCount != null) {
			hitCounter.firstChild.nodeValue = filters.size || conditions.size ? `${visibleCount} of ${rows.length} records` : originalCount;
		}
		headings.forEach((heading, column) => {
			const trigger = heading.querySelector(".saGridFilterTrigger");
			const active = filters.has(column) || conditions.has(column);
			trigger.classList.toggle("saFiltered", active);
			const sorting = sortColumn === column ? `, sorted ${sortDirection === 1 ? "ascending" : "descending"}` : "";
			trigger.setAttribute("aria-label", `Filter ${labels[column]}${active ? ", active" : ""}${sorting}`);
		});
		grid.dispatchEvent(new Event("table-filter-change"));
	}

	function closeMenu(restoreFocus = false) {
		if (!menu) return;
		menu.remove();
		menu = null;
		activeTrigger.setAttribute("aria-expanded", "false");
		if (restoreFocus) activeTrigger.focus();
		activeTrigger = null;
	}

	function option(label, icon, checked, action) {
		const item = document.createElement("li");
		item.setAttribute("role", "none");
		const button = document.createElement("button");
		button.type = "button";
		button.className = "saOptionWrapper";
		button.setAttribute("role", "menuitemradio");
		button.setAttribute("aria-checked", String(checked));
		button.innerHTML = `<span class="saOption"><span class="saIconHolder saOptionIcon"><i class="far fad ${icon} saIcon" aria-hidden="true"></i></span><span class="saOptionText"></span></span>`;
		button.querySelector(".saOptionText").textContent = label;
		button.addEventListener("click", action);
		item.append(button);
		return item;
	}

	function openMenu(column, trigger) {
		if (menu) closeMenu();
		activeTrigger = trigger;
		trigger.setAttribute("aria-expanded", "true");
		const selected = new Set(filters.get(column) ?? values[column]);
		let selectionTouched = false;
		menu = document.createElement("div");
		menu.className = "saContextMenu saSouth saOpen saGridFilterMenu";
		menu.id = "saGridFilterMenu";
		menu.setAttribute("role", "dialog");
		menu.setAttribute("aria-label", `Filter ${labels[column]}`);
		menu.innerHTML = `
			<ul class="saActionLinkList saGridFilterActions" role="menu" aria-label="Sort ${labels[column]}"></ul>
			<div class="saGridFilterCondition" role="group" aria-label="Filter by condition">
				<label class="saInputTextWrapper">
					<select class="saInputText saDropdown saGridFilterOperator" aria-label="Condition for ${labels[column]}"><option value="">(None)</option></select>
					<div class="saTrailingIconsWrapper"><i aria-hidden="true" class="saIcon far fa-angle-down"></i></div>
				</label>
				<div class="saGridFilterConditionInputs">
					<label class="saInputTextWrapper"><input class="saInputText saGridFilterConditionValue" aria-label="${labels[column]} condition value"></label>
					<label class="saInputTextWrapper"><input class="saInputText saGridFilterConditionSecond" aria-label="${labels[column]} second condition value"></label>
				</div>
				<span class="saGridFilterConditionHint"></span>
			</div>
			<label class="saInputTextWrapper saGridFilterSearch"><input type="search" class="saInputText" placeholder="Search values" aria-label="Search ${labels[column]} values"></label>
			<label class="saGridFilterSelectAll"><input type="checkbox" class="saCheckbox"> <span>Select all</span></label>
			<div class="saGridFilterValues"></div>
			<div class="saGridFilterFooter"><button type="button" class="saGridFilterApply saDefaultButtonPrimary">Apply</button><button type="button" class="saDefaultButtonSecondary saGridFilterClear">Clear filter</button></div>`;
		const actions = menu.querySelector(".saGridFilterActions");
		const ascending = option("Sort A to Z", "fa-arrow-down-a-z", sortColumn === column && sortDirection === 1, () => sortRows(column, 1));
		const descending = option("Sort Z to A", "fa-arrow-up-z-a", sortColumn === column && sortDirection === -1, () => sortRows(column, -1));
		actions.append(ascending, descending);
		const kind = columnKind(column);
		const savedCondition = conditions.get(column);
		const conditionSelect = menu.querySelector(".saGridFilterOperator");
		const conditionValue = menu.querySelector(".saGridFilterConditionValue");
		const conditionSecond = menu.querySelector(".saGridFilterConditionSecond");
		const conditionHint = menu.querySelector(".saGridFilterConditionHint");
		for (const [value, label] of operators[kind]) conditionSelect.add(new Option(label, value));
		conditionSelect.value = savedCondition?.operator ?? "";
		conditionValue.type = kind === "date" ? "date" : kind === "number" ? "number" : "text";
		conditionSecond.type = conditionValue.type;
		if (kind === "number") {
			conditionValue.step = "any";
			conditionSecond.step = "any";
		}
		conditionValue.value = savedCondition?.value ?? "";
		conditionSecond.value = savedCondition?.second ?? "";
		conditionHint.textContent = labels[column] === "Age" ? "Enter age in years" : labels[column] === "Weight" ? "Enter weight in grams" : "";
		function updateConditionInputs() {
			const needsValue = conditionSelect.value !== "" && !["blank", "notBlank"].includes(conditionSelect.value);
			const needsSecond = conditionSelect.value === "between";
			conditionValue.hidden = !needsValue;
			conditionValue.disabled = !needsValue;
			conditionValue.required = needsValue;
			conditionSecond.hidden = !needsSecond;
			conditionSecond.disabled = !needsSecond;
			conditionSecond.required = needsSecond;
			conditionHint.hidden = !needsValue || !conditionHint.textContent;
		}
		conditionSelect.addEventListener("change", () => {
			updateConditionInputs();
			if (!conditionValue.hidden) conditionValue.focus();
		});
		updateConditionInputs();
		const search = menu.querySelector("input[type='search']");
		const selectAll = menu.querySelector(".saGridFilterSelectAll input");
		const list = menu.querySelector(".saGridFilterValues");

		function renderValues() {
			const query = search.value.trim().toLocaleLowerCase();
			const matches = values[column].filter((value) => value.toLocaleLowerCase().includes(query));
			list.replaceChildren();
			for (const value of matches) {
				const label = document.createElement("label");
				label.className = "saGridFilterValue";
				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.className = "saCheckbox";
				checkbox.checked = selected.has(value);
				checkbox.addEventListener("change", () => {
					selectionTouched = true;
					if (checkbox.checked) selected.add(value);
					else selected.delete(value);
					updateSelectAll();
				});
				const text = document.createElement("span");
				text.textContent = value || "(Blank)";
				label.append(checkbox, text);
				list.append(label);
			}
			if (!matches.length) {
				const noValues = document.createElement("div");
				noValues.className = "saGridFilterNoValues";
				const icon = document.createElement("i");
				icon.className = "saIcon far fad fa-search";
				const message = document.createElement("span");
				message.textContent = "No matching values";
				noValues.append(icon, message);
				list.append(noValues);
			}
			updateSelectAll();
		}

		function updateSelectAll() {
			const shown = values[column].filter((value) => value.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()));
			const count = shown.filter((value) => selected.has(value)).length;
			selectAll.checked = shown.length > 0 && count === shown.length;
			selectAll.indeterminate = count > 0 && count < shown.length;
			selectAll.disabled = shown.length === 0;
		}

		search.addEventListener("input", renderValues);
		selectAll.addEventListener("change", () => {
			selectionTouched = true;
			for (const value of values[column]) {
				if (!value.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase())) continue;
				if (selectAll.checked) selected.add(value);
				else selected.delete(value);
			}
			renderValues();
		});
		menu.querySelector(".saGridFilterClear").addEventListener("click", () => {
			filters.delete(column);
			conditions.delete(column);
			refresh();
			closeMenu(true);
		});
		menu.querySelector(".saGridFilterApply").addEventListener("click", () => {
			if (!conditionValue.disabled && !conditionValue.reportValidity()) return;
			if (!conditionSecond.disabled && !conditionSecond.reportValidity()) return;
			const query = search.value.trim().toLocaleLowerCase();
			const applied = query && !selectionTouched
				? new Set(values[column].filter((value) => value.toLocaleLowerCase().includes(query)))
				: selected;
			if (applied.size === values[column].length) filters.delete(column);
			else filters.set(column, applied);
			if (conditionSelect.value) conditions.set(column, {
				operator: conditionSelect.value,
				value: conditionValue.value,
				second: conditionSecond.value
			});
			else conditions.delete(column);
			refresh();
			closeMenu(true);
		});
		menu.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				closeMenu(true);
			}
		});
		document.body.append(menu);
		renderValues();
		const rect = trigger.getBoundingClientRect();
		const menuWidth = menu.getBoundingClientRect().width;
		menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8))}px`;
		menu.style.top = `${Math.min(rect.bottom + 4, window.innerHeight - Math.min(menu.scrollHeight, window.innerHeight - 16) - 8)}px`;
		search.focus();
	}

	function sortRows(column, direction) {
		sortColumn = column;
		sortDirection = direction;
		rows.sort((a, b) => {
			const first = cellValue(a, column);
			const second = cellValue(b, column);
			return compareValues(column, first, second) * direction;
		});
		for (const row of rows) tbody.insertBefore(row, emptyRow);
		headings.forEach((heading, index) => {
			heading.querySelector(".saGridFilterTrigger").dataset.sortDirection = index === sortColumn ? (sortDirection === 1 ? "asc" : "desc") : "";
		});
		refresh();
		closeMenu(true);
	}

	headings.forEach((heading, column) => {
		const trigger = document.createElement("button");
		trigger.type = "button";
		trigger.className = "saGridFilterTrigger";
		trigger.setAttribute("aria-haspopup", "dialog");
		trigger.setAttribute("aria-expanded", "false");
		trigger.setAttribute("aria-label", `Filter ${labels[column]}`);
		trigger.innerHTML = '<i class="far fad fa-filter saIcon" aria-hidden="true"></i><i class="fas fa-filter saIcon" aria-hidden="true"></i>';
		heading.querySelector(".saGridHeadingInner")?.after(trigger);
		trigger.addEventListener("click", () => {
			if (activeTrigger === trigger) closeMenu(true);
			else openMenu(column, trigger);
		});
	});

	document.addEventListener("pointerdown", (event) => {
		if (menu && !menu.contains(event.target) && !activeTrigger.contains(event.target)) closeMenu();
	});
	window.addEventListener("resize", () => closeMenu());
	window.addEventListener("scroll", (event) => {
		if (menu && !menu.contains(event.target)) closeMenu();
	}, true);
	refresh();
})();
