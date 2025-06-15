document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu logic
    function toggleMobileNav() {
      var nav = document.getElementById('mobileNav');
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
      } else {
        nav.classList.add('open');
      }
    }
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
  
    // Crypto ticker logic using CoinGecko
    const ticker = document.getElementById('crypto-ticker');
    const coins = [
      { id: 'bitcoin', symbol: 'BTC' },
      { id: 'ethereum', symbol: 'ETH' },
      { id: 'tether', symbol: 'USDT' },
      { id: 'binancecoin', symbol: 'BNB' },
      { id: 'solana', symbol: 'SOL' },
      { id: 'ripple', symbol: 'XRP' },
      { id: 'cardano', symbol: 'ADA' },
      { id: 'dogecoin', symbol: 'DOGE' }
    ];
    
    let animationId;
    let isScrolling = false;
    let scrollTimeout;
  
    function fetchCrypto() {
      fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + coins.map(c=>c.id).join(','))
        .then(res => res.json())
        .then(data => {
          let coinHTML = '';
          data.forEach(coin => {
            coinHTML += `<div class="crypto-coin"><img src="${coin.image}" alt="${coin.symbol}"/><span>${coin.name}</span> <span class="crypto-price">$${coin.current_price.toLocaleString()}</span> <span class="crypto-change" style="color:${coin.price_change_percentage_24h>=0?'#0f0':'#f00'}">${coin.price_change_percentage_24h>=0?'+':''}${coin.price_change_percentage_24h.toFixed(2)}%</span></div>`;
          });
          ticker.innerHTML = coinHTML + coinHTML; // duplicate for infinite scroll
          
          // Reset and restart animation
          ticker.scrollLeft = 0;
          startScrollAnimation();
          
          // Hide loading overlay
          var overlay = document.getElementById('loading-overlay');
          if (overlay) overlay.classList.add('hidden');
        });
    }
  
    // Detect when user is scrolling the page
    window.addEventListener('scroll', function() {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        isScrolling = false;
      }, 150);
    });
  
    // Use requestAnimationFrame for smoother animation
    function scrollTicker() {
      if (ticker.scrollWidth > ticker.clientWidth && !isScrolling) {
        const currentScroll = ticker.scrollLeft;
        const maxScroll = ticker.scrollWidth / 2;
        
        if (currentScroll >= maxScroll) {
          ticker.scrollLeft = 0;
        } else {
          ticker.scrollLeft = currentScroll + 1;
        }
      }
      animationId = requestAnimationFrame(scrollTicker);
    }
  
    function startScrollAnimation() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scrollTicker();
    }
  
    // Alternative approach using CSS animation (more reliable)
    function enableCSSAnimation() {
      ticker.style.animation = 'scroll-left 30s linear infinite';
    }
  
    fetchCrypto();
    setInterval(fetchCrypto, 60000);
  
    // Fallback: if requestAnimationFrame fails, use CSS animation
    setTimeout(() => {
      if (ticker.scrollWidth <= ticker.clientWidth) {
        enableCSSAnimation();
      }
    }, 1000);
  });