document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const messageElement = document.getElementById('message');

    fetch('/account/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            messageElement.textContent = 'Signup successful!';
            // Redirect to another page or update the UI as needed
        } else {
            messageElement.textContent = 'Signup failed: ' + data.error;
        }
    })
    .catch(error => {
        console.error('Error during signup:', error);
        messageElement.textContent = 'Error during signup.';
    });
});
