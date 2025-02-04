import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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

// Extract URL Parameter
const getURLParam = (param) => new URLSearchParams(window.location.search).get(param);

let userData = null, UniversalFoundUserInfo = null, universalTransactionDetails = null, universalUserID = null;

const firstPage = document.getElementById('first-page')

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    
    universalUserID = user.uid;
    const docSnap = await getDoc(doc(usersColRef, universalUserID));
    if (!docSnap.exists()) return;
    userData = docSnap.data();


    const accountNumber = getURLParam('accountNumber');
    if (!accountNumber) return;
    
    const recipientDisplay = document.getElementById('rec-display-div')
    const q = query(usersColRef, where("accountNumber", "==", accountNumber));
    const querySnap = await getDocs(q);
    if (querySnap.empty) return console.log("No user found with this account number.");
    
    const userDoc = querySnap.docs[0];
    UniversalFoundUserInfo = userDoc.data();
    recipientDisplay.style.justifyContent = 'start'
    recipientDisplay.innerHTML = 
    `
      <div>
        <img src="../images/Frame 263.png"  />
      </div>

      <div>
        <h2>${UniversalFoundUserInfo.fullName}</h2>
        <p>${UniversalFoundUserInfo.accountNumber} - Waves Bank</p>
      </div>  
    `;


  } catch (error) {
    console.error(error);
  }
});

// Prepare Money Transfer
const sendMoneyPrep = (accountNumber, amount, purpose) => {
  universalTransactionDetails = { accountNumber, amount, purpose };
  const fee = 0.005 * amount, totalAmount = amount + fee;
  if (userData.balance < totalAmount) return console.log('INSUFFICIENT FUNDS');
  document.getElementById('cAmount').textContent = amount;
  document.getElementById('cTo').textContent = `${UniversalFoundUserInfo.fullName} - ${UniversalFoundUserInfo.accountNumber} - Waves Bank`;
  document.getElementById('cFor').textContent = universalTransactionDetails.purpose;
  document.getElementById('first-page').classList.replace('show', 'hidden');
  document.getElementById('second-page').classList.replace('hidden', 'show');
};


const sendMoneyForm = document.getElementById('sendMoneyForm')
const sendMoneyBtn = document.getElementById('send-money-btn')
const amountInput = document.getElementById('amount')

sendMoneyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const purpose = document.getElementById('purpose').value
  sendMoneyBtn.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
  setTimeout(() => {
    sendMoneyPrep(getURLParam('accountNumber'), Number(amountInput.value), purpose);
  }, 2000);
});

// Send Money Function
const sendMoney = async (accountNumber, amount) => {
  try {
    verifyBtn.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
    const q = query(usersColRef, where("accountNumber", "==", accountNumber));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return console.log("No user found with this account number.");
    
    const recipientDoc = querySnapshot.docs[0];
    const recipientRef = doc(db, "users", recipientDoc.id);
    const userRef = doc(db, 'users', universalUserID);

    if (userData.balance < amount) return alert('Insufficient balance');

    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const fee = 0.05 * amount, totalAmount = amount + fee;
    const recipientBalance = recipientDoc.data().balance || 0;
    
    await updateDoc(userRef, {
      transactions: arrayUnion({
        type: 'Transfer', amount: amount, totalAmount: totalAmount, date: new Date().toISOString(), fee: fee, 
        title: `Transfer to ${recipientDoc.data().fullName}`, recipient: recipientDoc.data().fullName, 
        status: 'Successful', transactionId
      }),
      balance: userData.balance - totalAmount
    });

    await updateDoc(recipientRef, {
      transactions: arrayUnion({
        type: 'Deposit', amount, date: new Date().toISOString(), 
        title: `Trf from ${userData.fullName}`, transactionId, sender: userData.fullName
      }),
      balance: recipientBalance + amount
    });
    console.log(`Money sent! Sender: ${userData.balance - totalAmount}, Recipient: ${recipientBalance + amount}`);

    setTimeout(() => {
      window.location.href = `../pages/receipt.html?transactionId=${transactionId}`
    }, 2000);


  } catch (error) {
    console.error("Error sending money:", error);
  } finally {
    verifyBtn.innerHTML = `<i class="bx bx-check"></i>`
  }
};

// PIN Verification
const dots = document.querySelectorAll('.dot');
const keypad = document.querySelector('#keypad');
let pin = '';

keypad.addEventListener('click', (e) => {
  const button = e.target.closest('.key');
  if (!button) return;
  pin = button.id === 'backspace' ? pin.slice(0, -1) : pin.length < 6 && !isNaN(button.textContent.trim()) ? pin + button.textContent.trim() : pin;
  dots.forEach((dot, i) => dot.classList.toggle('filled-dot', i < pin.length));
});

let userUID = null;
onAuthStateChanged(auth, (user) => {
  if (user) userUID = user.uid;
  else window.location.href = '../auth/Login.html';
});

const verifyBtn = document.getElementById('verify');
let failedAttempts = 0;

const verifyPin = async (enteredPin) => {
  if (enteredPin.length < 6) return alert('Incomplete Pin');
  try {
    const docSnap = await getDoc(doc(usersColRef, userUID));
    if (docSnap.data().pin !== enteredPin) {
      if (++failedAttempts >= 3) return alert('Too many failed attempts. Logging out...'), signOut(auth);
      return alert('WRONG PIN');
    }
    alert('PIN VERIFIED');
    sendMoney(universalTransactionDetails.accountNumber, universalTransactionDetails.amount);
  } catch (error) {
    console.error(error);
  }
};

verifyBtn.addEventListener('click', (e) => {
  e.preventDefault();
  verifyPin(pin);
});


//THIS IS THE CODE FOR THE AMOUNT SUGGESTION PART
const amountSuggest = document.querySelectorAll('.amount-suggest p')
amountSuggest.forEach((suggestion) => {
  suggestion.addEventListener('click', (e) => {
    e.preventDefault()
    amountInput.value = suggestion.textContent
  })
})

