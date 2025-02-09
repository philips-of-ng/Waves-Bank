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

let userData = null, UniversalFoundUserInfo = null, universalTransactionDetails = null, universalUserID = null, universalGiverDoc = null;


onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      universalUserID = user.uid
      const docSnap = await getDoc(doc(usersColRef, universalUserID))
      userData = docSnap.data()
    } catch (error) {
      console.log('NO USER FOUND');
      
    }
  }
})

const firstPage = document.getElementById('first-page')
const secondPage = document.getElementById('second-page')

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
const warningText = document.getElementById('warningText')


fetchKey.addEventListener('click', (e) => {
  e.preventDefault()
  if (input.value == '') {
    warningText.textContent = 'Dem suppose knack you 2 by 2! Account number cannot be empty brr! 😒'
    setTimeout(() => {
      warningText.textContent = ''
    }, 5000);
    return
  }
  fetchUserByAccountNumber(input.value)

  // manageChange()
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
    universalGiverDoc = userDoc
    const foundUser = userDoc.data();
    UniversalFoundUserInfo = foundUser

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
      // window.location.href = `./SendMoney2.html?accountNumber=${foundUser.accountNumber}`;
      firstPage.classList.add('hidden')
      secondPage.classList.remove('hidden')

      displayDetails()


    });

    setLoading(false)
    fetchKey.innerHTML = `Giver found`
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};


// fetchUserByAccountNumber('0080795583')


// ---------JS FOR THE SECOND VIEW

const recipientDisplay2 = document.getElementById('rec-display-div-2')

function displayDetails() {

  console.log(recipientDisplay2);
  recipientDisplay2.style.justifyContent = 'start'
  recipientDisplay2.innerHTML = `
  <div>
    <img src="../images/Frame 263.png"  />
  </div>

  <div>
    <h2>${UniversalFoundUserInfo.fullName}</h2>
    <p>${UniversalFoundUserInfo.accountNumber} - Waves Bank</p>
  </div>
`
}


//JS FOR SENDING THE REQUEST

const requestMoneyForm = document.getElementById('requestMoneyForm')
const amountInput = document.getElementById('amount')
const purposeInput = document.getElementById('purpose')

requestMoneyForm.addEventListener('submit', (e) => {
  e.preventDefault()

  requestMoney(UniversalFoundUserInfo.accountNumber, amountInput.value, purposeInput.value)
})

// const accountNumberInput = document.getElementById('')

const requestMoney = async (giverAccountNumber, amount, purpose) => {
  try {
    //get the ref of both parties
    const giverRef = doc(db, 'users', universalGiverDoc.id)
    const receiverRef = doc(db, 'users', universalUserID)
  
    //generate the transaction ID and date
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const date = new Date().toISOString()

    const requestObject = {
      transactionId: transactionId,
      amount: amount,
      purpose: purpose,
      date: date,
      giverAccountNumber: giverAccountNumber,
      giverName: UniversalFoundUserInfo.fullName, 
      receiverName: userData.fullName,
      receiverAccountNumber: userData.accountNumber,
      granted: false
    }

    const receiver_requestObject = {
      transactionId: requestObject.transactionId,
      amount: requestObject.amount,
      purpose: requestObject.purpose,
      date: requestObject.date,
      giverAccountNumber: requestObject.giverAccountNumber,
      giverName: requestObject.giverName,
      granted: false
    }

    const giver_requestObject = {
      transactionId: requestObject.transactionId,
      amount: requestObject.amount,
      purpose: requestObject.purpose,
      date: requestObject.date,
      receiverAccountNumber: requestObject.receiverAccountNumber,
      receiverName: requestObject.receiverName,
      granted: false
    }

    console.log('RO', receiver_requestObject);
    console.log('GO', giver_requestObject);
    
    

    //pushing the request object to the receivers file
    await updateDoc(receiverRef, {
      outgoingRequests: arrayUnion(receiver_requestObject)
    })

    await updateDoc(giverRef, {
      incomingRequests: arrayUnion(giver_requestObject)
    })

    // console.log(date);
    console.log('Request sent');
    
  } catch (error) {
    console.log(error);
  }
  
}



