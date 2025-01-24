// --------------------------------------
    // JS FOR FILTERING INCOMING AND OUTGOING TRANSACTIONS
    // --------------------------------------

    const filterTransactions = (transactions, category) => {
      console.log('before filtering', transactions);
      
      const fiteredTransactions = transactions.filter(transaction =>
        category === 'incoming' ? transaction.type.toLowerCase() === 'deposit' :
          category === 'outgoing' ? transaction.type.toLowerCase() === 'transfer' || transaction.type.toLowerCase() === 'withdrawal' : false
      )

      console.log('Filtered Trans', fiteredTransactions);
      return fiteredTransactions
    }

    const groupTransactionsByDate = (transactions) => {
      console.log('dbg', transactions);
      
      const today = new Date().toISOString().slice(0, 10)

      const grouped = transactions.reduce((acc, transaction) => {
        const transactionDate = transaction.date.slice(0, 10); // Extract date only
        const monthYear = new Date(transaction.date).toLocaleString(undefined, { year: 'numeric', month: 'long' });

        if (transactionDate === today) {
          acc.today.push(transaction);
        } else {
          if (!acc.older[monthYear]) acc.older[monthYear] = [];
          acc.older[monthYear].push(transaction);
        }
        return acc;
      }, { today: [], older: {} });

      console.log('GroupedTransactions', grouped);
      
      return grouped
    }


    const renderINOUTTransactions = (groupedTransactions, containerId, inOrOut) => {
      console.log('render', groupedTransactions);

      console.log(`
        for the render of ${containerId} i got the container ${document.getElementById(containerId)} and the transactions to be rendered ${groupedTransactions.older}
        `);
      
      
      const container = document.getElementById(containerId)
      container.innerHTML = ''

      if (groupedTransactions.today.length > 0) {
        container.innerHTML += `
        <h3>Today's Transactions</h3>
        <div id="${inOrOut}" class="white-container">
        
        </div>
        `

        const whiteContainer = document.getElementById(inOrOut)

        groupedTransactions.today.forEach((transaction => {
          const date = new Date(transaction.date)

          const realTime = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })

          whiteContainer.innerHTML += `
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
          `
        }))
      }


      Object.keys(groupedTransactions.older).forEach(monthYear => {
        container.innerHTML += `
        <h3>${monthYear}</h3>
        <div class="${inOrOut}" class="whiteContainer">
        
        </div>
        `;

        const whiteContainer = document.getElementById(inOrOut)

        groupedTransactions.older[monthYear].forEach(transaction => {
          whiteContainer.innerHTML += `
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
      });
    }


    const incomingTransactions = filterTransactions(userData.transactions, 'incoming')
    const outgoingTransactions = filterTransactions(userData.transactions, 'outgoing')


    const groupedIncoming = groupTransactionsByDate(incomingTransactions)
    const groupedOutgoing = groupTransactionsByDate(outgoingTransactions)

    renderINOUTTransactions(groupedOutgoing, 'moneyOutTransactions', 'outTrans')
    renderINOUTTransactions(groupedIncoming, 'moneyInTransactions', 'inTrans')

    