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



function useState(initialValue) {
  let state = initialValue;

  function setState(newValue) {
    state = newValue;
    console.log("State updated:", state); // Optional: Log state changes
  }

  function getState() {
    return state;
  }

  return [getState, setState];
}

const [getLoading, setLoading] = useState(false)

const input = document.getElementById('account-input');
const fetchKey = document.getElementById('verify')



fetchKey.addEventListener('click', (e) => {
  e.preventDefault()
  fetchUserByAccountNumber(input.value)
  manageChange()
})

const fetchUserByAccountNumber = async (accountNumber) => {
  try {
    setLoading(true)
    fetchKey.innerHTML = `<i class='bx bx-loader-alt spinner'></i>` 

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
      <div>
        <img src="../images/Frame 263.png"  />
      </div>

      <div>
        <h2>${foundUser.fullName}</h2>
        <p>${foundUser.accountNumber} - Waves Bank</p>
      </div>
    `;

    // Add click event to navigate to SendMoney2 page
    recipientDisplay.addEventListener("click", () => {
      window.location.href = `./SendMoney2.html?accountNumber=${foundUser.accountNumber}`;
    });

    setLoading(false)
    fetchKey.innerHTML = `User found` 
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};


// fetchUserByAccountNumber('0080795583')


