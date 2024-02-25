import upvote from './focus/upvote.js';
import downvote from './focus/downvote.js';

let articles = [];
let currentArticleIndex = parseInt(localStorage.getItem('currentArticleIndex'), 10) || 0;
let selectedCommentId = null;

async function getCurrentUser() {
    const response = await fetch('/account/current', {
        credentials: 'include'
    });
    const user = await response.json();
    return user;
}

async function submitComment(commentText, perspectiveId) {
    try {
        const user = await getCurrentUser();
        const userId = user.id;

        const response = await fetch('/comments/submit_comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                articleId: articles[currentArticleIndex].id, 
                commentText, 
                perspectiveId, 
                userId, 
                parentID: selectedCommentId
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Comment submitted:', data);

        selectedCommentId = null;
        await fetchAndDisplayCommentsForFocusPage();
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

async function fetchAndDisplayArticle() {
    try {
        const response = await fetch(`/articles/get_latest?index=${currentArticleIndex}`);
        const article = await response.json();
        if (article) {
            articles[currentArticleIndex] = article;
            document.getElementById('articleTitle').textContent = article.title;
            await fetchAndDisplayCommentsForFocusPage();
        } else {
            console.error('No article returned from server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function createVoteButtons(comment) {
    const voteContainer = document.createElement('div');
    voteContainer.className = 'vote-container';

    const upvoteButton = document.createElement('button');
    upvoteButton.innerHTML = `Upvote (${comment.upvotes})`;
    upvoteButton.addEventListener('click', () => upvote(comment, upvoteButton, downvoteButton));

    const downvoteButton = document.createElement('button');
    downvoteButton.innerHTML = `Downvote (${comment.downvotes})`;
    downvoteButton.addEventListener('click', () => downvote(comment, upvoteButton, downvoteButton));

    voteContainer.appendChild(upvoteButton);
    voteContainer.appendChild(downvoteButton);

    return voteContainer;
}

function createCommentElement(comment, currentUserId) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';

    const voteContainer = createVoteButtons(comment);
    commentElement.appendChild(voteContainer);

    if (comment.Perspective && comment.Perspective.perspectiveName) {
        const perspectiveElement = document.createElement('p');
        perspectiveElement.className = 'perspective';
        perspectiveElement.textContent = comment.Perspective.perspectiveName;
        commentElement.appendChild(perspectiveElement);
    }

    const textElement = document.createElement('p');
    textElement.textContent = comment.text;
    commentElement.appendChild(textElement);

    const replyButton = createReplyButton(comment);
    commentElement.appendChild(replyButton);

    return commentElement;
}

function createReplyButton(comment) {
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.addEventListener('click', () => {
        selectedCommentId = comment.id;
        document.getElementById('commentText').focus();
    });
    return replyButton;
}

async function fetchAndDisplayCommentsForFocusPage() {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';

    const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
    const comments = await response.json();

    const user = await getCurrentUser();
    const currentUserId = user.id;

    comments.forEach(comment => {
        if (!selectedCommentId || comment.parentID === selectedCommentId) {
            const commentElement = createCommentElement(comment, currentUserId);
            commentsContainer.appendChild(commentElement);
        }
    });
}

window.onload = async function() {
    await fetchAndDisplayArticle();
    document.getElementById('submitComment').addEventListener('click', async function(event) {
        event.preventDefault();
        const commentText = document.getElementById('commentText').value;
        const perspectiveId = document.getElementById('perspectiveSelect').value;
        await submitComment(commentText, perspectiveId);
    });
};

function navigateArticles(offset) {
    const newIndex = currentArticleIndex + offset;
    if (newIndex >= 0 && newIndex < articles.length) {
        currentArticleIndex = newIndex;
        localStorage.setItem('currentArticleIndex', currentArticleIndex.toString());
        fetchAndDisplayArticle();
    }
}

document.getElementById('nextArticle').addEventListener('click', () => navigateArticles(1));
document.getElementById('prevArticle').addEventListener('click', () => navigateArticles(-1));