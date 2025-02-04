import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { Await } from "react-router-dom";


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

let userData = null;
let theProcessedTransactions = null


onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(user.uid);

    try {
      const docSnap = await getDoc(doc(usersColRef, user.uid))
      
      console.log('from PTJS', docSnap);
      
    } catch (error) {
      
    }
    
  }
})



const fullNameDisplay = document.getElementById('fullNameDisaplay')
const accountNumberDisplay = document.getElementById('accountNumberDisplay')
const accountNumberDisplay2 = document.getElementById('accountNumberDisplay2')
const phoneNumberDisplay = document.getElementById('phoneNumberDisplay')
const emailDisplay = document.getElementById('emailDisplay')
const homeAddressDisplay = document.getElementById('homeAddressDisplay')
const primaryDeviceDisplay = document.getElementById('primaryDeviceDisplay')


fullNameDisplay.textContent = userData.fullName
accountNumberDisplay.textContent = userData.accountNumber
accountNumberDisplay2.textContent = userData.accountNumber
phoneNumberDisplay.textContent = userData.phoneNumber || 'Nil'
emailDisplay.textContent = userData.email
homeAddressDisplay.textContent = userData.homeAddress || 'Nil'
primaryDeviceDisplay.textContent = getDeviceModel()




function getDeviceModel() {
  let userAgent = navigator.userAgent;

  if (/android/i.test(userAgent)) {
    let match = userAgent.match(/Android\s+\d+;\s+([^)]+)\)/);
    return match ? match[1] : "Unknown Android Device";
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return "Apple " + (/iPhone/i.test(userAgent) ? "iPhone" : /iPad/i.test(userAgent) ? "iPad" : "iPod");
  }

  if (/Windows/i.test(userAgent)) {
    return "Windows PC";
  }

  if (/Macintosh/i.test(userAgent)) {
    return "Mac";
  }

  return "Unknown Device";
}

