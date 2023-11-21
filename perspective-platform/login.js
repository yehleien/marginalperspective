function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(obj => {
        if (obj.status === 200) {
            console.log('Login successful:', obj.body);
            window.location.href = '/home'; // Adjust this to your home route
        } else {
            console.error('Login failed:', obj.body.error);
            alert('Login failed: ' + obj.body.error); // Display error to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login: ' + error); // Display error to the user
    });
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        login();
    });
});
