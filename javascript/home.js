import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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

let userData = null;
let theProcessedTransactions = null

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const id = user.uid;
      const docSnap = await getDoc(doc(usersColRef, id));
      console.log('User from auth:', user);

      if (docSnap.exists()) {
        userData = docSnap.data();
        console.log('Transactions from user data:', userData.transactions);

        // Call DisplayHomeTransactions after userData is populated
        DisplayHomeTransactions(userData.transactions);


        if (userData.transactions && userData.transactions.length > 0) {
          const transactionCounts = userData.transactions.reduce((acc, transaction) => {
            acc[transaction.type] = (acc[transaction.type] || 0) + 1;
            return acc;
          }, {});

          console.log('Transactions count', transactionCounts);

          const totalTransactions = Object.values(transactionCounts).reduce((a, b) => a + b, 0)

          // Render the Pie Chart
          const ctx = document.getElementById('transactionPieChart')?.getContext('2d');
          if (ctx) {
            const labels = Object.keys(transactionCounts);
            const data = Object.values(transactionCounts);

            // Generate dynamic colors
            const colors = labels.map((_, index) => `hsl(${(index * 360) / labels.length}, 70%, 50%)`);

            new Chart(ctx, {
              type: 'pie',
              data: {
                labels: labels,
                datasets: [
                  {
                    data: data,
                    backgroundColor: colors,
                  },
                ],
              },
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              },
            });

            const percentagesContainer = document.getElementById('percentagesContainer')
            percentagesContainer.innerHTML = ''

            labels.forEach((type, index) => {
              const percentage = ((transactionCounts[type] / totalTransactions) * 100).toFixed(1)

              percentagesContainer.innerHTML += `
                <p style="background-color: ${colors[index]};" >${type}: ${percentage}%</p>
              `
            })

          } else {
            console.error('Pie chart canvas element not found.');
          }
        } else {
          console.log('No transactions to visualize.');
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    }


    // -----------------------------------------------
    // JS FOR THE MAIN TRANSACTIONS HISTORY PAGE
    // -----------------------------------------------

    const processTransactions = (transactions) => {
      const today = new Date().toISOString().split("T")[0]; // Today's date as ISO string (YYYY-MM-DD)

      const groupedTransactions = {
        today: [],
        older: {},
      };

      transactions.forEach((transaction) => {
        const transactionDateString = transaction.date.split("T")[0]; // Extract only the date part

        if (transactionDateString === today) {
          groupedTransactions.today.push(transaction);
        } else {
          const transactionDate = new Date(transaction.date);
          const monthYear = transactionDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          }); // e.g., "January 2025"

          if (!groupedTransactions.older[monthYear]) {
            groupedTransactions.older[monthYear] = [];
          }
          groupedTransactions.older[monthYear].push(transaction);
        }
      });

      theProcessedTransactions = groupedTransactions
      return groupedTransactions;
    };

    console.log('Processed Transactions', processTransactions(userData.transactions));

    const renderTransactions = (groupedTransactions) => {
      const container = document.getElementById("allTransactions");

      // Render Today's Transactions
      if (groupedTransactions.today.length > 0) {
        container.innerHTML += `
           <h3>Today's Transactions</h3>
           <div id="todayContainer">

           </div>
        `;

        const todayContainer = document.getElementById('todayContainer')

        groupedTransactions.today.forEach((transaction) => {

          const date = new Date(transaction.date)
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

          
          todayContainer.innerHTML += `
            <div class="one-transaction">

              <div class="left">
                <p>${transaction.type.toLowerCase() === 'transfer' ? `${transaction.recipient.slice(0, 1)}` : transaction.title.slice(0, 1)}</p>
                <div>
                  <p>${transaction.title}</p>
                  <span>${realTime}</span>
                </div>
              </div>

              <div class="right">
                ${transaction.type.toLowerCase() === 'deposit' ? `<p class='credit'>+$${transaction.amount}</p>` : `<p class='debit'>$${transaction.amount}</p>`}
              </div>

             </div>
          `;
        });
      } else {
        container.innerHTML += `<h3>Today's Transactions</h3><p>No transactions found.</p>`;
      }

      // Render Older Transactions
      Object.keys(groupedTransactions.older).forEach((monthYear) => {
        container.innerHTML += `<h3>${monthYear}</h3>`;
        groupedTransactions.older[monthYear].forEach((transaction) => {
          container.innerHTML += `
            <div class="transaction">
              <p>Type: ${transaction.type}</p>
              <p>Amount: $${transaction.amount}</p>
              <p>Date: ${new Date(transaction.date).toLocaleString()}</p>
            </div>
          `;
        });
      });
    };

    // Example Call
    const grouped = processTransactions(userData.transactions);
    renderTransactions(grouped);



  } else {
    console.log('No user');
  }
});




// JavaScript for the Home Tab



const DisplayHomeTransactions = (transactions) => {
  const transactionsContainer = document.getElementById('transactions');

  if (transactions && transactions.length > 0) {
    transactions.slice(0, 3).forEach((transaction) => {
      const date = new Date(transaction.date)
      const realDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })

      transactionsContainer.innerHTML += `
        <div class="one-transaction">

          <div class="left">
            <p>${transaction.type.toLowerCase() === 'transfer' ? `${transaction.recipient.slice(0, 1)}` : transaction.title.slice(0, 1)}</p>
            <div>
              <p>${transaction.title}</p>
              <span>${realDate}</span>
            </div>
          </div>

          <div class="right">
            ${transaction.type.toLowerCase() === 'deposit' ? `<p class='credit'>+$${transaction.amount}</p>` : `<p class='debit'>$${transaction.amount}</p>`}
          </div>

        </div>
      `;
    });
  } else {
    transactionsContainer.innerHTML = '<p>No transactions to display.</p>';
  }
};


// JS FOR THE PIE CHART

const ctx = document.getElementById('transactionPieChart').getContext('2d')

const labels = Object.keys(transactionCounts)
const data = Object.values(transactionCounts)
const colors = ['red', 'blue', 'green']

new Chart(ctx, {
  type: 'pie',
  data: {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors,
    }],
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  }
})





