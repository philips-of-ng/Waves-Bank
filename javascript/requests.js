import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

let userData = null;
let universalUserID = null;


// the function to update request status, send money and accept request

const updateRequestForUser1 = async (userId, transactionId, newStatus, fieldName) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // Update the correct transaction array
      const updatedTransactions = userData[fieldName].map(txn =>
        txn.transactionId === transactionId ? { ...txn, granted: newStatus } : txn
      );

      await updateDoc(userRef, { [fieldName]: updatedTransactions });
      console.log(`Transaction updated for ${userId} in ${fieldName}`);
    } else {
      console.log(`User ${userId} not found.`);
    }
  } catch (error) {
    console.error(`Error updating transaction for ${userId}:`, error);
  }
};

const sendMoney = async (accountNumber, amount, transactionId) => {
  try {

    console.log('You tapped the send');


    // sendBtn.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
    const q = query(usersColRef, where("accountNumber", "==", accountNumber));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return console.log("No user found with this account number.");

    const recipientDoc = querySnapshot.docs[0];
    const recipientRef = doc(db, "users", recipientDoc.id);
    const userRef = doc(db, 'users', universalUserID);

    if (userData.balance < amount) {
      alert('Insufficient balance');
      return
    }

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

    //for the giver
    await updateRequestForUser1(universalUserID, transactionId, true, "incomingRequests")

    //for the begger
    await updateRequestForUser1(recipientDoc.id, transactionId, true, "outgoingRequests")


    console.log('nessessary granted update');



  } catch (error) {
    console.error("Error sending money:", error);
  } finally {
    // verifyBtn.innerHTML = `<i class="bx bx-check"></i>`
  }
};

//the modal stystem
const reqModal = document.getElementById('req-modal')
const closeReqModal = document.getElementById('closeReqModal')
closeReqModal.addEventListener('click', () => {
  reqModal.classList.add('hidden')
})

const incomingPopUp = (request) => {
  console.log('id i got', request);
  reqModal.classList.remove('hidden')
  console.log();

  const RMI_main = document.getElementById('rmi-main')

  if (!request.granted) {
    RMI_main.innerHTML = `
    <p>*accepting this request means you want to:</p>

    <div class="rmi-line">
      <p>Send:</p>
      <h4>$${request.amount}</h4>
    </div>

    <div class="rmi-line">
      <p>To:</p>
      <h4>${request.receiverName}</h4>
    </div>

    <div class="rmi-line">
      <p>For:</p>
      <h4>${request.purpose}</h4>
    </div>

    <div class="rmi-btns">
      <button class="cancel">Cancel</button>
      <button class="send" id="send">Accept & Send</button>
    </div>
  `

    const sendBtn = document.getElementById('send')

    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        sendBtn.innerHTML =  `<i class='bx bx-loader-alt spinner'></i>`
        await sendMoney(request.receiverAccountNumber, request.amount, request.transactionId)
        sendBtn.innerHTML = `Request Accepted!`
        setTimeout(() => {
          sendBtn.innerHTML = `View Receipt`
          sendBtn.addEventListener('click', () => {
            window.location.href = `../pages/receipt.html?transactionId=${request.transactionId}`
          })
        }, 2000);
      })
    }
  } else {
    console.log('already granted');

    RMI_main.innerHTML = `
      <h6>Request Completed.</h6>

      <div class="rmi-line">
        <p>You Sent:</p>
        <h4>$${request.amount}</h4>
      </div>

      <div class="rmi-line">
        <p>To:</p>
        <h4>${request.receiverName}</h4>
      </div>

      <div class="rmi-line">
        <p>For:</p>
        <h4>${request.purpose}</h4>
      </div>

      <div class="rmi-btns">
        <button class="cancel">Cancel</button>
        <button class="send" id="view-receipt">View Receipt</button>
      </div>
    `

    const viewReceipt = document.getElementById('view-receipt')

    if (viewReceipt) {
      viewReceipt.addEventListener('click', () => {
        window.location.href = `../pages/receipt.html?transactionId=${request.transactionId}`
      })
    }

  }

}



