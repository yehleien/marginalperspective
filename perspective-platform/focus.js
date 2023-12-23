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

async function submitComment() {
    const commentText = document.getElementById('commentText').value;
    const response = await fetch('/comments/submit_comment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            articleId: articles[currentArticleIndex].id,
            text: commentText
        })
    });
    const data = await response.json();
    if (data.success) {
        // Comment submitted successfully
        fetchAndDisplayCommentsForFocusPage();
    } else {
        // Handle error
        console.error('Error submitting comment:', data.error);
    }
}

async function fetchAndDisplayCommentsForFocusPage() {
    try {
        const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
        const comments = await response.json();
        const commentsContainer = document.querySelector('.comments-container');
        commentsContainer.innerHTML = '';

        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';

            const voteContainer = document.createElement('div');
            voteContainer.className = 'vote-container';

            const upvoteButton = document.createElement('button');
            upvoteButton.innerHTML = `&#x25B2; (${comment.upvotes})`;
            upvoteButton.className = `vote-button ${comment.userHasUpvoted ? 'upvoted' : ''}`;
            upvoteButton.addEventListener('click', async () => {
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
                    } else {
                        alert(data.error);
                    }
                } catch (error) {
                    console.error('Error upvoting comment:', error);
                }
            });

            const downvoteButton = document.createElement('button');
            downvoteButton.innerHTML = `&#x25BC; (${comment.downvotes})`;
            downvoteButton.className = `vote-button ${comment.userHasDownvoted ? 'downvoted' : ''}`;
            downvoteButton.addEventListener('click', async () => {
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
                    } else {
                        alert(data.error);
                    }
                } catch (error) {
                    console.error('Error downvoting comment:', error);
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

// Fetch and display articles when the page loads
fetchAndDisplayArticles();