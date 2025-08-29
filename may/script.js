$(document).ready(function () {
    // Get current URL path
    const path = (window.location.pathname + window.location.search + window.location.hash).toLowerCase();

    // Create toggle button
    const $toggler = $('<button>', {
        id: 'theToggler',
        class: 'saButton saDefaultButtonSecondary',
        style: 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; color: white; background-color: black; border: none;',
        text: 'Compact',
        title: 'Toggle between Standard, Compact, and SmallScreen views'
    });

    // Cache DOM elements
    const $body = $('body');
    const $sideBar = $('.saSideBar');

    // View configurations
    const views = [
        {
            name: 'Standard',
            classes: 'saStandard saPc saLargeScreen',
            url: 'standard'
        },
        {
            name: 'Compact',
            classes: 'saCompact saPc saLargeScreen',
            url: 'compact'
        },
        {
            name: 'SmallScreen',
            classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile',
            url: 'smallscreen'
        }
    ];

    // Initialize view based on URL
    function initializeView() {
        const currentView = views.find(view => path.includes(view.url)) || views[1]; // Default to Compact
        $body.addClass(currentView.classes);
        $toggler.text(currentView.name);
    }

    // Toggle between views
    function toggleView() {
        const currentClasses = $body.attr('class').split(' ').filter(cls => cls.startsWith('sa') || cls === 'smallscreen');
        const currentViewIndex = views.findIndex(view => currentClasses.includes(view.classes.split(' ')[0]));
        const nextView = views[(currentViewIndex + 1) % views.length];

        $body.removeClass(currentClasses.join(' ')).addClass(nextView.classes);
        $toggler.text(nextView.name);
    }

    // Handle sidebar expansion
    function toggleSidebar(e) {
        e.preventDefault();
        $sideBar.toggleClass('saExpanded saMinimized');
    }

    // Update responsive classes based on screen width
    function updateResponsiveClasses() {
        const width = window.innerWidth;
        const responsiveClasses = [
            { minWidth: 1536, classes: 'sa2xl saCompact saPc saLargeScreen saRootBody' },
            { minWidth: 1280, classes: 'saXl saCompact saPc saLargeScreen saRootBody' },
            { minWidth: 1024, classes: 'saLg saCompact saPc saLargeScreen saRootBody' },
            { minWidth: 768, classes: 'saMd saCompact saPc saLargeScreen saRootBody' },
            { minWidth: 0, classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile' }
        ];

        const currentClasses = $body.attr('class').split(' ').filter(cls => !cls.startsWith('sa') && cls !== 'smallscreen');
        $body.removeClass().addClass(currentClasses.join(' '));

        const matchingView = responsiveClasses.find(view => width >= view.minWidth);

        if (matchingView) {
            $body.addClass(matchingView.classes);
        }
    }

    // Append toggler and set initial state
    $body.append($toggler);
    setTimeout(initializeView, 200);

    // Event listeners
    $toggler.on('click', toggleView);
    $('.saExpander').on('click', toggleSidebar);
    $(window).on('resize', updateResponsiveClasses);
});