// Function to render incoming requests
const renderIncomingReq = () => {
  const incomingContainer = document.getElementById("incoming");

  if (!incomingContainer) {
    console.error("Incoming container not found in the DOM.");
    return;
  }

  incomingContainer.innerHTML = ""; // Clear previous content

  if (userData?.incomingRequests?.length > 0) {
    userData.incomingRequests.forEach((request) => {

      const date = new Date(request.date)
      const realTime = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      const realDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })

      const transactionDiv = document.createElement('div')
      transactionDiv.classList.add('one-transaction')

      transactionDiv.innerHTML = `
        <div class="one-transaction" id="${request.requestId}" data-transaction-id="${request.requestId}">
          <div class="left">
            <button>${request.receiverName.slice(0, 1) || 'i'}</button>
            <div>
              <p>$${request.amount} request from ${request.receiverName}</p>
              <span>${realTime} on ${realDate}</span>
            </div>
          </div>
          <div class="right">
            ${request.granted ? '<span class="green-dot"></span>' : '<span class="red-dot"></span>'}
          </div>
        </div>
      `;

      transactionDiv.addEventListener('click', () => {
        incomingPopUp(request)
      })

      incomingContainer.appendChild(transactionDiv)
    });
  } else {
    incomingContainer.innerHTML = "<p>No incoming requests</p>";
  }
};

const renderOutgoingReq = () => {
  const outgoingContainer = document.getElementById("outgoing");

  if (!outgoingContainer) {
    console.error("Incoming container not found in the DOM.");
    return;
  }

  outgoingContainer.innerHTML = ""; // Clear previous content

  if (userData?.outgoingRequests?.length > 0) {
    userData.outgoingRequests.forEach((request) => {

      const date = new Date(request.date)
      const realTime = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      const realDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })

      outgoingContainer.innerHTML += `
        <div class="one-transaction" data-transaction-id="${request.requestId}">
          <div class="left">
            <button>${request.giverName.slice(0, 1) || 'i'}</button>
            <div>
              <p>$${request.amount} request to ${request.giverName}</p>
              <span>${realTime} on ${realDate}</span>
            </div>
          </div>
          <div class="right">
            ${request.granted ? '<span class="green-dot"></span>' : '<span class="red-dot"></span>'}
          </div>
        </div>
      `;

    });
  } else {
    outgoingContainer.innerHTML = "<p>No outgoing requests</p>";
  }
}


const renderPendingReq = () => {
  if (!userData) return;

  const allRequest = [...(userData.incomingRequests || []), ...(userData.outgoingRequests || [])];

  console.log('All the fvking requests', allRequest);

  // Clone and sort the array to avoid mutating original data
  const arrangedByDate = [...allRequest].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter pending requests
  const pendingReqs = arrangedByDate.filter((request) => request.granted === false);

  console.log('Filtered pending reqs', pendingReqs);

  const pendingContainer = document.getElementById('pending');
  if (!pendingContainer) return; // Exit if element is missing

  if (pendingReqs.length > 0) {
    let htmlContent = "";
    pendingReqs.forEach((request) => {
      const date = new Date(request.date);
      const realTime = date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const realDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });

      htmlContent += `
        <div class="one-transaction" data-transaction-id="${request.requestId}">
          <div class="left">
            <button>${request.sentByMe ? request.giverName.slice(0, 1) : !request.sentByMe ? request.receiverName.slice(0, 1) : 'nil'}
            </button>

            <div>
              <p>$${request.amount} request ${request.sentByMe ? 'to' : !request.sentByMe ? 'from' : ''} ${request.sentByMe ? request.giverName : !request.sentByMe ? request.receiverName : ''}</p>
              <span>${realTime} on ${realDate}</span>
            </div>
          </div>
          <div class="right">
            ${request.granted ? '<span class="green-dot"></span>' : '<span class="red-dot"></span>'}
          </div>
        </div>`;
    });
    pendingContainer.innerHTML = htmlContent; // Update the DOM once
  } else {
    pendingContainer.innerHTML = "<p>No pending requests</p>";
  }
};


// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      universalUserID = user.uid;
      const docSnap = await getDoc(doc(usersColRef, universalUserID));

      if (docSnap.exists()) {
        userData = docSnap.data();
        renderIncomingReq();
        renderOutgoingReq()
        renderPendingReq()
      } else {
        console.log("No user data found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    console.log("No user logged in.");
  }
});

const newReq = document.getElementById('new-req')
newReq.addEventListener('click', () => {
  window.location.href = '../pages/requestMoney.html'
})



