document.addEventListener('DOMContentLoaded', async () => {
    // Populate the perspectiveSelect dropdown

    await fetchAndDisplayPerspectives();


    // Handle form submission
    const submitForm = document.getElementById('submitForm');
    if (submitForm) {
        submitForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(submitForm);
            const articleData = {
                title: formData.get('title'),
                content: formData.get('content'),
                perspectiveId: parseInt(formData.get('perspectiveId'), 10), // Convert to integer
                scope: formData.get('scope'),
                url: formData.get('url') // Optional URL
            };

            try {
                const response = await fetch('/articles/submit_article', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(articleData),
                });

                if (response.ok) {
                    console.log('Article submitted successfully');
                    // Optionally, redirect the user or clear the form
                } else {
                    console.error('Failed to submit article');
                }
            } catch (error) {
                console.error('Error submitting article:', error);
            }
        });
    } else {
        console.error('Submit form not found');
    }
});

async function fetchAndDisplayPerspectives() {
    try {
        // Fetch the current user to get the userId
        const userResponse = await fetch('/account/current', {
            credentials: 'include' // include credentials to send the session cookie
        });
        const user = await userResponse.json();
        const userId = user.id;

        // Fetch the user's perspectives by matching UserPerspective with Perspective
        const response = await fetch(`/UserPerspective/get_user_perspectives/${userId}`, {
            credentials: 'include' // include credentials to send the session cookie
        });
        const userPerspectives = await response.json();
        const perspectivesDropdown = document.getElementById('perspectiveDropdown');
        perspectivesDropdown.innerHTML = ''; // Clear existing options first
        userPerspectives.forEach(type => {
            const option = document.createElement('option');
            option.value = type.perspectiveId; // Assuming each type has a unique ID
            option.textContent = type.perspectiveName; // Assuming the name of the perspective type is what you want to display
            perspectivesDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}