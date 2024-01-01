let articles = [];
let currentArticleIndex = 0;
import upvote from './upvote.js';
import downvote from './downvote.js';

async function fetchAndDisplayArticle() {
    try {
        const response = await fetch(`/articles/get_latest?index=${currentArticleIndex}`);
        const article = await response.json();
        if (article) {
            articles[currentArticleIndex] = article;
            await displayArticle();
            fetchAndDisplayCommentsForFocusPage();
        } else {
            console.error('No article returned from server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function displayArticle() {
    if (articles.length > 0) {
        const article = articles[currentArticleIndex];
        document.getElementById('articleTitle').textContent = article.title;
        await fetchAndDisplayCommentsForFocusPage(); // Fetch comments after displaying the article
    }
}

document.getElementById('prevArticle').addEventListener('click', function() {
    if (currentArticleIndex > 0) {
        currentArticleIndex--;
        fetchAndDisplayArticle();
    }
});

document.getElementById('nextArticle').addEventListener('click', function() {
    currentArticleIndex++;
    fetchAndDisplayArticle();
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

            // Append the new comment to the comments container
    const commentsContainer = document.getElementById('commentsContainer');
    const commentElement = createCommentElement(data); // You'll need to implement this function
    commentsContainer.appendChild(commentElement);
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
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = ''; // Clear the comments container

        const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
        const comments = await response.json();

        const userResponse = await fetch('/account/current', {
            credentials: 'include'
        });
        const user = await userResponse.json();
        const currentUserId = user.id;

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            const voteContainer = document.createElement('div');
            voteContainer.className = 'vote-container';

            const upvoteButton = document.createElement('button');
            upvoteButton.className = 'vote-button';
            upvoteButton.innerHTML = `&#x25B2; (${comment.upvotes})`;
            upvoteButton.addEventListener('click', () => upvote(comment, upvoteButton, downvoteButton));

            const downvoteButton = document.createElement('button');
            downvoteButton.className = 'vote-button';
            downvoteButton.innerHTML = `&#x25BC; (${comment.downvotes})`;
            downvoteButton.addEventListener('click', () => downvote(comment, upvoteButton, downvoteButton));

            // Check if the current user has voted on the comment
            const currentUserVote = comment.votes.find(vote => vote.userId === currentUserId); // currentUserId should be the ID of the logged-in user

            if (currentUserVote) {
                if (currentUserVote.is_upvote) {
                    upvoteButton.classList.add('upvoted');
                    downvoteButton.classList.remove('downvoted');
                } else {
                    downvoteButton.classList.add('downvoted');
                    upvoteButton.classList.remove('upvoted');
                }
            }

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
        const response = await fetch(`/comments/comment/${commentId}`);
                if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null; // Return null if the server returns a non-OK status
        }
        const comment = await response.json();
        console.log('Fetched comment:', comment);
        return comment;
    } catch (error) {
        console.error(`Error fetching comment with ID ${commentId}:`, error);
        return null; // Return null if an error occurs
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
        const perspectiveId = document.getElementById('perspectiveSelect').value;
        await submitComment(commentText, perspectiveId);
    });

    // Fetch and display articles when the page loads
    fetchAndDisplayArticle();
}
