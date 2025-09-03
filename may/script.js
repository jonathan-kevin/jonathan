$(document).ready(function() {
    const IframeManager = {
        // Configuration
        config: {
            frameSelector: '#frameX',
            iframeSrc: './bento-menu-frame.html',
            minWidth: 320,
            resizeHandleId: 'resizeHandle',
            togglerId: 'theToggler',
            sizerPopoverId: 'sizes'
        },

        // View configurations with breakpoints - fixed order and proper maxWidth values
        breakpoints: [
            { name: 'base', minWidth: 0, maxWidth: 639, classes: 'saBase saSmallScreen smallscreen saSmallscreensidebar saMobile' },
            { name: 'sm', minWidth: 640, maxWidth: 767, classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile' },
            { name: 'md', minWidth: 768, maxWidth: 1023, classes: 'saMd saCompact saPc saLargeScreen saRootBody' },
            { name: 'lg', minWidth: 1024, maxWidth: 1279, classes: 'saLg saCompact saPc saLargeScreen saRootBody' },
            { name: 'xl', minWidth: 1280, maxWidth: 1535, classes: 'saXl saCompact saPc saLargeScreen saRootBody' },
            { name: '2xl', minWidth: 1536, maxWidth: null, classes: 'sa2xl saCompact saPc saLargeScreen saRootBody' }
        ],

        // View modes for toggler
        viewModes: [
            { name: 'Standard', classes: 'saStandard saPc saLargeScreen', url: 'standard' },
            { name: 'Compact', classes: 'saCompact saPc saLargeScreen', url: 'compact' },
            { name: 'SmallScreen', classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile', url: 'smallscreen' }
        ],

        // State
        state: {
            isResizing: false,
            lastX: 0,
            currentPath: ''
        },

        // Cache jQuery elements
        elements: {},

        // Initialize the manager
        init() {
            this.state.currentPath = this.getCurrentPath();
            this.createIframe();
        },

        // Get current URL path
        getCurrentPath() {
            return (window.location.pathname + window.location.search + window.location.hash).toLowerCase();
        },

        // Create and inject iframe
        createIframe() {
            const $iframe = $('<iframe>', {
                src: this.config.iframeSrc,
                id: 'bentoMenu',
                frameborder: 0,
                scrolling: 'auto',
                width: '100%',
                height: 'calc(100% - 1rem)'
            });

            $(this.config.frameSelector).append($iframe);
            this.elements.$iframe = $iframe;

            $iframe.on('load', () => this.onIframeLoad());
        },

        // Handle iframe load event
        onIframeLoad() {
            const iframeDoc = this.elements.$iframe[0].contentDocument ||
                             this.elements.$iframe[0].contentWindow.document;

            this.elements.$body = $(iframeDoc).find('.saRootBody');
            this.elements.$sideBar = $('.saSideBar');

            this.createToggler();
            this.createResizeHandle();
            this.createSizerPopover();
            this.initializeView();
            this.bindEvents();
            this.updateResponsiveClasses();
        },

        // Create view toggle button
        createToggler() {
            const $toggler = $('<button>', {
                id: this.config.togglerId,
                class: 'saButton saDefaultButtonSecondary',
                style: 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; color: white; background-color: black; border: none;',
                text: 'Compact',
                title: 'Toggle between Standard, Compact, and SmallScreen views'
            });

            this.elements.$body.append($toggler);
            this.elements.$toggler = $toggler;
        },

        // Create resize handle
        createResizeHandle() {
            const $resizeHandle = $('<div>', { id: this.config.resizeHandleId });
            $(this.config.frameSelector).append($resizeHandle);
            this.elements.$resizeHandle = $resizeHandle;
        },

        // Create sizer popover with radio buttons in correct order
        createSizerPopover() {
            const radioButtons = this.breakpoints.map(bp =>
                `<label>${bp.name}<input type="radio" name="size" value="${bp.name}" id="${bp.name}"></label>`
            ).join('');

            const popoverHtml = `
                <popover class="saSizer" id="${this.config.sizerPopoverId}" open>
                    <fieldset>
                        <label>reset<input type="radio" name="size" value="reset" id="reset"></label>
                        ${radioButtons}
                    </fieldset>
                </popover>
            `;

            $(this.config.frameSelector).append(popoverHtml);
            this.elements.$sizer = $(`#${this.config.sizerPopoverId}`);
        },

        // Initialize view based on URL
        initializeView() {
            const currentView = this.viewModes.find(view =>
                this.state.currentPath.includes(view.url)
            ) || this.viewModes[1]; // Default to Compact

            this.elements.$body.addClass(currentView.classes);
            this.elements.$toggler.text(currentView.name);
        },

        // Toggle between view modes
        toggleView() {
            const currentClasses = this.elements.$body.attr('class').split(' ')
                .filter(cls => cls.startsWith('sa') || cls === 'smallscreen');

            const currentViewIndex = this.viewModes.findIndex(view =>
                currentClasses.some(cls => view.classes.includes(cls))
            );

            const nextView = this.viewModes[(currentViewIndex + 1) % this.viewModes.length];

            this.elements.$body.removeClass(currentClasses.join(' ')).addClass(nextView.classes);
            this.elements.$toggler.text(nextView.name);
        },

        // Toggle sidebar expansion
        toggleSidebar(e) {
            e.preventDefault();
            this.elements.$sideBar.toggleClass('saExpanded saMinimized');
        },

        // Apply breakpoint classes based on width - fixed to sort breakpoints correctly
        applyBreakpoint(width) {
            // Sort breakpoints by minWidth descending to find the largest matching breakpoint
            const sortedBreakpoints = [...this.breakpoints].sort((a, b) => b.minWidth - a.minWidth);
            const matchingBreakpoint = sortedBreakpoints.find(bp => width >= bp.minWidth);

            if (matchingBreakpoint) {
                // Remove existing sa classes but keep others
                const currentClasses = this.elements.$body.attr('class').split(' ')
                    .filter(cls => !cls.startsWith('sa') && cls !== 'smallscreen');

                this.elements.$body.removeClass().addClass(currentClasses.concat(matchingBreakpoint.classes.split(' ')).join(' '));

                // Update radio button selection
                $('input[name="size"]').prop('checked', false);
                $(`#${matchingBreakpoint.name}`).prop('checked', true);

                // Trigger breakpoint change event for external listeners
                this.onBreakpointChange(matchingBreakpoint.name);
            }
        },

        // Update responsive classes based on current width
        updateResponsiveClasses() {
            this.elements.$body.removeAttr('style');
            const width = window.innerWidth;
            this.applyBreakpoint(width);
        },

        // Handle size radio button changes
        handleSizeChange() {
            const selectedSize = $('input[name="size"]:checked').val();

            if (selectedSize === 'reset') {
                this.resetIframeSize();
                return;
            }

            const breakpoint = this.breakpoints.find(bp => bp.name === selectedSize);
            if (breakpoint) {
                this.applyBreakpointToIframe(breakpoint);
            }
        },

        // Reset iframe to full width
        resetIframeSize() {
            this.elements.$iframe.css({
                'min-width': '',
                'max-width': '',
                'width': '100%'
            });
            this.elements.$body.removeClass();
            this.updateResponsiveClasses();
        },

        // Apply specific breakpoint to iframe
        applyBreakpointToIframe(breakpoint) {
            const maxWidth = breakpoint.maxWidth ? `${breakpoint.maxWidth}px` : 'none';

            this.elements.$iframe.css({
                'min-width': `${breakpoint.minWidth}px`,
                'max-width': maxWidth,
                'width': '100%'
            });

            this.elements.$body.removeClass().addClass(breakpoint.classes);

            // Trigger breakpoint change event
            this.onBreakpointChange(breakpoint.name);
        },

        // Handle resize functionality - removed the * 5 multiplier
        startResize(e) {
            e.preventDefault();
            this.state.isResizing = true;
            this.state.lastX = e.clientX;

            // Remove min-width and max-width constraints when starting manual resize
            this.elements.$iframe.css({
                'min-width': '',
                'max-width': ''
            });

            // Clear radio button selection since we're now in manual resize mode
            $('input[name="size"]').prop('checked', false);
        },

        handleResize(e) {
            if (!this.state.isResizing) return;

            const dx = e.clientX - this.state.lastX;
            let newWidth = this.elements.$iframe.width() + dx; // Fixed: removed * 5

            // Ensure minimum width
            newWidth = Math.max(this.config.minWidth, newWidth);

            this.elements.$iframe.width(newWidth);
            this.state.lastX = e.clientX;

            // Update classes based on new width
            this.applyBreakpoint(newWidth);
        },

        stopResize() {
            this.state.isResizing = false;
        },

        // Breakpoint change callback - can be overridden externally
        onBreakpointChange(breakpointName) {
            // Trigger custom event
            $(document).trigger('breakpointChanged', [breakpointName]);
        },

        // Get current breakpoint name
        getCurrentBreakpoint() {
            const classes = this.elements.$body.attr('class') || '';
            const match = classes.match(/sa(2xl|xl|lg|md|sm|base)/i);
            return match ? match[1].toLowerCase() : 'base';
        },

        // Bind all event listeners
        bindEvents() {
            // Toggler events
            this.elements.$toggler.on('click', () => this.toggleView());

            // Sidebar events
            $('.saExpander').on('click', (e) => this.toggleSidebar(e));

            // Resize events
            this.elements.$resizeHandle.on('mousedown', (e) => this.startResize(e));
            $(document).on('mousemove', (e) => this.handleResize(e));
            $(document).on('mouseup', () => this.stopResize());

            // Size selector events
            $(`${this.config.frameSelector} input[name="size"]`).on('change', () => this.handleSizeChange());

            // Window resize event
            $(window).on('resize', () => this.updateResponsiveClasses());

            // Iframe resize event (if supported)
            this.elements.$iframe.on('resize', () => this.updateResponsiveClasses());
        }
    };

    // Initialize the iframe manager
    IframeManager.init();

    // Grid System Manager - cleaned up and integrated
    const GridSystemManager = {
        // Utility: get current breakpoint from IframeManager
        getCurrentBreakpoint() {
            return IframeManager.getCurrentBreakpoint();
        },

        // Initialize selects for current breakpoint
        initSelects() {
            const bp = this.getCurrentBreakpoint();

            $('#sortable li').each(function() {
                const $li = $(this);
                $li.find('select').each(function() {
                    const $select = $(this);
                    const isRow = $select.parent().text().trim().toLowerCase() === "row";
                    const type = isRow ? "Row" : "Col";

                    // Fixed regex to handle both base and other breakpoints
                    const regex = bp === 'base'
                        ? new RegExp(`sa${type}(\\d+)`)
                        : new RegExp(`sa${bp}${type}(\\d+)`, 'i');

                    const match = $li.attr('class').match(regex);
                    $select.val(match ? match[1] : "0");
                });
            });
        },

        // Update li class when select changes
        handleSelectChange($select) {
            const $li = $select.closest('li');
            const isRow = $select.parent().text().trim().toLowerCase() === "row";
            const type = isRow ? "Row" : "Col";
            const val = $select.val();
            const bp = this.getCurrentBreakpoint();

            // Remove old class for this breakpoint
            const regex = bp === 'base'
                ? new RegExp(`sa${type}\\d+`, "g")
                : new RegExp(`sa${bp}${type}\\d+`, "gi");

            $li.removeClass(function(i, cls) {
                return (cls.match(regex) || []).join(" ");
            });

            if (val === "0") return; // Auto = remove

            // Add new class for current breakpoint
            const newClass = bp === 'base' ? `sa${type}${val}` : `sa${bp}${type}${val}`;
            $li.addClass(newClass);
        },

        // Initialize the grid system
        init() {
            // Bind select change events
            $('#sortable').on('change', 'select', (e) => {
                this.handleSelectChange($(e.target));
            });

            // Listen for breakpoint changes from IframeManager
            $(document).on('breakpointChanged', () => {
                this.initSelects();
            });

            // Initialize on page load
            this.initSelects();
        }
    };

    // Initialize grid system manager
    GridSystemManager.init();
});