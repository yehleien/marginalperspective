// Add this code at the beginning of your account.js
document.addEventListener("DOMContentLoaded", () => {
    const userEmail = getCookie('user_email');
    const welcomeElement = document.getElementById('welcomeMessage');

    if (userEmail && welcomeElement) {
        updateWelcomeMessage(userEmail);
    }
});

// Helper function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to update the welcome message
function updateWelcomeMessage(userEmail) {
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement) {
        welcomeElement.textContent = `Hello, ${userEmail}`;
    }
}

document.getElementById('ageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updatePerspective('age', document.getElementById('age').value);
});

document.getElementById('nationalityForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updatePerspective('nationality', document.getElementById('nationality').value);
});

document.getElementById('sexForm').addEventListener('submit', function(event) {
    event.preventDefault();
    updatePerspective('sex', document.getElementById('sex').value);
});

async function updatePerspective(key, value) {
    try {
        const response = await fetch('/api/update_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: key, value: value })
        });

        if (!response.ok) {
            throw new Error('Failed to update perspective');
        }

        // Handle success - maybe refresh the page or show a success message
    } catch (error) {
        console.error('Error updating perspective:', error);
    }
}

// Function to add a new perspective
// Function to add a new perspective
function addPerspective() {
    const newPerspective = document.getElementById('newPerspective').value;
    const email = getCookie('user_email');

    fetch('/add_perspective', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            perspectiveKey: newPerspective, // Send the perspective key
            perspectiveValue: "default value for " + newPerspective, // Set the default value
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response or update the table if needed
        console.log(data);
        // You can also update the table here if needed
        updatePerspectiveTable(data.perspectives);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function fetchAndDisplayPerspectives() {
    try {
        const response = await fetch('/api/get_perspectives');
        if (!response.ok) {
            throw new Error('Failed to fetch perspectives');
        }

        const data = await response.json();
        displayPerspectives(data.perspectives);
    } catch (error) {
        console.error('Error fetching perspectives:', error);
    }
}


document.addEventListener('DOMContentLoaded', function() {
    fetchUserPerspectives();
});

async function fetchUserPerspectives() {
    try {
        const response = await fetch('/api/get_perspectives');
        if (!response.ok) {
            throw new Error('Failed to fetch perspectives');
        }

        const data = await response.json();
        updatePerspectiveDisplays(data.perspectives);
    } catch (error) {
        console.error('Error fetching perspectives:', error);
    }
}

function updatePerspectiveDisplays(perspectives) {
    document.getElementById('ageDisplay').textContent = perspectives.age || 'Not set';
    document.getElementById('nationalityDisplay').textContent = perspectives.nationality || 'Not set';
    document.getElementById('sexDisplay').textContent = perspectives.sex || 'Not set';
}

function displayPerspectives(perspectives) {
    if (!perspectives) {
        console.error('No perspectives data received');
        return;
    }

    // Example of how you might display the perspectives
    document.getElementById('ageDisplay').textContent = perspectives.age || 'Not set';
    document.getElementById('nationalityDisplay').textContent = perspectives.nationality || 'Not set';
    document.getElementById('sexDisplay').textContent = perspectives.sex || 'Not set';
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayPerspectives);

// Function to delete a perspective
function deletePerspective(rowNum) {
    const email = getCookie('user_email');

    fetch(`/delete_perspective/${rowNum}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response or update the table if needed
        console.log(data);
        // You can also update the table here if needed
        updatePerspectiveTable(data.perspectives);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Helper function to update the perspective table
function updatePerspectiveTable(perspectives) {
    const tableBody = document.getElementById('perspectiveTableBody');
    tableBody.innerHTML = '';

    perspectives.forEach((perspective, index) => {
        const row = tableBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);

        cell1.textContent = perspective;
        cell2.innerHTML = `<button onclick="deletePerspective(${index + 1})">Delete</button>`;
    });
}


