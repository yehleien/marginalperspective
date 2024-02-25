let articles = [];
let currentArticleIndex = 0;
let currentlyViewedCommentId = null; // Add this line at the top of your script

import upvote from './focus/upvote.js';
import downvote from './focus/downvote.js';


async function getCurrentUser() {
    const response = await fetch('/account/current', {
        credentials: 'include'
    });
    const user = await response.json();
    return user;
}

async function submitComment(commentText, perspectiveId) {
    const parentID = document.getElementById('parentIDInput').value;
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
                parentID
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Comment submitted:', data);

        // Instead of reloading the page, fetch and display the updated comments
        await fetchAndDisplayCommentsForFocusPage();

        // Optionally, clear the comment input field after submission
        document.getElementById('commentText').value = '';
        document.getElementById('parentIDInput').value = ''; // Reset the parentIDInput value if necessary

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

function createVoteButtons(comment, currentUserId) {
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
    const currentUserVote = comment.votes ? comment.votes.find(vote => vote.userId === currentUserId) : null;
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

    return voteContainer;
}

function createRepliesButton(comment, parentCommentElement, currentUserId) {
    const repliesButton = document.createElement('button');
    repliesButton.textContent = `Replies (${comment.replyCount})`;
    repliesButton.className = 'replies-button';

    repliesButton.addEventListener('click', async function(event) {
        event.preventDefault();

        const repliesContainer = parentCommentElement.querySelector('.replies-container');
        if (repliesContainer.style.display === 'none' || repliesContainer.style.display === '') {
            repliesContainer.style.display = 'block';
            repliesButton.textContent = `Hide replies (${comment.replyCount})`;

            if (repliesContainer.childElementCount === 0) {
                // Fetch and display replies only if they haven't been fetched yet
                const response = await fetch(`/comments/replies/${comment.id}`);
                const replies = await response.json();

                replies.forEach(reply => {
                    const replyElement = createCommentElement(reply, currentUserId);
                    repliesContainer.appendChild(replyElement);
                });
            }
        } else {
            repliesContainer.style.display = 'none';
            repliesButton.textContent = `Replies (${comment.replyCount})`;
        }
    });

    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'replies-container';
    repliesContainer.style.display = 'none'; // Hide the replies container initially

    parentCommentElement.appendChild(repliesButton);
    parentCommentElement.appendChild(repliesContainer);
}

function createReplyButton(comment) {
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.addEventListener('click', function() {
        const parentIDInput = document.getElementById('parentIDInput');
        if (parentIDInput) {
            parentIDInput.value = comment.id; // Correctly update the hidden input's value
        } else {
            console.error('parentIDInput element not found');
        }

        // Highlight the comment being replied to
        document.querySelectorAll('.comment-item').forEach(item => item.style.backgroundColor = '');
        const commentElement = document.getElementById(`comment-${comment.id}`);
        if (commentElement) {
            commentElement.style.backgroundColor = '#ffff99'; // Highlight color
        } else {
            console.error(`Comment element with ID comment-${comment.id} not found`);
        }
    });

    return replyButton;
}

function createCommentElement(comment, currentUserId) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.id = `comment-${comment.id}`; // Assign an ID to each comment element for highlighting

    // Create and append the vote buttons first
    const voteContainer = createVoteButtons(comment, currentUserId);
    commentElement.appendChild(voteContainer);

    // Check if the comment has a Perspective and perspectiveName before trying to access it
    if (comment.Perspective && comment.Perspective.perspectiveName) {
        const perspectiveElement = document.createElement('p');
        perspectiveElement.className = 'perspective';
        perspectiveElement.textContent = comment.Perspective.perspectiveName;
        commentElement.appendChild(perspectiveElement);
    }

    const textElement = document.createElement('p');
    textElement.textContent = comment.text;
    commentElement.appendChild(textElement);

    // Always add a replies button, showing 0 if there are no replies
    createRepliesButton(comment, commentElement, currentUserId);

    // Replace the checkbox with a reply button
    const replyButton = createReplyButton(comment);
    commentElement.appendChild(replyButton);

    return commentElement;
}

async function fetchAndDisplayCommentsForFocusPage() {
    try {
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = ''; // Clear the comments container

        const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
        const comments = await response.json();

        const user = await getCurrentUser();
        const currentUserId = user.id;

        // Filter out comments that have a parentID
        const topLevelComments = comments.filter(comment => comment.parentID === null);

        topLevelComments.forEach(comment => {
            const commentElement = createCommentElement(comment, currentUserId);
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
};  
