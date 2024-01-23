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
const auth = firebase.auth()
const database = firebase.database()

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
                
                // Check if 'information' node exists and has 'Name' property
                if (userData && userData.information && userData.information.Name) {
                    var userName = userData.information.Name;

                    // Add unique names to the set
                    uniqueNames.add(userName);
                }
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
        usersRef.orderByChild('information/Name').equalTo(selectedUserName).once('value')
            .then(function (snapshot) {
                if (snapshot.exists()) {
                    snapshot.forEach(function (childSnapshot) {
                        var userData = childSnapshot.val();
                        displayUserDetails(userData);
                    });
                } else {
                    console.error('User not found in the database.');
                }
            })
            .catch(function (error) {
                console.error('Error fetching user details: ', error);
            });
    }
}

function displayUserDetails(userData) {
    var userDetailsDiv = document.getElementById('user-details');
    userDetailsDiv.innerHTML = ''; // Clear previous content

    // Display information details in a table
    var infoTable = createTable(["ID", "Name", "Email", "PhoneNumber", "Password", "LastSync","JobsCompleted","TotalWorkingHours"], userData.information);
    userDetailsDiv.appendChild(infoTable);

    // Display job details
    var jobsContainer = document.createElement('div');
    jobsContainer.classList.add('job-details-container');
    userDetailsDiv.appendChild(jobsContainer);

    // Iterate through each job
    for (var i = 1; userData['Job' + i]; i++) {
        console.log('Job' + i.toString())
        heading = document.createElement('h2')
        heading.setAttribute("id","tableHeading" + i.toString());
        var jobTable = createTable(["CurrentJob", "StartingTime", "EndingTime", "Date", "Response", "JobEnded"],  userData['Job' + i]);
        jobsContainer.appendChild(heading);
        document.getElementById("tableHeading" + i.toString()).innerHTML = 'Job' + i.toString()
        jobsContainer.appendChild(jobTable);

    }
}

// Function to create a table dynamically
function createTable(keys, data) {
    var table = document.createElement('table');
    table.classList.add('user-details-table');

    keys.forEach(function (key) {
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);

        cell1.textContent = key;

        // Check if the value is a number and convert it to a string
        cell2.textContent = typeof data[key] === 'number' ? data[key].toString() : data[key];
    });

    return table;
}





// Initialize the dropdown when the view tab is displayed
function onViewTabDisplayed() {
    populateDropdown();
}

// Add an event listener to handle the dropdown change event
// document.getElementById('user-dropdown').addEventListener('change', getUserDetails);

// Call onViewTabDisplayed when the view tab is displayed
document.getElementById('viewButt').addEventListener('click', onViewTabDisplayed);

// Add an event listener to handle the assign button click
document.getElementById('assign-button').addEventListener('click', assignJob);

// Function to handle assigning a job
// ... (Previous code remains unchanged)

// Function to handle assigning a job
function assignJob() {
    // Get selected values from dropdown and input fields
    var selectedUserName = document.getElementById('assign-user-dropdown').value;
    var address = document.getElementById('address-input').value;
    var startTime = document.getElementById('start-time-input').value;
    var endTime = document.getElementById('end-time-input').value;
    var date = document.getElementById("date-input").value;

    // Check if all fields are filled
    if (!selectedUserName || !address || !startTime || !endTime || !date) {
        alert('Please fill in all fields.');
        return;
    }

    // Reference to the 'users' section in the database
    var usersRef = database.ref('users');

    // Find the user with the selected name
    usersRef.orderByChild('information/Name').equalTo(selectedUserName).once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var userKey = childSnapshot.key;
                var totalWorkingHours = childSnapshot.val().information.TotalWorkingHours;
                let [Hour, Minute] = totalWorkingHours.split(':');
                if (parseInt(Hour) >= 24) {
                    alert('Total working hours are more than or equal to 24');
                    return;
                }
                // Get the user's phone number
                var userPhoneNumber = childSnapshot.val().information.PhoneNumber;
                // console.log('User Phone Number:', userPhoneNumber);
                url = "https://wa.me/" + userPhoneNumber + "?text=You have been assigned a job on the website : https://gunkar16.github.io/Firebase-Login/, please log in, navigate to the 'My Jobs' section and submit your response";
                // console.log(url)
                window.open(url, "_blank").focus();
                
                // Determine the next available job number
                var nextJobNumber = 1;
                while (childSnapshot.val()['Job' + nextJobNumber]) {
                    nextJobNumber++;
                }

                // Create an object with the job details under the appropriate job node (e.g., Job1)
                var jobDetails = {
                    CurrentJob: address,
                    StartingTime: startTime,
                    EndingTime: endTime,
                    Date: date,
                    Response: "No response",
                    JobEnded: "No"
                };

                // Update or create the job details under the user's key with the dynamically determined job number
                usersRef.child(userKey).child('Job' + nextJobNumber).update(jobDetails);

                // Notify the user that the job has been assigned
                alert('Job assigned successfully.');
            });
        })
        .catch(function (error) {
            console.error('Error assigning job: ', error);
        });
}

