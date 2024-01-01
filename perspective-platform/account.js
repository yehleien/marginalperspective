// perspective-platform/account.js
async function fetchAndDisplayUsername() {
    try {
        const response = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await response.json();
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = 'Welcome, ' + user.username + '!';
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAndDisplayPerspectives() {
    try {
        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        // Fetch the perspectives
        const response = await fetch(`/perspectives/get_perspectives/${userId}`, {
            credentials: 'include' // include credentials to send the session cookie
        });
        const perspectives = await response.json();
        const perspectivesBody = document.getElementById('perspectivesBody');
        perspectivesBody.innerHTML = perspectives.map(perspective => `
            <tr>
                <td>${perspective.perspectiveName}</td>
                <td>${new Date(perspective.updatedAt).toLocaleString()}</td>
                <td>
                    <button onclick="showUpdateForm(${perspective.perspectiveId}, '${perspective.perspectiveName}')">Update</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('addPerspectiveForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const perspectiveName = document.getElementById('perspectiveName').value;

        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch('/perspectives/add_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveName, userId }) // Include userId here
        });

        const data = await response.json();

        if (data.success) {
            // Clear the input field
            document.getElementById('perspectiveName').value = '';

            // Refresh the perspectives list
            fetchAndDisplayPerspectives();
        } else {
            // Display an error message
            console.error('Error:', data.error);
        }
    });
});

// Function to update a perspective
async function updatePerspective(perspectiveId, perspectiveName) {
    try {
        const response = await fetch('/perspectives/update_perspective/' + perspectiveId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveName })
        });
        const data = await response.json();
        if (data.success) {
            // Refresh the perspectives list
            fetchAndDisplayPerspectives();
        } else {
            // Display an error message
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.onload = function() {
    fetchAndDisplayUsername();
    fetchAndDisplayPerspectives();
};

// Show the update form with the current perspective name
function showUpdateForm(perspectiveId, name) {
    document.getElementById('updatePerspectiveId').value = perspectiveId;
    document.getElementById('updatePerspectiveName').value = name;
    document.getElementById('updatePerspectiveForm').style.display = 'block';
}

// Handle the update form submission
document.getElementById('updatePerspectiveForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const perspectiveId = document.getElementById('updatePerspectiveId').value;
    const name = document.getElementById('updatePerspectiveName').value;

    if (!perspectiveId) {
        console.error('Error: Perspective ID is undefined');
        return;
    }

    updatePerspective(perspectiveId, name);
});
document.getElementById('addPerspectiveButton').addEventListener('click', function() {
    const perspectivesTable = document.getElementById('perspectivesTable');

    // Create a new row
    const row = perspectivesTable.insertRow();

    // Create a cell for the perspective name
    const nameCell = row.insertCell();
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter perspective name';
    nameCell.appendChild(nameInput);

    // Create a cell for the "Save" button
    const saveCell = row.insertCell();
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', async function() {
        const perspectiveName = nameInput.value;

        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        // Add the new perspective to the database
        const response = await fetch('/perspectives/add_perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ perspectiveName, userId }) // Include userId here
        });

        const data = await response.json();

        if (data.success) {
            // Refresh the perspectives list
            fetchAndDisplayPerspectives();
        } else {
            // Display an error message
            console.error('Error:', data.error);
        }
    });
    saveCell.appendChild(saveButton);
});