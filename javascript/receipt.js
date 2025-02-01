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

// Extract URL Parameter
const getURLParam = (param) => new URLSearchParams(window.location.search).get(param);

const transactionId = getURLParam('transactionId')


const dStat = document.getElementById('trans-stat')
const dAmount = document.getElementById("dAmount");
const dName = document.getElementById("dName");
const dAmount2 = document.getElementById("dAmount2");
const dFee = document.getElementById("dFee");
const dTotal = document.getElementById("dTotal");
const dTransactionType = document.getElementById("dTransactionType");
const dStatus = document.getElementById("dStatus");
const dDate = document.getElementById("dDate");
const dTime = document.getElementById("dTime");


const convertDate = theDate => {

  const date = new Date(theDate)

  const realDate = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })

  const realTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  return { realDate, realTime }
}

const getTransactionDetails = async (transactionId) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log("User document not found");
          return;
        }

        const userData = userDocSnap.data();
        const transactions = userData.transactions || [];

        const foundTransaction = transactions.find(
          (transaction) => transaction.transactionId === transactionId
        );


        if (foundTransaction.type.toLowerCase() == "deposit") {
          dStat.textContent = 'Money Received'
          dAmount.textContent = foundTransaction.amount 
          dName.textContent = foundTransaction.sender 
          dAmount2.textContent = foundTransaction.amount 
          dFee.textContent = '0'
          dTotal.textContent = foundTransaction.amount 
          dTransactionType.textContent = foundTransaction.type 
          dStatus.textContent = foundTransaction.status
          dDate.textContent = convertDate(foundTransaction.date).realDate
          dTime.textContent = convertDate(foundTransaction.date).realTime
        } else if (foundTransaction.type.toLowerCase() == 'transfer') {
          dStat.textContent = 'Transaction Successful'
          dAmount.textContent = foundTransaction.amount 
          dName.textContent = foundTransaction.recipient 
          dAmount2.textContent = foundTransaction.amount 
          dFee.textContent = foundTransaction.fee
          dTotal.textContent = foundTransaction.totalAmount 
          dTransactionType.textContent = foundTransaction.type 
          dStatus.textContent = foundTransaction.status
          dDate.textContent = convertDate(foundTransaction.date).realDate
          dTime.textContent = convertDate(foundTransaction.date).realTime
        } else if (foundTransaction.type.toLowerCase() == 'withdrawal') {
          dStat.textContent = 'Transaction Successful'
          dAmount.textContent = foundTransaction.amount 
          dName.textContent = foundTransaction.title 
          dAmount2.textContent = foundTransaction.amount 
          dFee.textContent = '0'
          dTotal.textContent = foundTransaction.amount 
          dTransactionType.textContent = foundTransaction.type 
          dStatus.textContent = foundTransaction.status
          dDate.textContent = convertDate(foundTransaction.date).realDate
          dTime.textContent = convertDate(foundTransaction.date).realTime
        }

        if (foundTransaction) {
          console.log("Found transaction:", foundTransaction);
        } else {
          console.log("No transaction with the given ID was found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      console.log("No user is signed in");
    }
  });
};

// Example usage
getTransactionDetails(transactionId);





// // Debugging: Log db and auth to ensure Firebase is initialized
// console.log('Firebase DB:', db);
// console.log('Firebase Auth:', auth);

// const getTransactionDetails = async (transactionId) => {
//   try {
//     console.log('Looking for transactionId:', transactionId); // Debugging

//     const q = query(usersColRef, where('transactionId', '==', transactionId));
//     const querySnap = await getDocs(q);

//     if (querySnap.empty) {
//       console.log('No Transaction with the Id was found');
//       return; // early return if no document is found
//     }

//     // Get the first document
//     const theTransaction = querySnap.docs[0];

//     // Extract data from the document
//     const transactionData = theTransaction.data();

//     console.log('Found transaction', transactionData);

//   } catch (error) {
//     console.error('Error getting transaction details:', error);
//   }
// }

// getTransactionDetails('TXN001002');
