jQuery(function ($) {
});

jQuery(function ($) {
  $('.js-scroll-to').on('click', function(e) {
    e.preventDefault();

    var $container = $('html, body'),
      $scrollTo = $($($(this).attr('href')));
    
    /*$container.scrollTop(
      $scrollTo.offset().top - $container.offset().top + $container.scrollTop()
    );*/
    $container.animate({
      scrollTop: $scrollTo.offset().top
    }, 500);
  });
});

jQuery(function ($) {
  
  $('.js-open-support').on('click', function (e) {
    e.preventDefault();
    if ( $(this).hasClass('is-open') ) {
      $(this).removeClass('is-open');
      $('body').removeClass('is-chat-open');
      $('.support').fadeOut(300);
    } else {
      $(this).addClass('is-open');
      $('body').addClass('is-chat-open');
      $('.support').fadeIn(300);
    }
  });
  
  $('.js-footer-support').on('click', function (e) {
    e.preventDefault();
    $('.js-open-support').trigger('click');
  });
  
});
