import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

let userData = null;
let userUID = null

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log(user.uid);
    userUID = user.uid
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        userData = docSnap.data();
        console.log("from PTJS", docSnap);
        console.log("UD PTJS", userData);
        showDet(userData);
      } else {
        console.log("User document does not exist!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
});

function showDet(userDataParam) {
  const fullNameDisplay = document.getElementById("fullNameDisplay");
  const accountNumberDisplay = document.getElementById("accountNumberDisplay");
  const accountNumberDisplay2 = document.getElementById("accountNumberDisplay2");
  const phoneNumberDisplay = document.getElementById("phoneNumberDisplay");
  const emailDisplay = document.getElementById("emailDisplay");
  const homeAddressDisplay = document.getElementById("homeAddressDisplay");
  const primaryDeviceDisplay = document.getElementById("primaryDeviceDisplay");

  if (userDataParam) {
    console.log("Got param");

    if (fullNameDisplay) fullNameDisplay.textContent = userDataParam.fullName;
    if (accountNumberDisplay) accountNumberDisplay.textContent = userDataParam.accountNumber;
    if (accountNumberDisplay2) accountNumberDisplay2.textContent = userDataParam.accountNumber;
    if (phoneNumberDisplay) phoneNumberDisplay.textContent = userDataParam.phoneNumber || "Nil";
    if (emailDisplay) emailDisplay.textContent = userDataParam.email;
    if (homeAddressDisplay) homeAddressDisplay.textContent = userDataParam.address || "Nil";
    if (primaryDeviceDisplay) primaryDeviceDisplay.textContent = getDeviceModel();
  } else {
    console.log("No param");
  }
}

function getDeviceModel() {
  let userAgent = navigator.userAgent;

  console.log('User Agent', userAgent);

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

// --------THE LOGOUT SYSTEM ---------

const logoutBtn = document.getElementById('logout')
const confirmBtn = document.getElementById('confirm')
const stopBtn = document.getElementById('stop')
const logoutModal = document.getElementById('logout-modal')

logoutBtn.addEventListener('click', () => {
  logoutModal.classList.remove('hidden')
  logoutModal.classList.add('shown')
})

confirmBtn.addEventListener('click', () => {

})

stopBtn.addEventListener('click', () => {
  logoutModal.classList.remove('shown')
  logoutModal.classList.add('hidden')
})


const signOutUser = async () => {
  try {
    await signOut(auth)

    console.log('User signed out');

    window.location.href = '../auth/login.html'
  } catch (error) {
    console.log('Error loging out', error);

  }
}

confirmBtn.addEventListener('click', (e) => {
  e.preventDefault()
  signOutUser()
})

console.log('Device information:', getDeviceModel());

// -----THE EDIT MODAL--------

const editModal = document.getElementById('edit-modal')
const editModal_content = document.getElementById('em-main')
const editModalCloseBtn = document.getElementById('em-close')

editModalCloseBtn.addEventListener('click', () => {
  editModal.classList.remove('shown-block')
  editModal.classList.add('hidden')
})


// FOR THE FULLNAME SETTING
const fullNameSetter = document.getElementById('fullNameSetter')
fullNameSetter.addEventListener('click', () => {
  editModal.classList.remove('hidden')
  editModal.classList.add('shown-block')

  editModal_content.innerHTML = `
   <form id="fullNameSetterForm">

    <div class="one-edit-input">
      <label for="currentVal">Current Full Name:</label>
      <input type="text" id="currentVal" value="${userData.fullName}" readonly>
    </div>

    <div class="one-edit-input">
      <label for="newVal">New Full Name:</label>
      <input type="text" id="newVal" placeholder="Input New Full name here">
    </div>

    <div class="one-edit-btn">
      <button id="nusBtn" type="submit">Update</button>
    </div>

  </form>
  `

  const fullNameSetterForm = document.getElementById('fullNameSetterForm')
  const newVal = document.getElementById('newVal')
  const submit = document.getElementById('nusBtn')

  fullNameSetterForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (newVal.value.trim().length < 10) {
      alert('Full name is too short!')
    } else {
      try {
        submit.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
        const userRef = doc(db, 'users', userUID)
        console.log('This is the userref from updating the name', userRef);
        await updateDoc(userRef, { fullName: newVal.value })
        console.log('Name updated successfully.');
        submit.innerHTML = 'Name Updated!'
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          submit.innerHTML = 'Update'
        }, 2000);
      }
    }
  })

})



// FOR THE ADDRESS SETTING
const addressSetter = document.getElementById('addressSetter')
addressSetter.addEventListener('click', () => {
  editModal.classList.remove('hidden')
  editModal.classList.add('shown-block')

  editModal_content.innerHTML = `
   <form id="addressSetterForm">

    <div class="one-edit-input">
      <label for="currentVal">Current Home Address:</label>
      <input type="text" id="currentVal" value="${userData.address || 'No address set'}" readonly>
    </div>

    <div class="one-edit-input">
      <label for="newVal">New Home Address:</label>
      <input type="text" id="newVal" placeholder="Input New Home Address here">
    </div>

    <div class="one-edit-btn">
      <button id="nusBtn" type="submit">Update</button>
    </div>

  </form>
  `

  const addressSetterForm = document.getElementById('addressSetterForm')
  const newVal = document.getElementById('newVal')
  const submit = document.getElementById('nusBtn')

  addressSetterForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (newVal.value.trim().length < 10) {
      alert('Address is too short!')
    } else {
      try {
        submit.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
        const userRef = doc(db, 'users', userUID)
        console.log('This is the userref from updating the name', userRef);
        await updateDoc(userRef, { address: newVal.value })
        console.log('Name updated successfully.');
        submit.innerHTML = 'Address Updated!'
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          submit.innerHTML = 'Update'
        }, 2000);
      }
    }
  })

})




// FOR THE PHONE NUMBER SETTING
const phoneSetter = document.getElementById('phoneSetter')
phoneSetter.addEventListener('click', () => {
  editModal.classList.remove('hidden')
  editModal.classList.add('shown-block')

  editModal_content.innerHTML = `
   <form id="phoneSetterForm">

    <div class="one-edit-input">
      <label for="currentVal">Current Phone Number:</label>
      <input type="text" id="currentVal" value="${userData.phoneNumber || 'No Phone number set'}" readonly>
    </div>

    <div class="one-edit-input">
      <label for="newVal">New Phone Number:</label>
      <input type="text" id="newVal" placeholder="Input New Phone Number here">
    </div>

    <div class="one-edit-btn">
      <button id="nusBtn" type="submit">Update</button>
    </div>

  </form>
  `

  const phoneSetterForm = document.getElementById('addressSetterForm')
  const newVal = document.getElementById('newVal')
  const submit = document.getElementById('nusBtn')

  phoneSetterForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (newVal.value.trim().length < 8) {
      alert('Phone number is too short!')
    } else {
      try {
        submit.innerHTML = `<i class='bx bx-loader-alt spinner'></i>`
        const userRef = doc(db, 'users', userUID)
        console.log('This is the userref from updating the name', userRef);
        await updateDoc(userRef, { phoneNumber: newVal.value })
        console.log('Phone number updated successfully.');
        submit.innerHTML = 'Phone Number Updated!'
      } catch (error) {
        console.log(error);
      } finally {
        setTimeout(() => {
          submit.innerHTML = 'Update'
        }, 2000);
      }
    }
  })

})










