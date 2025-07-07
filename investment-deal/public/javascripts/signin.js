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
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}
function showErrorModal(message) {
  let cleanMsg = message.replace(/^Firebase:\s*/i, '').replace(/\([^)]*\)\.?\s*$/, '').trim();
  const modal = document.getElementById('error-modal');
  const msgSpan = document.getElementById('error-modal-message');
  if (msgSpan) msgSpan.textContent = cleanMsg;
  if (modal) modal.classList.remove('hidden');
  const closeBtn = document.getElementById('close-error-modal');
  if (closeBtn) closeBtn.focus();
}
function hideErrorModal() {
  const modal = document.getElementById('error-modal');
  if (modal) modal.classList.add('hidden');
}
window.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('close-error-modal');
  if (closeBtn) closeBtn.onclick = hideErrorModal;
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideErrorModal();
  });

  const signinForm = document.getElementById('signin-form');
  const emailError = document.getElementById('email-error-message');
  if (!signinForm) return;
  signinForm.onsubmit = async function(e) {
    e.preventDefault();
    if (emailError) emailError.textContent = '';
    showLoading();
    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    if (password !== confirmPassword) {
      hideLoading();
      showErrorModal('Passwords do not match.');
      return;
    }
    try {
      const userCred = await firebase.auth().signInWithEmailAndPassword(email, password);
      if (!userCred.user.emailVerified) {
        await userCred.user.sendEmailVerification();
        hideLoading();
        showErrorModal('Your email is not verified. We have sent you another verification email. Please check your inbox.');
        if (emailError) emailError.textContent = 'Your email is not verified.';
        return;
      }
      hideLoading();
      window.location.href = '/dashboard';
    } catch (err) {
      hideLoading();
      showErrorModal(err.message);
    }
  };
}); 