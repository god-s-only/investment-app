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
const errorNotification = document.getElementById('errorNotification');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const userNameElement = document.getElementById('userName');
const accountBalanceElement = document.getElementById('accountBalance');
const availableBalanceElement = document.getElementById('availableBalance');
const pendingWithdrawalsElement = document.getElementById('pendingWithdrawals');
const withdrawAmountInput = document.getElementById('withdrawAmount');
const withdrawalMethodSelect = document.getElementById('withdrawalMethod');
const withdrawalDetailsTextarea = document.getElementById('withdrawalDetails');
const withdrawalNotesTextarea = document.getElementById('withdrawalNotes');
const submitWithdrawalBtn = document.getElementById('submitWithdrawal');
const amountError = document.querySelector('.amount-error');

// Global variables
let currentUser = null;
let userData = null;
let accountBalance = 0;
let pendingWithdrawals = 0;
let availableBalance = 0;
const minimumWithdrawal = 100;

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

// Show error notification
function showErrorNotification(title, message) {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  errorNotification.classList.remove('hidden');
  // Auto hide after 7 seconds
  setTimeout(() => {
    hideErrorNotification();
  }, 7000);
}

// Hide error notification
function hideErrorNotification() {
  errorNotification.classList.add('hidden');
}

// Format currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '' || amount === 'NaN') {
    return '$0.00';
  }
  
  let numStr = String(amount).replace(/[^\d.-]/g, '');
  let num = parseFloat(numStr);
  
  if (isNaN(num)) {
    num = 0;
  }
  
  return `$${num.toFixed(2)}`;
}

// Calculate days since account creation
function calculateDaysSinceCreation(createdAt) {
  const now = new Date();
  const creationDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const timeDiff = now.getTime() - creationDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
}

// Check if user can withdraw (30-day rule)
function canUserWithdraw() {
  if (!userData || !userData.createdAt) {
    return { canWithdraw: false, reason: 'Account creation date not found' };
  }
  
  const daysSinceCreation = calculateDaysSinceCreation(userData.createdAt);
  
  if (daysSinceCreation < 30) {
    const remainingDays = 30 - daysSinceCreation;
    return { 
      canWithdraw: false, 
      reason: `Cannot place withdrawal before 30 days. ${remainingDays} days remaining.` 
    };
  }
  
  return { canWithdraw: true, reason: null };
}

// Validate withdrawal amount
function validateWithdrawalAmount() {
  const amount = parseFloat(withdrawAmountInput.value);
  
  // Check if amount is valid
  if (isNaN(amount) || amount <= 0) {
    amountError.textContent = 'Please enter a valid amount';
    amountError.classList.remove('hidden');
    submitWithdrawalBtn.disabled = true;
    return false;
  }
  
  // Check minimum withdrawal
  if (amount < minimumWithdrawal) {
    amountError.textContent = `Minimum withdrawal amount is $${minimumWithdrawal}`;
    amountError.classList.remove('hidden');
    submitWithdrawalBtn.disabled = true;
    return false;
  }
  
  // Check if amount exceeds available balance
  if (amount > availableBalance) {
    amountError.textContent = `Amount exceeds available balance of ${formatCurrency(availableBalance)}`;
    amountError.classList.remove('hidden');
    submitWithdrawalBtn.disabled = true;
    return false;
  }
  
  // Check 30-day rule
  const withdrawalCheck = canUserWithdraw();
  if (!withdrawalCheck.canWithdraw) {
    amountError.textContent = withdrawalCheck.reason;
    amountError.classList.remove('hidden');
    submitWithdrawalBtn.disabled = true;
    return false;
  }
  
  // All validations passed
  amountError.classList.add('hidden');
  submitWithdrawalBtn.disabled = false;
  return true;
}

// Validate form
function validateForm() {
  const amount = parseFloat(withdrawAmountInput.value);
  const method = withdrawalMethodSelect.value;
  const details = withdrawalDetailsTextarea.value.trim();
  
  const isAmountValid = validateWithdrawalAmount();
  const isMethodValid = method !== '';
  const isDetailsValid = details.length > 0;
  
  if (!isDetailsValid) {
    submitWithdrawalBtn.disabled = true;
    return false;
  }
  
  submitWithdrawalBtn.disabled = !(isAmountValid && isMethodValid && isDetailsValid);
  return (isAmountValid && isMethodValid && isDetailsValid);
}

