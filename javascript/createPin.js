import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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

let userData = null
onAuthStateChanged(auth, (user) => {
  if (user) {
    userData = user
    console.log(userData);


    const setNewPin = async (pin) => {
      try {
        const docRef = doc(usersColRef, user.uid)
        await updateDoc(docRef, {
          pin: pin
        })
        alert('Pin set successfully.')
        window.location.href = '../pages/BankHome.html'

      } catch (error) {
        console.log('Error setting new pin', error);
      }

    }





    const firstPage = document.getElementById('first-page');
    const secondPage = document.getElementById('second-page');

    // Variables for the first view
    let pin = '';
    const firstDots = firstPage.querySelectorAll('.dot');
    const firstKeypad = firstPage.querySelector('#keypad');

    // Variables for the second view
    let confirmedPin = '';
    const secondDots = secondPage.querySelectorAll('.dot');
    const secondKeypad = secondPage.querySelector('#keypad');

    // Handle keypad input for the first view
    firstKeypad.addEventListener('click', (e) => {
      const button = e.target.closest('.key');
      if (!button) return;

      const value = button.textContent.trim();

      if (button.id === 'backspace') {
        pin = pin.slice(0, -1);
      } else if (!isNaN(value) && pin.length < 6) {
        pin += value;
      } else if (button.id === 'verify' && pin.length === 6) {
        switchToSecondPage();
        return;
      }

      updateDots(firstDots, pin);
    });

    // Handle keypad input for the second view
    secondKeypad.addEventListener('click', (e) => {
      const button = e.target.closest('.key');
      if (!button) return;

      const value = button.textContent.trim();

      if (button.id === 'backspace') {
        confirmedPin = confirmedPin.slice(0, -1);
      } else if (!isNaN(value) && confirmedPin.length < 6) {
        confirmedPin += value;
      } else if (button.id === 'verify' && confirmedPin.length === 6) {
        if (confirmedPin === pin) {
          setNewPin(pin)
          // alert('Transaction PIN set successfully!');
          reset();
        } else {
          alert('PINs do not match. Please try again.');
          resetSecondPage();
        }
        return;
      }

      updateDots(secondDots, confirmedPin);
    });

    // Update the dot indicators
    function updateDots(dots, value) {
      dots.forEach((dot, index) => {
        if (index < value.length) {
          dot.classList.add('filled-dot');
        } else {
          dot.classList.remove('filled-dot');
        }
      });
    }

    // Switch to the second page
    function switchToSecondPage() {
      firstPage.style.display = 'none';
      secondPage.style.display = 'block';
    }

    // Reset everything
    function reset() {
      pin = '';
      confirmedPin = '';
      firstPage.style.display = 'block';
      secondPage.style.display = 'none';
      updateDots(firstDots, pin);
      updateDots(secondDots, confirmedPin);
    }

    // Reset only the second page
    function resetSecondPage() {
      confirmedPin = '';
      updateDots(secondDots, confirmedPin);
    }





  } else {
    console.log('NO USER');
  }
})








