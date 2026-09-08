$(document).ready(function () {

	function updateClasses() {
		const isSmall = $(window).width() <= 640;

		const $body = $('body');
		const $bodyAlt = $('#body');

		if (isSmall) {
			$body
				.removeClass('saLargeScreen saPc')
				.addClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile');

			$bodyAlt
				.removeClass('saLargeScreen saCompact saPc') // assuming this exists on large
				.addClass('smallscreen saSmallScreen saSmallScreenJs saMobile');
		} else {
			$body
				.removeClass('saSmallScreen saSmallscreensidebar saSmallScreenSidebarJs saMobile')
				.addClass('saLargeScreen saPc');

			$bodyAlt
				.removeClass('smallscreen saSmallScreen saSmallScreenJs saMobile')
				.addClass('saLargeScreen saCompact saPc');
		}
	}

	updateClasses();

	$(window).on('resize', function () {
		updateClasses();
	});

	const $sideBar = $('#SideBar');
	const $sideBarExpander = $('button.saExpander');

	function updateSidebarToggleState() {
		const isExpanded = $sideBar.hasClass('saExpanded');
		const action = isExpanded ? 'Minimize sidebar' : 'Expand sidebar';

		$sideBarExpander.attr({
			'aria-expanded': String(isExpanded),
			'aria-label': action,
			'title': `${action} (Alt+M)`
		});
	}

	function toggleSidebar() {
		const shouldMinimize = $sideBar.hasClass('saExpanded');
		$sideBar.toggleClass('saExpanded', !shouldMinimize);
		$sideBar.toggleClass('saMinimized', shouldMinimize);
		updateSidebarToggleState();
	}

	$sideBarExpander.on('click', toggleSidebar);

	$(document).on('keydown', function (event) {
		const isSidebarShortcut = event.altKey
			&& !event.ctrlKey
			&& !event.metaKey
			&& !event.shiftKey
			&& event.key.toLowerCase() === 'm';

		if (!isSidebarShortcut || event.repeat || $('body').hasClass('saSmallScreen')) return;

		event.preventDefault();
		toggleSidebar();
	});

	updateSidebarToggleState();

	$('button.saNavigator').on('click', function () {
		$('.saSideBarOuter').toggleClass('saClosed')
		$('.saSideBarSmallScreenOverlay').toggle();
	});

	$(document).on('click', '.saInfoBoxHeadingButton', function () {
		const $headingButton = $(this);
		const $infoBox = $headingButton.closest('.saInfoBox');
		const shouldOpen = !$infoBox.hasClass('saOpen');

		$infoBox
			.toggleClass('saOpen', shouldOpen)
			.toggleClass('saClosed', !shouldOpen);
		$headingButton.attr('aria-expanded', String(shouldOpen));
	});

	const $InfoBoxButton = $('.saInfoBoxCopyButton');
	let $AriaLabelTooltip = null;
	let ariaLabelTooltipTarget = null;

	function removeAriaLabelTooltip() {
		if ($AriaLabelTooltip) $AriaLabelTooltip.remove();

		$AriaLabelTooltip = null;
		ariaLabelTooltipTarget = null;
	}

	function positionAriaLabelTooltip() {
		if (!$AriaLabelTooltip || !ariaLabelTooltipTarget) return;

		const targetRect = ariaLabelTooltipTarget.getBoundingClientRect();
		$AriaLabelTooltip.css({
			left: `${targetRect.left + targetRect.width / 2}px`,
			top: `${targetRect.top - 8}px`
		});
	}

	$(document).on('mouseenter', '[aria-label]', function () {
		if (!$('body').hasClass('saLargeScreen')) return;

		const label = $(this).attr('aria-label');
		if (!label) return;

		removeAriaLabelTooltip();
		ariaLabelTooltipTarget = this;
		$AriaLabelTooltip = $('<div>', {
			class: 'saTooltipRoot saAriaLabelTooltip',
			'aria-hidden': 'true',
			text: label
		}).css({
			position: 'fixed',
			transform: 'translate(-50%, -100%)'
		}).appendTo('body');

		positionAriaLabelTooltip();
	}).on('mouseleave', '[aria-label]', function () {
		if (ariaLabelTooltipTarget === this) removeAriaLabelTooltip();
	});

	$(window).on('resize scroll', function () {
		if (!$('body').hasClass('saLargeScreen')) {
			removeAriaLabelTooltip();
			return;
		}

		positionAriaLabelTooltip();
	});

	function getInfoBoxCopyText(button) {
		const $content = $(button).closest('.saInfoBoxContent');
		const table = $content.find('.saBoxTable').get(0);

		if (table) {
			return Array.from(table.rows, function (row) {
				return Array.from(row.cells, function (cell) {
					return cell.innerText.trim();
				}).join('\t');
			}).join('\n');
		}

		const textContent = $(button).closest('.saInfoBoxTextContent').get(0);
		const copySource = textContent || $content.get(0);
		return copySource?.innerText.trim() || '';
	}

	async function copyTextToClipboard(text) {
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return;
			} catch (error) {
				// Fall back for browsers that expose the API but block clipboard access.
			}
		}

		const $textArea = $('<textarea>', {
			value: text,
			'aria-hidden': 'true'
		}).css({
			position: 'fixed',
			left: '-9999px'
		}).appendTo('body');

		$textArea.get(0).select();
		const didCopy = document.execCommand('copy');
		$textArea.remove();

		if (!didCopy) throw new Error('Unable to copy text to the clipboard.');
	}

	$InfoBoxButton.on('click', async function () {
		const $button = $(this);
		const copyLabel = $button.data('saCopyLabel') || $button.attr('aria-label');
		const copiedLabel = copyLabel.replace(/^Copy\b/, 'Copied');
		$button.data('saCopyLabel', copyLabel);

		try {
			await copyTextToClipboard(getInfoBoxCopyText(this));

			const previousTimeout = $button.data('saCopiedTimeout');
			if (previousTimeout) clearTimeout(previousTimeout);

			$button.addClass('saCopied').attr('aria-label', copiedLabel);
			if (ariaLabelTooltipTarget === this) $AriaLabelTooltip.text(copiedLabel);

			$button.data('saCopiedTimeout', setTimeout(function () {
				$button.removeClass('saCopied')
					.attr('aria-label', copyLabel)
					.removeData('saCopiedTimeout');

				if (ariaLabelTooltipTarget === $button.get(0)) {
					$AriaLabelTooltip.text(copyLabel);
				}
			}, 2000));
		} catch (error) {
			console.error('Failed to copy InfoSQL content.', error);
		}
	});


	const $accountDropdown = $('.saAccountDropdown').first();
	const $accountMenu = $accountDropdown.siblings('.saProfileMenu').first();
	const $accountMenuRoot = $accountDropdown.closest('.saListItem');

	function setAccountMenuOpen(isOpen) {
		$accountDropdown.toggleClass('saOpen', isOpen).attr('aria-expanded', String(isOpen));
		$accountMenu.toggleClass('saOpen', isOpen).attr('aria-hidden', String(!isOpen));
	}

	$accountDropdown.on('click', function (event) {
		event.stopPropagation();
		setAccountMenuOpen(!$accountDropdown.hasClass('saOpen'));
	});

	$(document).on('click', function (event) {
		if ($accountMenuRoot[0]?.contains(event.target)) return;
		setAccountMenuOpen(false);
	});

	$(document).on('keydown', function (event) {
		if (event.key !== 'Escape' || !$accountDropdown.hasClass('saOpen')) return;

		setAccountMenuOpen(false);
		$accountDropdown.trigger('focus');
	});

	setAccountMenuOpen(false);


	const $themeToggle = $('#saToggleDark');

	const savedTheme = localStorage.getItem('theme');
	let currentTheme = savedTheme === 'light' || savedTheme === 'dark'
		? savedTheme
		: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

	applyTheme(currentTheme);

	function toggleTheme() {
		currentTheme = currentTheme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', currentTheme);
		applyTheme(currentTheme);
	}

	$themeToggle.on('change', function () {
		currentTheme = this.checked ? 'dark' : 'light';
		localStorage.setItem('theme', currentTheme);
		applyTheme(currentTheme);
	});

	$(document).on('keydown', function (event) {
		const isEditable = $(event.target).is('input, select, textarea, [contenteditable="true"]');
		const isThemeShortcut = !event.altKey
			&& !event.ctrlKey
			&& !event.metaKey
			&& !event.shiftKey
			&& event.key.toLowerCase() === 'd';

		if (!isThemeShortcut || isEditable || event.repeat) return;

		event.preventDefault();
		toggleTheme();
	});

	function applyTheme(theme) {
		const root = document.documentElement;
		const isDark = theme === 'dark';

		root.setAttribute('data-theme', theme);
		$themeToggle
			.prop('checked', isDark)
			.attr({
				'aria-label': isDark ? 'Switch to light mode' : 'Switch to dark mode',
				title: `${isDark ? 'Switch to light mode' : 'Switch to dark mode'} (D)`
			});
	}

	$('.saFavoriteToggle').click(function () {
		$(this).attr('aria-checked', function (i, attr) { return attr === 'true' ? 'false' : 'true'; });
	});

	const $splitMenuButton = $('.saSplitButtonArrow[aria-controls="saSplitButtonMenu"]');
	const $splitMenu = $('#saSplitButtonMenu');
	const $splitMenuRoot = $splitMenuButton.closest('.saButtonSplit');

	function setSplitMenuOpen(isOpen) {
		$splitMenuButton.toggleClass('saOpen', isOpen).attr('aria-expanded', String(isOpen));
		$splitMenu.toggleClass('saOpen', isOpen);
	}

	$splitMenuButton.on('click', function (event) {
		event.stopPropagation();
		setSplitMenuOpen(!$splitMenuButton.hasClass('saOpen'));
	});

	$(document).on('click', function (event) {
		if ($(event.target).closest($splitMenuRoot).length) return;
		setSplitMenuOpen(false);
	});

	$(document).on('keydown', function (event) {
		if (event.key !== 'Escape' || !$splitMenuButton.hasClass('saOpen')) return;

		setSplitMenuOpen(false);
		$splitMenuButton.trigger('focus');
	});

	$('.saGrid tbody').on('mouseenter mouseleave', 'tr', function (event) {
		$(this).toggleClass('saSelected', event.type === 'mouseenter');
	});

	const $attachments = $('#project-attachments');

	function formatFileSize(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function renderAttachments(files) {
		const $fileGroup = $attachments.find('.saFileGroup').empty();

		Array.from(files).forEach(function (file) {
			const $fileItem = $('<li>', { class: 'saFileWrapper saFileVisible saDone' });
			const $iconWrapper = $('<div>', { class: 'saFileIconWrapper saDone' })
				.append($('<i>', { class: 'saFileIcon saIcon fas fa-file', 'aria-hidden': 'true' }));
			const $fileDetails = $('<div>', { class: 'saFile' }).append(
				$('<div>', { class: 'saFileNameWrapper' }).append(
					$('<span>', { class: 'saFileName', text: file.name })
				),
				$('<div>', { class: 'saFileSizeWrapper' }).append(
					$('<div>', { class: 'saFileSizeRow' }).append(
						$('<span>', { class: 'saFileSize', text: formatFileSize(file.size) }),
						$('<span>', { class: 'saFileUploadProgressText', text: '100%' })
					),
					$('<progress>', { class: 'saFileUploadProgress', max: 100, value: 100 })
				)
			);
			const $deleteButton = $('<button>', {
				class: 'saDeleteButton saDestructive',
				type: 'button',
				'aria-label': `Delete file ${file.name}`,
				'data-tooltip': 'Delete file'
			}).append($('<i>', { class: 'saIcon far fa-trash-alt', 'aria-hidden': 'true' }));

			$fileItem.append($iconWrapper, $fileDetails, $('<div>', { class: 'saFileButtonGroup' }).append($deleteButton));
			$fileGroup.append($fileItem);
		});

		$attachments.toggleClass('saHasFiles', $fileGroup.children().length > 0);
	}

	$attachments.find('input[type="file"]').on('change', function () {
		renderAttachments(this.files);
	});

	$attachments.on('keydown', '.saFileUploadArea', function (event) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		event.preventDefault();
		$(this).find('input[type="file"]').trigger('click');
	});

	$attachments.on('dragover', '.saFileUploadArea', function (event) {
		event.preventDefault();
		$attachments.addClass('saDragOver');
	});

	$attachments.on('dragleave drop', '.saFileUploadArea', function (event) {
		event.preventDefault();
		$attachments.removeClass('saDragOver');

		if (event.type === 'drop') {
			renderAttachments(event.originalEvent.dataTransfer.files);
		}
	});

	$attachments.on('click', '.saDeleteButton', function () {
		$(this).closest('.saFileWrapper').remove();
		const hasFiles = $attachments.find('.saFileWrapper').length > 0;
		$attachments.toggleClass('saHasFiles', hasFiles);

		if (!hasFiles) {
			$attachments.find('input[type="file"]').val('');
		}
	});

});
