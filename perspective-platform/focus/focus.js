import upvote from './upvote.js';
import downvote from './downvote.js';

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

async function submitComment(commentText) {
    const parentID = document.getElementById('parentIDInput').value;
    const perspectiveSelect = document.getElementById('perspectiveSelect'); // Get the select element
    const perspectiveId = perspectiveSelect.value; // Get the selected perspectiveId

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
                perspectiveId, // Include the selected perspectiveId in the request
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

        // Optionally, clear the comment input field and reset the perspectiveSelect after submission
        document.getElementById('commentText').value = '';
        document.getElementById('parentIDInput').value = ''; // Reset the parentIDInput value if necessary
        perspectiveSelect.value = ''; // Optionally reset the perspectiveSelect if needed

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
    upvoteButton.innerHTML = `&#x25B2; (${comment.upvotes})`; // Up arrow symbol
    upvoteButton.className = comment.userHasUpvoted ? 'upvoted' : ''; // Add 'upvoted' class if user has upvoted
    upvoteButton.addEventListener('click', async () => {
        await upvote(comment, upvoteButton, downvoteButton);
        upvoteButton.classList.add('upvoted');
        downvoteButton.classList.remove('downvoted'); // Remove 'downvoted' class from downvote button
    });

    const downvoteButton = document.createElement('button');
    downvoteButton.innerHTML = `&#x25BC; (${comment.downvotes})`; // Down arrow symbol
    downvoteButton.className = comment.userHasDownvoted ? 'downvoted' : ''; // Add 'downvoted' class if user has downvoted
    downvoteButton.addEventListener('click', async () => {
        await downvote(comment, upvoteButton, downvoteButton);
        downvoteButton.classList.add('downvoted');
        upvoteButton.classList.remove('upvoted'); // Remove 'upvoted' class from upvote button
    });

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

    // Add a reply button
    const replyButton = createReplyButton(comment);
    commentElement.appendChild(replyButton);

    return commentElement;
}

async function fetchAndDisplayCommentsForFocusPage() {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';

    const response = await fetch(`/comments/comments/${articles[currentArticleIndex].id}`);
    const allComments = await response.json();

    // Use a separate variable for filtered comments
    const topLevelComments = allComments.filter(comment => comment.parentID === null);

    const user = await getCurrentUser();
    const currentUserId = user.id;

    topLevelComments.forEach(comment => {
        // Since we're only dealing with top-level comments now, this check might be redundant
        // unless you have additional logic that still requires it.
        if (!selectedCommentId || comment.parentID === selectedCommentId) {
            const commentElement = createCommentElement(comment, currentUserId);
            commentsContainer.appendChild(commentElement);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    await fetchAndDisplayArticle();
    const user = await getCurrentUser();
    fetch(`perspectives/get_perspectives/${user.id}`)
        .then(response => response.json())
        .then(perspectives => {
            const dropdown = document.getElementById('perspectiveSelect');
            perspectives.forEach(perspective => {
                const option = document.createElement('option');
                option.value = perspective.perspectiveId;
                option.textContent = perspective.perspectiveName;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching perspectives:', error));

    document.getElementById('submitComment').addEventListener('click', async function(event) {
        event.preventDefault();
        const commentText = document.getElementById('commentText').value;
        const perspectiveId = document.getElementById('perspectiveSelect').value;
        await submitComment(commentText, perspectiveId);
    });
});

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