/*$(function () {
  const breakpoints = [
    { name: 'xs',   min: 0,    max: 639,   classes: 'saBase saSmallScreen smallscreen saSmallscreensidebar saMobile' },
    { name: 'sm',   min: 640,  max: 767,   classes: 'saSm saSmallScreen smallscreen saSmallscreensidebar saMobile' },
    { name: 'md',   min: 768,  max: 1023,  classes: 'saMd saCompact saPc saLargeScreen saRootBody' },
    { name: 'lg',   min: 1024, max: 1279,  classes: 'saLg saCompact saPc saLargeScreen saRootBody' },
    { name: 'xl',   min: 1280, max: 1535,  classes: 'saXl saCompact saPc saLargeScreen saRootBody' },
    { name: '2xl',  min: 1536, max: Infinity, classes: 'sa2xl saCompact saPc saLargeScreen saRootBody' }
  ];

  const prefixFor = { xs: '', sm: 'Sm', md: 'Md', lg: 'Lg', xl: 'Xl', '2xl': '2xl' };

  function getRealBreakpoint() {
    const w = window.innerWidth;
    return breakpoints.find(bp => w >= bp.min && (bp.max === Infinity || w <= bp.max)) || breakpoints[5];
  }

  function setBodyClasses(bpName) {
    const bp = breakpoints.find(b => b.name === bpName);
    $('body')
      .removeClass(breakpoints.map(b => b.classes).join(' '))
      .addClass(bp.classes);
  }

  function applyCardClasses(currentBpName) {
    const prefix = prefixFor[currentBpName];

    $('#sortable > li').each(function () {
      const $card = $(this);
      const rowVal = parseInt($card.find('fieldset select').eq(0).val(), 10) || 0;
      const colVal = parseInt($card.find('fieldset select').eq(1).val(), 10) || 0;

      // wipe ALL previous sa*Row / sa*Col classes
      $card.removeClass(function (i, c) {
        return (c.match(/\bsa(?:Sm|Md|Lg|Xl|2xl)?(?:Row|Col)\d+\b/g) || []).join(' ');
      });

      // apply only for the active breakpoint
      if (rowVal > 0) $card.addClass(prefix ? `sa${prefix}Row${rowVal}` : `saRow${rowVal}`);
      if (colVal > 0) $card.addClass(prefix ? `sa${prefix}Col${colVal}` : `saCol${colVal}`);
    });
  }

  function refreshEverything(forcedBp = null) {
    const bpName = forcedBp || getRealBreakpoint().name;
    setBodyClasses(bpName);
    applyCardClasses(bpName);
    $(`input[name="bp"][value="${bpName}"]`).prop('checked', true);
    if (forcedBp) $(`input[name="bp"][value="auto"]`).prop('checked', false);
  }

  // Radio buttons (including Auto)
  $(document).on('change', 'input[name="bp"]', function () {
    const val = $(this).val();
    if (val === 'auto') {
      refreshEverything(); // will use real screen size
    } else {
      refreshEverything(val); // force preview
    }
  });

  // Select dropdowns inside cards
  $(document).on('change', '#sortable select', function () {
    const activeBp = $('input[name="bp"]:checked').val();
    const bpToUse = (activeBp === 'auto') ? getRealBreakpoint().name : activeBp;
    applyCardClasses(bpToUse);
  });

  // Window resize → only if "Auto" is selected
  let timer;
  $(window).on('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if ($('input[name="bp"][value="auto"]').is(':checked')) {
        refreshEverything();
      }
    }, 100);
  });

  // Initial run
  refreshEverything();
});*/