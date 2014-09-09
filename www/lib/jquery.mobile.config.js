$(document).on(
   'mobileinit',
   function()
   {
      // Page Loader Widget
      $.mobile.loader.prototype.options.text = 'Caricamento...';
      $.mobile.loader.prototype.options.textVisible = true;

      $.mobile.defaultPageTransition = 'flow';

      // Theme
      $.mobile.page.prototype.options.theme  = 'a';
      $.mobile.page.prototype.options.headerTheme = 'a';
      $.mobile.page.prototype.options.contentTheme = 'a';
      $.mobile.page.prototype.options.footerTheme = 'a';
      $.mobile.page.prototype.options.backBtnTheme = 'a';

      // Swipe
      $.event.special.swipe.durationThreshold = 400;
      $.event.special.swipe.horizontalDistanceThreshold = 60;
      $.event.special.swipe.verticalDistanceThreshold = 30;
   }
);