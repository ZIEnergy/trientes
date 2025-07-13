jQuery(function ($) {
  
  $('.js-open-support').on('click', function (e) {
    e.preventDefault();
    if ( $(this).hasClass('is-open') ) {
      $(this).removeClass('is-open');
      $('html, body').css('overflow', '');
      $('.support').fadeOut(300);
    } else {
      $(this).addClass('is-open');
      $('html, body').css('overflow', 'hidden');
      $('.support').fadeIn(300);
    }
  });
  
  $('.js-footer-support').on('click', function (e) {
    e.preventDefault();
    $('.js-open-support').trigger('click');
  });
  
});
