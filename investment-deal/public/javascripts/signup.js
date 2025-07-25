// Remove: import { initializeApp } from "firebase/app";
// Remove: import { getAnalytics } from "firebase/analytics";

// Your Firebase config here


const firebaseConfig = {
  apiKey: "AIzaSyBjlDKt-QOk_1gAQutwBB4M2xTy6_qjgX4",
  authDomain: "firestore-68a3a.firebaseapp.com",
  projectId: "firestore-68a3a",
  storageBucket: "firestore-68a3a.appspot.com",
  messagingSenderId: "80731087647",
  appId: "1:80731087647:web:8b9e8630d8cf0ef147c62a",
  measurementId: "G-JXYJJBZXJD"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function showErrorModal(message, onClose, okText) {
  // Remove 'Firebase:' prefix and any error code in parentheses at the end (e.g., (auth/email-already-in-use))
  let cleanMsg = message.replace(/^Firebase:\s*/i, '').replace(/\([^)]*\)\.?\s*$/, '').trim();
  const modal = document.getElementById('error-modal');
  const msgSpan = document.getElementById('error-modal-message');
  const closeBtn = document.getElementById('close-error-modal');
  if (msgSpan) msgSpan.textContent = cleanMsg;
  if (closeBtn) {
    closeBtn.textContent = okText || 'Close';
    closeBtn.onclick = function() {
      modal.classList.add('hidden');
      if (onClose) onClose();
      // Restore button text for next time
      closeBtn.textContent = 'Close';
    };
    closeBtn.focus();
  }
  if (modal) modal.classList.remove('hidden');
}
function hideErrorModal() {
  const modal = document.getElementById('error-modal');
  if (modal) modal.classList.add('hidden');
}
// Attach close event
window.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('close-error-modal');
  if (closeBtn) closeBtn.onclick = hideErrorModal;
  // Also close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideErrorModal();
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signup-form');
  if (!signupForm) return;
  signupForm.onsubmit = async function(e) {
    e.preventDefault();
    showLoading();
    const form = e.target;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const username = form.username.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const privacy = form.privacy.checked;

    if (!privacy) {
      hideLoading();
      showErrorModal('You must agree to the privacy policy.');
      return;
    }
    if (password !== confirmPassword) {
      hideLoading();
      showErrorModal('Passwords do not match.');
      return;
    }

    try {
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(userCred.user.uid).set({
        firstName, lastName, username, phone, email,
        accountBalance: "$0.00",
        totalWithdraw: "$0.00",
        totalDeposit: "$0.00",
        totalInvest: "$0.00",
        currentInvest: "$0.00",
        pendingInvest: "$0.00",
        pendingWithdraw: "$0.00",
        referralEarn: "$0.00",
        currentPlan:"N/A",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      await userCred.user.sendEmailVerification();
      hideLoading();
      showErrorModal('Sign up successful, please check your email for verification or spam folder.', function() {
        window.location.href = '/signin';
      });
    } catch (err) {
      hideLoading();
      showErrorModal(err.message);
    }
  };
});