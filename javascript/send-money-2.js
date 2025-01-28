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


// ----------------------------------
// ----------------------------------

// Function to extract a URL parameter
function getURLParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}


let userData = null
onAuthStateChanged(auth, async (user) => {

  if (user) {
    try {
      const id = user.uid;
      const docSnap = await getDoc(doc(usersColRef, id));
      console.log('User from auth:', user);

      if (docSnap.exists()) {
        userData = docSnap.data()



        const accountNumber = getURLParam('accountNumber');
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
            const foundUser = userDoc;
            const foundUserInfo = userDoc.data()

            console.log("User ID:", userDoc.id);
            console.log("User Data:", foundUserInfo);

            // Update the recipient display
            const recipientDisplay = document.getElementById("rec-display-div");
            recipientDisplay.innerHTML = `
              <h2>${foundUserInfo.fullName}</h2>
              <p>${foundUserInfo.accountNumber}</p>
            `;

            //  return foundUser
          } catch (error) {
            console.error("Error fetching user:", error);
          }
        };

        fetchUserByAccountNumber(accountNumber)



        const sendMoney = async (accountNumber, amount) => {
          const params = { accountNumber, amount }
          console.log('params', params);

          try {
            //Querying the db to get the recipient details
            const q = query(usersColRef, where("accountNumber", "==", accountNumber));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
              console.log("No user found with this account number.");
              return;
            }

            // Fetch the recipient document (assuming accountNumber is unique)
            const recipientDoc = querySnapshot.docs[0];
            const recipientRef = doc(db, "users", recipientDoc.id);

            //get ready to push info to the user too
            const userRef = doc(db, 'users', id)




            //check if the user has enough money
            if (userData.balance < amount) {
              alert('Insufficient balance')
              return
            }

            //Information about the transactions
            const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            const fee = 0.05 * amount
            const totalAmount = amount + fee

            const userTransactionDetails = {
              type: 'Transfer',
              amount: totalAmount,
              date: new Date().toISOString(),
              fee: fee,
              title: `Transfer to ${recipientDoc.data().fullName}`,
              recipient: recipientDoc.data().fullName,
              status: 'Successful',
              transactionId: transactionId
            }

            const RecipientTransactionDetails = {
              type: 'Deposit',
              amount: amount,
              date: new Date().toISOString(),
              title: `Trf from ${userData.fullName}`,
              transactionId: transactionId,
              sender: userData.fullName
            }


            // Step 2: Get the current balance
            const recipientCurrentBalance = recipientDoc.data().balance || 0;
            console.log('current bal', recipientCurrentBalance);


            // Step 3: Update both parties' transactions and balance

            await updateDoc(userRef, {
              transactions: arrayUnion(userTransactionDetails),
              balance: Number(userData.balance) - totalAmount
            })

            await updateDoc(recipientRef, {
              transactions: arrayUnion(RecipientTransactionDetails), 
              balance: Number(recipientCurrentBalance) + amount
            });

            console.log(`Successfully received money. Rec Updated balance: ${recipientCurrentBalance + amount}`);
            console.log(`Successfully sent money. Sender updated balance: ${userData.balance - totalAmount}`);
            

          } catch (error) {
            console.error("Error sending money:", error);
          }
        };

        const sendMoneyForm = document.getElementById('sendMoneyForm')

        sendMoneyForm.addEventListener('submit', (e) => {
          e.preventDefault()

          const amountInput = document.getElementById('amount')
          const amount = Number(amountInput.value)

          const transactionDetails = {
            type: 'deposit',
          }

          sendMoney(accountNumber, amount)
        })






      }

    } catch (error) {
      console.log(error);
    }
  }

})




