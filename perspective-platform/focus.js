let articles = [];
let currentArticleIndex = 0;

async function fetchAndDisplayArticles() {
    try {
        const response = await fetch('/articles/get_news');
        articles = await response.json();
        displayArticle();
        fetchAndDisplayCommentsForFocusPage();
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayArticle() {
    if (articles.length > 0) {
        const article = articles[currentArticleIndex];
        document.getElementById('articleTitle').textContent = article.title;
    }
}

document.getElementById('prevArticle').addEventListener('click', function() {
    if (currentArticleIndex > 0) {
        currentArticleIndex--;
        displayArticle();
        fetchAndDisplayCommentsForFocusPage();
    }
});

document.getElementById('nextArticle').addEventListener('click', function() {
    if (currentArticleIndex < articles.length - 1) {
        currentArticleIndex++;
        displayArticle();
        fetchAndDisplayCommentsForFocusPage();
    }
});

async function submitComment(commentText, perspectiveId) {
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
            body: JSON.stringify({ articleId: articles[currentArticleIndex].id, commentText, perspectiveId, userId }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Comment submitted:', data);

        // Clear the comment text field
        document.getElementById('commentText').value = '';

        // Refresh the comments list
        await fetchAndDisplayCommentsForFocusPage();
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

async function fetchAndDisplayCommentsForFocusPage() {
    try {
        const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
        const comments = await response.json();
        const commentsContainer = document.querySelector('.comments-container');
        commentsContainer.innerHTML = '';

        comments.forEach(async comment => {
            const updatedComment = await fetchComment(comment.id);
            comment.upvotes = updatedComment.upvotes;
            comment.downvotes = updatedComment.downvotes;

            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            const voteContainer = document.createElement('div');
            voteContainer.className = 'vote-container';

            const upvoteButton = document.createElement('button');
            upvoteButton.innerHTML = `&#x25B2; (${comment.upvotes})`;
            upvoteButton.className = `vote-button ${comment.userHasUpvoted ? 'upvoted' : ''}`;
            if (comment.userHasUpvoted) {
                upvoteButton.style.backgroundColor = 'green';
            }
            upvoteButton.addEventListener('click', async () => {
                if (!comment.userHasUpvoted) {
                    try {
                        const response = await fetch(`/comments/upvote/${comment.id}`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                        const data = await response.json();
                        if (data.success) {
                            upvoteButton.innerHTML = `&#x25B2; (${data.upvotes})`;
                            upvoteButton.classList.add('upvoted');
                            downvoteButton.classList.remove('downvoted');
                            await comment.decrement('downvotes');
                            await comment.increment('upvotes');
                        } else {
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error upvoting comment:', error);
                    }
                }
            });

            const downvoteButton = document.createElement('button');
            downvoteButton.innerHTML = `&#x25BC; (${comment.downvotes})`;
            downvoteButton.className = `vote-button ${comment.userHasDownvoted ? 'downvoted' : ''}`;
            if (comment.userHasDownvoted) {
                downvoteButton.style.backgroundColor = 'red';
            }
            downvoteButton.addEventListener('click', async () => {
                if (!comment.userHasDownvoted) {
                    try {
                        const response = await fetch(`/comments/downvote/${comment.id}`, {
                            method: 'POST',
                            credentials: 'include'
                        });
                        const data = await response.json();
                        if (data.success) {
                            downvoteButton.innerHTML = `&#x25BC; (${data.downvotes})`;
                            downvoteButton.classList.add('downvoted');
                            upvoteButton.classList.remove('upvoted');
                            await comment.decrement('upvotes');
                            await comment.increment('downvotes');
                        } else {
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error downvoting comment:', error);
                    }
                }
            });

            voteContainer.appendChild(upvoteButton);
            voteContainer.appendChild(downvoteButton);

            const perspectiveElement = document.createElement('p');
            perspectiveElement.className = 'perspective';
            perspectiveElement.textContent = comment.Perspective.perspectiveName;

            const textElement = document.createElement('p');
            textElement.textContent = comment.text;

            const commentContent = document.createElement('div');
            commentContent.appendChild(perspectiveElement);
            commentContent.appendChild(textElement);

            commentElement.appendChild(voteContainer);
            commentElement.appendChild(commentContent);

            commentsContainer.appendChild(commentElement);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

async function fetchComment(commentId) {
    try {
        const response = await fetch(`/comments/${commentId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const comment = await response.json();
        return comment;
    } catch (error) {
        console.error(`Error fetching comment with ID ${commentId}:`, error);
    }
}

async function fetchAndDisplayPerspectives() {
    try {
        const userResponse = await fetch('/account/current', {
            credentials: 'include'
        });
        const user = await userResponse.json();
        const userId = user.id;

        const response = await fetch(`/perspectives/get_perspectives/${userId}`);
        const perspectives = await response.json();
        const perspectiveSelect = document.getElementById('perspectiveSelect');
        perspectiveSelect.innerHTML = '';

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

window.onload = async function() {
    await fetchAndDisplayPerspectives();
    document.getElementById('submitComment').addEventListener('click', async function(event) {
        event.preventDefault();
        const commentText = document.getElementById('commentText').value;
        let perspectiveId = document.getElementById('perspectiveSelect').value || null; // Retrieve the perspectiveId directly within the function
        await submitComment(commentText, perspectiveId); // Pass the perspectiveId to the submitComment function
    });
};

// Fetch and display articles when the page loads
fetchAndDisplayArticles();