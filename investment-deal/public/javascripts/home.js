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

  // Enhanced Crypto ticker logic with fixed animation
  const ticker = document.getElementById('crypto-ticker');
  const coins = [
    { id: 'bitcoin', symbol: 'BTC' },
    { id: 'ethereum', symbol: 'ETH' },
    { id: 'tether', symbol: 'USDT' },
    { id: 'binancecoin', symbol: 'BNB' },
    { id: 'solana', symbol: 'SOL' },
    { id: 'ripple', symbol: 'XRP' },
    { id: 'cardano', symbol: 'ADA' },
    { id: 'dogecoin', symbol: 'DOGE' },
    { id: 'chainlink', symbol: 'LINK' },
    { id: 'polygon', symbol: 'MATIC' },
    { id: 'avalanche-2', symbol: 'AVAX' },
    { id: 'litecoin', symbol: 'LTC' }
  ];
  
  let tickerContent = '';
  let animationPaused = false;

  function formatPrice(price) {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(6);
    }
  }

  function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  }

  function fetchCrypto() {
    if (!ticker) return;
    
    // Show loading state
    ticker.innerHTML = '<div class="crypto-coin loading">Loading crypto data...</div>';
    
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + 
                   coins.map(c => c.id).join(',') + 
                   '&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h';
    
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!data || data.length === 0) {
          throw new Error('No data received');
        }
        
        let coinHTML = '';
        data.forEach(coin => {
          const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
          const changeIcon = coin.price_change_percentage_24h >= 0 ? '▲' : '▼';
          
          coinHTML += `
            <div class="crypto-coin">
              <div class="coin-icon">
                <img src="${coin.image}" alt="${coin.symbol}" onerror="this.style.display='none'"/>
              </div>
              <div class="coin-info">
                <span class="coin-symbol">${coin.symbol}</span>
                <span class="coin-name">${coin.name}</span>
              </div>
              <div class="coin-price">
                <span class="price">$${formatPrice(coin.current_price)}</span>
                <span class="change ${changeClass}">
                  <span class="change-icon">${changeIcon}</span>
                  ${formatChange(coin.price_change_percentage_24h)}
                </span>
              </div>
            </div>
          `;
        });
        
        // Clear any existing content and animation to prevent overlap
        ticker.style.animation = 'none';
        ticker.offsetHeight; // Trigger reflow to ensure animation stops
        
        // Create seamless loop content
        tickerContent = coinHTML;
        ticker.innerHTML = tickerContent + tickerContent; // Exactly 2 copies for 50% animation
        
        // Restart animation
        ticker.style.animation = 'scroll-infinite 80s linear infinite';
        
        hideLoadingOverlay();
      })
      .catch(error => {
        console.error('Error fetching crypto data:', error);
        ticker.innerHTML = `
          <div class="crypto-coin error">
            <div class="coin-info">
              <span class="coin-symbol">API</span>
              <span class="coin-name">Error loading data</span>
            </div>
            <div class="coin-price">
              <span class="price">Retrying...</span>
            </div>
          </div>
        `;
        hideLoadingOverlay();
        
        // Retry after 5 seconds
        setTimeout(fetchCrypto, 5000);
      });
  }

  function hideLoadingOverlay() {
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 500);
    }
  }

  // Pause animation when page is not visible (performance optimization)
  document.addEventListener('visibilitychange', function() {
    if (ticker) {
      if (document.hidden) {
        ticker.style.animationPlayState = 'paused';
      } else {
        ticker.style.animationPlayState = 'running';
      }
    }
  });

  // Add hover pause functionality
  if (ticker) {
    const tickerBar = ticker.closest('.ticker-bar');
    if (tickerBar) {
      tickerBar.addEventListener('mouseenter', () => {
        ticker.style.animationPlayState = 'paused';
      });
      
      tickerBar.addEventListener('mouseleave', () => {
        if (!document.hidden) {
          ticker.style.animationPlayState = 'running';
        }
      });
    }
  }

  // Initialize Firebase and Auth Check
  function initializeFirebaseAuth() {
    const firebaseConfig = {
      apiKey: "AIzaSyBjlDKt-QOk_1gAQutwBB4M2xTy6_qjgX4",
      authDomain: "firestore-68a3a.firebaseapp.com",
      projectId: "firestore-68a3a",
      storageBucket: "firestore-68a3a.appspot.com",
      messagingSenderId: "80731087647",
      appId: "1:80731087647:web:8b9e8630d8cf0ef147c62a",
      measurementId: "G-JXYJJBZXJD"
    };
    
    if (typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        
        const auth = firebase.auth();
        
        updateNavButtons(null, true);
        
        auth.onAuthStateChanged(function(user) {
          console.log('Auth state changed:', user ? 'User logged in' : 'User not logged in');
          updateNavButtons(user, false);
        });
        
      } catch (error) {
        console.error('Firebase initialization error:', error);
        updateNavButtons(null, false);
      }
    } else {
      console.warn('Firebase not loaded');
      updateNavButtons(null, false);
    }
  }
  
  function updateNavButtons(user, isLoading) {
    document.querySelectorAll('.nav-actions a.button').forEach(btn => {
      if (isLoading) {
        btn.textContent = 'Loading...';
        btn.setAttribute('href', '#');
      } else if (user) {
        btn.textContent = 'Dashboard';
        btn.setAttribute('href', '/dashboard');
      } else {
        btn.textContent = 'Sign In';
        btn.setAttribute('href', '/signin');
      }
    });
    
    document.querySelectorAll('.mobile-nav ul li a.button').forEach(btn => {
      if (isLoading) {
        btn.textContent = 'Loading...';
        btn.setAttribute('href', '#');
      } else if (user) {
        btn.textContent = 'Dashboard';
        btn.setAttribute('href', '/dashboard');
      } else {
        btn.textContent = 'Sign In';
        btn.setAttribute('href', '/signin');
      }
    });
  }

  // Initialize crypto ticker
  fetchCrypto();
  
  // Refresh crypto data every 2 minutes
  setInterval(fetchCrypto, 120000);
  
  // Initialize Firebase Auth
  initializeFirebaseAuth();
});

// Mobile Navigation Functions
function toggleMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobileNav');

  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');

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

// Add click handlers to mobile nav links
document.querySelectorAll('.mobile-nav ul li a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});