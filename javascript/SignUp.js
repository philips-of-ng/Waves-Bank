import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


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

// DOM References
const signUpForm = document.getElementById("signUpForm");
const fullName = document.getElementById("fullName");
const email = document.getElementById("email");
const phoneNumber = document.getElementById("phoneNumber");
const nationality = document.getElementById("nationality");
const gender = document.getElementById("gender");
const password = document.getElementById("password");

// Handle Form Submission
signUpForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent page refresh
  createAccount();
});

// Get User Details
const getDetails = () => {
  return {
    fullName: fullName.value,
    email: email.value,
    phoneNumber: phoneNumber.value,
    nationality: nationality.value,
    gender: gender.value,
    password: password.value,
  };
};

// Create a New Account

const [getSignUpLoading, setSignUpLoading] = createState(false)

const createAccount = async () => {
  try {
    setSignUpLoading(true)
    // Get user input
    const { email, password, fullName, phoneNumber, nationality, gender } = getDetails();

    // Create user with email and password
    const response = await createUserWithEmailAndPassword(auth, email, password);

    console.log("Response from creating account:", response);

    // Save additional user information in Firestore
    const docRef = doc(usersColRef, response.user.uid);
    await setDoc(docRef, { email, fullName, phoneNumber, nationality, gender });

    alert("Account created successfully!");
  } catch (error) {
    console.error("Error creating user account:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setSignUpLoading(false)
  }
};


function createState(initialValue) {
  let value = initialValue;

  const getState = () => value;
  const setState = (newValue) => {
    value = newValue;
    render();  // Re-render the UI after state change
  };

  return [getState, setState];
}

const signUpBtn = document.getElementById('submit')

// Render function to update the UI
function render() {
  if (getSignUpLoading()) {
    // Show loading state (e.g., "Creating Account...")
    signUpBtn.textContent = 'Creating Account...';
    signUpBtn.disabled = true;  // Disable the button while loading
  } else {
    // Reset button text to original state and enable it
    signUpBtn.textContent = 'Create Account';
    signUpBtn.disabled = false;
  }
}

// Initial render
render();
