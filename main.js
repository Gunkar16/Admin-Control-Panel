// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1qfrpttkA2a4Ww6JI627U9qmi2-Q87FY",
    authDomain: "trial-project-20b4c.firebaseapp.com",
    databaseURL: "https://trial-project-20b4c-default-rtdb.firebaseio.com",
    projectId: "trial-project-20b4c",
    storageBucket: "trial-project-20b4c.appspot.com",
    messagingSenderId: "458445394475",
    appId: "1:458445394475:web:29eeaac17bb48c3b43d06e",
    measurementId: "G-01BQMPN3PN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize variables
const auth = firebase.auth();
const database = firebase.database();

function showTab(tabId) {
    var tabs = document.getElementsByClassName('tab-content');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = 'none';
    }

    document.getElementById(tabId).style.display = 'block';
}

// Fetch names from the database and populate the dropdown
function populateDropdown() {
    console.log('populateDropdown called'); // Log for debugging
    var dropdown = document.getElementById('user-dropdown');

    // Check if the dropdown is already populated
    if (dropdown.options.length > 0) {
        return; // If populated, exit the function
    }


    // Use a set to store unique names
    var uniqueNames = new Set();

    // Reference to the 'users' section in the database
    var usersRef = database.ref('users');

    // Fetch user data
    usersRef.once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var userData = childSnapshot.val();
                var userName = userData.name;

                // Add unique names to the set
                uniqueNames.add(userName);
            });

            // Create options for each unique name
            uniqueNames.forEach(function (name) {
                var option = document.createElement('option');
                option.value = name;
                option.text = name;
                dropdown.appendChild(option); // Use appendChild to add options
            });
        })
        .catch(function (error) {
            console.error('Error fetching user data: ', error);
        });
}

// Function to get details when the dropdown value changes
function getUserDetails() {
    var selectedUserName = document.getElementById('user-dropdown').value;

    console.log('Selected User Name:', selectedUserName); // Add this line for debugging

    if (selectedUserName) {
        var usersRef = database.ref('users');

        // Find the user with the selected name
        usersRef.orderByChild('name').equalTo(selectedUserName).once('value')
            .then(function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var userData = childSnapshot.val();
                    displayUserDetails(userData);
                });
            })
            .catch(function (error) {
                console.error('Error fetching user details: ', error);
            });
    }
}

// Function to display user details in a table
function displayUserDetails(userData) {
    var userDetailsDiv = document.getElementById('user-details');
    userDetailsDiv.innerHTML = ''; // Clear previous content

    var table = document.createElement('table');
    table.classList.add('user-details-table');

    // Create rows and cells for each user detail
    for (var key in userData) {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        cell1.textContent = key;
        cell2.textContent = userData[key];
    }

    userDetailsDiv.appendChild(table);
}

// Initialize the dropdown when the view tab is displayed
function onViewTabDisplayed() {
    populateDropdown();
}

// Add an event listener to handle the dropdown change event
document.getElementById('user-dropdown').addEventListener('change', getUserDetails);

// Call onViewTabDisplayed when the view tab is displayed
document.getElementById('view-tab').addEventListener('click', onViewTabDisplayed);
