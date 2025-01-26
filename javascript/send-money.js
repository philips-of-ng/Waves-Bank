import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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




const input = document.getElementById('account-input');
const keypad = document.getElementById('keypad');

keypad.addEventListener('click', (event) => {
  const button = event.target.closest('button'); // Ensure the click is on a button
  if (!button) return; // If not a button, do nothing

  // Get the button text
  const buttonText = button.textContent.trim();

  // Handle verify button (you can add functionality later)
  // if (button.id === 'verify') {
  //   console.log('Verify action:', input.value);
  //   return;
  // }

  // Handle backspace button
  if (button.id === 'backspace') {
    input.value = input.value.slice(0, -1); // Remove the last character
    return;
  }

  // Handle regular number buttons
  if (!isNaN(buttonText)) {
    input.value += buttonText; // Append the number to the input value
  }

});


const fetchKey = document.getElementById('verify')

fetchKey.addEventListener('click', (e) => {
  e.preventDefault()

  fetchUserByAccountNumber(input.value)
})

const fetchUserByAccountNumber = async (accountNumber) => {
  try {
    const q = query(usersColRef, where("accountNumber", "==", accountNumber));

    // Fetch the user
    const querySnap = await getDocs(q);

    // Check if no user is found
    if (querySnap.empty) {
      console.log("There is no user with this account number.");
      return;
    }

    // Since accountNumber is unique, get the first (and only) document
    const userDoc = querySnap.docs[0];
    const foundUser = userDoc.data();

    console.log("User ID:", userDoc.id);
    console.log("User Data:", foundUser);

    // Update the recipient display
    const recipientDisplay = document.getElementById("rec-display-div");
    recipientDisplay.innerHTML = `
      <h2>${foundUser.fullName}</h2>
      <p>${foundUser.accountNumber}</p>
    `;

    // Add click event to navigate to SendMoney2 page
    recipientDisplay.addEventListener("click", () => {
      window.location.href = `./SendMoney2.html?accountNumber=${foundUser.accountNumber}`;
    });
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};


// fetchUserByAccountNumber('0080795583')


