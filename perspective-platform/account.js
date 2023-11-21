// account.js

// Function to add a new perspective
function addPerspective() {
    const newPerspective = document.getElementById('newPerspective').value;

    // Get the user email from the cookie
    const email = getCookie('user_email');

    // Use the actual route for adding perspectives
    fetch('/add_perspective', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            perspective: newPerspective,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response or update the table if needed
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to delete a perspective
function deletePerspective(rowNum) {
    // Get the user email from the cookie
    const email = getCookie('user_email');

    // Use the actual route for deleting perspectives
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
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Helper function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
