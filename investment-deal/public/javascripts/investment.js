// Firebase Auth initialization (assumes firebase-app and firebase-auth are loaded globally)
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
if (typeof firebase !== 'undefined') {
    let auth = firebase.auth();
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in, display email and name
            const email = user.email;
            const displayName = user.displayName || email;
            const nameElem = document.getElementById('userName');
          
            if (nameElem) {
                nameElem.textContent = displayName;
            }
        } else {
            // No user is signed in
           
          
        }
    });
} else {
    console.error('Firebase not loaded on this page.');
}

window.navigateTo = function(path) {
    window.location.href = path;
};
window.handleLogout = async function() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        try {
            await firebase.auth().signOut();
            window.location.href = '/signin';
        } catch (error) {
            alert('Error signing out. Please try again.');
        }
    } else {
        window.location.href = '/signin';
    }
};
