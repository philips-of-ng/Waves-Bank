import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuQCpOAl39SwYbzIWzcKjepNcmilRpN2k",
  authDomain: "waves-bank.firebaseapp.com",
  projectId: "waves-bank",
  storageBucket: "waves-bank.appspot.com",
  messagingSenderId: "389165188354",
  appId: "1:389165188354:web:f57be4686f20ef538cae1b",
  measurementId: "G-XQZ14QK1W5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Collection reference for users
const usersColRef = collection(db, "users");


const resetPassword = async () => {
  try {
    await sendPasswordResetEmail(auth, email.value);
    messageEl.textContent = "✅ Password reset link sent! Check your email.";
    messageEl.style.color = "green";

    setTimeout(() => {
      window.location.href = '../auth/login.html'
    }, 3000);
  } catch (error) {
    messageEl.textContent = `❌ Error: ${error.message}`;
    messageEl.style.color = "red";
  }
}

const resetPasswordForm = document.getElementById('resetPasswordForm')
const email = document.getElementById('email')
const messageEl = document.getElementById('messageEl')

resetPasswordForm.addEventListener('submit', (e) => {
  e.preventDefault()

  resetPassword()
})



