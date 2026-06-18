
(function(){
  var menuButton=document.querySelector('[data-menu-button]');
  var mobileNav=document.querySelector('[data-mobile-nav]');
  if(menuButton&&mobileNav){menuButton.addEventListener('click',function(){mobileNav.classList.toggle('open')})}
  var forms=document.querySelectorAll('[data-search-form]');
  forms.forEach(function(form){form.addEventListener('submit',function(e){var input=form.querySelector('input[name="q"]');if(input&&input.value.trim()){form.action='search.html'}else{e.preventDefault()}})});
  var scope=document.querySelector('[data-filter-scope]');
  if(scope){
    var input=document.querySelector('[data-filter-input]');
    var cards=[].slice.call(scope.querySelectorAll('[data-search-text]'));
    var apply=function(){var q=(input&&input.value||'').trim().toLowerCase();cards.forEach(function(card){var text=(card.getAttribute('data-search-text')||'').toLowerCase();card.classList.toggle('hide-card',q&&text.indexOf(q)===-1)})};
    if(input){input.addEventListener('input',apply);var params=new URLSearchParams(location.search);var q=params.get('q');if(q){input.value=q;apply()}}
  }
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
  if(slides.length){var i=0;var show=function(n){slides[i].classList.remove('active');if(dots[i])dots[i].classList.remove('active');i=(n+slides.length)%slides.length;slides[i].classList.add('active');if(dots[i])dots[i].classList.add('active')};dots.forEach(function(dot,idx){dot.addEventListener('click',function(){show(idx)})});setInterval(function(){show(i+1)},5200)}
})();
