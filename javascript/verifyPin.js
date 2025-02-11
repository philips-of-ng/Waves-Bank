import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


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


// ----------------------------------
// ----------------------------------

const dots = document.querySelectorAll('.dot');
const keypad = document.querySelector('#keypad');

let pin = ''; // Store the entered PIN

keypad.addEventListener('click', (e) => {
  const button = e.target.closest('.key');
  if (!button) return;

  const value = button.textContent.trim();

  // Handle backspace
  if (button.id === 'backspace') {
    pin = pin.slice(0, -1);
  } else if (pin.length < 6 && !isNaN(value)) {
    pin += value;
    console.log(value)
  }

  // Update the dots display
  updateDots();
});

function updateDots() {
  dots.forEach((dot, index) => {
    if (index < pin.length) {
      dot.classList.add('filled-dot');
    } else {
      dot.classList.remove('filled-dot');
    }
  });
}

let userUID = null
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user.uid);
    userUID = user.uid
  } else {
    window.location.href = '../auth/Login.html'
  }
})

const warningText = document.getElementById('warningText')
const verifyBtn = document.getElementById('verify')
let failedAttempts = 0;
const maxAttempts = 3;
// let leftAttempts = maxAttempts - failedAttempts

const verifyPin = async (enteredPin) => {
  if (enteredPin.length < 6) {
    alert('Incomplete Pin');
    return;
  }

  console.log('Pin:', enteredPin);
  console.log(auth.currentUser.uid);
  try {
    const docSnap = await getDoc(doc(usersColRef, userUID));
    const originalPin = docSnap.data().pin;
    console.log(docSnap.data());
    
    console.log('Original pin', originalPin);

    const isMatch = (originalPin == enteredPin);

    if (isMatch) {
      alert('PIN VERIFIED');
      window.location.href = "../pages/BankHome.html"
      failedAttempts = 0;
    } else {
      failedAttempts++;
      // alert('WRONG PIN');
      warningText.style.color = 'red'
      warningText.textContent = `Wrong Pin! ${maxAttempts - failedAttempts} attempt${(maxAttempts - failedAttempts) > 1 ? 's' : ''} left... `
      pin = ''
      updateDots()

      if (failedAttempts >= maxAttempts) {

        warningText.textContent = 'Too many failed attempts. Logging out...'

        setTimeout(() => {
          signOut(auth);
        }, 2000);
        failedAttempts = 0;
      }
    }
  } catch (error) {
    console.log(error);
  }
};

verifyBtn.addEventListener('click', (e) => {
  e.preventDefault();
  verifyPin(pin);
});