// Load user data and balance
async function loadUserData() {
  try {
    if (!currentUser) return;
    
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    userData = userDoc.data();
    
    if (userData) {
      // Update user name display
      userNameElement.textContent = userData.displayName || userData.email || 'User';
      
      // Get current pending withdrawals
      pendingWithdrawals = await getPendingWithdrawalsTotal();
      
      // Update balance information
      accountBalance = userData.accountBalance || 0;
      availableBalance = Math.max(0, accountBalance - pendingWithdrawals);
      
      // Update UI
      accountBalanceElement.textContent = formatCurrency(accountBalance);
      availableBalanceElement.textContent = formatCurrency(availableBalance);
      pendingWithdrawalsElement.textContent = formatCurrency(pendingWithdrawals);
      
      // Validate withdrawal capability
      const withdrawalCheck = canUserWithdraw();
      if (!withdrawalCheck.canWithdraw) {
        showErrorNotification('Withdrawal Restricted', withdrawalCheck.reason);
      }
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    showErrorNotification('Error', 'Failed to load user data. Please refresh the page.');
  }
}

// Get pending withdrawals total
async function getPendingWithdrawalsTotal() {
  try {
    const pendingWithdrawalsSnapshot = await db.collection('userTransactions')
      .doc('transactions')
      .collection(currentUser.uid)
      .where('type', '==', 'Withdrawal')
      .where('status', '==', 'Pending')
      .get();
    
    let total = 0;
    pendingWithdrawalsSnapshot.forEach(doc => {
      const data = doc.data();
      total += data.amount || 0;
    });
    
    return total;
  } catch (error) {
    console.error('Error getting pending withdrawals:', error);
    return 0;
  }
}

// Handle withdrawal submission
async function handleWithdrawalSubmission() {
  try {
    if (!validateForm()) {
      return;
    }
    
    showLoading();
    
    const amount = parseFloat(withdrawAmountInput.value);
    const method = withdrawalMethodSelect.value;
    const details = withdrawalDetailsTextarea.value.trim();
    const notes = withdrawalNotesTextarea.value.trim();
    
    // Create withdrawal transaction
    const transactionId = db.collection('userTransactions').doc().id;
    const transactionData = {
      id: transactionId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      type: 'Withdrawal',
      amount: amount,
      method: method,
      details: details,
      notes: notes,
      status: 'Pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add transaction to database
    await db.collection('userTransactions')
      .doc('transactions')
      .collection(currentUser.uid)
      .doc(transactionId)
      .set(transactionData);
    
    // Update user's pending withdrawals
    await db.collection('users').doc(currentUser.uid).update({
      pendingWithdrawals: firebase.firestore.FieldValue.increment(amount),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    hideLoading();
    showSuccessNotification();
    clearForm();
    
    // Reload user data to reflect changes
    await loadUserData();
    
  } catch (error) {
    console.error('Error submitting withdrawal:', error);
    hideLoading();
    showErrorNotification('Submission Failed', 'Failed to submit withdrawal request. Please try again.');
  }
}

// Clear form
function clearForm() {
  withdrawAmountInput.value = '';
  withdrawalMethodSelect.value = '';
  withdrawalDetailsTextarea.value = '';
  withdrawalNotesTextarea.value = '';
  amountError.classList.add('hidden');
  submitWithdrawalBtn.disabled = true;
}

// Navigation functions
function navigateTo(path) {
  window.location.href = path;
}

// Handle logout
function handleLogout() {
  if (auth) {
    auth.signOut().then(() => {
      window.location.href = '/signin';
    }).catch((error) => {
      console.error('Error signing out:', error);
      showErrorNotification('Logout Error', 'Failed to logout. Please try again.');
    });
  }
}

// Initialize authentication state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    loadUserData();
  } else {
    window.location.href = '/login';
  }
});

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Amount input validation
  withdrawAmountInput.addEventListener('input', validateWithdrawalAmount);
  withdrawAmountInput.addEventListener('blur', validateWithdrawalAmount);
  
  // Form validation
  withdrawalMethodSelect.addEventListener('change', validateForm);
  withdrawalDetailsTextarea.addEventListener('input', validateForm);
  
  // Submit button
  submitWithdrawalBtn.addEventListener('click', handleWithdrawalSubmission);
  
  // Enter key submission
  withdrawAmountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !submitWithdrawalBtn.disabled) {
      handleWithdrawalSubmission();
    }
  });
  
  // Close notifications on click
  document.addEventListener('click', (e) => {
    if (e.target.closest('.notification-close')) {
      if (e.target.closest('.success-notification')) {
        hideNotification();
      } else if (e.target.closest('.error-notification')) {
        hideErrorNotification();
      }
    }
  });
  
  // Prevent form submission on Enter in textareas
  withdrawalDetailsTextarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && !submitWithdrawalBtn.disabled) {
      handleWithdrawalSubmission();
    }
  });
  
  withdrawalNotesTextarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey && !submitWithdrawalBtn.disabled) {
      handleWithdrawalSubmission();
    }
  });
});

// Handle page visibility change to refresh data
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && currentUser) {
    loadUserData();
  }
});

// Auto-refresh data every 30 seconds
setInterval(() => {
  if (currentUser && !document.hidden) {
    loadUserData();
  }
}, 30000);