// ... (Other functions remain unchanged)

// Function to populate the assign dropdown with user names
// Function to populate the assign dropdown with user names
function populateAssignDropdown() {
    var assignDropdown = document.getElementById('assign-user-dropdown');
    if (assignDropdown.options.length > 0) {
        return; // If populated, exit the function
    }

    // Reference to the 'users' section in the database
    var usersRef = database.ref('users');

    // Fetch user data
    usersRef.once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var userData = childSnapshot.val();
                var userName = userData.information.Name;

                // Check if the user is already present in the dropdown
                if (!assignDropdown.options.namedItem(userName)) {
                    // Create options for each user name
                    var option = document.createElement('option');
                    option.value = userName;
                    option.text = userName;
                    assignDropdown.add(option); // Use add to append options
                }
            });
        })
        .catch(function (error) {
            console.error('Error fetching user data: ', error);
        });
}


// Initialize the assign dropdown when the assign tab is displayed
function onAssignTabDisplayed() {
    populateAssignDropdown();
}

// Call onAssignTabDisplayed when the assign tab is displayed
document.getElementById('assignButt').addEventListener('click', onAssignTabDisplayed);

function refreshWeekly() {
    var usersRef = database.ref('users');

    usersRef.once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var userKey = childSnapshot.key;

                // Delete existing job nodes
                for (var i = 1; i <= 12; i++) { // Adjust the limit based on your maximum expected jobs (e.g., 12)
                    if (childSnapshot.val().hasOwnProperty('Job' + i)) {
                        usersRef.child(userKey).child('Job' + i).remove();
                    }
                }

                // Create an object with the reset values
                var resetValues = {
                    information: {
                        TotalWorkingHours: '00:00',
                        JobsCompleted: 0,
                        // Add other keys you want to preserve in the Information node
                        Name: childSnapshot.val().information.Name,
                        Email: childSnapshot.val().information.Email,
                        ID: childSnapshot.val().information.ID,
                        PhoneNumber: childSnapshot.val().information.PhoneNumber,
                        Password: childSnapshot.val().information.Password,
                        LastSync: childSnapshot.val().information.LastSync,
                        // Add other keys as needed
                    }
                };

                // Update the values under the user's key
                usersRef.child(userKey).update(resetValues);
            });

            // Notify that the values have been reset
            alert('Values reset successfully for all users.');
        })
        .catch(function (error) {
            console.error('Error resetting values: ', error);
        });
}
// Function to download the Excel sheet
function downloadExcel() {
    var usersRef = database.ref('users');

    usersRef.once('value')
        .then(function (snapshot) {
            var data = [];

            // Add headers to the data array
            var headers = ["ID", "Name", "Email", "PhoneNumber", "Password", "LastSync", "JobsCompleted", "TotalWorkingHours"];
            for (var i = 1; i <= 10; i++) {
                headers.push(`Job${i}`, `StartingTimeJob${i}`, `EndingTimeJob${i}`, `DateJob${i}`, `ResponseJob${i}`, `JobEnded${i}`);
            }
            data.push(headers);

            // Iterate through each user
            snapshot.forEach(function (childSnapshot) {
                var userData = childSnapshot.val().information;

                // Add user information to the data array
                var userRow = [
                    userData.ID,
                    userData.Name,
                    userData.Email,
                    userData.PhoneNumber,
                    userData.Password,
                    userData.LastSync,
                    userData.JobsCompleted,
                    userData.TotalWorkingHours
                ];

                // Iterate through each job (up to 10)
                for (var i = 1; i <= 10; i++) {
                    var jobData = childSnapshot.val()[`Job${i}`] || {}; // Use {} if the job doesn't exist
                    userRow.push(
                        jobData.CurrentJob || "",
                        jobData.StartingTime || "",
                        jobData.EndingTime || "",
                        jobData.Date || "",
                        jobData.Response || "",
                        jobData.JobEnded || ""
                    );
                }

                data.push(userRow);
            });

            // Convert data array to Excel sheet
            var ws = XLSX.utils.aoa_to_sheet(data);
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            // Save the Excel sheet
            var fileName = 'user_data.xlsx';
            XLSX.writeFile(wb, fileName);
        })
        .catch(function (error) {
            console.error('Error downloading Excel sheet: ', error);
        });
}
