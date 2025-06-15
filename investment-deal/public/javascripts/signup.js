// Your Firebase config here
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ...other config
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  document.getElementById('signup-form').onsubmit = async function(e) {
    e.preventDefault();
    const form = e.target;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const username = form.username.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    const privacy = form.privacy.checked;
  
    if (!privacy) return alert('You must agree to the privacy policy.');
    if (password !== confirmPassword) return alert('Passwords do not match.');
  
    try {
      const userCred = await auth.createUserWithEmailAndPassword(email, password);
      await userCred.user.sendEmailVerification();
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Registration successful! Please check your email for verification.');
      window.location.href = '/dashboard';
    } catch (err) {
      alert(err.message);
    }
  };