document.addEventListener('DOMContentLoaded', async () => {
    const userId = await fetchCurrentUserId();
    await fetchAndDisplayPerspectives(userId); // Fetches perspectives for "My Communities"

    // Show "My Communities" by default
    document.getElementById('myCommunitiesBody').style.display = "block";
    // Hide "All Communities" by default
    document.getElementById('allCommunitiesBody').style.display = "block";

    // Optionally preload data for "All Communities"
    await fetchAndDisplayAllCommunities();


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
        const response = await fetch(`/UserPerspective/get_user_perspectives/${userId}`, {
            credentials: 'include'
        });
        const userPerspectives = await response.json();
        const perspectivesBody = document.getElementById('myCommunitiesBody');
        const perspectiveDropdown = document.getElementById('perspectiveId');

        // Clear existing options
        perspectiveDropdown.innerHTML = '';

        userPerspectives.forEach(userPerspective => {
            // Populate the table
            perspectivesBody.innerHTML += `
                <tr>
                    <td>${userPerspective.perspectiveName}</td>
                </tr>
            `;

            // Populate the dropdown
            const option = document.createElement('option');
            option.value = userPerspective.id;
            option.textContent = userPerspective.perspectiveName;
            perspectiveDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Assuming you will implement this function to fetch and display all perspectives
async function fetchAndDisplayAllCommunities() {
    try {
        const response = await fetch('/perspectives/get_all_perspectives', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allPerspectives = await response.json();
        const perspectivesBody = document.getElementById('allCommunitiesBody');
        perspectivesBody.innerHTML = allPerspectives.map(perspective => `
            <tr>
                <td>${perspective.perspectiveName}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

let currentIndex = 10; // Keep track of the current index for loading posts

// Function to fetch and display posts based on the currentIndex
function fetchAndDisplayPosts() {
    fetch(`/articles/get_latest?index=${currentIndex}`)
        .then(response => response.json())
        .then(article => {
            if (Object.keys(article).length === 0) {
                alert('No more posts to load.');
                return;
            }
            const mainContainer = document.getElementById('mainContainer');
            const postElement = document.createElement('div');
            postElement.innerHTML = `
                <h3>${article.title}</h3>
                <p>${article.content}</p>
                <p>Submitted on: ${new Date(article.submitDate).toLocaleDateString()}</p>
                <p>Perspective: ${article.Perspective ? article.Perspective.perspectiveName : 'N/A'}</p>
                <button onclick="fetchAndDisplayComments(${article.id})">View Comments</button>
            `;
            mainContainer.appendChild(postElement);
            currentIndex++; // Increment the index for the next load
        })
        .catch(error => console.error('Error fetching posts:', error));
}

// Fetch and display posts on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);

document.addEventListener('DOMContentLoaded', fetchAndDisplayPosts);

document.getElementById('loadMore').addEventListener('click', fetchAndDisplayPosts);


function createPostElement(post) {
    // Create the container for the post
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Add the post title
    const title = document.createElement('h3');
    title.textContent = post.title;
    postElement.appendChild(title);

    // Add the post content
    const content = document.createElement('p');
    content.textContent = post.content;
    postElement.appendChild(content);

    // Add the submission date
    const submitDate = document.createElement('p');
    submitDate.textContent = `Submitted on: ${new Date(post.submitDate).toLocaleDateString()}`;
    postElement.appendChild(submitDate);

    // Optionally, add the perspective name if available
    if (post.Perspective) {
        const perspectiveName = document.createElement('p');
        perspectiveName.textContent = `Perspective: ${post.Perspective.perspectiveName}`;
        postElement.appendChild(perspectiveName);
    }

    // Add a button to view comments
    const viewCommentsButton = document.createElement('button');
    viewCommentsButton.textContent = 'View Comments';
    viewCommentsButton.onclick = () => fetchAndDisplayComments(post.id);
    postElement.appendChild(viewCommentsButton);

    return postElement;
}

// Example usage:
// Assuming you have a post object
const examplePost = {
    id: 1,
    title: 'Example Post Title',
    content: 'This is the content of the post.',
    submitDate: new Date(), // Example date
    Perspective: { perspectiveName: 'Example Perspective' }
};

// Create the post element
const postElement = createPostElement(examplePost);

// Append the post element to the main container
const mainContainer = document.getElementById('mainContainer');
mainContainer.appendChild(postElement);
