// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjlDKt-QOk_1gAQutwBB4M2xTy6_qjgX4",
  authDomain: "firestore-68a3a.firebaseapp.com",
  projectId: "firestore-68a3a",
  storageBucket: "firestore-68a3a.appspot.com",
  messagingSenderId: "80731087647",
  appId: "1:80731087647:web:8b9e8630d8cf0ef147c62a",
  measurementId: "G-JXYJJBZXJD"
};

// Initialize Firebase
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

// Global variables
let currentUser = null;
let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
const transactionsPerPage = 10;

// DOM Elements
const userNameElement = document.getElementById('userName');
const transactionTableBody = document.getElementById('transactionTableBody');
const dateFilter = document.getElementById('dateFilter');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const paginationContainer = document.querySelector('.pagination-container');
const currentRangeSpan = document.getElementById('currentRange');
const totalTransactionsSpan = document.getElementById('totalTransactions');

// Mobile Detection and Helper Functions
function isMobileDevice() {
  return window.innerWidth <= 768;
}

function createMobileCard(data) {
  const card = document.createElement('div');
  card.className = 'transaction-card';
  
  card.innerHTML = `
      <div class="card-header">
          <div class="card-id">#${data.id}</div>
          <div class="card-amount">${data.amount}</div>
      </div>
      <div class="card-details">
          <div class="card-detail">
              <div class="card-detail-label">Date & Time</div>
              <div class="card-detail-value">${data.date}</div>
          </div>
          <div class="card-detail">
              <div class="card-detail-label">Type</div>
              <div class="card-detail-value">${data.type}</div>
          </div>
          <div class="card-detail">
              <div class="card-detail-label">Status</div>
              <div class="card-detail-value">${data.status}</div>
          </div>
          <div class="card-detail">
              <div class="card-detail-label">Plan</div>
              <div class="card-detail-value">${data.plan}</div>
          </div>
      </div>
      <div class="card-footer">
          <div class="card-actions">
              ${data.actions}
          </div>
      </div>
  `;
  
  return card;
}

