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
  let coinHTML = '';
  let scrollAmount = 0;
  let scrollSpeed = 1;
  function fetchCrypto() {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + coins.map(c=>c.id).join(','))
      .then(res => res.json())
      .then(data => {
        coinHTML = '';
        data.forEach(coin => {
          coinHTML += `<div class="crypto-coin"><img src="${coin.image}" alt="${coin.symbol}"/><span>${coin.name}</span> <span class="crypto-price">$${coin.current_price.toLocaleString()}</span> <span class="crypto-change" style="color:${coin.price_change_percentage_24h>=0?'#0f0':'#f00'}">${coin.price_change_percentage_24h>=0?'+':''}${coin.price_change_percentage_24h.toFixed(2)}%</span></div>`;
        });
        ticker.innerHTML = coinHTML + coinHTML; // duplicate for infinite scroll
        scrollAmount = 0; // reset scroll position after update
      });
  }
  fetchCrypto();
  setInterval(fetchCrypto, 60000);
  // Infinite auto-scroll
  function animateScroll() {
    if (ticker.scrollWidth > ticker.clientWidth) {
      scrollAmount += scrollSpeed;
      if (scrollAmount >= ticker.scrollWidth / 2) {
        scrollAmount = 0;
      }
      ticker.scrollLeft = scrollAmount;
    }
    requestAnimationFrame(animateScroll);
  }
  animateScroll();
});
