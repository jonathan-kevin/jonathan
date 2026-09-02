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

	const $select = $('<select>', {
		id: 'theme-select',
		class: 'saInputText saDropdown saButton',
		style: 'position: fixed; top: 0.5rem; right: 0.5rem; z-index: 1000;',
		name: 'theme',
		'aria-label': 'Theme'
	});

	$select.append(
		$('<option>', { value: 'system', text: 'System' }),
		$('<option>', { value: 'light', text: 'Light' }),
		$('<option>', { value: 'dark', text: 'Dark' })
	);

	$('body').append($select);

	const saved = localStorage.getItem('theme') || 'system';
	$('#theme-select').val(saved);
	applyTheme(saved);

	$('#theme-select').on('change', function () {
		const value = $(this).val();
		localStorage.setItem('theme', value);
		applyTheme(value);
	});

	function applyTheme(theme) {
		const root = document.documentElement;

		if (theme === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', theme);
		}
	}

	function initializeQuiz() {
		const $quiz = $('[data-quiz]');
		if (!$quiz.length) return;

		const questions = [
			{
				question: 'A user submits a form with an invalid email address. What should the interface do?',
				hint: 'Choose the most helpful response',
				options: [
					{ value: 'preserve-and-focus', title: 'Preserve the form and focus the email field', description: 'Show a specific inline error without discarding valid input' },
					{ value: 'clear-form', title: 'Clear the entire form', description: 'Ask the user to enter everything again' },
					{ value: 'generic-message', title: 'Show a generic error at the top', description: 'Do not identify which field needs attention' },
					{ value: 'submit-anyway', title: 'Submit the invalid address', description: 'Let the backend deal with it later' }
				]
			},
			{
				question: 'Which of these are gas giant planets?',
				hint: 'Select all that apply',
				multiple: true,
				options: [
					{ value: 'venus', title: 'Venus', description: 'The hottest planet' },
					{ value: 'mars', title: 'Mars', description: 'A rocky planet rich in iron oxide' },
					{ value: 'jupiter', title: 'Jupiter', description: 'The largest planet' },
					{ value: 'saturn', title: 'Saturn', description: 'Known for its prominent rings' }
				]
			},
			{
				question: 'What does CSS primarily control on a web page?',
				hint: 'One last question',
				options: [
					{ value: 'data', title: 'Database records', description: 'Persistent application data' },
					{ value: 'presentation', title: 'Presentation and layout', description: 'Colors, spacing, typography, and positioning' },
					{ value: 'server', title: 'Server routing', description: 'How requests reach a backend' },
					{ value: 'encryption', title: 'Data encryption', description: 'Protecting information in transit' }
				]
			}
		];

		let currentQuestion = 0;
		const answers = questions.map(() => ({ values: [], otherText: '' }));
		const $question = $quiz.find('#quiz-question');
		const $hint = $quiz.find('.saQuizHint');
		const $group = $quiz.find('.saQuizGroup');
		const $step = $quiz.find('.saQuizStep');
		const $message = $quiz.find('.saQuizMessage');
		const $previous = $quiz.find('[data-quiz-previous]');
		const $next = $quiz.find('[data-quiz-next]');

		function escapeHtml(value) {
			return $('<div>').text(value).html().replace(/"/g, '&quot;').replace(/'/g, '&#39;');
		}

		function clearMessage() {
			$message.empty();
		}

		function revealGroup() {
			$group.addClass('saEntering');
			void $group[0].offsetWidth;
			requestAnimationFrame(() => $group.removeClass('saEntering'));
		}

		function updateOtherInput(shouldFocus) {
			const item = questions[currentQuestion];
			const answer = answers[currentQuestion];
			const allowsText = item.options.some(option => option.allowsText && answer.values.includes(option.value));
			let $other = $group.find('[name="other-answer"]');

			if (!allowsText) {
				$other.remove();
				return;
			}

			if (!$other.length) {
				$other = $('<input>', {
					class: 'saInputText saQuizOther',
					type: 'text',
					name: 'other-answer',
					placeholder: 'Enter your answer',
					'aria-label': 'Other answer'
				}).val(answer.otherText);
				$group.append($other);
			}

			if (shouldFocus) $other.trigger('focus');
		}

		function updateNextState() {
			if ($quiz.hasClass('saQuizComplete')) {
				$next.prop('disabled', false);
				return;
			}

			const selectedValues = $group.find('input[name="quiz-answer"]:checked').map(function () {
				return this.value;
			}).get();
			const requiresOtherText = selectedValues.includes('other');
			const otherText = String($group.find('[name="other-answer"]').val() || '').trim();
			$next.prop('disabled', selectedValues.length === 0 || (requiresOtherText && !otherText));
		}

		function renderQuestion() {
			const item = questions[currentQuestion];
			const answer = answers[currentQuestion];
			$quiz.removeClass('saQuizComplete');
			$step.text(`Question ${currentQuestion + 1} of ${questions.length}`);
			$question.text(item.question);
			$hint.text(`${item.hint} · Press ${item.options.map((_, index) => String.fromCharCode(65 + index)).join('–')} to select`);
			const options = item.options.map((option, index) => {
				const checked = answer.values.includes(option.value) ? ' checked' : '';
				const disabled = option.disabled ? ' disabled' : '';
				const description = option.description ? `<div class="saQuizDescription">${escapeHtml(option.description)}</div>` : '';
				return `<label class="saQuizOption"><input type="${item.multiple ? 'checkbox' : 'radio'}" name="quiz-answer" value="${escapeHtml(option.value)}"${checked}${disabled}><div class="saQuizText"><div class="saQuizTitle">${escapeHtml(option.title)}</div>${description}</div><kbd>${String.fromCharCode(65 + index)}</kbd></label>`;
			}).join('');

			$group.attr({ 'aria-labelledby': 'quiz-question', 'role': item.multiple ? 'group' : 'radiogroup' }).html(options);
			updateOtherInput(false);
			revealGroup();

			clearMessage();
			$previous.prop('disabled', currentQuestion === 0).show();
			$next.text(currentQuestion === questions.length - 1 ? 'Finish' : 'Next').show();
			$quiz.find('.saQuizNavigation').show();
			updateNextState();
		}

		function saveAnswer() {
			answers[currentQuestion].values = $group.find('input[name="quiz-answer"]:checked').map(function () {
				return this.value;
			}).get();
			answers[currentQuestion].otherText = String($group.find('[name="other-answer"]').val() || '').trim();
		}

		function validateAnswer() {
			saveAnswer();
			const answer = answers[currentQuestion];
			const option = questions[currentQuestion].options.find(item => answer.values.includes(item.value) && item.allowsText);
			if (!answer.values.length) {
				$message.text(questions[currentQuestion].multiple ? 'Choose at least one answer before continuing.' : 'Choose an answer before continuing.');
				$group.find('input:enabled').first().trigger('focus');
				return false;
			}
			if (option && option.allowsText && !answer.otherText) {
				$message.text('Enter your other answer before continuing.');
				$group.find('[name="other-answer"]').trigger('focus');
				return false;
			}
			return true;
		}

		function showConfirmation() {
			$quiz.addClass('saQuizComplete');
			$step.text('Complete');
			$question.text('Answers submitted');
			$hint.text('Thank you! Your responses have been recorded successfully.');
			$group.removeAttr('role aria-labelledby').html('<div class="saQuizSuccess" role="status"><i class="saIcon fas fa-party-horn" aria-hidden="true"></i><span class="saScreenReaderOnly">Submission confirmed</span></div>');
			revealGroup();
			clearMessage();
			$previous.hide();
			$next.text('Start over').prop('disabled', false).show().trigger('focus');
		}

		$quiz.on('change', 'input[name="quiz-answer"]', function () {
			saveAnswer();
			clearMessage();
			updateOtherInput(true);
			updateNextState();
		});

		$quiz.on('input', '[name="other-answer"]', function () {
			answers[currentQuestion].otherText = $(this).val();
			clearMessage();
			updateNextState();
		});

		$quiz.on('keydown', '[name="other-answer"]', function (event) {
			if (event.key !== 'Enter') return;
			event.preventDefault();
			$next.trigger('click');
		});

		$previous.on('click', function () {
			saveAnswer();
			if (currentQuestion > 0) currentQuestion -= 1;
			renderQuestion();
		});

		$next.on('click', function () {
			if ($quiz.hasClass('saQuizComplete')) {
				answers.forEach(answer => { answer.values = []; answer.otherText = ''; });
				currentQuestion = 0;
				renderQuestion();
				return;
			}
			if (!validateAnswer()) return;
			if (currentQuestion < questions.length - 1) {
				currentQuestion += 1;
				renderQuestion();
			} else {
				showConfirmation();
			}
		});

		$(document).on('keydown.quiz', function (event) {
			if (event.ctrlKey || event.metaKey || event.altKey) return;
			if (!$quiz.is(':visible') || $quiz.hasClass('saQuizComplete') || $(event.target).is('input[type="text"], textarea, select, button, a')) return;
			const optionIndex = /^[a-e]$/i.test(event.key) ? event.key.toUpperCase().charCodeAt(0) - 65 : -1;
			if (optionIndex >= 0 && optionIndex < questions[currentQuestion].options.length) {
				const $input = $group.find('input[name="quiz-answer"]').eq(optionIndex);
				if (!$input.prop('disabled')) {
					event.preventDefault();
					const shouldCheck = questions[currentQuestion].multiple ? !$input.prop('checked') : true;
					$input.prop('checked', shouldCheck).trigger('change');
				}
			} else if (event.key === 'Enter') {
				event.preventDefault();
				$next.trigger('click');
			}
		});

		renderQuestion();
	}

	initializeQuiz();
	$('.saFavoriteToggle').click(function () {
		$(this).attr('aria-checked', function (i, attr) { return attr === 'true' ? 'false' : 'true'; });
	});
});
