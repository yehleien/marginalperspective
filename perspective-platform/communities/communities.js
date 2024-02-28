document.addEventListener('DOMContentLoaded', async () => {
    const userId = await fetchCurrentUserId();
    await fetchAndDisplayPerspectives(userId);
});

async function fetchCurrentUserId() {
    try {
        const response = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        return user.id; // Assuming the user object has an id field
    } catch (error) {
        console.error('Error:', error);
        return null; // Handle error appropriately in your application context
    }
}

async function fetchAndDisplayPerspectives(userId) {
    try {
        // Adjust the URL to match your server's expected endpoint. Including userId in the request.
        const response = await fetch(`/perspectives/get_perspectives/${userId}`, {
            credentials: 'include' // include credentials to send the session cookie
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const perspectives = await response.json();
        const perspectivesList = document.getElementById('perspectivesList');
        perspectivesList.innerHTML = perspectives.map(perspective => `
            <li>${perspective.perspectiveName}</li>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}