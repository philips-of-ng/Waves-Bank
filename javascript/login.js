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
const warningText = document.getElementById('warningText')
const email = document.getElementById('email')
const password = document.getElementById('password')
const pwSwitch = document.getElementById('pwSwitch')


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
    if (response.user) {
      warningText.style.color = 'green'
      warningText.textContent = 'Signing in... please wait'

      setTimeout(() => {
        window.location.href = '../auth/VerifyPin.html'
      }, 2000);
    }
    console.log(response);
  } catch (error) {
    console.log('Error login in', error);
    warningText.style.color = 'red'
    warningText.innerHTML = 'Invalid Credentials'
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
    loginBtn.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`;
    loginBtn.disabled = true;
  } else {
    loginBtn.innerHTML = 'Sign In';
    loginBtn.disabled = false;
  }
}

// Initial render
render();


pwSwitch.addEventListener('click', (e) => {
  e.preventDefault();

  if (password.type === 'text') {
    password.type = 'password';
    pwSwitch.innerHTML = `<i class="bi bi-eye"></i>`;
  } else {
    password.type = 'text';
    pwSwitch.innerHTML = `<i class="bi bi-eye-slash"></i>`;
  }
});


