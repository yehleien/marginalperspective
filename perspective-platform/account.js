// perspective-platform/account.js
async function fetchAndDisplayUsername() {
    try {
        const response = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await response.json();
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.textContent = 'Welcome ' + user.username;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchAndDisplayPerspectives() {
    try {
        const response = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await response.json();
        const perspectivesResponse = await fetch('/perspectives/get_perspectives/' + user.id, {
            credentials: 'include' // include credentials to send the session cookie
        });
        const perspectives = await perspectivesResponse.json();
        const perspectivesList = document.getElementById('perspectivesList');
        perspectivesList.innerHTML = ''; // Clear the list
        perspectives.forEach(perspective => {
            const listItem = document.createElement('li');
            listItem.textContent = perspective.perspectiveName; // Changed from perspectiveText to perspectiveName
            perspectivesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

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

// Function to update a perspective
async function updatePerspective(id, perspectiveName) {
    const response = await fetch('/perspectives/update_perspective/' + id, {
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
    }
}

// Function to delete a perspective
async function deletePerspective(id) {
    const response = await fetch('/perspectives/delete_perspective/' + id, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (data.success) {
        // Refresh the perspectives list
        fetchAndDisplayPerspectives();
    } else {
        // Display an error message
    }
}

window.onload = function() {
    fetchAndDisplayUsername();
    fetchAndDisplayPerspectives();
};

