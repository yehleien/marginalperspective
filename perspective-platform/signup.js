// signup.js
function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Use the actual route for signup
    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Optionally, you can redirect to another page after successful signup
         window.location.href = '/home'; // Replace with your desired redirect path
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Prevent the form from submitting in the traditional HTML way
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();
});
