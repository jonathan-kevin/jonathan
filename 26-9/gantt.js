(($) => {
	'use strict';

	const DAY_MS = 86400000;
	const HEADER_ROWS = 4;
	const ROW_HEIGHT_REM = 2;
	const LABEL_COLUMN_WIDTH_REM = 12.5;
	const ZOOM_WIDTHS = {
		day: 2,
		week: 1.5,
		month: 0.75,
		year: 0.375
	};
	const STATUSES = ['planned', 'active', 'review', 'blocked', 'complete'];
	const STORAGE_KEY = 'saGanttBookingsV2';
	const VIEW_STORAGE_KEY = 'saGanttViewV1';
	const HISTORY_LIMIT = 20;
	const now = new Date();
	const currentDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
	const displayYear = currentDate.getUTCFullYear();
	const startDate = new Date(Date.UTC(displayYear, 0, 1));
	const endDate = new Date(Date.UTC(displayYear, 11, 31));
	const dates = getDates(startDate, endDate);
	const dateFormatter = new Intl.DateTimeFormat('en', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});

	const defaultResources = [
		{
			id: 'product-design',
			name: 'Product design',
			bookings: [
				createSeedBooking('Research and concepts', 'complete', 0, 12, 0, 30),
				createSeedBooking('Interaction design', 'active', 8, 1, 8, 18)
			]
		},
		{
			id: 'user-research',
			name: 'User research',
			bookings: [createSeedBooking('Usability study', 'review', 8, 7, 8, 21)]
		},
		{
			id: 'backend-api',
			name: 'Backend API',
			bookings: [createSeedBooking('Scheduling endpoints', 'active', 7, 17, 9, 2)]
		},
		{
			id: 'web-app',
			name: 'Web application',
			bookings: [createSeedBooking('Gantt interface', 'active', 8, 1, 8, 25)]
		},
		{
			id: 'mobile-app',
			name: 'Mobile application',
			bookings: [createSeedBooking('Responsive adaptation', 'planned', 9, 1, 9, 20)]
		},
		{
			id: 'quality-assurance',
			name: 'Quality assurance',
			bookings: [createSeedBooking('Regression testing', 'planned', 9, 13, 10, 3)]
		},
		{
			id: 'infrastructure',
			name: 'Infrastructure',
			bookings: [createSeedBooking('Performance environment', 'complete', 6, 6, 6, 24)]
		},
		{
			id: 'analytics',
			name: 'Analytics',
			bookings: [createSeedBooking('Usage dashboard', 'review', 8, 14, 9, 4)]
		},
		{
			id: 'security',
			name: 'Security review',
			bookings: [createSeedBooking('Threat review', 'blocked', 9, 19, 9, 30)]
		},
		{
			id: 'documentation',
			name: 'Documentation',
			bookings: [createSeedBooking('User guide', 'planned', 10, 2, 10, 20)]
		},
		{
			id: 'launch',
			name: 'Launch operations',
			bookings: [createSeedBooking('Production rollout', 'planned', 11, 1, 11, 11)]
		},
		{
			id: 'support',
			name: 'Customer support',
			bookings: [createSeedBooking('Launch readiness', 'planned', 11, 7, 11, 18)]
		}
	];

	let resources = loadResources();
	let zoomLevel = 'week';
	let compactMode = false;
	let $container;
	let $grid;
	let dragState = null;
	let selectedBooking = null;
	let statusTimer = null;
	const undoStack = [];

	function parseDate(value) {
		return new Date(`${value}T00:00:00Z`);
	}

	function formatDate(date) {
		return date.toISOString().slice(0, 10);
	}

	function seedDate(month, day) {
		return formatDate(new Date(Date.UTC(displayYear, month, day)));
	}

	function createSeedBooking(title, status, startMonth, startDay, endMonth, endDay) {
		return {
			title,
			status,
			start: seedDate(startMonth, startDay),
			end: seedDate(endMonth, endDay)
		};
	}

	function cloneResources(value) {
		return JSON.parse(JSON.stringify(value));
	}

	function normalizedResources(value) {
		if (!Array.isArray(value) || !value.length) return null;

		const normalized = value
			.filter(resource => resource && typeof resource.name === 'string' && Array.isArray(resource.bookings))
			.map((resource, resourceIndex) => ({
				id: resource.id || `resource-${resourceIndex}`,
				name: resource.name,
				bookings: resource.bookings
					.filter(booking => booking && booking.start && booking.end)
					.map(booking => ({
						title: booking.title || 'Booking',
						status: STATUSES.includes(booking.status) ? booking.status : 'planned',
						start: booking.start,
						end: booking.end
					}))
			}));

		return normalized.length ? normalized : null;
	}

	function loadResources() {
		try {
			return normalizedResources(JSON.parse(localStorage.getItem(STORAGE_KEY))) || cloneResources(defaultResources);
		} catch {
			return cloneResources(defaultResources);
		}
	}

	function saveResources() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
		} catch {
			announce('Bookings changed, but this browser could not save them.');
		}
	}

	function loadViewPreferences() {
		try {
			const saved = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY));
			if (ZOOM_WIDTHS[saved?.zoomLevel]) zoomLevel = saved.zoomLevel;
			compactMode = Boolean(saved?.compactMode);
		} catch {
			// Keep defaults when preferences cannot be read.
		}
	}

	function saveViewPreferences() {
		try {
			localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({ zoomLevel, compactMode }));
		} catch {
			// View preferences are non-critical.
		}
	}

	function addDays(date, days) {
		return new Date(date.getTime() + (days * DAY_MS));
	}

	function daysBetween(first, second) {
		return Math.round((second.getTime() - first.getTime()) / DAY_MS);
	}

	function clamp(value, minimum, maximum) {
		return Math.min(Math.max(value, minimum), maximum);
	}

	function getDates(first, last) {
		const result = [];

		for (let date = first; date <= last; date = addDays(date, 1)) {
			result.push(date);
		}

		return result;
	}

	function getHeaderGroups(type) {
		const groups = [];
		let currentGroup = null;

		dates.forEach((date, column) => {
			const year = date.getUTCFullYear();
			const month = date.getUTCMonth();
			let key;
			let label;

			if (type === 'year') {
				key = String(year);
				label = key;
			} else if (type === 'quarter') {
				const quarter = Math.floor(month / 3) + 1;
				key = `${year}-Q${quarter}`;
				label = `Q${quarter}`;
			} else {
				key = `${year}-${month}`;
				label = date.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
			}

			if (!currentGroup || currentGroup.key !== key) {
				currentGroup = { key, label, start: column, span: 1 };
				groups.push(currentGroup);
			} else {
				currentGroup.span += 1;
			}
		});

		return groups;
	}

	function currentColumnWidthRem() {
		const compactScale = compactMode ? 0.75 : 1;
		return ZOOM_WIDTHS[zoomLevel] * compactScale;
	}

	function bookingColumns(booking) {
		return {
			start: clamp(daysBetween(startDate, parseDate(booking.start)), 0, dates.length - 1),
			end: clamp(daysBetween(startDate, parseDate(booking.end)), 0, dates.length - 1)
		};
	}

	function setGridPosition($element, row, startColumn, endColumn) {
		$element.css({
			gridColumn: `${startColumn + 2} / ${endColumn + 3}`,
			gridRow: row + HEADER_ROWS + 1
		});
	}

	function bookingDateRange(startColumn, endColumn) {
		const first = dateFormatter.format(dates[startColumn]);
		const last = dateFormatter.format(dates[endColumn]);
		return `${first}${startColumn === endColumn ? '' : ` – ${last}`}`;
	}

	function bookingLabel(resource, booking, startColumn, endColumn) {
		return `${booking.title} · ${resource.name} · ${bookingDateRange(startColumn, endColumn)}`;
	}

	function statusClass(status) {
		return `saGanttBookingStatus${status.charAt(0).toUpperCase()}${status.slice(1)}`;
	}

	function createBookingElement(resource, resourceIndex, booking, bookingIndex) {
		const columns = bookingColumns(booking);
		const label = bookingLabel(resource, booking, columns.start, columns.end);
		const $booking = $(`
			<div class="saGanttBooking" role="button" tabindex="0">
				<div class="saGanttHandle saGanttHandleLeft" aria-hidden="true"></div>
				<span class="saGanttBookingLabel"></span>
				<div class="saGanttHandle saGanttHandleRight" aria-hidden="true"></div>
			</div>
		`);

		$booking
			.addClass(statusClass(booking.status))
			.toggleClass(
				'saGanttBookingSelected',
				selectedBooking?.row === resourceIndex && selectedBooking?.bookingIndex === bookingIndex
			)
			.attr({
				'aria-label': `${label}. Drag to move, drag either edge to resize, or use the arrow keys.`,
				'aria-pressed': selectedBooking?.row === resourceIndex && selectedBooking?.bookingIndex === bookingIndex,
				'title': label,
				'data-row': resourceIndex,
				'data-booking-index': bookingIndex
			})
			.data({
				row: resourceIndex,
				bookingIndex,
				startColumn: columns.start,
				endColumn: columns.end
			});

		$booking.find('.saGanttBookingLabel').text(booking.title);
		setGridPosition($booking, resourceIndex, columns.start, columns.end);

		return $booking;
	}

	function createHeaderCell(label, row, startColumn, span, extraClass = '') {
		return $('<div role="columnheader"></div>')
			.addClass(`saGanttCell saGanttHeader ${extraClass}`)
			.attr({
				'aria-label': label,
				'data-header-row': row
			})
			.css({
				'--sa-gantt-header-row': row,
				gridColumn: `${startColumn + 2} / span ${span}`,
				gridRow: row + 1
			})
			.append($('<span></span>').text(label));
	}

	function render({ preserveScroll = true, focusSelector = null } = {}) {
		const previousScrollLeft = preserveScroll && $grid ? $grid.scrollLeft() : 0;
		const previousScrollTop = preserveScroll && $grid ? $grid.scrollTop() : 0;
		const columnWidth = currentColumnWidthRem();
		const zoomClass = `saGanttZoom${zoomLevel.charAt(0).toUpperCase()}${zoomLevel.slice(1)}`;
		const $nextGrid = $('<div class="saGanttGridInner" role="grid"></div>')
			.addClass(zoomClass)
			.toggleClass('saGanttCompactMode', compactMode)
			.attr({
				'aria-colcount': dates.length + 1,
				'aria-rowcount': resources.length + HEADER_ROWS,
				'aria-label': 'Resource booking schedule'
			})
			.css({
				'--sa-gantt-date-width': `${columnWidth}rem`,
				gridTemplateColumns: `${LABEL_COLUMN_WIDTH_REM}rem repeat(${dates.length}, ${columnWidth}rem)`,
				gridTemplateRows: `repeat(${HEADER_ROWS}, 1.875rem) repeat(${resources.length}, ${ROW_HEIGHT_REM}rem)`
			});

		['Year', 'Quarter', 'Month', 'Resource'].forEach((label, row) => {
			const $corner = createHeaderCell(label, row, -1, 1, 'saGanttCorner');
			$corner.css('gridColumn', '1');
			$nextGrid.append($corner);
		});

		['year', 'quarter', 'month'].forEach((level, row) => {
			getHeaderGroups(level).forEach(group => {
				$nextGrid.append(createHeaderCell(group.label, row, group.start, group.span));
			});
		});

		dates.forEach((date, column) => {
			$nextGrid.append(
				createHeaderCell(String(date.getUTCDate()), 3, column, 1, 'saGanttDayHeader')
					.attr({
						'aria-label': dateFormatter.format(date),
						'data-col': column
					})
					.toggleClass('saGanttTodayColumn', formatDate(date) === formatDate(currentDate))
			);
		});

		resources.forEach((resource, resourceIndex) => {
			const gridRow = resourceIndex + HEADER_ROWS + 1;

			$nextGrid.append(
				$('<div class="saGanttCell saGanttLabel" role="rowheader"></div>')
					.attr('data-row', resourceIndex)
					.css({ gridColumn: 1, gridRow })
					.append($('<span class="saGanttResourceName"></span>').text(resource.name))
			);

			dates.forEach((date, column) => {
				const $cell = $('<div class="saGanttCell saGanttCellBackground" role="gridcell" tabindex="-1"></div>')
					.attr({
						'aria-label': `${resource.name}, ${dateFormatter.format(date)}`,
						'data-row': resourceIndex,
						'data-col': column
					})
					.css({
						gridColumn: column + 2,
						gridRow
					})
					.toggleClass('saGanttTodayColumn', formatDate(date) === formatDate(currentDate));

				if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
					$cell.addClass('saGanttWeekend');
				}

				$nextGrid.append($cell);
			});

			resource.bookings.forEach((booking, bookingIndex) => {
				$nextGrid.append(createBookingElement(resource, resourceIndex, booking, bookingIndex));
			});
		});

		$container.empty().append($nextGrid);
		$grid = $nextGrid;
		$grid.scrollLeft(previousScrollLeft);
		$grid.scrollTop(previousScrollTop);

		const $focusTarget = focusSelector
			? $grid.find(focusSelector).first()
			: $grid.find('.saGanttCellBackground').first();
		$focusTarget.attr('tabindex', '0');

		if (focusSelector && $focusTarget.length) {
			$focusTarget[0].focus({ preventScroll: true });
		}

		updateToolbar();
		updateSelectionActions();
	}

	function remSize() {
		return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	}

	function columnWidthPx() {
		return currentColumnWidthRem() * remSize();
	}

	function labelWidthPx() {
		return LABEL_COLUMN_WIDTH_REM * remSize();
	}

	function pointerColumn(event) {
		const nativeEvent = event.originalEvent || event;
		const gridElement = $grid[0];
		const rect = gridElement.getBoundingClientRect();
		const dateAreaX = nativeEvent.clientX - rect.left + gridElement.scrollLeft - labelWidthPx();
		return clamp(Math.floor(dateAreaX / columnWidthPx()), 0, dates.length - 1);
	}

	function scrollToColumn(column, smooth = true) {
		const gridElement = $grid[0];
		const visibleDateWidth = Math.max(gridElement.clientWidth - labelWidthPx(), columnWidthPx());
		const target = labelWidthPx() + (column * columnWidthPx()) - (visibleDateWidth / 2);
		gridElement.scrollTo({
			left: Math.max(0, target),
			behavior: smooth ? 'smooth' : 'auto'
		});
	}

	function scrollToDate(value, smooth = true) {
		const date = parseDate(value);
		const column = daysBetween(startDate, date);

		if (Number.isNaN(column) || column < 0 || column >= dates.length) {
			announce('Choose a date within the displayed year.');
			return;
		}

		scrollToColumn(column, smooth);
		announce(`Showing ${dateFormatter.format(date)}.`);
	}

	function updateBookingPreview($booking, row, booking, startColumn, endColumn) {
		setGridPosition($booking, row, startColumn, endColumn);
		$booking.find('.saGanttBookingLabel').text(bookingDateRange(startColumn, endColumn));
	}

	function showDragTooltip(event, startColumn, endColumn, action) {
		const nativeEvent = event.originalEvent || event;
		let $tooltip = $('.saGanttDragTooltip');

		if (!$tooltip.length) {
			$tooltip = $('<div class="saGanttDragTooltip" role="tooltip"></div>').appendTo(document.body);
		}

		$tooltip
			.text(`${action}: ${bookingDateRange(startColumn, endColumn)}`)
			.css({
				left: `${nativeEvent.clientX + 14}px`,
				top: `${nativeEvent.clientY + 14}px`
			});
	}

	function hideDragTooltip() {
		$('.saGanttDragTooltip').remove();
	}

	function autoScroll(nativeEvent) {
		const element = $grid[0];
		const rect = element.getBoundingClientRect();
		const edgeSize = 48;
		const step = columnWidthPx();

		if (nativeEvent.clientX < rect.left + edgeSize) {
			element.scrollLeft -= step;
		} else if (nativeEvent.clientX > rect.right - edgeSize) {
			element.scrollLeft += step;
		}
	}

	function clearHighlights() {
		if (!$grid) return;
		$grid.find('.saGanttRowHighlight, .saGanttColumnHighlight')
			.removeClass('saGanttRowHighlight saGanttColumnHighlight');
	}

	function highlightCell(row, column) {
		clearHighlights();
		$grid.find(`[data-row="${row}"]`).addClass('saGanttRowHighlight');
		$grid.find(`[data-col="${column}"]`).addClass('saGanttColumnHighlight');
	}

	function beginCreate(event) {
		if (event.button !== 0) return;

		event.preventDefault();
		selectedBooking = null;
		updateSelectionActions();

		const $cell = $(event.currentTarget);
		const row = Number($cell.attr('data-row'));
		const column = Number($cell.attr('data-col'));
		const previewBooking = { title: 'New booking', status: 'planned' };
		const $preview = $(`
			<div class="saGanttBooking saGanttBookingPreview saGanttBookingStatusPlanned" aria-hidden="true">
				<span class="saGanttBookingLabel"></span>
			</div>
		`);

		dragState = {
			type: 'create',
			row,
			startColumn: column,
			endColumn: column,
			booking: previewBooking,
			$element: $preview
		};

		$grid.addClass('saGanttIsDragging').append($preview);
		updateBookingPreview($preview, row, previewBooking, column, column);
		showDragTooltip(event, column, column, 'Create');
	}

	function beginBookingDrag(event) {
		if (event.button !== 0) return;

		event.preventDefault();
		event.stopPropagation();

		const $booking = $(event.currentTarget);
		const row = Number($booking.attr('data-row'));
		const bookingIndex = Number($booking.attr('data-booking-index'));
		const booking = resources[row].bookings[bookingIndex];
		const columns = bookingColumns(booking);
		const $handle = $(event.target).closest('.saGanttHandle');
		let type = 'move';

		if ($handle.hasClass('saGanttHandleLeft')) type = 'resize-start';
		if ($handle.hasClass('saGanttHandleRight')) type = 'resize-end';

		selectBooking(row, bookingIndex);
		dragState = {
			type,
			row,
			bookingIndex,
			startColumn: columns.start,
			endColumn: columns.end,
			anchorOffset: pointerColumn(event) - columns.start,
			booking,
			$element: $booking
		};

		$booking.addClass('saGanttBookingDragging');
		$grid.addClass('saGanttIsDragging');
		showDragTooltip(event, columns.start, columns.end, type === 'move' ? 'Move' : 'Resize');
	}

	function updateDrag(event) {
		if (!dragState) return;

		event.preventDefault();
		const nativeEvent = event.originalEvent || event;
		autoScroll(nativeEvent);
		const column = pointerColumn(event);

		if (dragState.type === 'create') {
			dragState.previewStart = Math.min(dragState.startColumn, column);
			dragState.previewEnd = Math.max(dragState.startColumn, column);
		} else if (dragState.type === 'resize-start') {
			dragState.previewStart = Math.min(column, dragState.endColumn);
			dragState.previewEnd = dragState.endColumn;
		} else if (dragState.type === 'resize-end') {
			dragState.previewStart = dragState.startColumn;
			dragState.previewEnd = Math.max(column, dragState.startColumn);
		} else {
			const duration = dragState.endColumn - dragState.startColumn;
			const start = clamp(column - dragState.anchorOffset, 0, dates.length - duration - 1);
			dragState.previewStart = start;
			dragState.previewEnd = start + duration;
		}

		const startColumn = dragState.previewStart ?? dragState.startColumn;
		const endColumn = dragState.previewEnd ?? dragState.endColumn;
		updateBookingPreview(dragState.$element, dragState.row, dragState.booking, startColumn, endColumn);
		showDragTooltip(event, startColumn, endColumn, dragState.type === 'create' ? 'Create' : dragState.type === 'move' ? 'Move' : 'Resize');
	}

	function pushUndo() {
		undoStack.push(cloneResources(resources));
		if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
		updateToolbar();
	}

	function commit(message, focusSelector = null) {
		saveResources();
		render({ focusSelector });
		announce(message);
	}

	function finishDrag() {
		if (!dragState) return;

		const state = dragState;
		dragState = null;
		hideDragTooltip();

		const startColumn = state.previewStart ?? state.startColumn;
		const endColumn = state.previewEnd ?? state.endColumn;
		const changed = state.type === 'create'
			|| startColumn !== state.startColumn
			|| endColumn !== state.endColumn;

		if (!changed) {
			state.$element.removeClass('saGanttBookingDragging');
			$grid.removeClass('saGanttIsDragging');
			updateSelectionActions();
			return;
		}

		pushUndo();

		if (state.type === 'create') {
			const bookingIndex = resources[state.row].bookings.length;
			resources[state.row].bookings.push({
				title: 'New booking',
				status: 'planned',
				start: formatDate(dates[startColumn]),
				end: formatDate(dates[endColumn])
			});
			selectedBooking = { row: state.row, bookingIndex };
			commit(
				`Created New booking for ${resources[state.row].name}, ${bookingDateRange(startColumn, endColumn)}.`,
				`.saGanttBooking[data-row="${state.row}"][data-booking-index="${bookingIndex}"]`
			);
			return;
		}

		const booking = resources[state.row].bookings[state.bookingIndex];
		booking.start = formatDate(dates[startColumn]);
		booking.end = formatDate(dates[endColumn]);
		const action = state.type === 'move' ? 'Moved' : 'Resized';

		commit(
			`${action} ${booking.title} to ${bookingDateRange(startColumn, endColumn)}.`,
			`.saGanttBooking[data-row="${state.row}"][data-booking-index="${state.bookingIndex}"]`
		);
	}

	function cancelDrag() {
		if (!dragState) return;
		dragState = null;
		hideDragTooltip();
		render();
		announce('Edit cancelled.');
	}

	function selectBooking(row, bookingIndex) {
		selectedBooking = { row, bookingIndex };
		$grid.find('.saGanttBooking')
			.removeClass('saGanttBookingSelected')
			.attr('aria-pressed', 'false');
		$grid.find(`.saGanttBooking[data-row="${row}"][data-booking-index="${bookingIndex}"]`)
			.addClass('saGanttBookingSelected')
			.attr('aria-pressed', 'true');
		updateSelectionActions();
	}

	function selectedBookingData() {
		if (!selectedBooking) return null;
		const resource = resources[selectedBooking.row];
		const booking = resource?.bookings[selectedBooking.bookingIndex];
		return resource && booking ? { resource, booking, ...selectedBooking } : null;
	}

	function updateSelectionActions() {
		const selected = selectedBookingData();
		const $actions = $('.saGanttSelectionActions');

		$actions.prop('hidden', !selected);

		if (selected) {
			$('.saGanttSelectionLabel').text(`${selected.booking.title} · ${selected.resource.name}`);
		}
	}

	function updateToolbar() {
		$('.saGanttUndo').prop('disabled', undoStack.length === 0);
		$('.saGanttZoomLevels [data-zoom]').each(function () {
			$(this).attr('aria-pressed', $(this).data('zoom') === zoomLevel);
		});
		$('.saGanttCompact').prop('checked', compactMode);
	}

	function announce(message) {
		const $status = $('.saGanttStatus');
		clearTimeout(statusTimer);
		$status.text(message).addClass('saGanttStatusActive');
		statusTimer = setTimeout(() => $status.removeClass('saGanttStatusActive'), 4000);
	}

	function moveCellFocus(event) {
		const $cell = $(event.currentTarget);
		const row = Number($cell.attr('data-row'));
		const column = Number($cell.attr('data-col'));
		const offsets = {
			ArrowRight: [0, 1],
			ArrowLeft: [0, -1],
			ArrowDown: [1, 0],
			ArrowUp: [-1, 0]
		};
		const offset = offsets[event.key];

		if (offset) {
			event.preventDefault();
			const nextRow = clamp(row + offset[0], 0, resources.length - 1);
			const nextColumn = clamp(column + offset[1], 0, dates.length - 1);
			const selector = `.saGanttCellBackground[data-row="${nextRow}"][data-col="${nextColumn}"]`;

			$grid.find('[tabindex="0"]').attr('tabindex', '-1');
			$grid.find(selector).attr('tabindex', '0')[0]?.focus();
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			pushUndo();
			const bookingIndex = resources[row].bookings.length;
			resources[row].bookings.push({
				title: 'New booking',
				status: 'planned',
				start: formatDate(dates[column]),
				end: formatDate(dates[column])
			});
			selectedBooking = { row, bookingIndex };
			commit(
				`Created New booking for ${resources[row].name}, ${bookingDateRange(column, column)}.`,
				`.saGanttBooking[data-row="${row}"][data-booking-index="${bookingIndex}"]`
			);
		}
	}

	function runBookingAction(action) {
		const selected = selectedBookingData();
		if (!selected) return;

		const { row, bookingIndex, resource, booking } = selected;
		const columns = bookingColumns(booking);
		let nextStart = columns.start;
		let nextEnd = columns.end;
		let message;

		if (action === 'delete') {
			pushUndo();
			resource.bookings.splice(bookingIndex, 1);
			selectedBooking = null;
			commit(`Deleted ${booking.title} from ${resource.name}.`);
			return;
		}

		if (action === 'move-left' || action === 'move-right') {
			const direction = action === 'move-left' ? -1 : 1;
			const duration = columns.end - columns.start;
			nextStart = clamp(columns.start + direction, 0, dates.length - duration - 1);
			nextEnd = nextStart + duration;
			message = `Moved ${booking.title} to ${bookingDateRange(nextStart, nextEnd)}.`;
		} else if (action === 'shorten') {
			if (columns.start === columns.end) {
				announce('A one-day booking cannot be shortened.');
				return;
			}
			nextEnd -= 1;
			message = `Shortened ${booking.title} to ${bookingDateRange(nextStart, nextEnd)}.`;
		} else if (action === 'extend') {
			if (columns.end >= dates.length - 1) {
				announce('The booking already reaches the end of the displayed year.');
				return;
			}
			nextEnd += 1;
			message = `Extended ${booking.title} to ${bookingDateRange(nextStart, nextEnd)}.`;
		} else if (action === 'status') {
			pushUndo();
			const statusIndex = STATUSES.indexOf(booking.status);
			booking.status = STATUSES[(statusIndex + 1) % STATUSES.length];
			commit(
				`${booking.title} is now ${booking.status}.`,
				`.saGanttBooking[data-row="${row}"][data-booking-index="${bookingIndex}"]`
			);
			return;
		} else {
			return;
		}

		if (nextStart === columns.start && nextEnd === columns.end) {
			announce('The booking cannot move beyond the displayed year.');
			return;
		}

		pushUndo();
		booking.start = formatDate(dates[nextStart]);
		booking.end = formatDate(dates[nextEnd]);
		commit(
			message,
			`.saGanttBooking[data-row="${row}"][data-booking-index="${bookingIndex}"]`
		);
	}

	function editBookingWithKeyboard(event) {
		if (!['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(event.key)) return;

		event.preventDefault();
		const $booking = $(event.currentTarget);
		selectBooking(
			Number($booking.attr('data-row')),
			Number($booking.attr('data-booking-index'))
		);

		if (event.key === 'Delete' || event.key === 'Backspace') {
			runBookingAction('delete');
		} else if (event.shiftKey) {
			runBookingAction(event.key === 'ArrowLeft' ? 'shorten' : 'extend');
		} else {
			runBookingAction(event.key === 'ArrowLeft' ? 'move-left' : 'move-right');
		}
	}

	function undo() {
		if (!undoStack.length) return;
		resources = undoStack.pop();
		selectedBooking = null;
		saveResources();
		render();
		announce('Undid the latest booking edit.');
	}

	function setZoom(nextZoom) {
		if (!ZOOM_WIDTHS[nextZoom] || nextZoom === zoomLevel) return;

		const centerColumn = $grid
			? clamp(
				Math.round(($grid.scrollLeft() + (($grid[0].clientWidth - labelWidthPx()) / 2)) / columnWidthPx()),
				0,
				dates.length - 1
			)
			: 0;

		zoomLevel = nextZoom;
		saveViewPreferences();
		render();
		scrollToColumn(centerColumn, false);
		announce(`Zoom level changed to ${nextZoom}.`);
	}

	function toggleCompact() {
		const centerColumn = $grid
			? clamp(
				Math.round(($grid.scrollLeft() + (($grid[0].clientWidth - labelWidthPx()) / 2)) / columnWidthPx()),
				0,
				dates.length - 1
			)
			: 0;

		compactMode = $('.saGanttCompact').prop('checked');
		saveViewPreferences();
		render();
		scrollToColumn(centerColumn, false);
		announce(`Compact column width ${compactMode ? 'enabled' : 'disabled'}.`);
	}

	function bindInteractions() {
		$container
			.on('pointerdown', '.saGanttCellBackground', beginCreate)
			.on('pointerdown', '.saGanttBooking', beginBookingDrag)
			.on('click', '.saGanttBooking', function () {
				selectBooking(
					Number($(this).attr('data-row')),
					Number($(this).attr('data-booking-index'))
				);
			})
			.on('keydown', '.saGanttCellBackground', moveCellFocus)
			.on('keydown', '.saGanttBooking', editBookingWithKeyboard)
			.on('pointerenter', '.saGanttCellBackground', function () {
				highlightCell(Number($(this).attr('data-row')), Number($(this).attr('data-col')));
			})
			.on('focusin', '.saGanttCellBackground', function () {
				highlightCell(Number($(this).attr('data-row')), Number($(this).attr('data-col')));
				$(this).addClass('saGanttFocused');
			})
			.on('focusout', '.saGanttCellBackground', function () {
				$(this).removeClass('saGanttFocused');
			});

		$('.saGantt')
			.on('click', '.saGanttUndo', undo)
			.on('click', '.saGanttToday', () => scrollToDate(formatDate(currentDate)))
			.on('click', '.saGanttJump', () => scrollToDate($('.saGanttJumpDate').val()))
			.on('keydown', '.saGanttJumpDate', function (event) {
				if (event.key === 'Enter') {
					event.preventDefault();
					scrollToDate($(this).val());
				}
			})
			.on('click', '.saGanttZoomLevels [data-zoom]', function () {
				setZoom($(this).data('zoom'));
			})
			.on('change', '.saGanttCompact', toggleCompact)
			.on('click', '[data-booking-action]', function () {
				runBookingAction($(this).data('booking-action'));
			});

		$(document)
			.off('.saGanttDemo')
			.on('pointermove.saGanttDemo', updateDrag)
			.on('pointerup.saGanttDemo', finishDrag)
			.on('pointercancel.saGanttDemo', cancelDrag)
			.on('keydown.saGanttDemo', function (event) {
				if (event.key === 'Escape') cancelDrag();
			});
	}

	$(() => {
		$container = $('.saGanttGrid');
		if (!$container.length) return;

		loadViewPreferences();
		$('.saGanttJumpDate')
			.attr({
				min: formatDate(startDate),
				max: formatDate(endDate)
			})
			.val(formatDate(currentDate));

		bindInteractions();
		render({ preserveScroll: false });
		requestAnimationFrame(() => scrollToColumn(daysBetween(startDate, currentDate), false));
	});
})(jQuery);
