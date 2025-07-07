const firebaseConfig = {
    apiKey: "AIzaSyBjlDKt-QOk_1gAQutwBB4M2xTy6_qjgX4",
    authDomain: "firestore-68a3a.firebaseapp.com",
    projectId: "firestore-68a3a",
    storageBucket: "firestore-68a3a.appspot.com",
    messagingSenderId: "80731087647",
    appId: "1:80731087647:web:8b9e8630d8cf0ef147c62a",
    measurementId: "G-JXYJJBZXJD"
  };
  
  // Initialize Firebase with error handling
  let db, auth;
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      auth = firebase.auth();
      console.log('Firebase initialized successfully');
    } else {
      console.error('Firebase not loaded');
      alert('Firebase failed to load. Please refresh the page.');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Firebase initialization failed. Please check your configuration.');
  }
  
  // DOM Elements
  const loadingModal = document.getElementById('loadingModal');
  const userNameElement = document.getElementById('userName');
  const accountBalanceElement = document.getElementById('accountBalance');
  const totalWithdrawElement = document.getElementById('totalWithdraw');
  const totalDepositElement = document.getElementById('totalDeposit');
  const totalInvestElement = document.getElementById('totalInvest');
  const currentInvestElement = document.getElementById('currentInvest');
  const currentPlanElement = document.getElementById('currentPlan');
  const pendingInvestElement = document.getElementById('pendingInvest');
  const pendingWithdrawElement = document.getElementById('pendingWithdraw');
  const referralEarnElement = document.getElementById('referralEarn');
  const referralLinkElement = document.getElementById('referralLink');
  
  // Show loading modal
  function showLoading() {
    loadingModal.classList.remove('hidden');
    loadingModal.style.display = 'flex';
  }
  
  // Hide loading modal
  function hideLoading() {
    loadingModal.classList.add('hidden');
    loadingModal.style.display = 'none';
  }
  
  // Format currency - FIXED VERSION
  function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '' || amount === 'NaN') {
      return '0.00 USD';
    }
    
    // Convert to string first, then parse
    let numStr = String(amount).replace(/[^\d.-]/g, ''); // Remove non-numeric characters except dots and dashes
    let num = parseFloat(numStr);
    
    // If parsing fails, default to 0
    if (isNaN(num)) {
      num = 0;
    }
    
    return `${num.toFixed(2)} USD`;
  }
  
  // Load user data from Firestore
  async function loadUserData() {
    try {
      showLoading();
      
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user is signed in');
        window.location.href = '/login'; // Redirect to login if no user
        return;
      }
  
      const userId = currentUser.uid;
      
      // Get user document from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Update UI with user data
        updateUserInterface(userData);
        
        // Generate referral link
        const username = userData.username || 'user';
        referralLinkElement.textContent = `https://www.equitrust.com/register/${username}`;
        
      } else {
        console.error('User document not found');
        // Create default user document or handle error
        await createDefaultUserDocument(userId);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      // Handle error - show error message to user
      alert('Error loading dashboard data. Please try again.');
    } finally {
      hideLoading();
    }
  }
  
  // Update UI with user data
  function updateUserInterface(userData) {
    // Update username
    userNameElement.textContent = userData.username || 'User';
    
    // Update financial data with improved error handling
    accountBalanceElement.textContent = formatCurrency(userData.accountBalance || 0);
    totalWithdrawElement.textContent = formatCurrency(userData.totalWithdraw || 0);
    totalDepositElement.textContent = formatCurrency(userData.totalDeposit || 0);
    totalInvestElement.textContent = formatCurrency(userData.totalInvest || 0);
    currentInvestElement.textContent = formatCurrency(userData.currentInvest || 0);
    pendingInvestElement.textContent = formatCurrency(userData.pendingInvest || 0);
    pendingWithdrawElement.textContent = formatCurrency(userData.pendingWithdraw || 0);
    referralEarnElement.textContent = formatCurrency(userData.referralEarn || 0);
    
    // Update current plan
    currentPlanElement.textContent = userData.currentPlan || 'N/A';
  }
  
  // Create default user document - FIXED VERSION
  async function createDefaultUserDocument(userId) {
    try {
      const defaultData = {
        username: 'User',
        accountBalance: 0,
        totalWithdraw: 0,
        totalDeposit: 0,
        totalInvest: 0,
        currentInvest: 0,
        pendingInvest: 0,
        pendingWithdraw: 0,
        referralEarn: 0,
        currentPlan: 'N/A',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(userId).set(defaultData);
      updateUserInterface(defaultData);
      
    } catch (error) {
      console.error('Error creating default user document:', error);
    }
  }
  
  // Navigation handlers
  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const text = this.querySelector('span').textContent.toLowerCase();
        
        // Handle navigation based on menu item
        switch(text) {
          case 'dashboard':
            // Already on dashboard
            break;
          case 'investment':
            // Navigate to investment page
            window.location.href = '/investment';
            break;
          case 'deposit':
            // Navigate to deposit page
            window.location.href = '/deposit';
            break;
          case 'withdraw':
            // Navigate to withdraw page
            window.location.href = '/withdraw';
            break;
          case 'transfer money':
            // Navigate to transfer page
            window.location.href = '/transfer';
            break;
          case 'money transfer log':
            // Navigate to transfer log page
            window.location.href = '/transfer-log';
            break;
          case 'interest log':
            // Navigate to interest log page
            window.location.href = '/interest-log';
            break;
          case 'transaction log':
            // Navigate to transaction log page
            window.location.href = '/transaction-log';
            break;
          case 'referral log':
            // Navigate to referral log page
            window.location.href = '/referral-log';
            break;
          case '2fa':
            // Navigate to 2FA page
            window.location.href = '/2fa';
            break;
          case 'support':
            // Navigate to support page
            window.location.href = '/support';
            break;
          case 'logout':
            // Handle logout
            handleLogout();
            break;
        }
      });
    });
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      showLoading();
      await auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error logging out. Please try again.');
    } finally {
      hideLoading();
    }
  }
  
  // Real-time updates
  function setupRealTimeUpdates() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
  
    const userId = currentUser.uid;
    
    // Listen for real-time updates to user document
    db.collection('users').doc(userId).onSnapshot((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        updateUserInterface(userData);
      }
    }, (error) => {
      console.error('Error listening for updates:', error);
    });
  }
  
  // Copy referral link to clipboard
  function copyReferralLink() {
    const referralLink = referralLinkElement.textContent;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralLink).then(() => {
        alert('Referral link copied to clipboard!');
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
        fallbackCopyTextToClipboard(referralLink);
      });
    } else {
      fallbackCopyTextToClipboard(referralLink);
    }
  }
  
  // Fallback for copying text
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      alert('Referral link copied to clipboard!');
    } catch (err) {
      console.error('Error copying text:', err);
      alert('Unable to copy referral link. Please copy it manually.');
    }
    
    document.body.removeChild(textArea);
  }
  
  // Initialize dashboard
  function initializeDashboard() {
    showLoading();
    
    // Check if user is authenticated
    auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        loadUserData();
        setupRealTimeUpdates();
        setupNavigation();
        
        // Add click handler for referral link
        referralLinkElement.addEventListener('click', copyReferralLink);
        
      } else {
        // User is not signed in
        hideLoading();
        window.location.href = '/signin';
      }
    });
  }
  
  // Handle dropdown menus
  function setupDropdowns() {
    const dropdownItems = document.querySelectorAll('.dropdown');
    
    dropdownItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        const icon = this.querySelector('.dropdown-icon');
        
        // Toggle dropdown rotation
        if (icon.style.transform === 'rotate(180deg)') {
          icon.style.transform = 'rotate(0deg)';
        } else {
          icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }
  
  // Refresh data function
  function refreshData() {
    loadUserData();
  }
  
  // Page load event
  document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDropdowns();
    
    // Add refresh button functionality if needed
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
      refreshButton.addEventListener('click', refreshData);
    }
  });
  
  // Handle window resize for responsive design
  window.addEventListener('resize', function() {
    // Add any responsive adjustments here if needed
  });
  
  // Error handling for network issues
  window.addEventListener('online', function() {
    console.log('Connection restored');
    loadUserData();
  });
  
  window.addEventListener('offline', function() {
    console.log('Connection lost');
    // Handle offline state if needed
  });