import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


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


const loginForm = document.getElementById('loginForm')
const email = document.getElementById('email')
const password = document.getElementById('password')


function getDetails() {
  return {
    email: email.value,
    password: password.value
  }
}

const [getSignInLoading, setSignInLoading] = createState(false)

const loginUser = async () => {
  try {
    setSignInLoading(true)
    const { email, password } = getDetails()
    const response = await signInWithEmailAndPassword(auth, email, password)
    console.log(response);
  } catch (error) {
    console.log('Error login in', error);
  } finally {
    setSignInLoading(false)
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  loginUser()
})




function createState(initialValue) {
  let value = initialValue;

  const getState = () => value;
  const setState = (newValue) => {
    value = newValue;
    render();  // Re-render the UI after state change
  };

  return [getState, setState];
}

const loginBtn = document.getElementById('submit')

// Render function to update the UI
function render() {
  if (getSignInLoading()) {
    loginBtn.textContent = 'Loading';
    loginBtn.disabled = true;  
  } else {
    loginBtn.textContent = 'Sign In';
    loginBtn.disabled = false;
  }
}

// Initial render
render();