function convertTableToMobileCards() {
  const tableContainer = document.querySelector('.table-container');
  const mobileCards = document.querySelector('.mobile-cards');
  const tableBody = document.querySelector('#transactionTableBody');
  
  if (!tableContainer || !mobileCards || !tableBody) return;
  
  // Clear existing mobile cards
  mobileCards.innerHTML = '';
  
  // Get table rows (excluding empty row)
  const rows = tableBody.querySelectorAll('tr:not(.empty-row)');
  
  if (rows.length === 0) {
      // Show empty state in mobile cards
      mobileCards.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px; text-align: center;">
              <i class="fas fa-inbox" style="font-size: 3em; color: #ff8c00; opacity: 0.5; margin-bottom: 20px;"></i>
              <h3 style="font-size: 1.2em; margin-bottom: 10px;">No Transactions Found</h3>
              <p style="font-size: 0.9em; color: #ccc;">You haven't made any transactions yet. Start by making a deposit or investment.</p>
          </div>
      `;
      return;
  }
  
  // Convert each row to a card
  rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
          const card = createMobileCard({
              date: cells[0].textContent.trim(),
              id: cells[1].textContent.trim(),
              type: cells[2].innerHTML.trim(),
              amount: cells[3].textContent.trim(),
              status: cells[4].innerHTML.trim(),
              plan: cells[5].textContent.trim(),
              actions: cells[6].innerHTML.trim()
          });
          mobileCards.appendChild(card);
      }
  });
}

function toggleMobileView() {
  const tableContainer = document.querySelector('.table-container');
  const mobileCards = document.querySelector('.mobile-cards');
  
  if (isMobileDevice()) {
      // Show mobile cards and hide table
      if (tableContainer) tableContainer.style.display = 'none';
      if (mobileCards) {
          mobileCards.style.display = 'flex';
          convertTableToMobileCards();
      }
  } else {
      // Show table and hide mobile cards
      if (tableContainer) tableContainer.style.display = 'block';
      if (mobileCards) mobileCards.style.display = 'none';
  }
}

function updateMobileView() {
  if (isMobileDevice()) {
      convertTableToMobileCards();
  }
}

// Navigation function
function navigateTo(path) {
  window.location.href = path;
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

// Format date for display
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.toDate) {
      // Firebase timestamp
      date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
      // ISO string
      date = new Date(timestamp);
  } else {
      // Regular date
      date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });
}

// Format currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '' || amount === 'NaN') {
      return '$0.00';
  }
  
  const num = parseFloat(amount);
  if (isNaN(num)) {
      return '$0.00';
  }
  
  return `$${num.toFixed(2)}`;
}

// Create status badge
function createStatusBadge(status) {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="status-badge status-${statusClass}">${status}</span>`;
}

// Create type badge
function createTypeBadge(type) {
  const typeClass = type.toLowerCase().replace(/\s+/g, '-');
  return `<span class="type-badge type-${typeClass}">${type}</span>`;
}

// Create action buttons
function createActionButtons(transaction) {
  const status = transaction.status.toLowerCase();
  let buttons = '';
  
  if (status === 'pending') {
      buttons += `<button class="action-btn view" onclick="viewTransaction('${transaction.id}')">
          <i class="fas fa-eye"></i> View
      </button>`;
  } else {
      buttons += `<button class="action-btn view" onclick="viewTransaction('${transaction.id}')">
          <i class="fas fa-eye"></i> Details
      </button>`;
  }
  
  return buttons;
}

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// Load user transactions from Firestore
async function loadUserTransactions() {
  try {
      if (!currentUser) {
          console.error('No authenticated user');
          return;
      }

      showLoading();
      // Show loading state
      showLoadingState();

      // Get transactions from the userTransactions collection structure
      const transactionsRef = db.collection('userTransactions')
          .doc('transactions')
          .collection(currentUser.uid)
          .orderBy('timestamp', 'desc');

      const snapshot = await transactionsRef.get();
      allTransactions = [];

      snapshot.forEach(doc => {
          const data = doc.data();
          allTransactions.push({
              id: doc.id,
              transactionId: data.transactionId || doc.id,
              type: data.type || 'Unknown',
              amount: data.amount || 0,
              status: data.status || 'Unknown',
              plan: data.plan || 'N/A',
              timestamp: data.timestamp,
              dateTime: data.dateTime,
              btcAmount: data.btcAmount || 0,
              paymentMethod: data.paymentMethod || 'N/A',
              description: data.description || '',
              notes: data.notes || ''
          });
      });

      // If no transactions found in new structure, check old structure for backward compatibility
      if (allTransactions.length === 0) {
          const oldTransactionsRef = db.collection('transactions')
              .where('userId', '==', currentUser.uid)
              .orderBy('timestamp', 'desc');

          const oldSnapshot = await oldTransactionsRef.get();
          oldSnapshot.forEach(doc => {
              const data = doc.data();
              allTransactions.push({
                  id: doc.id,
                  transactionId: data.transactionId || doc.id,
                  type: data.type || 'Unknown',
                  amount: data.amount || 0,
                  status: data.status || 'Unknown',
                  plan: data.plan || 'N/A',
                  timestamp: data.timestamp,
                  dateTime: data.dateTime,
                  btcAmount: data.btcAmount || 0,
                  paymentMethod: 'Bitcoin',
                  description: `${data.type} transaction`,
                  notes: ''
              });
          });
      }

      // Apply initial filters
      applyFilters();
      hideLoading();

  } catch (error) {
      console.error('Error loading transactions:', error);
      // Only show error state if it's a real error (not just empty)
      if (error && error.code !== 'not-found' && error.code !== 'permission-denied') {
        showErrorState();
      } else {
        // If it's just no data, show nothing (or empty state via applyFilters)
        allTransactions = [];
        applyFilters();
      }
      hideLoading();
  }
}

// Show loading state
function showLoadingState() {
  transactionTableBody.innerHTML = `
      <tr>
          <td colspan="7">
              <div class="table-loading">
                  <div class="loading-spinner"></div>
                  <p>Loading transactions...</p>
              </div>
          </td>
      </tr>
  `;
  
  // Also show loading in mobile cards
  const mobileCards = document.querySelector('.mobile-cards');
  if (mobileCards && isMobileDevice()) {
      mobileCards.innerHTML = `
          <div class="loading-state" style="padding: 40px 20px; text-align: center;">
              <div class="loading-spinner"></div>
              <p>Loading transactions...</p>
          </div>
      `;
  }
}

// Show error state
function showErrorState() {
  transactionTableBody.innerHTML = `
      <tr>
          <td colspan="7">
              <div class="empty-state">
                  <i class="fas fa-exclamation-triangle"></i>
                  <h3>Error Loading Transactions</h3>
                  <p>Unable to load your transactions. Please refresh the page and try again.</p>
                  <button class="cta-btn" onclick="loadUserTransactions()">
                      <i class="fas fa-refresh"></i>
                      Retry
                  </button>
              </div>
          </td>
      </tr>
  `;
  
  // Also show error in mobile cards
  const mobileCards = document.querySelector('.mobile-cards');
  if (mobileCards && isMobileDevice()) {
      mobileCards.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px; text-align: center;">
              <i class="fas fa-exclamation-triangle" style="font-size: 3em; color: #ff8c00; opacity: 0.5; margin-bottom: 20px;"></i>
              <h3 style="font-size: 1.2em; margin-bottom: 10px;">Error Loading Transactions</h3>
              <p style="font-size: 0.9em; color: #ccc;">Unable to load your transactions. Please refresh the page and try again.</p>
              <button class="cta-btn" onclick="loadUserTransactions()" style="margin-top: 20px;">
                  <i class="fas fa-refresh"></i>
                  Retry
              </button>
          </div>
      `;
  }
}

// Show empty state
function showEmptyState() {
  transactionTableBody.innerHTML = `
      <tr class="empty-row">
          <td colspan="7">
              <div class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <h3>No Transactions Found</h3>
                  <p>You haven't made any transactions yet. Start by making a deposit or investment.</p>
                 
              </div>
          </td>
      </tr>
  `;
  
  // Update mobile view to show empty state
  updateMobileView();
}

// Apply filters to transactions
function applyFilters() {
  const dateFilterValue = dateFilter.value;
  const typeFilterValue = typeFilter.value;
  const statusFilterValue = statusFilter.value;

  filteredTransactions = allTransactions.filter(transaction => {
      // Date filter
      if (dateFilterValue !== 'all') {
          const transactionDate = transaction.timestamp ? 
              (transaction.timestamp.toDate ? transaction.timestamp.toDate() : new Date(transaction.timestamp)) :
              new Date(transaction.dateTime);
          const now = new Date();
          
          switch (dateFilterValue) {
              case 'today':
                  if (transactionDate.toDateString() !== now.toDateString()) return false;
                  break;
              case 'week':
                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (transactionDate < weekAgo) return false;
                  break;
              case 'month':
                  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  if (transactionDate < monthAgo) return false;
                  break;
              case 'year':
                  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                  if (transactionDate < yearAgo) return false;
                  break;
          }
      }

      // Type filter
      if (typeFilterValue !== 'all') {
          if (transaction.type.toLowerCase() !== typeFilterValue.toLowerCase()) return false;
      }

      // Status filter
      if (statusFilterValue !== 'all') {
          if (transaction.status.toLowerCase() !== statusFilterValue.toLowerCase()) return false;
      }

      return true;
  });

  // Reset to first page
  currentPage = 1;
  displayTransactions();
}

// Display transactions with pagination
function displayTransactions() {
  if (filteredTransactions.length === 0) {
      showEmptyState();
      paginationContainer.classList.add('hidden');
      return;
  }

  // Calculate pagination
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const endIndex = startIndex + transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Generate table rows
  const tableRows = paginatedTransactions.map(transaction => `
      <tr>
          <td>${formatDate(transaction.timestamp || transaction.dateTime)}</td>
          <td>
              <span style="font-family: monospace; font-size: 12px; color: #ff8c00;">
                  ${transaction.transactionId}
              </span>
          </td>
          <td>${createTypeBadge(transaction.type)}</td>
          <td>${formatCurrency(transaction.amount)}</td>
          <td>${createStatusBadge(transaction.status)}</td>
          <td>
              <span style="color: #ff8c00; font-weight: bold;">
                  ${transaction.plan}
              </span>
          </td>
          <td>${createActionButtons(transaction)}</td>
      </tr>
  `).join('');

  transactionTableBody.innerHTML = tableRows;

  // Update pagination
  updatePagination();
  
  // Update mobile view
  updateMobileView();
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  
  if (totalPages <= 1) {
      paginationContainer.classList.add('hidden');
      return;
  }

  paginationContainer.classList.remove('hidden');

  // Update pagination info
  const startIndex = (currentPage - 1) * transactionsPerPage + 1;
  const endIndex = Math.min(currentPage * transactionsPerPage, filteredTransactions.length);
  
  currentRangeSpan.textContent = `${startIndex}-${endIndex}`;
  totalTransactionsSpan.textContent = filteredTransactions.length;

  // Update pagination buttons
  const prevBtn = document.querySelector('.pagination-btn');
  const nextBtn = document.querySelector('.pagination-btn:last-child');
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  // Generate page numbers
  const pageNumbers = document.querySelector('.page-numbers');
  pageNumbers.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.onclick = () => goToPage(i);
      pageNumbers.appendChild(pageBtn);
  }
}

// Pagination functions
function previousPage() {
  if (currentPage > 1) {
      currentPage--;
      displayTransactions();
  }
}

function nextPage() {
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  if (currentPage < totalPages) {
      currentPage++;
      displayTransactions();
  }
}

function goToPage(page) {
  currentPage = page;
  displayTransactions();
}

// View transaction details
function viewTransaction(transactionId) {
  const transaction = allTransactions.find(t => t.id === transactionId);
  if (!transaction) {
      alert('Transaction not found');
      return;
  }

  // Create modal or redirect to details page
  showTransactionModal(transaction);
}

// Show transaction modal
function showTransactionModal(transaction) {
  const modal = document.createElement('div');
  modal.className = 'transaction-modal';
  modal.innerHTML = `
      <div class="modal-backdrop" onclick="closeTransactionModal()"></div>
      <div class="modal-content">
          <div class="modal-header">
              <h3>Transaction Details</h3>
              <button class="close-btn" onclick="closeTransactionModal()">
                  <i class="fas fa-times"></i>
              </button>
          </div>
          <div class="modal-body">
              <div class="detail-row">
                  <span class="label">Transaction ID:</span>
                  <span class="value">${transaction.transactionId}</span>
              </div>
              <div class="detail-row">
                  <span class="label">Date & Time:</span>
                  <span class="value">${formatDate(transaction.timestamp || transaction.dateTime)}</span>
              </div>
              <div class="detail-row">
                  <span class="label">Type:</span>
                  <span class="value">${createTypeBadge(transaction.type)}</span>
              </div>
              <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="value">${formatCurrency(transaction.amount)}</span>
              </div>
              <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value">${createStatusBadge(transaction.status)}</span>
              </div>
              <div class="detail-row">
                  <span class="label">Plan:</span>
                  <span class="value">${transaction.plan}</span>
              </div>
              ${transaction.btcAmount ? `
              <div class="detail-row">
                  <span class="label">BTC Amount:</span>
                  <span class="value">${transaction.btcAmount.toFixed(8)} BTC</span>
              </div>
              ` : ''}
              ${transaction.description ? `
              <div class="detail-row">
                  <span class="label">Description:</span>
                  <span class="value">${transaction.description}</span>
              </div>
              ` : ''}
              ${transaction.notes ? `
              <div class="detail-row">
                  <span class="label">Notes:</span>
                  <span class="value">${transaction.notes}</span>
              </div>
              ` : ''}
          </div>
      </div>
  `;

  document.body.appendChild(modal);
  
  // Add modal styles
  const style = document.createElement('style');
  style.textContent = `
      .transaction-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      
      .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
      }
      
      .modal-content {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 15px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .modal-header h3 {
          color: #ff8c00;
          margin: 0;
      }
      
      .close-btn {
          background: none;
          border: none;
          color: #ccc;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
      }
      
      .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ff8c00;
      }
      
      .modal-body {
          padding: 20px;
      }
      
      .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      
      .detail-row:last-child {
          border-bottom: none;
      }
      
      .detail-row .label {
          color: #ccc;
          font-weight: bold;
          font-size: 14px;
      }
      
      .detail-row .value {
          color: white;
          font-size: 14px;
          text-align: right;
      }
  `;
  document.head.appendChild(style);
}

// Close transaction modal
function closeTransactionModal() {
  const modal = document.querySelector('.transaction-modal');
  if (modal) {
      modal.remove();
  }
}

// Load user data
async function loadUserData() {
  try {
      if (currentUser) {
          const userDoc = await db.collection('users').doc(currentUser.uid).get();
          const userData = userDoc.data();
          
          if (userData) {
              userNameElement.textContent = userData.displayName || userData.email || 'User';
          }
      }
  } catch (error) {
      console.error('Error loading user data:', error);
  }
}

// Initialize the page
function initializePage() {
  try {
      // Add mobile cards container if it doesn't exist
      if (!document.querySelector('.mobile-cards')) {
          const mobileCards = document.createElement('div');
          mobileCards.className = 'mobile-cards';
          
          const tableContainer = document.querySelector('.table-container');
          if (tableContainer) {
              tableContainer.parentNode.insertBefore(mobileCards, tableContainer.nextSibling);
          }
      }
      
      // Setup mobile view
      toggleMobileView();
      
      // Setup auth state listener
      auth.onAuthStateChanged(async (user) => {
          if (user) {
              currentUser = user;
              await loadUserData();
              await loadUserTransactions();
          } else {
              // Redirect to login if not authenticated
              window.location.href = '/signin';
          }
      });

      // Setup filter event listeners
      dateFilter.addEventListener('change', applyFilters);
      typeFilter.addEventListener('change', applyFilters);
      statusFilter.addEventListener('change', applyFilters);

  } catch (error) {
      console.error('Error initializing page:', error);
      alert('Error initializing page. Please refresh and try again.');
  }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Handle window resize
window.addEventListener('resize', function() {
  toggleMobileView();
});

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
});

// Handle online/offline status
window.addEventListener('online', function() {
  console.log('Connection restored');
  loadUserTransactions();
});

window.addEventListener('offline', function() {
  console.log('Connection lost');
  showErrorState();
});

// Export functions for global access
window.navigateTo = navigateTo;
window.handleLogout = handleLogout;
window.applyFilters = applyFilters;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.viewTransaction = viewTransaction;
window.closeTransactionModal = closeTransactionModal;
window.toggleMobileView = toggleMobileView;
window.updateMobileView = updateMobileView;