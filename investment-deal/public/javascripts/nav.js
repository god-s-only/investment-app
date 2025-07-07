// Mobile Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu logic
    var hamburger = document.querySelector('.hamburger');
    if (hamburger) hamburger.onclick = toggleMobileNav;
    var nav = document.getElementById('mobileNav');
    if (nav) {
      nav.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
          nav.classList.remove('open');
        });
      });
    }
});

function toggleMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobileNav');
  
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
  
  // Prevent body scroll when menu is open
  if (mobileNav.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

function closeMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobileNav');
  
  hamburger.classList.remove('active');
  mobileNav.classList.remove('open');
  document.body.style.overflow = 'auto';
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(event) {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.querySelector('.hamburger');
  
  if (mobileNav && mobileNav.classList.contains('open') && 
      !mobileNav.contains(event.target) && 
      !hamburger.contains(event.target)) {
    closeMobileNav();
  }
});

// Close mobile nav on window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    closeMobileNav();
  }
});

// Close menu when clicking on nav links
document.addEventListener('DOMContentLoaded', function() {
  const mobileNavLinks = document.querySelectorAll('.mobile-nav ul li a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
}); 