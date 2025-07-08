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
  const successNotification = document.getElementById('successNotification');
  const userNameElement = document.getElementById('userName');
  const depositAmountInput = document.getElementById('depositAmount');
  const selectedPlanInput = document.getElementById('selectedPlan');
  const btcAmountSpan = document.getElementById('btcAmount');
  const btcRateElement = document.querySelector('.btc-rate');
  const completePaymentBtn = document.getElementById('completePayment');
  const amountError = document.querySelector('.amount-error');
  
  // Global variables
  let currentUser = null;
  let selectedPlan = 'Bronze';
  let btcRate = 0;
  let planLimits = {
    'Bronze': { min: 2000, max: 10000 },
    'Silver': { min: 10000, max: 50000 },
    'Gold Pack': { min: 20000, max: 10000000 }
  };
  
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
  
  // Show success notification
  function showSuccessNotification() {
    successNotification.classList.remove('hidden');
    // Auto hide after 5 seconds
    setTimeout(() => {
      hideNotification();
    }, 5000);
  }
  
  // Hide success notification
  function hideNotification() {
    successNotification.classList.add('hidden');
  }
  
  // Format currency
  function formatCurrency(amount) {
    if (amount === null || amount === undefined || amount === '' || amount === 'NaN') {
      return '0.00 USD';
    }
    
    let numStr = String(amount).replace(/[^\d.-]/g, '');
    let num = parseFloat(numStr);
    
    if (isNaN(num)) {
      num = 0;
    }
    
    return `${num.toFixed(2)} USD`;
  }
  
  // Get Bitcoin rate from API
 // Get Bitcoin rate from CoinGecko API
async function getBitcoinRate() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      btcRate = parseFloat(data.bitcoin.usd);
      updateBitcoinRate();
      return btcRate;
    } catch (error) {
      console.error('Error fetching Bitcoin rate:', error);
      btcRate = 45000; // fallback
      updateBitcoinRate();
      return btcRate;
    }
  }
  
  
  // Update Bitcoin rate display
  function updateBitcoinRate() {
    if (btcRateElement) {
      btcRateElement.textContent = `(Rate: $${btcRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per BTC)`;
    }
  }
  
  // Calculate Bitcoin equivalent
  function calculateBitcoinAmount(usdAmount) {
    if (!usdAmount || !btcRate) return 0;
    return usdAmount / btcRate;
  }
  
  // Update Bitcoin amount display
  function updateBitcoinAmount() {
    const usdAmount = parseFloat(depositAmountInput.value);
    if (!isNaN(usdAmount) && usdAmount > 0) {
      const btcAmount = calculateBitcoinAmount(usdAmount);
      btcAmountSpan.textContent = `${btcAmount.toFixed(8)} BTC`;
    } else {
      btcAmountSpan.textContent = '0.00000000 BTC';
    }
  }
  
  // Validate deposit amount
  function validateDepositAmount() {
    const amount = parseFloat(depositAmountInput.value);
    const limits = planLimits[selectedPlan];
    
    if (isNaN(amount) || amount < limits.min || amount > limits.max) {
      amountError.textContent = `Amount must be between $${limits.min.toLocaleString()} and $${limits.max.toLocaleString()} for ${selectedPlan} plan`;
      amountError.classList.remove('hidden');
      completePaymentBtn.disabled = true;
      return false;
    } else {
      amountError.classList.add('hidden');
      completePaymentBtn.disabled = false;
      return true;
    }
  }
  
  // Setup plan selection
  function setupPlanSelection() {
    const planTabs = document.querySelectorAll('.plan-tab');
    
    planTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        planTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Update selected plan
        selectedPlan = this.dataset.plan;
        selectedPlanInput.value = selectedPlan;
        
        // Validate amount with new plan
        validateDepositAmount();
      });
    });
  }
  
  // Copy Bitcoin address to clipboard
  function copyToClipboard() {
    const btcAddress = document.getElementById('btcAddress');
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(btcAddress.value).then(() => {
        alert('Bitcoin address copied to clipboard!');
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
        fallbackCopyTextToClipboard(btcAddress.value);
      });
    } else {
      fallbackCopyTextToClipboard(btcAddress.value);
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
      alert('Bitcoin address copied to clipboard!');
    } catch (err) {
      console.error('Error copying text:', err);
      alert('Unable to copy address. Please copy it manually.');
    }
    
    document.body.removeChild(textArea);
  }
  
  // Handle payment completion
  // Handle payment completion
