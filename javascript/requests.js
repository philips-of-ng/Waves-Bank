import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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

      incomingContainer.innerHTML += `
        <div class="one-transaction" data-transaction-id="${request.requestId}">
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
            <button>${request.sentByMe ? request.giverName.slice(0, 1) : !request.sentByMe ? request.receiverName.slice(0, 1) : 'nil' }
            </button>

            <div>
              <p>$${request.amount} request ${request.sentByMe ? 'to': !request.sentByMe ? 'from' : ''} ${request.sentByMe ? request.giverName : !request.sentByMe ? request.receiverName : ''}</p>
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


