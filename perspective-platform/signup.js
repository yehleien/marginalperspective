function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(obj => {
        if (obj.status === 200) {
            console.log('Signup successful:', obj.body);
            window.location.href = '/home'; // Redirect on successful signup
        } else {
            console.error('Signup failed:', obj.body.error);
            alert('Signup failed: ' + obj.body.error); // Show error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error); // Show error message to the user
    });
}

document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    signup();
});