async function handlePaymentCompletion() {
    try {
      showLoading();
      
      const depositAmount = parseFloat(depositAmountInput.value);
      const btcAmount = calculateBitcoinAmount(depositAmount);
      
      if (!validateDepositAmount()) {
        hideLoading();
        return;
      }
      
      // Generate transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get current timestamp
      const currentTimestamp = firebase.firestore.FieldValue.serverTimestamp();
      
      // Update user data in Firestore
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      let userData = userDoc.data() || {};
      
      // Update account balance and current plan
      const newBalance = (userData.accountBalance || 0) + depositAmount;
      const newTotalDeposit = (userData.totalDeposit || 0) + depositAmount;
      
      const updateData = {
        accountBalance: newBalance,
        totalDeposit: newTotalDeposit,
        pendingDeposit: (userData.pendingDeposit || 0) + depositAmount,
        currentPlan: selectedPlan,
        lastUpdated: currentTimestamp
      };
      
      await db.collection('users').doc(currentUser.uid).update(updateData);
      
      // Store transaction in userTransactions collection structure
      const transactionData = {
        transactionId: transactionId,
        type: 'Deposit',
        amount: depositAmount,
        btcAmount: btcAmount,
        status: 'Pending',
        plan: selectedPlan,
        timestamp: currentTimestamp,
        dateTime: new Date().toISOString(), // For easy date/time display
        userId: currentUser.uid,
        userEmail: currentUser.email,
        // Additional fields for actions/management
        paymentMethod: 'Bitcoin',
        description: `Deposit to ${selectedPlan} plan`,
        processedBy: null, // Can be updated by admin
        notes: '',
        confirmationHash: null // Can be updated when payment is confirmed
      };
      
      // Store in the specified structure: userTransactions -> transactions -> currentUserUID (subcollection)
      await db.collection('userTransactions')
        .doc('transactions')
        .collection(currentUser.uid)
        .doc(transactionId)
        .set(transactionData);
      
      // Also keep the original transactions collection for backward compatibility
      await db.collection('transactions').add({
        userId: currentUser.uid,
        transactionId: transactionId,
        type: 'deposit',
        amount: depositAmount,
        btcAmount: btcAmount,
        plan: selectedPlan,
        status: 'pending',
        timestamp: currentTimestamp
      });
      
      hideLoading();
      showSuccessNotification();
      
      // Clear the form
      depositAmountInput.value = '';
      updateBitcoinAmount();
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
      
      console.log('Transaction stored successfully:', transactionData);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      hideLoading();
      alert('Error processing payment. Please try again.');
    }
  }
  
  // Helper function to retrieve user transactions (for displaying in transaction log)
  async function getUserTransactions() {
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const transactionsRef = db.collection('userTransactions')
        .doc('transactions')
        .collection(currentUser.uid)
        .orderBy('timestamp', 'desc');
      
      const snapshot = await transactionsRef.get();
      const transactions = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          dateTime: data.timestamp ? data.timestamp.toDate().toLocaleString() : data.dateTime,
          transactionId: data.transactionId,
          type: data.type,
          amount: `$${data.amount.toFixed(2)}`,
          status: data.status,
          plan: data.plan,
          actions: data.status === 'Pending' ? 'View Details' : 'Completed'
        });
      });
      
      return transactions;
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
  
  // Helper function to update transaction status (for admin use)
  async function updateTransactionStatus(transactionId, newStatus, adminNotes = '') {
    try {
      const transactionRef = db.collection('userTransactions')
        .doc('transactions')
        .collection(currentUser.uid)
        .doc(transactionId);
      
      await transactionRef.update({
        status: newStatus,
        notes: adminNotes,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        processedBy: currentUser.uid // or admin ID
      });
      
      console.log('Transaction status updated successfully');
      
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  }
  
  // Helper function to get transaction by ID
  async function getTransactionById(transactionId) {
    try {
      const transactionDoc = await db.collection('userTransactions')
        .doc('transactions')
        .collection(currentUser.uid)
        .doc(transactionId)
        .get();
      
      if (transactionDoc.exists) {
        return transactionDoc.data();
      } else {
        throw new Error('Transaction not found');
      }
      
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }
  // Setup navigation
  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const text = this.querySelector('span').textContent.trim();
        
        // Remove active class from all items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Navigate based on clicked item
        switch(text) {
          case 'Dashboard':
            window.location.href = '/dashboard';
            break;
          case 'Investment':
            window.location.href = '/investment';
            break;
          case 'Deposit':
            // Already on deposit page
            break;
          case 'Withdraw':
            window.location.href = '/withdraw';
            break;
          case 'Transaction log':
            window.location.href = '/transaction-log';
            break;
          case 'Logout':
            handleLogout();
            break;
        }
      });
    });
  }
  
  // Handle logout
  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  }
  
  // Load user data
  async function loadUserData() {
    try {
      if (currentUser) {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (userData) {
          // Update user name display
          userNameElement.textContent = userData.displayName || userData.email || 'User';
          
          // Set default plan if user has one
          if (userData.currentPlan) {
            selectedPlan = userData.currentPlan;
            selectedPlanInput.value = selectedPlan;
            
            // Update active plan tab
            const planTabs = document.querySelectorAll('.plan-tab');
            planTabs.forEach(tab => {
              if (tab.dataset.plan === selectedPlan) {
                tab.classList.add('active');
              } else {
                tab.classList.remove('active');
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }
  
  // Initialize the page
  async function initializePage() {
    try {
      // Hide loading modal initially
      hideLoading();
      
      // Setup auth state listener
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          currentUser = user;
          await loadUserData();
        } else {
          // Redirect to login if not authenticated
          window.location.href = '/signin';
        }
      });
      
      // Setup event listeners
      setupPlanSelection();
      setupNavigation();
      
      // Setup deposit amount input listener
      depositAmountInput.addEventListener('input', function() {
        validateDepositAmount();
        updateBitcoinAmount();
      });
      
      // Setup complete payment button
      completePaymentBtn.addEventListener('click', handlePaymentCompletion);
      
      // Get Bitcoin rate
      await getBitcoinRate();
      
      // Update Bitcoin rate every 5 minutes
      setInterval(getBitcoinRate, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Error initializing page:', error);
      alert('Error initializing page. Please refresh and try again.');
    }
  }
  
  // Auto-hide success notification after 5 seconds
  function autoHideNotification() {
    setTimeout(() => {
      if (!successNotification.classList.contains('hidden')) {
        hideNotification();
      }
    }, 5000);
  }
  
  // Add smooth scrolling to form validation errors
  function scrollToError() {
    if (!amountError.classList.contains('hidden')) {
      amountError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  // Format number inputs
  function formatNumberInput(input) {
    let value = input.value.replace(/[^\d.-]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    input.value = value;
  }
  
  // Add input formatting to deposit amount
  depositAmountInput.addEventListener('input', function() {
    formatNumberInput(this);
    validateDepositAmount();
    updateBitcoinAmount();
  });
  
  // Prevent negative values
  depositAmountInput.addEventListener('keydown', function(e) {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].includes(e.keyCode) ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190) {
      e.preventDefault();
    }
  });
  
  // Initialize page when DOM is loaded
  document.addEventListener('DOMContentLoaded', initializePage);
  
  // Handle page visibility change to refresh Bitcoin rate
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      getBitcoinRate();
    }
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // ESC to close notification
    if (e.key === 'Escape') {
      hideNotification();
    }
    
    // Enter to complete payment (if enabled)
    if (e.key === 'Enter' && !completePaymentBtn.disabled) {
      handlePaymentCompletion();
    }
  });
  
  // Add window beforeunload handler for unsaved changes
  window.addEventListener('beforeunload', function(e) {
    if (depositAmountInput.value && parseFloat(depositAmountInput.value) > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  
  // Global error handler
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    hideLoading();
  });
  
  // Handle online/offline status
  window.addEventListener('online', function() {
    console.log('Connection restored');
    getBitcoinRate();
  });
  
  window.addEventListener('offline', function() {
    console.log('Connection lost');
    alert('Connection lost. Please check your internet connection.');
  });