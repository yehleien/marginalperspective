let currentPage = 1;
const articlesPerPage = 10;
let selectedArticleId = null;

window.onload = async function() {
    console.log('Page loaded');
    await fetchAndDisplayArticles(); // Call the function here
    await fetchAndDisplayPerspectives(); // Fetch and display perspectives

    // Event listener for the perspectives select box
    document.getElementById('perspectiveSelect').addEventListener('change', function(event) {
        perspectiveId = parseInt(event.target.value, 10);
        console.log('Selected perspective ID:', perspectiveId); // Log the selected perspective ID
    });
};

document.getElementById('scrapeArticles').addEventListener('click', async function(event) {
    try {
        const response = await fetch('/articles/scrape_and_submit_articles');
        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchAndDisplayArticles() {
    try {
        const response = await fetch('/articles/get_news');
        const articles = await response.json();
        const articlesBody = document.getElementById('articlesBody');
        articlesBody.innerHTML = ''; // Clear the table body

        // Populate the table with articles
        articles.forEach(article => {
            const row = document.createElement('tr');
            const titleCell = document.createElement('td');
            const dateCell = document.createElement('td');
            const actionCell = document.createElement('td');
            const sourceCell = document.createElement('td'); // New source cell

            titleCell.textContent = article.title; // Set the title
            dateCell.textContent = new Date(article.submitDate).toLocaleDateString();

            // Create a button for the action
            const actionButton = document.createElement('button');
            actionButton.textContent = 'View Article';
            actionButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('/articles/content/' + encodeURIComponent(article.url));
                    const data = await response.json();
                    articleFrame.contentWindow.document.body.innerHTML = data.content;
                    selectedArticleId = article.id; // Update the selectedArticleId
                    await fetchAndDisplayComments(); // Fetch and display comments for the selected article
                } catch (error) {
                    console.error('Error fetching article content:', error);
                }
            });

            actionCell.appendChild(actionButton); // Append the button to the action cell

            // Extract the source from the URL
            const url = new URL(article.url);
            sourceCell.textContent = url.hostname;

            row.appendChild(titleCell);
            row.appendChild(dateCell);
            row.appendChild(actionCell);
            row.appendChild(sourceCell); // Append the source cell to the row

            articlesBody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
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

        // Fetch the perspectives from the server
        const response = await fetch(`/perspectives/get_perspectives/${userId}`);
        const perspectives = await response.json();
        const perspectiveId = document.getElementById('perspectiveSelect');
        perspectiveSelect.innerHTML = ''; // Clear the select box

        // Populate the select box with perspectives
        perspectives.forEach(perspective => {
            const option = document.createElement('option');
            option.value = perspective.perspectiveId;
            option.textContent = perspective.perspectiveName;
            perspectiveSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching perspectives:', error);
    }
}

async function submitArticle(url) {
    try {
        const response = await fetch('/articles/submit_article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Article submitted:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

document.getElementById('articleForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const urlInput = event.target.elements.articleUrl;
    const url = urlInput.value;
    await submitArticle(url);
    urlInput.value = ''; // Clear the input field
    await fetchAndDisplayArticles(); // Refresh the articles list
});

// Function to fetch and display comments for a selected article
async function fetchAndDisplayComments() {
    try {
        const response = await fetch(`/comments/comments/${selectedArticleId}`);
        const comments = await response.json();
        const commentsColumn = document.querySelector('.comments-column');
        if (commentsColumn) {
            commentsColumn.innerHTML = '';

            comments.forEach(comment => {
                const commentElement = document.createElement('p');
                commentElement.className = 'comment-item';

                const perspectiveElement = document.createElement('span');
                perspectiveElement.className = 'perspective';
                perspectiveElement.textContent = comment.Perspective.perspectiveName;

                const textElement = document.createElement('span');
                textElement.textContent = ` - ${comment.text}`;

                commentElement.appendChild(perspectiveElement);
                commentElement.appendChild(textElement);

                const upvoteButton = document.createElement('button');
                upvoteButton.innerHTML = `&#x25B2; (${comment.upvotes})`;
                upvoteButton.className = 'vote-button';
                upvoteButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/comments/upvote/${comment.id}`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                        const data = await response.json();
                        if (data.success) {
                            upvoteButton.innerHTML = `&#x25B2; (${data.upvotes})`;
                        } else {
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error upvoting comment:', error);
                    }
                });

                const downvoteButton = document.createElement('button');
                downvoteButton.innerHTML = `&#x25BC; (${comment.downvotes})`;
                downvoteButton.className = 'vote-button';
                downvoteButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/comments/downvote/${comment.id}`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                        const data = await response.json();
                        if (data.success) {
                            downvoteButton.innerHTML = `&#x25BC; (${data.downvotes})`;
                        } else {
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error downvoting comment:', error);
                    }
                });

                commentElement.appendChild(upvoteButton);
                commentElement.appendChild(downvoteButton);

                commentsColumn.appendChild(commentElement);
            });
        }
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

// Function to submit a comment
async function submitComment(commentText, perspectiveId ) { // Default perspectiveId to null
    try {
        const userResponse = await fetch('/account/current', {
            credentials: 'include'
        });
        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch('/comments/submit_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ articleId: selectedArticleId, commentText, perspectiveId, userId }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Comment submitted:', data);

        // Clear the comment text field
        document.getElementById('commentText').value = '';

        // Refresh the comments list
        await fetchAndDisplayComments();
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

// Event listener for the comment form
document.getElementById('submitComment').addEventListener('click', async function(event) {
    event.preventDefault();

    const commentText = document.getElementById('commentText').value;
    let perspectiveId = document.getElementById('perspectiveSelect').value || null; // Retrieve the perspectiveId directly within the function

    // Check if an article is selected
    if (!selectedArticleId) {
        console.error('No article selected');
        return;
    }

    await submitComment(commentText, perspectiveId); // Pass the perspectiveId to the submitComment function
});
``


